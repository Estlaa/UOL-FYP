import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { auth, db } from '../firebaseConfig.js';
import { deleteDoc, doc } from 'firebase/firestore';
import BouncyCheckbox from "react-native-bouncy-checkbox";

export default function TaskList({ navigation,tasks,onTaskDeleted }) {
  const [checkedItems, setCheckedItems] = useState({});

  const handleCheckboxChange = (id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeleteTask = async (id) => {
    Alert.alert(
      "Delete task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const userId = auth.currentUser?.uid;

              // Delete the task from Firestore
              await deleteDoc(doc(db, 'users', userId, "tasks", id));
              console.log('Task successfully deleted');

              // Notify parent to refresh tasks
              onTaskDeleted();
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
        <View style={styles.taskCard}>
          <View style={styles.taskInfo}>
          <BouncyCheckbox style={{width:'15%'}}
            isChecked={checkedItems[item.id] || false}
            onPress={() => handleCheckboxChange(item.id)}
            fillColor="#007AFF"
            unfillColor="#FFFFFF"
            bounceEffectIn={1.5}
            bounceEffectOut={1.8}
            size={20}
          />
            <View style={styles.taskDesc}>
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
              <Text>Due date: {item.dueDate} </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={{ marginHorizontal: 20 }} onPress={()=>navigation.navigate("Add Task",{taskToEdit:item})}>
              <AntDesign name="edit" size={20} color="black"></AntDesign>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(item.id)} >
              <AntDesign name="delete" size={20} color="red"></AntDesign>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    flexDirection:'row',
  },
  taskDesc:{
    flex:1,
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
  }
});