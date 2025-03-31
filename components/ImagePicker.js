import React, { useState } from "react";
import { View, Button, Image, FlatList, StyleSheet, Alert, TouchableOpacity, Text, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "react-native-vector-icons/Ionicons";

const getStoragePathFromUri = (uri) => {
  const filename = uri.substring(uri.lastIndexOf('/') + 1);
  return `tasks/${filename}`;
};

const ImagePickerComponent = ({ images, setImages }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Function to launch the gallery picker
  const pickFromGallery = async () => {
    let permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Permission to access gallery is required");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
    });
    if (!result.cancelled) {
      if (result.assets) {
        // Map each asset to an object with a uri and storage path.
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          path: getStoragePathFromUri(asset.uri),
        }));
        setImages([...images, ...newImages]);
      } else {
        setImages([
          ...images,
          {
            uri: result.uri,
            path: getStoragePathFromUri(result.uri),
          }
        ]);
      }
    }
  };

  // Function to launch the camera
  const pickFromCamera = async () => {
    let permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Permission to access camera is required");
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
    });
    console.log("Camera result:", result);
    if (!result.cancelled) {
      const asset = result.assets[0];
      setImages([
        ...images,
        {
          uri: asset.uri,
          path: getStoragePathFromUri(asset.uri),
        }
      ]);
    }
  };

  // Open the modal when the select images button is pressed.
  const handleSelectImages = () => {
    setModalVisible(true);
  };

  // Remove image 
  const handleRemoveImage = (imageToRemove) => {
    const updatedImages = images.filter(image => image.uri !== imageToRemove.uri);
    setImages(updatedImages);
  };

  // Open the preview modal when an image is pressed.
  const openPreviewModal = (image) => {
    setPreviewImage(image);
    setPreviewModalVisible(true);
  };

  // Render each image with delete and preview handlers.
  const renderItem = ({ item }) => (
    <View style={styles.imageContainer}>
      <TouchableOpacity onPress={() => openPreviewModal(item)}>
        <Image source={{ uri: item.uri }} style={styles.imagePreview} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveImage(item)}
      >
        <Text style={styles.removeButtonText}>X</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Images</Text>
        <TouchableOpacity onPress={handleSelectImages}>
          <Ionicons name="attach-outline" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        horizontal
        style={styles.previewList}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setModalVisible(false); pickFromCamera(); }}
            >
              <Text style={styles.modalOptionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setModalVisible(false); pickFromGallery(); }}
            >
              <Text style={styles.modalOptionText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalOptionText, { color: 'red' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={previewModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.previewModalOverlay}
          activeOpacity={1}
          onPressOut={() => setPreviewModalVisible(false)}
        >
          <View style={styles.previewModalContent}>
            {previewImage && (
              <Image
                source={{ uri: previewImage.uri }}
                style={styles.previewModalImage}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  modalOptionText: {
    fontSize: 18,
    textAlign: "center",
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewModalContent: {
    width: "90%",
    height: "70%",
    backgroundColor: "#000",
    borderRadius: 10,
    overflow: "hidden",
  },
  previewModalImage: {
    width: "100%",
    height: "100%",
  },
});

export default ImagePickerComponent;
