import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import Colors from "../themes/Colors";
import { achievementsData } from "../components/AchievementManager";

// Calculate a card width that fits two cards per row with some margin.
const { width } = Dimensions.get("window");
const CARD_WIDTH = (width / 2) - 24; // half screen minus margins

export default function AchievementScreen() {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);

  useEffect(() => {
    const fetchUnlockedAchievements = async () => {
      try {
        const userId = auth.currentUser.uid;
        const statsDocRef = doc(db, "users", userId, "achievements", "stats");
        const statsSnap = await getDoc(statsDocRef);
        if (statsSnap.exists()) {
          const data = statsSnap.data();
          if (data.unlockedAchievements) {
            setUnlockedAchievements(data.unlockedAchievements);
          }
        }
      } catch (error) {
        console.error("Error fetching unlocked achievements:", error);
      }
    };

    fetchUnlockedAchievements();
  }, []);

  // Merge static achievements data with whether they've been unlocked
  const achievementsList = achievementsData.map((achievement) => ({
    ...achievement,
    unlocked: unlockedAchievements.includes(achievement.id),
  }));

  // Map tiers to medal images
  const medalImages = {
    bronze: require("../assets/bronze.png"),
    silver: require("../assets/silver.png"),
    gold: require("../assets/gold.png"),
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={medalImages[item.tier]}
        style={[styles.image, { opacity: item.unlocked ? 1 : 0.3 }]}
        resizeMode="contain"
      />
      <Text style={styles.caption}>{item.caption}</Text>
      {!item.unlocked && (
        <Text style={styles.lockedText}>Locked</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Achievements</Text>
      <FlatList
        data={achievementsList}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || "#fff",
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: Colors.primary || "#333",
  },
  contentContainer: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    padding: 16,
    alignItems: "center",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  caption: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.text || "#333",
    marginBottom: 4,
  },
  lockedText: {
    fontSize: 12,
    color: "#888",
  },
});
