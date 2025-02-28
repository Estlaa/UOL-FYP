import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Button, TouchableOpacity } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { getAuth, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig.js"
import TaskList from "../components/TaskList.js";
import { format } from "date-fns";
import Ionicons from 'react-native-vector-icons/Ionicons';


export default function TaskScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  //testing logout
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("User signed out");
      })
      .catch((error) => {
        console.error("Error signing out:", error.message);
      });
  };

  const fetchTasks = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error("User not signed in");
        return;
      }

      const tasksRef = collection(db, "users", userId, "tasks");
      const querySnapshot = await getDocs(tasksRef);

      const tasksList = querySnapshot.docs.map((doc) => {
        const taskData = doc.data();
        const dueDate = taskData.dueDate?.toDate();
        const formattedDueDate = dueDate ? format(dueDate, "MMM dd, yyyy") : null;

        return {
          id: doc.id,
          ...taskData,
          dueDate: formattedDueDate,
        };
      });
      console.log("Fetched tasks:", tasksList);
      setTasks(tasksList);
      setLoading(false);
      console.log(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [])
  );



  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading tasks..</Text>
      </View>
    );

  }
  return (
    <View style={styles.container}>
      <TaskList tasks={tasks} onTaskDeleted={fetchTasks} navigation={navigation}/>
      <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Add Task')}>
        <Ionicons name="add" size={40} color="white" />
      </TouchableOpacity>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );


}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'darkred',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});