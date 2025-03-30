import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../themes/Colors.js";
import { fixedCategories } from "../components/CategoryModal.js";

const Filter = ({ visible, onClose, onApply }) => {
  const [completed, setCompleted] = useState(false);
  const [incomplete, setIncomplete] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (categoryName) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryName));
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  const clearFilters = () => {
    setCompleted(false);
    setIncomplete(false);
    setSelectedCategories([]);
  };

  const applyFilters = () => {
    if (onApply) onApply({ completed, incomplete, categories: selectedCategories });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={applyFilters}>
      <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPressOut={applyFilters}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <Text style={styles.sectionHeader}>Status</Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setCompleted(!completed)}
              >
                <Ionicons
                  name={completed ? "checkbox" : "checkbox-outline"}
                  size={24}
                  color={Colors.primary}
                />
                <Text style={styles.checkboxLabel}>Completed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setIncomplete(!incomplete)}
              >
                <Ionicons
                  name={incomplete ? "checkbox" : "checkbox-outline"}
                  size={24}
                  color={Colors.primary}
                />
                <Text style={styles.checkboxLabel}>Incomplete</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionHeader}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {fixedCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.checkboxContainer}
                  onPress={() => toggleCategory(category.name)}
                >
                  <Ionicons
                    name={selectedCategories.includes(category.name) ? "checkbox" : "checkbox-outline"}
                    size={24}
                    color={Colors.primary}
                  />
                  <Text style={styles.checkboxLabel}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.buttonText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 10,
    paddingBottom: 5,
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  categoriesContainer: {
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  clearButton: {
    backgroundColor: "#888",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Filter;
