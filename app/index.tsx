import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';

export default function StreakTracker() {
  const [streak, setStreak] = useState<number>(0);
  const [lastDate, setLastDate] = useState<Date | null>(null);
  const [checkedInDates, setCheckedInDates] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const savedStreak = await AsyncStorage.getItem('streak');
        const savedDate = await AsyncStorage.getItem('lastDate');
        const savedCheckedIn = await AsyncStorage.getItem('checkedInDates');
        if (savedStreak !== null) setStreak(parseInt(savedStreak));
        if (savedDate !== null) setLastDate(new Date(savedDate));
        if (savedCheckedIn !== null) setCheckedInDates(JSON.parse(savedCheckedIn));
      } catch (e) {
        console.log('Failed to load data', e);
      }
    }
    loadData();
  }, []);

  function isYesterday(date1: Date, date2: Date) {
    const diffTime = date1.getTime() - date2.getTime();
    return diffTime > 0 && diffTime < 1000 * 60 * 60 * 24 * 1.5;
  }

  async function onCheckIn() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    if (lastDate) {
      const last = new Date(lastDate);
      last.setHours(0, 0, 0, 0);
      if (today.getTime() === last.getTime()) {
        Alert.alert('Already checked in today!');
        return;
      }
      if (isYesterday(today, last)) {
        setStreak((prev) => {
          const newStreak = prev + 1;
          AsyncStorage.setItem('streak', newStreak.toString());
          return newStreak;
        });
      } else {
        setStreak(1);
        await AsyncStorage.setItem('streak', '1');
      }
    } else {
      setStreak(1);
      await AsyncStorage.setItem('streak', '1');
    }

    // Add today to checkedInDates
    setCheckedInDates((prev) => {
      const updatedDates = [...prev, todayStr];
      AsyncStorage.setItem('checkedInDates', JSON.stringify(updatedDates));
      return updatedDates;
    });

    setLastDate(today);
    await AsyncStorage.setItem('lastDate', today.toISOString());
  }

  // Build markedDates object for Calendar
  const markedDates = checkedInDates.reduce((acc, date) => {
    acc[date] = { selected: true, marked: true, selectedColor: '#50cebb' };
    return acc;
  }, {} as { [key: string]: { selected: boolean; marked: boolean; selectedColor: string } });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 You’re on a {streak}-day streak!</Text>
      <Button title="Check In Today" onPress={onCheckIn} />
      <Calendar
        markedDates={markedDates}
        style={{ marginTop: 20 }}
        // optional: customize theme/colors here
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, marginBottom: 10, textAlign: 'center' },
});
