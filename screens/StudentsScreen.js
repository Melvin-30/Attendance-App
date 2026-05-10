import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';

import { db } from '../firebase';


export default function StudentsScreen() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');

  /**
   * Load Classes
   * Fetches the list of available classes for the dropdown.
   */
  const loadClasses = useCallback(async () => {
    try {
      const snap = await db.collection('classes').get();
      let list = snap.docs.map((doc) => doc.data().name);

      list.sort((a, b) =>
        a.localeCompare(b, undefined, {
          numeric: true,
          sensitivity: 'base',
        })
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
   * Fetches the entire list of students from Firestore.
   */
  const loadStudents = async () => {
    try {
      const snap = await db.collection('students').get();
      setStudents(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    } catch (error) {
      console.error("Error loading students:", error);
      Alert.alert("Error", "Could not load students: " + error.message);
    }
  };

  // Run data loading on screen mount
  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    loadStudents();
  }, []);

  /**
   * Add New Student
   * Saves student name, roll number, and class to Firestore.
   */
  const addStudent = async () => {
    if (!name || !rollNo || !selectedClass) return;

    try {
      await db.collection('students').add({
        name,
        rollNo: Number(rollNo),
        class: selectedClass,
      });

      setName('');
      setRollNo('');
      loadStudents(); // Refresh list
    } catch (error) {
      Alert.alert("Error", "Could not add student: " + error.message);
    }
  };

  /**
   * Delete Student
   * Removes a student record by their unique ID.
   */
  const deleteStudent = async (id) => {
    await db.collection('students').doc(id).delete();
    loadStudents(); // Refresh list
  };

  /**
   * Filtered Students
   * Filters the main student list based on the selected class in the dropdown.
   */
  const filteredStudents = students
    .filter((s) => s.class === selectedClass)
    .sort((a, b) => (a.rollNo || 0) - (b.rollNo || 0));


  return (
    <View style={styles.container}>

      <Text style={styles.title}>Students Management</Text>

      {/* INPUT CARD */}
      <View style={styles.card}>

        <Text style={styles.label}>Class</Text>

        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setDropdownOpen(!dropdownOpen)}
        >
          <Text style={styles.dropdownText}>
            {selectedClass || 'Select Class'}
          </Text>
          <Text style={{ fontSize: 18 }}>
            {dropdownOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownBox}>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedClass(cls);
                  setDropdownOpen(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{cls}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TextInput
          placeholder="Student Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Roll No"
          value={rollNo}
          onChangeText={setRollNo}
          keyboardType="numeric"
          style={styles.input}
          placeholderTextColor="#999"
        />

        <TouchableOpacity style={styles.addBtn} onPress={addStudent}>
          <Text style={styles.addText}>+ Add Student</Text>
        </TouchableOpacity>

      </View>

      {/* LIST */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>

            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.roll}>Roll No: {item.rollNo}</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteStudent(item.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>

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
    maxWidth: 600,
    alignSelf: 'center'
  },


  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#111',
  },

  /* CARD */
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    elevation: 3,
  },

  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#111',
  },

  /* DROPDOWN */
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    marginBottom: 10,
  },

  dropdownText: {
    fontWeight: 'bold',
    color: '#111',
  },

  dropdownBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  dropdownItemText: {
    fontWeight: '600',
    color: '#111',
  },

  /* INPUT */
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },

  addBtn: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  addText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  /* STUDENT CARD */
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },

  roll: {
    color: '#666',
    marginTop: 2,
  },

  deleteBtn: {
    justifyContent: 'center',
  },

  deleteText: {
    color: '#e53935',
    fontWeight: 'bold',
  },
});