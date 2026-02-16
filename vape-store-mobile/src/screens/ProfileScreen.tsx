import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { fontFamily, fontFamilyBold } from '../theme';

export default function ProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState({ name: user?.name || '', email: '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setProfile({ name: user?.name || '', email: '', phone: user?.phone || '' });
  }, [user]);

  const handleSave = () => {
    setLoading(true);
    updateUser({ name: profile.name, phone: profile.phone });
    setTimeout(() => setLoading(false), 400);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar} />
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profile.name}
          onChangeText={(t) => setProfile((p) => ({ ...p, name: t }))}
          placeholder="Name"
        />
        <Text style={styles.label}>Email (Optional)</Text>
        <TextInput
          style={styles.input}
          value={profile.email}
          onChangeText={(t) => setProfile((p) => ({ ...p, email: t }))}
          placeholder="Email"
          keyboardType="email-address"
        />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={profile.phone}
          onChangeText={(t) => setProfile((p) => ({ ...p, phone: t.replace(/\D/g, '').slice(0, 10) }))}
          placeholder="Phone"
          keyboardType="phone-pad"
        />
        <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#dbeafe' },
  form: { backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  label: { fontSize: 11, fontFamily: fontFamilyBold, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase' },
  input: { borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 12, fontSize: 14, marginBottom: 16, fontFamily },
  btn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontFamily: fontFamilyBold },
});
