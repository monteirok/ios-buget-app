import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CtaButton from '@/components/CtaButton';
import CategoryProgressList, { CategoryProgress } from '@/features/dashboard/components/CategoryProgressList';
import { useDataStore } from '@/services/dataContext';
import { snapshotForCategory, tripProgress, dailyAllowance } from '@/services/budgetCalculator';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const store = useDataStore();
  const categories = store.getCategories();
  const transactions = store.getTransactions();
  const goal = store.getTripGoal();
  const now = useMemo(() => new Date(), []);

  const monthStart = useMemo(() => new Date(now.getFullYear(), now.getMonth(), 1), [now]);
  const monthEnd = useMemo(() => new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59), [now]);
  const weekEnd = useMemo(() => {
    const temp = new Date(now);
    const day = temp.getDay();
    const diff = 6 - day;
    temp.setDate(temp.getDate() + diff);
    temp.setHours(23, 59, 59, 999);
    return temp;
  }, [now]);

  const categoryProgress = useMemo<CategoryProgress[]>(() => {
    return categories.map((category) => {
      const snapshot = snapshotForCategory(category, transactions, monthStart, monthEnd);
      return {
        id: category.id,
        name: category.name,
        remaining: snapshot.remaining,
        total: snapshot.allocated + snapshot.carriedOver,
        color: category.colorHex
      };
    });
  }, [categories, transactions, monthStart, monthEnd]);

  const remainingThisMonth = useMemo(() => {
    const totalAllocated = categories.reduce((sum, category) => sum + category.monthlyLimitCAD, 0);
    const spent = transactions
      .filter((transaction) => {
        const date = new Date(transaction.date);
        return date >= monthStart && date <= monthEnd;
      })
      .reduce((sum, transaction) => sum + transaction.amountCAD, 0);
    return Math.max(0, totalAllocated - spent);
  }, [categories, transactions, monthStart, monthEnd]);

  const daysRemainingThisMonth = useMemo(() => {
    const diff = Math.max(0, Math.ceil((monthEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    return diff;
  }, [monthEnd, now]);

  const todayRemaining = dailyAllowance(remainingThisMonth, daysRemainingThisMonth);

  const daysRemainingThisWeek = useMemo(() => {
    const diff = Math.max(0, Math.ceil((weekEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    return diff;
  }, [weekEnd, now]);

  const weekRemaining = dailyAllowance(remainingThisMonth, daysRemainingThisWeek);

  const progress = goal ? tripProgress(goal, transactions, now) : undefined;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trip Progress</Text>
        {progress ? (
          <>
            <Text style={styles.progressLabel}>
              {progress.target > 0
                ? `${Math.round((progress.totalSaved / progress.target) * 100)}% saved`
                : '0% saved'}
            </Text>
            <Text style={styles.progressValue}>
              ${progress.totalSaved.toFixed(0)} / ${progress.target.toFixed(0)}
            </Text>
            <Text style={[styles.cardSubtitle, { color: progress.onTrack ? '#35c759' : '#f87171' }]}>
              {progress.onTrack
                ? "You're on track."
                : `You're behind by $${Math.abs(progress.delta).toFixed(0)} this month.`}
            </Text>
          </>
        ) : (
          <Text style={styles.cardSubtitle}>Set your trip goal to start tracking progress.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Remaining</Text>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.subtitle}>Today</Text>
            <Text style={styles.summaryValue}>${todayRemaining.toFixed(2)}</Text>
          </View>
          <View>
            <Text style={styles.subtitle}>Week</Text>
            <Text style={styles.summaryValue}>${weekRemaining.toFixed(2)}</Text>
          </View>
        </View>
        <CategoryProgressList categories={categoryProgress} />
      </View>

      <CtaButton
        label="Add Expense"
        icon="add-circle"
        onPress={() => navigation.navigate('AddExpense')}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24
  },
  card: {
    backgroundColor: '#18202b',
    borderRadius: 16,
    padding: 20
  },
  cardTitle: {
    color: '#f1f5f9',
    fontSize: 18,
    fontWeight: '600'
  },
  progressLabel: {
    color: '#35c759',
    fontSize: 16,
    marginTop: 12
  },
  progressValue: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '700'
  },
  cardSubtitle: {
    color: '#a0aec0',
    fontSize: 14,
    marginTop: 8
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  subtitle: {
    color: '#a0aec0',
    fontSize: 14
  },
  summaryValue: {
    color: '#f1f5f9',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4
  }
});

export default DashboardScreen;
