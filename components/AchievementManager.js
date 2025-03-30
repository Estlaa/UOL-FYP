// AchievementsManager.js
import { auth, db } from "../firebaseConfig";
import { doc, updateDoc, arrayUnion,getDoc, getDocs ,collection,query,where} from "firebase/firestore";
import moment from "moment";


export const achievementsData = [
    {
      id: "login_5_days",
      tier: "bronze",
      unlocked: false,
      caption: "5-day Login Streak "
    },
    {
      id: "login_15_days",
      tier: "silver",
      unlocked: false,
      caption: "15-day Login Streak "
    },
    {
      id: "login_30_days",
      tier: "gold",
      unlocked: false,
      caption: "30-day Login Streak "
    },
    {
      id: "tasks_5_completed",
      tier: "bronze",
      unlocked: false,
      caption: "5 Tasks Completed"
    },
    {
      id: "tasks_15_completed",
      tier: "silver",
      unlocked: false,
      caption: "15 Tasks Completed"
    },
    {
      id: "tasks_30_completed",
      tier: "gold",
      unlocked: false,
      caption: "30 Tasks Completed"
    }
  ];


const unlockAchievement = async (achievementId) => {
  const userId = auth.currentUser.uid;
  const achievementDocRef = doc(db, "users", userId, "achievements", "stats");
  try {
    await updateDoc(achievementDocRef, {
      // "unlockedAchievements" is array that holds all unlocked achievement IDs.
      unlockedAchievements: arrayUnion(achievementId)
    });
    console.log(`Achievement ${achievementId} unlocked`);
  } catch (error) {
    console.error("Error unlocking achievement:", error);
  }
};

// Function to check and unlock login achievements based on the current login streak.
export const checkLoginAchievements = async (loginStreak) => {
  if (loginStreak >= 5) {
    await unlockAchievement("login_5_days");
  }
  if (loginStreak >= 15) {
    await unlockAchievement("login_15_days");
  }
  if (loginStreak >= 30) {
    await unlockAchievement("login_30_days");
  }
};

// Function to check and unlock task achievements based on the number of tasks completed.
export const checkTaskAchievements = async (tasksCompleted) => {
  if (tasksCompleted >= 5) {
    await unlockAchievement("tasks_5_completed");
  }
  if (tasksCompleted >= 15) {
    await unlockAchievement("tasks_15_completed");
  }
  if (tasksCompleted >= 30) {
    await unlockAchievement("tasks_30_completed");
  }
};


export const updateLoginStreak = async () => {
  try {
    const userId = auth.currentUser.uid;
    const statsDocRef = doc(db, "users", userId, "achievements", "stats");
    const statsSnap = await getDoc(statsDocRef);

    let stats = statsSnap.data() || {};
    const today = moment().startOf("day");
    let loginStreak = stats.loginStreak || 0;

    if (stats.lastLogin) {
      const lastLoginDate = moment(stats.lastLogin).startOf("day");

      if (today.isSame(lastLoginDate, "day")) {
        console.log("User already logged in today. Login streak remains:", loginStreak);
        return loginStreak;
      }

      const expectedLoginDate = lastLoginDate.clone().add(1, "day");

      if (today.isSame(expectedLoginDate, "day")) {
        loginStreak++;
      } else {
        // Not a consecutive login; reset streak to 1.
        loginStreak = 1;
      }
    } else {
      // No lastLogin data means first-time login.
      loginStreak = 1;
    }

    // Update the stats document with the new streak and today's login.
    await updateDoc(statsDocRef, {
      loginStreak,
      lastLogin: today.toISOString(),
    });

    console.log("Updated login streak:", loginStreak);
    return loginStreak;
  } catch (error) {
    console.error("Error updating login streak:", error);
    throw error;
  }
};

export const updateTasksCompleted = async () => {
    try {
      const userId = auth.currentUser.uid;

      const tasksCollectionRef = collection(db, "users", userId, "tasks");
      
      // Query for tasks where "completed" is true.
      const tasksQuery = query(tasksCollectionRef, where("completed", "==", true));
      const querySnapshot = await getDocs(tasksQuery);
      
      // Count the number of tasks with completed set to true.
      const tasksCount = querySnapshot.size;
      

      const statsDocRef = doc(db, "users", userId, "achievements", "stats");
      
      // Update the stats document with the new tasksCompleted count.
      await updateDoc(statsDocRef, {
        tasksCompleted: tasksCount,
      });
      
      console.log("Updated tasks completed count:", tasksCount);
      return tasksCount;
    } catch (error) {
      console.error("Error updating tasks completed:", error);
      throw error;
    }
  };

