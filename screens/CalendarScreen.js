import React, { useState, useEffect, useRef } from "react";
import {View,Text,StyleSheet,TouchableOpacity,Alert,ActivityIndicator,} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Agenda } from "react-native-calendars";
import { collection, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db, storage } from "../firebaseConfig.js";
import { ref, deleteObject } from "firebase/storage";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "../themes/Colors";
import { format } from "date-fns";

export default function CalendarScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  // Keep a ref to the Agenda so we can call loadItemsForMonth
  const agendaRef = useRef(null);

  const currentDate = new Date();
  const minDate = new Date(
    currentDate.getFullYear() - 1,
    currentDate.getMonth(),
    currentDate.getDate()
  )
    .toISOString()
    .split("T")[0];
  const maxDate = new Date(
    currentDate.getFullYear() + 1,
    currentDate.getMonth(),
    currentDate.getDate()
  )
    .toISOString()
    .split("T")[0];

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Update selected date when screen regains focus (e.g., day changes).
  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }, [])
  );

  useEffect(() => {
    if (!userId) return;
    const tasksRef = collection(db, "users", userId, "tasks");
    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        const tasksList = snapshot.docs.map((docSnap) => {
          const taskData = docSnap.data();
          const dueDateObj =
            taskData.dueDate && taskData.dueDate.toDate
              ? taskData.dueDate.toDate()
              : null;
          return {
            id: docSnap.id,
            ...taskData,
            // Store Agenda date as "yyyy-MM-dd"
            agendaDueDate: dueDateObj ? format(dueDateObj, "yyyy-MM-dd") : null,
            // Store display date as "MMM dd yyyy"
            dueDate: dueDateObj ? format(dueDateObj, "MMM dd, yyyy") : null,
          };
        });
        setTasks(tasksList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    if (!loading && tasks.length >= 0 && agendaRef.current) {
      const todayTimestamp = new Date().getTime();
      agendaRef.current.props.loadItemsForMonth?.({ timestamp: todayTimestamp });
    }
  }, [loading, tasks]);

  const loadItemsForMonth = (day) => {
    const newItems = {};
    // Create date keys for ±85 days around the provided day
    for (let i = -10; i < 85; i++) {
      const time = day.timestamp + i * 24 * 60 * 60 * 1000;
      const strTime = new Date(time).toISOString().split("T")[0];
      newItems[strTime] = [];
    }
  
    // Merge tasks from Firebase
    tasks.forEach((task) => {
      if (task.agendaDueDate) {
        if (!newItems[task.agendaDueDate]) {
          newItems[task.agendaDueDate] = [];
        }
        newItems[task.agendaDueDate].push(task);
      }
    });
    setItems(newItems);
  };

  // Update task completion status in Firebase
  const handleCheckboxChange = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "users", userId, "tasks", id), {
        completed: !currentStatus,
      });
    } catch (error) {
      console.error("Error updating task status:", error.message);
    }
  };

  // Delete task (including images) from Firebase
  const handleDeleteTask = async (task) => {
    Alert.alert("Delete task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            if (task.images && task.images.length > 0) {
              for (const image of task.images) {
                try {
                  const imageRef = ref(storage, image.path);
                  await deleteObject(imageRef);
                  console.log(`Deleted image from storage: ${image.path}`);
                } catch (error) {
                  console.error(
                    `Error deleting image (${image.path}):`,
                    error.message
                  );
                }
              }
            }
            await deleteDoc(doc(db, "users", userId, "tasks", task.id));
            console.log("Task successfully deleted");
          } catch (error) {
            console.error("Failed to delete task:", error.message);
          }
        },
      },
    ]);
  };

  const renderItem = (item) => {
    return (
      <View
        style={[
          styles.taskCard,
          item.priority === "high" && { borderColor: "red", borderWidth: 3 },
          item.priority === "medium" && { borderColor: "orange", borderWidth: 2 },
        ]}
      >
        <View style={styles.taskInfo}>
          <BouncyCheckbox
            style={{ width: "15%" }}
            isChecked={item.completed || false}
            onPress={() => handleCheckboxChange(item.id, item.completed)}
            fillColor="#007AFF"
            unfillColor="#FFFFFF"
            bounceEffectIn={1.2}
            size={30}
          />
          <View style={styles.taskDesc}>
            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.descriptionText} numberOfLines={1}>
              {item.description}
            </Text>
            <Text>Due date: {item.dueDate}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={{ marginHorizontal: 20 }}
            onPress={() => navigation.navigate("Add Task", { taskToEdit: item })}
          >
            <AntDesign name="edit" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteTask(item)}>
            <AntDesign name="delete" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Gray line placeholder for dates with no tasks
  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDateContainer}>
        <View style={styles.emptyDateLine} />
      </View>
    );
  };

  // Show a full-screen loader while initially loading
  if (loading && tasks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Agenda
        ref={agendaRef}
        items={items}
        loadItemsForMonth={loadItemsForMonth}
        minDate={minDate}
        maxDate={maxDate}
        selected={selectedDate}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        theme={{
          agendaTodayColor: Colors.primary,
          agendaKnobColor: Colors.primary,
        }}
      />

      {/* If you want a brief overlay while items are updating, you can do: */}
      {loading && tasks.length > 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 4,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskInfo: {
    flex: 1,
    flexDirection: "row",
  },
  taskDesc: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  titleText: {
    fontSize: 20,
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    marginBottom: 5,
  },
  emptyDateContainer: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 10,
  },
  emptyDateLine: {
    width: "80%",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
