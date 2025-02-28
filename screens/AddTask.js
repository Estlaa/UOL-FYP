import React, { useState } from "react";
import { parse } from "date-fns";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, addDoc, Timestamp,updateDoc,doc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function AddTask({ navigation,route }) {
  console.log(route.params);
  const taskToEdit = route.params?.taskToEdit || null;

  const [title, setTitle] = useState(taskToEdit ? taskToEdit.title : "");
  const [description, setDescription] = useState(taskToEdit ? taskToEdit.description : "");
  const [priority, setPriority] = useState(taskToEdit ? taskToEdit.priority : "low");
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate? parse(taskToEdit.dueDate, "MMM dd, yyyy", new Date()): new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  //function to add task to firebase
  const handleTask = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required.");
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert("Error", "User is not signed in.");
        return;
      }

      const tasksRef = collection(db, "users", userId, "tasks");

      if (taskToEdit) {
        // If editing, update the existing task
        const taskEdit = doc(db, "users", userId, "tasks", taskToEdit.id);
        await updateDoc(taskEdit, {
          title,
          description,
          priority,
          dueDate: Timestamp.fromDate(dueDate),
        });

        Alert.alert("Success", "Task updated successfully!");
      }

      else {await addDoc(tasksRef, {
        title,
        description,
        priority,
        dueDate: Timestamp.fromDate(dueDate),
        completed:false,
      });

      Alert.alert("Success", "Task added successfully!");
    }
      navigation.goBack(); 
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Enter task description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={priority}
          onValueChange={(itemValue) => setPriority(itemValue)}
        >
          <Picker.Item label="Urgent" value="urgent" />
          <Picker.Item label="High" value="high" />
          <Picker.Item label="Medium" value="medium" />
          <Picker.Item label="Low" value="low" />
        </Picker>
      </View>

      <Text style={styles.label}>Due Date</Text>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{dueDate.toDateString()}</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}

      <Button title={taskToEdit ? "Update Task":"Add Task"} onPress={handleTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
    alignItems: "center",
    marginBottom: 20,
  },
});
