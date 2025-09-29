import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '@/features/dashboard/DashboardScreen';
import BudgetsScreen from '@/features/budgets/BudgetsScreen';
import HistoryScreen from '@/features/history/HistoryScreen';
import SettingsScreen from '@/features/settings/SettingsScreen';
import AddExpenseScreen from '@/features/expenses/AddExpenseScreen';
import { DataProvider } from '@/services/dataContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0f141a',
    card: '#121821',
    text: '#f1f5f9',
    border: '#1f2933',
    primary: '#35c759'
  }
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'home',
            Budgets: 'pie-chart',
            History: 'time',
            Settings: 'settings'
          };
          const name = icons[route.name] ?? 'ellipse';
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: '#10171f'
        },
        tabBarActiveTintColor: '#35c759',
        headerShown: false
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator>
            <Stack.Screen name="Root" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen
              name="AddExpense"
              component={AddExpenseScreen}
              options={{ title: 'Add Expense' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </DataProvider>
    </SafeAreaProvider>
  );
}
