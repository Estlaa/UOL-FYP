import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import ProgressCircle from 'react-native-progress/Circle';
import Colors from '../themes/Colors';

const TimerScreen = () => {
  const [workDuration, setWorkDuration] = useState(25 * 60); // 25 minutes in seconds
  const [breakDuration, setBreakDuration] = useState(5 * 60); // 5 minutes in seconds
  const [cycles, setCycles] = useState(4); // Number of cycles
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isWorking, setIsWorking] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);

  const [inputWorkDuration, setInputWorkDuration] = useState('25');
  const [inputBreakDuration, setInputBreakDuration] = useState('5');
  const [inputCycles, setInputCycles] = useState('4');

  // Track whether settings have been applied
  const [settingsApplied, setSettingsApplied] = useState(false);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isWorking) {
        if (currentCycle < cycles) {
          setIsWorking(false);
          setTimeLeft(breakDuration);
          setCurrentCycle((prev) => prev + 1);
        } else {
          resetTimer();
        }
      } else {
        setIsWorking(true);
        setTimeLeft(workDuration);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isWorking, workDuration, breakDuration, cycles, currentCycle]);

  // Reset the timer when settings are applied
  useEffect(() => {
    if (settingsApplied) {
      resetTimer();
      setSettingsApplied(false); // Reset the flag
    }
  }, [settingsApplied]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setIsWorking(true);
    setTimeLeft(workDuration);
    setCurrentCycle(1);
  };

  const applySettings = () => {
    const newWorkDuration = parseInt(inputWorkDuration, 10) * 60;
    const newBreakDuration = parseInt(inputBreakDuration, 10) * 60;
    const newCycles = parseInt(inputCycles, 10);

    if (!isNaN(newWorkDuration) && !isNaN(newBreakDuration) && !isNaN(newCycles)) {
      setWorkDuration(newWorkDuration);
      setBreakDuration(newBreakDuration);
      setCycles(newCycles);
      setTimeLeft(newWorkDuration);
      setSettingsApplied(true); // Trigger the reset
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
  
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculate progress for the current session (work or break)
  const progress = timeLeft / (isWorking ? workDuration : breakDuration);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isWorking ? 'Work Time' : 'Break Time'}</Text>
      <Text style={styles.cycleText}>Cycle: {currentCycle} of {cycles}</Text>
      
      <View style={styles.timerContainer}>
        <ProgressCircle
          progress={progress}
          size={200}
          thickness={10}
          showsText={false}
          color={Colors.primary}
          unfilledColor="#e6e6e6"
          borderWidth={0}
        />
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={isRunning ? pauseTimer : startTimer}>
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={resetTimer}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Customization Inputs */}
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsTitle}>Customize Timer</Text>
        <View style={styles.inputContainer}>
          <Text>Work Duration (minutes):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={inputWorkDuration}
            onChangeText={setInputWorkDuration}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text>Break Duration (minutes):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={inputBreakDuration}
            onChangeText={setInputBreakDuration}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text>Number of Cycles:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={inputCycles}
            onChangeText={setInputCycles}
          />
        </View>
        <TouchableOpacity style={styles.applyButton} onPress={applySettings}>
          <Text style={styles.applyButtonText}>Apply Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cycleText: {
    fontSize: 16,
    marginBottom: 20,
  },
  timerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    position: 'absolute',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    width: '40%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsContainer: {
    width: '100%',
    marginTop: 20,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TimerScreen;
