import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import StudentsScreen from './screens/StudentsScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import AttendanceRegisterScreen from './screens/AttendanceRegisterScreen';
import ClassManagementScreen from "./screens/ClassManagementScreen";

const Stack = createNativeStackNavigator();

/**
 * App.js - Main Entry Point
 * Sets up the navigation container and stack for the entire application.
 */
export default function App() {
  return (
    <NavigationContainer>
      {/* 
          Stack Navigator manages the "breadcrumbs" or back-history of the app.
          Each Screen corresponds to a different file in the /screens directory.
      */}
      <Stack.Navigator>
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* Main Application Screens */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Students" component={StudentsScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="AttendanceRegister" component={AttendanceRegisterScreen}/>
        <Stack.Screen name="Classes" component={ClassManagementScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

