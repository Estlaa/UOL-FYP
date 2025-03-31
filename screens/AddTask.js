import React, { useState } from "react";
import { parse } from "date-fns";
import {View,Text,TextInput,TouchableOpacity,TouchableWithoutFeedback,Keyboard,Alert,StyleSheet,ActivityIndicator,ScrollView,} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, addDoc, Timestamp, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { auth, db } from "../firebaseConfig";
import {scheduleTaskNotification,updateTaskNotification,cancelTaskNotification,} from "../components/NotificationManager";
import Colors from "../themes/Colors";
import CategoryModal from "../components/CategoryModal";
import ImagePickerComponent from "../components/ImagePicker";
import DocumentPickerComponent from "../components/DocumentPicker";

const getStoragePathFromUri = (uri) => {
  const filename = uri.substring(uri.lastIndexOf("/") + 1);
  return `tasks/${filename}`;
};

export default function AddTask({ navigation, route }) {
  console.log(route.params);
  const taskToEdit = route.params?.taskToEdit || null;

  const [title, setTitle] = useState(taskToEdit ? taskToEdit.title : "");
  const [description, setDescription] = useState(taskToEdit ? taskToEdit.description : "");
  const [priority, setPriority] = useState(taskToEdit ? taskToEdit.priority : "low");
  const [dueDate, setDueDate] = useState(
    taskToEdit?.dueDate
      ? parse(taskToEdit.dueDate, "MMM dd, yyyy", new Date())
      : new Date()
  );
  const [category, setCategory] = useState(taskToEdit ? taskToEdit.category : "None");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Images state and original images for comparison.
  const [images, setImages] = useState(taskToEdit ? taskToEdit.images : []);
  const originalImages = taskToEdit ? taskToEdit.images : [];

  // Files state and original files for comparison.
  const [files, setFiles] = useState(taskToEdit ? taskToEdit.files : []);
  const originalFiles = taskToEdit ? taskToEdit.files : [];

  // Function to upload images and get their download URLs.
  const uploadImages = async (images) => {
    const uploadedImages = [];
    for (const image of images) {
      const { uri, path } = image;
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      uploadedImages.push({ uri: downloadURL, path });
    }
    return uploadedImages;
  };

  // Function to upload files and get their download URLs.
  const uploadFiles = async (files) => {
    const uploadedFiles = [];
    for (const file of files) {
      const { uri, path, name } = file;
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      uploadedFiles.push({ uri: downloadURL, path, name });
    }
    return uploadedFiles;
  };

  // Function to add or update task.
  const handleTask = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Title is required.");
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert("Error", "User is not signed in.");
        return;
      }

      // If editing, remove images that are no longer used.
      if (taskToEdit) {
        const removedImages = originalImages.filter(
          (originalImg) => !images.some((newImg) => newImg.uri === originalImg.uri)
        );
        for (const image of removedImages) {
          try {
            const imageRef = ref(storage, image.path);
            await deleteObject(imageRef);
            console.log(`Deleted image from storage: ${image.path}`);
          } catch (error) {
            console.warn(`Failed to delete image from storage: ${image.path}`, error);
          }
        }
      }

      // If editing, remove files that are no longer used.
      if (taskToEdit) {
        const removedFiles = originalFiles.filter(
          (originalFile) => !files.some((newFile) => newFile.uri === originalFile.uri)
        );
        for (const file of removedFiles) {
          try {
            const fileRef = ref(storage, file.path);
            await deleteObject(fileRef);
            console.log(`Deleted file from storage: ${file.path}`);
          } catch (error) {
            console.warn(`Failed to delete file from storage: ${file.path}`, error);
          }
        }
      }

      // Upload images and files.
      const uploadedImageObjects = await uploadImages(images);
      const uploadedFileObjects = await uploadFiles(files);

      // If editing, update the task and its notification.
      if (taskToEdit) {
        const taskEditRef = doc(db, "users", userId, "tasks", taskToEdit.id);
        // Update the notification: cancel the old one and schedule a new one.
        const newNotificationId = await updateTaskNotification(
          taskToEdit.notificationId,
          title,
          dueDate
        );

        await updateDoc(taskEditRef, {
          title,
          description,
          priority,
          dueDate: Timestamp.fromDate(dueDate),
          category,
          images: uploadedImageObjects,
          files: uploadedFileObjects,
          notificationId: newNotificationId,
        });
        Alert.alert("Success", "Task updated successfully!");
      } else {
        // For a new task, schedule a new notification.
        const tasksRef = collection(db, "users", userId, "tasks");
        const notificationId = await scheduleTaskNotification(title, dueDate);

        await addDoc(tasksRef, {
          title,
          description,
          priority,
          dueDate: Timestamp.fromDate(dueDate),
          category,
          completed: false,
          images: uploadedImageObjects,
          files: uploadedFileObjects,
          notificationId,
        });
        Alert.alert("Success", "Task added successfully!");
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
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

        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setModalVisible(true)}
        >
          <Text>{category || "Select Category"}</Text>
        </TouchableOpacity>

        <CategoryModal
          visible={modalVisible}
          onSelect={(selectedCategory) => setCategory(selectedCategory)}
          onClose={() => setModalVisible(false)}
        />

        <ImagePickerComponent images={images} setImages={setImages} />

        <DocumentPickerComponent files={files} setFiles={setFiles} />

        <TouchableOpacity style={styles.createButton} onPress={handleTask}>
          <Text style={styles.createButtonText}>
            {taskToEdit ? "Update Task" : "Add Task"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
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
    backgroundColor: Colors.secondary,
    marginBottom: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 20,
    backgroundColor: Colors.secondary,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    marginBottom: 20,
  },
  createButton: {
    width: "100%",
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 8,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
