import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig.js";
import Colors from "../themes/Colors.js";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegistration = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Save basic user data in the "users" collection.
      await setDoc(doc(db, "users", userId), {
        username,
        email,
      });

      // Create a subcollection "achievements" under the user document with a default document "stats".
      await setDoc(doc(db, "users", userId, "achievements", "stats"), {
        lastLogin: new Date().toISOString(),
        loginStreak: 0,
        tasksCompleted: 0,
      });

      console.log("User registered with default achievements saved in Firestore.");
      // Optionally, navigate to the next screen
      // navigation.navigate('SomeOtherScreen');
    } catch (error) {
      console.error("Error signing up:", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.btn} onPress={handleRegistration}>
        <Text style={styles.btnText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f7",
  },
  input: {
    width: "100%",
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
  },
  btn: {
    width: "100%",
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 8,
  },
  btnText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});
