import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig.js";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../themes/Colors.js";
import { format, parse, addDays, startOfToday } from "date-fns";
import TaskList from "../components/TaskList";
import Filter from "../components/Filter.js";

export default function TaskScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState(null); // holds filter criteria
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;
  const [expandedSection, setExpandedSection] = useState("today");
  const [filterVisible, setFilterVisible] = useState(false);

  // Update header to add filter button alongside the logout button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 15 }}>
          <Ionicons
            name="filter-outline"
            size={24}
            color="white"
            style={{ marginRight: 15 }}
            onPress={() => setFilterVisible(true)}
          />
          <Ionicons name="log-out-outline" size={24} color="white" onPress={() => auth.signOut()} />
        </View>
      ),
    });
  }, [navigation]);

  // Fetch tasks from Firebase
  useEffect(() => {
    setLoading(true);
    if (!userId) return;
    const tasksRef = collection(db, "users", userId, "tasks");
    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        const tasksList = snapshot.docs.map((doc) => {
          const taskData = doc.data();
          const dueDateObj =
            taskData.dueDate && taskData.dueDate.toDate ? taskData.dueDate.toDate() : null;
          const formattedDueDate = dueDateObj ? format(dueDateObj, "MMM dd, yyyy") : null;
          return {
            id: doc.id,
            ...taskData,
            dueDate: formattedDueDate,
          };
        });
        setTasks(tasksList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching tasks in real-time:", error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [userId]);

  // Update filteredTasks whenever tasks or appliedFilters changes
  useEffect(() => {
    // If no filters are applied or filters are "empty", show all tasks.
    if (
      !appliedFilters ||
      (!appliedFilters.completed && !appliedFilters.incomplete && appliedFilters.categories.length === 0)
    ) {
      setFilteredTasks(tasks);
    } else {
      let filtered = tasks;
      // Apply status filtering:
      // If only "completed" is selected, filter tasks with completed === true.
      // If only "incomplete" is selected, filter tasks with completed === false.
      if (appliedFilters.completed && !appliedFilters.incomplete) {
        filtered = filtered.filter((task) => task.completed === true);
      } else if (!appliedFilters.completed && appliedFilters.incomplete) {
        filtered = filtered.filter((task) => task.completed === false);
      }
      // Apply category filtering if any categories are selected
      if (appliedFilters.categories.length > 0) {
        filtered = filtered.filter((task) => appliedFilters.categories.includes(task.category));
      }
      setFilteredTasks(filtered);
    }
  }, [tasks, appliedFilters]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="darkred" />
      </View>
    );
  }

  const today = startOfToday();

  const overdueTasks = filteredTasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = parse(task.dueDate, "MMM dd, yyyy", new Date());
    return due.getTime() < today.getTime();
  });

  const todaysTasks = filteredTasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = parse(task.dueDate, "MMM dd, yyyy", new Date());
    return due.getTime() === today.getTime();
  });

  const weekStart = addDays(today, 1);
  const weekEnd = addDays(today, 7);
  const weekTasks = filteredTasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = parse(task.dueDate, "MMM dd, yyyy", new Date());
    return due.getTime() >= weekStart.getTime() && due.getTime() <= weekEnd.getTime();
  });

  const monthStart = addDays(today, 7);
  const monthEnd = addDays(today, 30);
  const monthTasks = filteredTasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = parse(task.dueDate, "MMM dd, yyyy", new Date());
    return due.getTime() > monthStart.getTime() && due.getTime() <= monthEnd.getTime();
  });

  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  const renderSectionHeader = (title, sectionName) => (
    <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(sectionName)}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Ionicons
        name={expandedSection === sectionName ? "chevron-up" : "chevron-down"}
        size={24}
        color="#fff"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionContent}>
        {renderSectionHeader("Overdue", "overdue")}
        {expandedSection === "overdue" &&
          (overdueTasks.length > 0 ? (
            <TaskList tasks={overdueTasks} navigation={navigation} />
          ) : (
            <Text style={styles.emptyText}>No overdue tasks</Text>
          ))}
      </View>

      <View style={styles.sectionContent}>
        {renderSectionHeader("Today", "today")}
        {expandedSection === "today" &&
          (todaysTasks.length > 0 ? (
            <TaskList tasks={todaysTasks} navigation={navigation} />
          ) : (
            <Text style={styles.emptyText}>No tasks for today</Text>
          ))}
      </View>

      <View style={styles.sectionContent}>
        {renderSectionHeader("This Week", "week")}
        {expandedSection === "week" &&
          (weekTasks.length > 0 ? (
            <TaskList tasks={weekTasks} navigation={navigation} />
          ) : (
            <Text style={styles.emptyText}>No tasks for this week</Text>
          ))}
      </View>

      <View style={styles.sectionContent}>
        {renderSectionHeader("This Month", "month")}
        {expandedSection === "month" &&
          (monthTasks.length > 0 ? (
            <TaskList tasks={monthTasks} navigation={navigation} />
          ) : (
            <Text style={styles.emptyText}>No tasks for this month</Text>
          ))}
      </View>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Add Task")}
      >
        <Ionicons name="add" size={40} color="white" />
      </TouchableOpacity>
      
      {/* Filter modal */}
      <Filter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(filters) => {
          console.log("Applied filters:", filters);
          setAppliedFilters(filters);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  sectionHeaderText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  sectionContent: { maxHeight: "55%" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  emptyText: { fontStyle: "italic", color: "#666", textAlign: "center", marginVertical: 5, fontSize: 18 },
});


