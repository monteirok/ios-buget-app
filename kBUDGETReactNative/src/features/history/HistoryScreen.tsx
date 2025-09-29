import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useDataStore } from '@/services/dataContext';

interface HistorySection {
  title: string;
  data: HistoryEntry[];
}

interface HistoryEntry {
  id: string;
  merchant: string;
  category: string;
  amountCad: number;
  originalAmount: number;
  currency: string;
}

const formatSectionTitle = (date: Date): string => {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  if (isToday) {
    return 'Today';
  }
  return date.toLocaleDateString();
};

const HistoryScreen: React.FC = () => {
  const store = useDataStore();
  const transactions = store.getTransactions();
  const categories = store.getCategories();

  const sections = useMemo<HistorySection[]>(() => {
    const categoryLookup = new Map(categories.map((category) => [category.id, category.name]));
    const groups = new Map<string, HistoryEntry[]>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const key = date.toISOString().slice(0, 10);
      const entry: HistoryEntry = {
        id: transaction.id,
        merchant: transaction.merchant ?? 'Expense',
        category: categoryLookup.get(transaction.categoryId) ?? 'Unknown',
        amountCad: transaction.amountCAD,
        originalAmount: transaction.amountOriginal,
        currency: transaction.currencyCode
      };
      const existing = groups.get(key) ?? [];
      groups.set(key, [...existing, entry]);
    });

    const sortedKeys = Array.from(groups.keys()).sort((a, b) => (a < b ? 1 : -1));
    return sortedKeys.map((key) => {
      const date = new Date(key);
      return {
        title: formatSectionTitle(date),
        data: groups.get(key) ?? []
      };
    });
  }, [transactions, categories]);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderSectionHeader={({ section }) => (
        <Text style={styles.sectionTitle}>{section.title}</Text>
      )}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View>
            <Text style={styles.merchant}>{item.merchant}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <View style={styles.amountBlock}>
            <Text style={styles.amountCad}>${item.amountCad.toFixed(2)} CAD</Text>
            <Text style={styles.original}>
              {item.originalAmount.toFixed(2)} {item.currency}
            </Text>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyState}>No expenses yet. Add one to see it here.</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16
  },
  sectionTitle: {
    color: '#a0aec0',
    fontSize: 14,
    marginTop: 24,
    marginBottom: 8
  },
  row: {
    backgroundColor: '#18202b',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  merchant: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600'
  },
  category: {
    color: '#a0aec0',
    fontSize: 14,
    marginTop: 4
  },
  amountBlock: {
    alignItems: 'flex-end'
  },
  amountCad: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600'
  },
  original: {
    color: '#a0aec0',
    fontSize: 13,
    marginTop: 4
  },
  emptyState: {
    color: '#a0aec0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 48
  }
});

export default HistoryScreen;
