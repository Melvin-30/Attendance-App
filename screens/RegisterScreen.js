import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from "react-native";

import { auth } from "../firebase";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handle Registration
   * Creates a new user account in Firebase Auth.
   */
  const register = async () => {
    if (loading) return;

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase
      await auth.createUserWithEmailAndPassword(cleanEmail, cleanPassword);
      Alert.alert("Success", "Account Created");
      // Go back to Login screen
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f4f6f8" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>

          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register a new teacher account</Text>

            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={register}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Creating account..." : "Register"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>

          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center"
  },


  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#111"
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#fafafa"
  },

  button: {
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5
  },

  buttonDisabled: {
    opacity: 0.6
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },

  link: {
    marginTop: 15,
    textAlign: "center",
    color: "#1976d2",
    fontWeight: "600"
  }
});