/**
 * Next Step - Chore and life-admin companion for neurodivergent brains
 */
import 'react-native-get-random-values'; // Must be first – polyfills crypto.getRandomValues for uuid

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AppProvider } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { TaskDetailScreen } from './src/screens/TaskDetailScreen';
import { SessionRunnerScreen } from './src/screens/SessionRunnerScreen';
import { SessionCompleteScreen } from './src/screens/SessionCompleteScreen';
import { TaskLibraryScreen } from './src/screens/TaskLibraryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { AddTaskScreen } from './src/screens/AddTaskScreen';
import { CompletedTasksScreen } from './src/screens/CompletedTasksScreen';
import { EditTaskScreen } from './src/screens/EditTaskScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#FDF8F5' },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="SessionRunner" component={SessionRunnerScreen} />
            <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} />
            <Stack.Screen name="TaskLibrary" component={TaskLibraryScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Progress" component={ProgressScreen} />
            <Stack.Screen name="AddTask" component={AddTaskScreen} />
            <Stack.Screen name="CompletedTasks" component={CompletedTasksScreen} />
            <Stack.Screen name="EditTask" component={EditTaskScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
