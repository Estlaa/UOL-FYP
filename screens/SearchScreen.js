import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, ActivityIndicator } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebaseConfig.js";
import { format } from "date-fns";
import Colors from "../themes/Colors.js";
import TaskList from "../components/TaskList";

export default function SearchScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;
    const tasksRef = collection(db, "users", userId, "tasks");
    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        const tasksList = snapshot.docs.map((doc) => {
          const taskData = doc.data();
          const dueDateObj =
            taskData.dueDate && taskData.dueDate.toDate
              ? taskData.dueDate.toDate()
              : null;
          const formattedDueDate = dueDateObj
            ? format(dueDateObj, "MMM dd, yyyy")
            : null;
          return { id: doc.id, ...taskData, dueDate: formattedDueDate };
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

  // Filter tasks based on search query matching title or description
  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (task.title && task.title.toLowerCase().includes(lowerQuery)) ||
      (task.description && task.description.toLowerCase().includes(lowerQuery))
    );
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="darkred" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search tasks..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {filteredTasks.length > 0 ? (
        <TaskList tasks={filteredTasks} navigation={navigation} />
      ) : (
        <Text style={styles.emptyText}>No tasks found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  searchBar: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#777",
  },
});
