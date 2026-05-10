import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert
} from "react-native";


import { db } from "../firebase";

export default function ClassManagementScreen() {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState("");

  /**
   * Load Classes
   * Fetches the list of school classes from Firestore.
   */
  const loadClasses = useCallback(async () => {
    try {
      const snap = await db.collection("classes").get();

      let list = snap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));

      // Sort classes numerically/alphabetically (e.g., 1A, 2B)
      list.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base"
        })
      );

      setClasses(list);
    } catch (error) {
      console.error("Error loading classes:", error);
      Alert.alert("Error", "Could not load classes: " + error.message);
    }
  }, []);

  /**
   * Add New Class
   * Saves a new class name to Firestore.
   */
  const addClass = async () => {
    if (!newClass) {
      Alert.alert("Error", "Enter class name");
      return;
    }

    try {
      await db.collection("classes").add({
        name: newClass.toUpperCase()
      });

      setNewClass("");
      loadClasses(); // Refresh the list
    } catch (error) {
      Alert.alert("Error", "Could not add class: " + error.message);
    }
  };

  /**
   * Delete Class
   * Removes a class from Firestore by its unique ID.
   */
  const deleteClass = async (id) => {
    await db.collection("classes").doc(id).delete();
    loadClasses(); // Refresh the list
  };


  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <Text style={styles.title}>🏫 Class Management</Text>
      <Text style={styles.subtitle}>
        Add and manage school classes
      </Text>

      {/* INPUT CARD */}
      <View style={styles.card}>

        <Text style={styles.label}>New Class</Text>

        <TextInput
          placeholder="e.g. 10A, 9B, 12 Science"
          value={newClass}
          onChangeText={setNewClass}
          style={styles.input}
        />

        <TouchableOpacity style={styles.addBtn} onPress={addClass}>
          <Text style={styles.addText}>+ Add Class</Text>
        </TouchableOpacity>

      </View>

      {/* LIST HEADER */}
      <Text style={styles.sectionTitle}>Existing Classes</Text>

      {/* LIST */}
      <FlatList
        data={classes}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.row}>

            <View style={styles.classBox}>
              <Text style={styles.classText}>{item.name}</Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deleteClass(item.id)}
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
    backgroundColor: "#f4f6f8",
    padding: 15,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center"
  },


  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginTop: 10
  },

  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 15
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },

  label: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#374151"
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f9fafb"
  },

  addBtn: {
    backgroundColor: "#16a34a",
    padding: 12,
    borderRadius: 10,
    alignItems: "center"
  },

  addText: {
    color: "white",
    fontWeight: "bold"
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#374151"
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },

  classBox: {
    flex: 1
  },

  classText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827"
  },

  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },

  deleteText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12
  }
});