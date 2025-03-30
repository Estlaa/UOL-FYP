import React from "react";
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Ionicons from "react-native-vector-icons/Ionicons";

// Helper function to generate a storage path from the URI.
const getStoragePathFromUri = (uri) => {
  const filename = uri.substring(uri.lastIndexOf("/") + 1);
  return `tasks/${filename}`;
};

const DocumentPickerComponent = ({ files, setFiles }) => {
  // Launch the document picker
  const pickDocument = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/plain",
          "text/csv",
          "text/css",
          "text/html",
          "text/xml",
          "application/pdf",
          "application/xml",
          "video/*",
          "audio/*",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });
      console.log(result);
      // Check the "canceled" property (not "cancelled")
      if (!result.canceled) {
        if (result.assets) {
          // Map each asset to an object with uri, name, and storage path.
          const newFiles = result.assets.map((asset) => ({
            uri: asset.uri,
            name: asset.name,
            path: getStoragePathFromUri(asset.uri),
          }));
          setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        } else {
          setFiles((prevFiles) => [
            ...prevFiles,
            {
              uri: result.uri,
              name: result.name,
              path: getStoragePathFromUri(result.uri),
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Document pick error:", error);
      Alert.alert("Error", "There was an issue picking the document.");
    }
  };

  const handleRemoveFile = (fileToRemove) => {
    const updatedFiles = files.filter((file) => file.uri !== fileToRemove.uri);
    setFiles(updatedFiles);
  };

  // Render each file as a small card with the file name and a remove button
  const renderItem = ({ item }) => (
    <View style={styles.fileContainer}>
      <Text style={styles.fileName} numberOfLines={1}>
        {item.name}
      </Text>
      <TouchableOpacity onPress={() => handleRemoveFile(item)} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header row with "Documents" label and attachment icon */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Documents</Text>
        <TouchableOpacity onPress={pickDocument}>
          <Ionicons name="attach-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Display selected documents */}
      {files && files.length > 0 && (
        <FlatList
          data={files}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          horizontal
          style={styles.previewList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 3,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  previewList: {
    marginTop: 10,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 150,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 10,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default DocumentPickerComponent;
