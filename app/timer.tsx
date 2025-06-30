import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Timer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const paddedHrs = hrs.toString().padStart(2, '0');
    const paddedMins = mins.toString().padStart(2, '0');
    const paddedSecs = secs.toString().padStart(2, '0');

    return `${paddedHrs}:${paddedMins}:${paddedSecs}`;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      <Button
        title={isRunning ? 'Pause' : 'Start'}
        onPress={() => setIsRunning((prev) => !prev)}
      />
      <Button
        title="Reset"
        onPress={() => {
          setIsRunning(false);
          setSeconds(0);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  timerText: { fontSize: 48, marginBottom: 20 },
});
