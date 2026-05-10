import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';


import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebase';

export default function AttendanceScreen() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [attendanceData, setAttendanceData] = useState({});

  /**
   * Format Date
   * Converts a Date object to a string format (YYYY-MM-DD) for Firestore document IDs.
   */
  const formatDate = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;
  };

  const selectedDate = formatDate(date);

  /**
   * Load Classes
   * Fetches the classes list for the selector.
   */
  const loadClasses = useCallback(async () => {
    try {
      const snap = await db.collection('classes').get();
      let list = snap.docs.map((doc) => doc.data().name);

      list.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );

      setClasses(list);
      setSelectedClass(prev => prev || list[0] || '');
    } catch (error) {
      console.error("Error loading classes:", error);
      Alert.alert("Error", "Could not load classes: " + error.message);
    }
  }, []);

  /**
   * Load Students
   * Fetches the student list to display in the attendance sheet.
   */
  const loadStudents = async () => {
    try {
      const snap = await db.collection('students').get();
      setStudents(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Error loading students:", error);
      Alert.alert("Error", "Could not load students: " + error.message);
    }
  };

  /**
   * Load Attendance
   * Fetches the attendance record for the specific selected date.
   */
  const loadAttendance = async (dateStr) => {
    const doc = await db.collection('attendance').doc(dateStr).get();
    setAttendanceData(doc.exists ? doc.data() : {});
  };

  // Lifecycle effects to load data on mount or when date changes
  useEffect(() => {
    loadClasses();
    loadStudents();
  }, [loadClasses]);

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate]);

  /**
   * Mark Attendance
   * Updates or creates the attendance record for a student on the selected date.
   */
  const markAttendance = async (studentId, status) => {
    const ref = db.collection('attendance').doc(selectedDate);
    const doc = await ref.get();

    let data = doc.exists ? doc.data() : {};
    // Store status (Present/Absent) and current timestamp
    data[studentId] = { status, time: new Date().toISOString() };

    await ref.set(data);
    setAttendanceData(data); // Update local state to show change immediately
  };


  const getStatus = (id) => attendanceData?.[id]?.status || '—';

  const filteredStudents = students
    .filter((s) => s.class === selectedClass)
    .sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));

  return (
    <View style={styles.container}>

      {/* CLASS */}
      <Text style={styles.label}>Class</Text>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setDropdownOpen(!dropdownOpen)}
      >
        <Text style={styles.cardText}>
          {selectedClass || 'Select Class'}
        </Text>
        <Text>{dropdownOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {dropdownOpen && (
        <View style={styles.dropdown}>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedClass(cls);
                setDropdownOpen(false);
              }}
            >
              <Text style={styles.dropdownText}>{cls}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* DATE */}
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.cardText}>{selectedDate}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setShowPicker(Platform.OS === 'ios');
            if (d) setDate(d);
          }}
        />
      )}

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.h1}>Roll</Text>
        <Text style={styles.h2}>Name</Text>
        <Text style={styles.h3}>Status</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.cardRow}>

            <Text style={styles.colRoll}>{item.rollNo}</Text>

            <Text style={styles.colName} numberOfLines={1}>
              {item.name}
            </Text>

            <Text
              style={[
                styles.colStatus,
                getStatus(item.id) === 'Present'
                  ? styles.present
                  : getStatus(item.id) === 'Absent'
                  ? styles.absent
                  : styles.unmarked,
              ]}
            >
              {getStatus(item.id)}
            </Text>

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#2ecc71' }]}
                onPress={() => markAttendance(item.id, 'Present')}
              >
                <Text style={styles.btnText}>P</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#e74c3c' }]}
                onPress={() => markAttendance(item.id, 'Absent')}
              >
                <Text style={styles.btnText}>A</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      />
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 15, 
    backgroundColor: '#f4f6f8',
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center'
  },


  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },

  /* CARDS */
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  cardText: {
    fontWeight: 'bold',
    color: '#333',
  },

  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  dropdownText: {
    fontWeight: 'bold',
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 5,
    elevation: 2,
  },

  h1: { width: 50, fontWeight: 'bold' },
  h2: { flex: 1, fontWeight: 'bold' },
  h3: { width: 80, fontWeight: 'bold', textAlign: 'center' },

  /* ROW CARD */
  cardRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },

  colRoll: { width: 50, fontWeight: 'bold' },
  colName: { flex: 1, fontWeight: 'bold' },
  colStatus: { width: 80, textAlign: 'center', fontWeight: 'bold' },

  present: { color: '#2ecc71' },
  absent: { color: '#e74c3c' },
  unmarked: { color: '#888' },

  btnRow: { flexDirection: 'row' },

  btn: {
    padding: 6,
    marginLeft: 6,
    borderRadius: 6,
    width: 28,
    alignItems: 'center',
  },

  btnText: { color: '#fff', fontWeight: 'bold' },
});