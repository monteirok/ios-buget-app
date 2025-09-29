import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDataStore } from '@/services/dataContext';

const categories = ['Food', 'Transport', 'Housing', 'Fun', 'Misc', 'Trip Fund'];
const currencies = ['CAD', 'USD', 'THB', 'IDR'];

const categoryIds: Record<string, string> = {
  Food: 'food',
  Transport: 'transport',
  Housing: 'housing',
  Fun: 'fun',
  Misc: 'misc',
  'Trip Fund': 'trip-fund'
};

const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const store = useDataStore();
  const [amount, setAmount] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [currencyIndex, setCurrencyIndex] = useState(0);
  const [note, setNote] = useState('');

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a positive number.');
      return;
    }

    const categoryName = categories[categoryIndex];
    const categoryId = categoryIds[categoryName] ?? 'misc';
    const currency = currencies[currencyIndex];
    const amountCad = currency === 'CAD' ? parsedAmount : parsedAmount; // FX conversion stub

    store.addTransaction({
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2),
      date: new Date().toISOString(),
      amountOriginal: parsedAmount,
      currencyCode: currency,
      amountCAD: amountCad,
      categoryId,
      merchant: undefined,
      note: note.length > 0 ? note : undefined,
      photoUri: undefined
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#4b5563"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.pillRow}>
          {categories.map((category, index) => {
            const isActive = index === categoryIndex;
            return (
              <Pressable
                key={category}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setCategoryIndex(index)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{category}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Currency</Text>
        <View style={styles.pillRow}>
          {currencies.map((currency, index) => {
            const isActive = index === currencyIndex;
            return (
              <Pressable
                key={currency}
                style={[styles.pillSmall, isActive && styles.pillActive]}
                onPress={() => setCurrencyIndex(index)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{currency}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Optional note"
          placeholderTextColor="#4b5563"
          value={note}
          onChangeText={setNote}
        />
      </View>

      <Pressable
        style={[styles.saveButton, !amount && styles.saveButtonDisabled]}
        disabled={!amount}
        onPress={handleSave}
      >
        <Ionicons name="checkmark-circle" size={22} color="#0b111a" />
        <Text style={styles.saveLabel}>Save</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
    backgroundColor: '#0f141a'
  },
  card: {
    backgroundColor: '#18202b',
    borderRadius: 16,
    padding: 18,
    gap: 12
  },
  label: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#0f141a',
    borderRadius: 12,
    padding: 14,
    fontSize: 20,
    color: '#f1f5f9'
  },
  noteInput: {
    backgroundColor: '#0f141a',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#f1f5f9'
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  pill: {
    borderWidth: 1,
    borderColor: '#1f2933',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  pillSmall: {
    borderWidth: 1,
    borderColor: '#1f2933',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12
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
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#35c759',
    borderRadius: 999,
    paddingVertical: 16
  },
  saveButtonDisabled: {
    opacity: 0.5
  },
  saveLabel: {
    color: '#0b111a',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default AddExpenseScreen;
