import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../firebase';

export default function DashboardScreen({ navigation }) {
  const [loggingOut, setLoggingOut] = useState(false);

  /**
   * Handle Logout
   * Signs out from Firebase and redirects to Login screen.
   */
  const logout = useCallback(async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (e) {
      console.log(e);
    } finally {
      setLoggingOut(false);
    }
  }, [loggingOut, navigation]);


  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>School Dashboard</Text>
        <Text style={styles.subtitle}>Attendance Management System</Text>
      </View>

      {/* CARDS */}
      <View style={styles.grid}>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Classes')}>
          <Text style={styles.cardIcon}>🏫</Text>
          <Text style={styles.cardText}>Manage Classes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Students')}>
          <Text style={styles.cardIcon}>👨‍🎓</Text>
          <Text style={styles.cardText}>Manage Students</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Attendance')}>
          <Text style={styles.cardIcon}>📝</Text>
          <Text style={styles.cardText}>Mark Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('AttendanceRegister')}>
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardText}>Monthly Report</Text>
        </TouchableOpacity>

      </View>

      {/* LOGOUT */}
      <TouchableOpacity
        style={[styles.logout, loggingOut && { opacity: 0.6 }]}
        onPress={logout}
        disabled={loggingOut}
      >
        <Text style={styles.logoutText}>
          {loggingOut ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 20,
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center'
  },


  header: {
    marginTop: 20,
    marginBottom: 10
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937'
  },

  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },

  card: {
    width: '47%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 14,
    marginBottom: 15,

    // shadow (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    // elevation (Android)
    elevation: 3,

    alignItems: 'center'
  },

  cardIcon: {
    fontSize: 28,
    marginBottom: 10
  },

  cardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111827'
  },

  logout: {
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10
  },

  logoutText: {
    color: 'white',
    fontWeight: 'bold'
  }
});