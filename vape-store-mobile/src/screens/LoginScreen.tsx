import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { fontFamily, fontFamilyBold } from '../theme';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = () => {
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      login(phone);
      setLoading(false);
      navigation.navigate('Account');
    }, 600);
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Enter your mobile number to login or signup.</Text>

        <View style={styles.inputWrap}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        <TouchableOpacity
          style={[styles.btn, (loading || phone.length < 10) && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading || phone.length < 10}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Continue</Text>}
        </TouchableOpacity>
      </View>
      <Text style={styles.footer}>By continuing, you agree to our Terms & Privacy Policy.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  box: { maxWidth: 400 },
  title: { fontSize: 24, fontFamily: fontFamilyBold, color: '#111', marginBottom: 8 },
  subtitle: { fontSize: 14, fontFamily, color: '#6b7280', marginBottom: 24 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16 },
  prefix: { fontSize: 14, fontFamily: fontFamilyBold, color: '#6b7280', marginRight: 12 },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: '#111', fontFamily },
  btn: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontFamily: fontFamilyBold, fontSize: 16 },
  footer: { textAlign: 'center', fontSize: 12, fontFamily, color: '#9ca3af', marginTop: 32 },
});
