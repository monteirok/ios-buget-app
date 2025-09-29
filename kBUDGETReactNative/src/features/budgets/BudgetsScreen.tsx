import React from 'react';
import { View, Text, StyleSheet, FlatList, Switch } from 'react-native';
import { useDataStore } from '@/services/dataContext';

const BudgetsScreen: React.FC = () => {
  const store = useDataStore();
  const categories = store.getCategories();

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={categories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.limit}>${item.monthlyLimitCAD.toFixed(0)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.subtitle}>Carry over</Text>
            <Switch value={item.carryOver} trackColor={{ true: '#35c759' }} thumbColor="#0b111a" disabled />
          </View>
        </View>
      )}
    />
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
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600'
  },
  limit: {
    color: '#a0aec0',
    fontSize: 16
  },
  subtitle: {
    color: '#a0aec0',
    fontSize: 14
  }
});

export default BudgetsScreen;
