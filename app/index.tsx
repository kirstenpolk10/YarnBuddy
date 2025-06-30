// src/StreakTracker.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';

import { db } from "./firebase"; // your firebase config
import { doc, getDoc, setDoc } from "firebase/firestore";

const userId = "demo-user"; // Replace with real user id when auth is added

export default function StreakTracker() {
  const [streak, setStreak] = useState<number>(0);
  const [lastDate, setLastDate] = useState<Date | null>(null);
  const [checkedInDates, setCheckedInDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Utility function to check if date1 is yesterday of date2
  function isYesterday(date1: Date, date2: Date) {
    const diffTime = date1.getTime() - date2.getTime();
    return diffTime > 0 && diffTime < 1000 * 60 * 60 * 24 * 1.5;
  }

  // Load data from Firestore on mount
  useEffect(() => {
    async function loadData() {
      try {
        const docRef = doc(db, "streaks", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.streak !== undefined) setStreak(data.streak);
          if (data.lastDate !== undefined) setLastDate(new Date(data.lastDate));
          if (data.checkedInDates !== undefined) setCheckedInDates(data.checkedInDates);

          // Save to AsyncStorage as cache
          await AsyncStorage.setItem('streak', data.streak.toString());
          await AsyncStorage.setItem('lastDate', data.lastDate);
          await AsyncStorage.setItem('checkedInDates', JSON.stringify(data.checkedInDates));
        } else {
          // If no Firestore data, fallback to AsyncStorage
          const savedStreak = await AsyncStorage.getItem('streak');
          const savedDate = await AsyncStorage.getItem('lastDate');
          const savedCheckedIn = await AsyncStorage.getItem('checkedInDates');

          if (savedStreak !== null) setStreak(parseInt(savedStreak));
          if (savedDate !== null) setLastDate(new Date(savedDate));
          if (savedCheckedIn !== null) setCheckedInDates(JSON.parse(savedCheckedIn));
        }
      } catch (e) {
        console.log('Failed to load data from Firestore', e);
        // fallback to AsyncStorage
        const savedStreak = await AsyncStorage.getItem('streak');
        const savedDate = await AsyncStorage.getItem('lastDate');
        const savedCheckedIn = await AsyncStorage.getItem('checkedInDates');

        if (savedStreak !== null) setStreak(parseInt(savedStreak));
        if (savedDate !== null) setLastDate(new Date(savedDate));
        if (savedCheckedIn !== null) setCheckedInDates(JSON.parse(savedCheckedIn));
      }
      setLoading(false);
    }

    loadData();
  }, []);

  // Save current streak data to Firestore AND AsyncStorage
  async function saveData(newStreak: number, newCheckedInDates: string[], todayISO: string) {
    try {
      // Save to Firestore
      const docRef = doc(db, "streaks", userId);
      await setDoc(docRef, {
        streak: newStreak,
        checkedInDates: newCheckedInDates,
        lastDate: todayISO,
      });

      // Save to AsyncStorage (local cache)
      await AsyncStorage.setItem('streak', newStreak.toString());
      await AsyncStorage.setItem('lastDate', todayISO);
      await AsyncStorage.setItem('checkedInDates', JSON.stringify(newCheckedInDates));
    } catch (e) {
      console.log('Failed to save data to Firestore', e);
    }
  }

  // Handler for user check-in
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
        // Continue streak
        const newStreak = streak + 1;
        const newCheckedInDates = [...checkedInDates, todayStr];
        setStreak(newStreak);
        setCheckedInDates(newCheckedInDates);
        setLastDate(today);
        await saveData(newStreak, newCheckedInDates, today.toISOString());
      } else {
        // Streak broken, reset
        const newStreak = 1;
        const newCheckedInDates = [todayStr];
        setStreak(newStreak);
        setCheckedInDates(newCheckedInDates);
        setLastDate(today);
        await saveData(newStreak, newCheckedInDates, today.toISOString());
      }
    } else {
      // First ever check-in
      const newStreak = 1;
      const newCheckedInDates = [todayStr];
      setStreak(newStreak);
      setCheckedInDates(newCheckedInDates);
      setLastDate(today);
      await saveData(newStreak, newCheckedInDates, today.toISOString());
    }
  }

  // Prepare marked dates for calendar display
  const markedDates = checkedInDates.reduce((acc, date) => {
    acc[date] = { selected: true, marked: true, selectedColor: '#50cebb' };
    return acc;
  }, {} as { [key: string]: { selected: boolean; marked: boolean; selectedColor: string } });

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading streak...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 You’re on a {streak}-day streak!</Text>
      <Button title="Check In Today" onPress={onCheckIn} />
      <Calendar
        markedDates={markedDates}
        style={{ marginTop: 20 }}
        // Add any customization you want here
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 24, marginBottom: 10, textAlign: 'center' },
});
