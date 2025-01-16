import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading durumu
  const router = useRouter();

  const handleRegister = async () => {
    if (isLoading) return; // Zaten yükleme yapılıyorsa tekrar işlem yapma

    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setIsLoading(true); // İşlem başlıyor

    try {
      const response = await fetch("http://10.0.2.2:8080/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        Alert.alert("Success", "User registered successfully!");
        router.push("/"); // Login sayfasına yönlendirme
      } else {
        // Backend'den dönen hatayı oku
        const error = await response.text();

        // Email veya username hatalarını yakala
        let customMessage;
        if (error.includes("e-mail")) {
          const match = error.match(/The e-mail (.+?) is currently used by another user./);
          customMessage = match ? `The e-mail ${match[1]} is already taken.` : "This e-mail is already in use.";
        } else if (error.includes("username")) {
          const match = error.match(/The username (.+?) is currently used by another user./);
          customMessage = match ? `The username ${match[1]} is already taken.` : "This username is already in use.";
        } else {
          customMessage = "Failed to register.";
        }

        Alert.alert("Error", customMessage);
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // İşlem tamamlandı
    }
  };


  const handleBackToLogin = () => {
    router.push("/"); // Login sayfasına yönlendirme
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#6d6e6d" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleBackToLogin}>
        <Text style={styles.backToLoginText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  button: {
    backgroundColor: "#6d6e6d",
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backToLoginText: {
    marginTop: 16,
    color: "#6d6e6d",
    fontSize: 16,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  loader: {
    marginTop: 16,
  },
});
