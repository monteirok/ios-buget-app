import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const SettingsScreen: React.FC = () => {
  const [baseCurrency, setBaseCurrency] = useState('CAD');
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [icloudEnabled, setIcloudEnabled] = useState(false);
  const [faceIdEnabled, setFaceIdEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Currency</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.pill, baseCurrency === 'CAD' && styles.pillActive]}
            onPress={() => setBaseCurrency('CAD')}
          >
            <Text style={[styles.pillText, baseCurrency === 'CAD' && styles.pillTextActive]}>CAD</Text>
          </Pressable>
          <Pressable
            style={[styles.pill, baseCurrency === 'USD' && styles.pillActive]}
            onPress={() => setBaseCurrency('USD')}
          >
            <Text style={[styles.pillText, baseCurrency === 'USD' && styles.pillTextActive]}>USD</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Reminders</Text>
        <Pressable style={styles.row} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.label}>Daily reminder</Text>
          <Text style={styles.value}>{reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </Pressable>
        <View style={styles.row}>
          <Text style={styles.label}>Enable iCloud Sync</Text>
          <Switch value={icloudEnabled} onValueChange={setIcloudEnabled} trackColor={{ true: '#35c759' }} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacy</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Face ID Lock</Text>
          <Switch value={faceIdEnabled} onValueChange={setFaceIdEnabled} trackColor={{ true: '#35c759' }} />
        </View>
        <Pressable style={styles.row}>
          <Text style={styles.label}>Export CSV</Text>
          <Text style={styles.value}>Share</Text>
        </Pressable>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={reminderTime}
          mode="time"
          onChange={(_, date) => {
            setShowTimePicker(false);
            if (date) {
              setReminderTime(date);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16
  },
  card: {
    backgroundColor: '#18202b',
    borderRadius: 16,
    padding: 20,
    gap: 16
  },
  cardTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    color: '#f1f5f9',
    fontSize: 16
  },
  value: {
    color: '#35c759',
    fontSize: 16,
    fontWeight: '600'
  },
  pill: {
    borderWidth: 1,
    borderColor: '#1f2933',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12
  },
  pillActive: {
    backgroundColor: '#35c759',
    borderColor: '#35c759'
  },
  pillText: {
    color: '#a0aec0',
    fontSize: 14
  },
  pillTextActive: {
    color: '#0b111a',
    fontWeight: '600'
  }
});

export default SettingsScreen;
