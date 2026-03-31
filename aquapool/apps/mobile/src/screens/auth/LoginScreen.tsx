import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuthStore } from '../../store/authStore';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3001';

interface Props {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requireTotp, setRequireTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...(requireTotp && { totpCode }) }),
      });

      const json = await res.json() as {
        success: boolean;
        data: { requireTotp?: boolean; accessToken: string; refreshToken: string; user: { id: string; email: string; kycTier: string } };
        error?: { message: string };
      };

      if (!json.success) {
        Alert.alert('Login Failed', json.error?.message ?? 'Invalid credentials');
        return;
      }

      if (json.data.requireTotp) {
        setRequireTotp(true);
        return;
      }

      await login(json.data.accessToken, json.data.refreshToken, json.data.user);
    } catch {
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Aquapool</Text>
      <Text style={styles.title}>Welcome back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#6B7280"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6B7280"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
      />

      {requireTotp && (
        <TextInput
          style={[styles.input, styles.totpInput]}
          placeholder="6-digit 2FA code"
          placeholderTextColor="#6B7280"
          value={totpCode}
          onChangeText={setTotpCode}
          keyboardType="numeric"
          maxLength={6}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
        <Text style={styles.linkText}>New to Aquapool? <Text style={styles.linkAccent}>Create account</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0F1E', padding: 24, justifyContent: 'center' },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#0066FF', textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#fff', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#111827', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 16, color: '#fff', marginBottom: 12, fontSize: 15,
  },
  totpInput: { borderColor: '#0066FF', textAlign: 'center', letterSpacing: 8, fontSize: 22 },
  button: {
    backgroundColor: '#0066FF', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#6B7280', fontSize: 14 },
  linkAccent: { color: '#0066FF' },
});
