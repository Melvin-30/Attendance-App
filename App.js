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

import { useState, useEffect } from 'react';
import { Alert, Linking, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from './firebase';

const Stack = createNativeStackNavigator();

/**
 * APP_VERSION
 * Update this number whenever you release a new version.
 */
const APP_VERSION = "1.0.0";

/**
 * App.js - Main Entry Point
 * Sets up navigation and performs a mandatory update check on launch.
 */
export default function App() {
  const [isOldVersion, setIsOldVersion] = useState(false);
  const [updateUrl, setUpdateUrl] = useState("");

  useEffect(() => {
    /**
     * checkVersion
     * Fetches the latest version info from Firestore: config/app
     * If local version doesn't match, locks the app.
     */
    const checkVersion = async () => {
      try {
        const doc = await db.collection("config").doc("app").get();
        if (doc.exists) {
          const { latestVersion, url } = doc.data();
          
          if (latestVersion && latestVersion !== APP_VERSION) {
            setUpdateUrl(url || "https://your-download-site.com");
            setIsOldVersion(true);
          }
        }
      } catch (error) {
        console.warn("Update check failed:", error.message);
      }
    };

    checkVersion();
  }, []);

  // If the version is old, show a persistent lock screen that cannot be dismissed
  if (isOldVersion) {
    return (
      <View style={styles.lockContainer}>
        <View style={styles.lockCard}>
          <Text style={styles.lockEmoji}>🚀</Text>
          <Text style={styles.lockTitle}>Update Required</Text>
          <Text style={styles.lockMessage}>
            A new version of the app is available. Please update to continue using the service.
          </Text>
          <TouchableOpacity 
            style={styles.lockButton} 
            onPress={() => Linking.openURL(updateUrl)}
          >
            <Text style={styles.lockButtonText}>Download & Update Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


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

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lockCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  lockEmoji: {
    fontSize: 50,
    marginBottom: 20,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
  },
  lockMessage: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
    marginBottom: 30,
  },
  lockButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  lockButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


