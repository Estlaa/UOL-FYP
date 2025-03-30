import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from "./themes/Colors"

// Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import TaskScreen from "./screens/TaskScreen";
import AddTask from "./screens/AddTask";
import TimerScreen from "./screens/TimerScreen";
import CalendarScreen from "./screens/CalendarScreen";
import SearchScreen from "./screens/SearchScreen";
import AchievementScreen from "./screens/AchievementScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  const auth = getAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: "white",
        headerTitleStyle: { fontWeight: "bold" },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case "Tasks":
              iconName = "checkmark-done-outline";
              break;
            case "Pomodoro Timer":
              iconName = "timer-outline";
              break;
            case "Search":
              iconName = "search-outline";
              break;
            case "Achievements":
              iconName = "trophy-outline";
              break;
            case "Calendar":
              iconName = "calendar-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        headerRight: () => (
          <Ionicons
            name="log-out-outline"
            size={24}
            color="white"
            style={{ marginRight: 15 }}
            onPress={() => auth.signOut()}
          />
        ),
      })}
    >
      <Tab.Screen name="Tasks" component={TaskScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Pomodoro Timer" component={TimerScreen} />
      <Tab.Screen name="Achievements" component={AchievementScreen} />

    </Tab.Navigator>
  );
}


export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex:1}}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: "white",
            headerTitleStyle: { fontWeight: "bold" },
          }}>
          {user ? (
            // If user is logged in, show BottomTabs inside Stack
            <>
              <Stack.Screen name="Home" component={BottomTabs} options={{ headerShown: false }} />
              <Stack.Screen name="Add Task" component={AddTask} />
            </>
          ) : (
            // If not logged in, show Login and Register
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
