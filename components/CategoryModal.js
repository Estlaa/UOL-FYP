import React from "react";
import { Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback, FlatList, StyleSheet } from "react-native";
import Colors from "../themes/Colors";

// Fixed list of categories
export const fixedCategories = [
  { id:"1",name: "None"},
  { id: "2", name: "Work" },
  { id: "3", name: "School" },
  { id: "4", name: "Shopping" },
  { id: "5", name: "Sport" },
  { id: "6", name: "Personal" },
];

export default function CategoryModal({ visible, onSelect, onClose }) {
  return (
    <Modal animationType="fade" visible={visible} transparent>
      <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <FlatList
              data={fixedCategories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    onSelect(item.name);
                    onClose();
                  }}
                >
                  <Text style={styles.categoryText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: "80%",
    borderRadius: 10,
    padding: 20,
    maxHeight: "70%",
  },
  categoryItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  categoryText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    alignSelf: "center",
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
