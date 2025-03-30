import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TextInput, Alert,TouchableOpacity } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Colors from "../themes/Colors";
import { checkLoginAchievements,updateLoginStreak } from "../components/AchievementManager";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then(async(userCredential) => {
        console.log("User signed in:", userCredential.user);
        // Update the login streak and get the current streak value.
        const currentLoginStreak = await updateLoginStreak();
        // Check if any login achievements should be unlocked.
        await checkLoginAchievements(currentLoginStreak);
      })
      .catch((error) => {
        console.error("Error signing in:", error.message);
        Alert.alert("Login Error", "Invalid login credentials, please check for correct email and password");
      });
  };

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Sign in</Text>
      </TouchableOpacity>
      <Text style={{marginTop:16,fontSize:14,fontWeight: 'bold'}}>
        Don't have an account?
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("Register")} >
          <Text style={styles.btnText}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    marginHorizontal:16,
  },
  input: {
    width: "100%",
    padding: 15,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: Colors.secondary,
  },
  btn:{
    width:"100%",
    backgroundColor: Colors.primary,
    padding:15,
    borderRadius:10,
    marginTop:8
  },
  btnText:{
    color:"white",
    fontSize:16,
    textAlign:'center',
    fontWeight: 'bold'
  },
});
