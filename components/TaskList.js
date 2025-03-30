import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { auth, db, storage } from "../firebaseConfig.js";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Colors from "../themes/Colors.js";
import { cancelTaskNotification } from "./NotificationManager.js";

export default function TaskList({ navigation, tasks }) {

  const handleCheckboxChange = async (id, currentStatus) => {
    const userId = auth.currentUser?.uid;
    console.log(currentStatus);
    try {
      await updateDoc(doc(db, 'users', userId, "tasks", id), {
        completed: !currentStatus,
      });
    } catch (error) {
      console.error('Error updating task status:', error.message);
    }
  };

  const handleDeleteTask = async (task) => {
    Alert.alert(
      "Delete task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const userId = auth.currentUser?.uid;

              // Cancel the scheduled notification if it exists.
              if (task.notificationId) {
                await cancelTaskNotification(task.notificationId);
                console.log(`Cancelled notification: ${task.notificationId}`);
              }

              // If the task has images, delete each one from Firebase Storage.
              if (task.images && task.images.length > 0) {
                for (const image of task.images) {
                  try {
                    const imageRef = ref(storage, image.path);
                    await deleteObject(imageRef);
                    console.log(`Deleted image from storage: ${image.path}`);
                  } catch (error) {
                    console.error(`Error deleting image (${image.path}):`, error.message);
                  }
                }
              }

              // Delete the task document.
              await deleteDoc(doc(db, 'users', userId, "tasks", task.id));
              console.log('Task successfully deleted');
            } catch (error) {
              console.error('Failed to delete task:', error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <FlatList
      data={tasks}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={[
          styles.taskCard,
          item.priority === "high" && { borderColor: "red", borderWidth: 3 },
          item.priority === "medium" && { borderColor: "orange", borderWidth: 2 }
        ]}>
          <View style={styles.taskInfo}>
            <BouncyCheckbox
              style={{ width: '15%' }}
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
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(item)}>
              <Ionicons name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 4,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  taskDesc: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 14,
    marginBottom: 5,
  },
});
