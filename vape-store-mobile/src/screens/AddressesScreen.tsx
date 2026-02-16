import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, MapPin } from '../components/Icons';
import { get, post, put, del } from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Address } from '../types';
import { fontFamily, fontFamilyBold } from '../theme';

export default function AddressesScreen() {
  const navigation = useNavigation<any>();
  const { user, isLoggedIn } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    age: '',
  });

  const fetchAddresses = async (phone: string) => {
    try {
      const data = await get<Address[]>('api/addresses', { phone });
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (!isLoggedIn) {
        navigation.navigate('Login');
        return;
      }
      if (user?.phone) {
        setFormData((p) => ({ ...p, phone: user.phone!, name: user.name || '' }));
        fetchAddresses(user.phone);
      }
    }, [isLoggedIn, user?.phone])
  );

  const resetForm = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      email: '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      age: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (addr: Address) => {
    setFormData({
      name: addr.name,
      phone: addr.phone,
      email: addr.email || '',
      address: addr.address,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state || '',
      pincode: addr.pincode,
      age: String(addr.age),
    });
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          del('api/addresses', { id })
            .then(() => setAddresses((prev) => prev.filter((a) => a._id !== id)))
            .catch(() => Alert.alert('Error', 'Failed to delete')),
      },
    ]);
  };

  const handleSubmit = async () => {
    setActionLoading(true);
    try {
      if (editingId) await put('api/addresses', { ...formData, _id: editingId });
      else await post('api/addresses', formData);
      if (user?.phone) fetchAddresses(user.phone);
      resetForm();
    } catch {
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {showForm ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editingId ? 'Edit Address' : 'Add New Address'}</Text>
          {['name', 'phone', 'email', 'address', 'landmark', 'city', 'state', 'pincode', 'age'].map((key) => (
            <TextInput
              key={key}
              style={styles.input}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={(formData as any)[key]}
              onChangeText={(t) =>
                setFormData((p) => ({
                  ...p,
                  [key]: key === 'phone' ? t.replace(/\D/g, '').slice(0, 10) : key === 'age' ? t.replace(/\D/g, '').slice(0, 3) : t,
                }))
              }
              keyboardType={key === 'email' ? 'email-address' : key === 'phone' || key === 'age' ? 'phone-pad' : 'default'}
            />
          ))}
          <View style={styles.formActions}>
            <TouchableOpacity onPress={resetForm}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={actionLoading}>
              <Text style={styles.saveBtnText}>{actionLoading ? 'Saving...' : editingId ? 'Update' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Plus size={22} color="#2563eb" />
          <Text style={styles.addBtnText}>Add New Address</Text>
        </TouchableOpacity>
      )}

      {addresses.map((addr) => (
        <View key={addr._id} style={styles.card}>
          <MapPin size={20} color="#2563eb" style={styles.cardIcon} />
          <View style={styles.cardBody}>
            <Text style={styles.cardName}>{addr.name} ({addr.age} Yrs)</Text>
            <Text style={styles.cardAddress}>{addr.address}</Text>
            {addr.landmark ? <Text style={styles.cardAddress}>{addr.landmark}, </Text> : null}
            <Text style={styles.cardAddress}>{addr.city}, {addr.pincode}</Text>
            <Text style={styles.cardPhone}>{addr.phone}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEdit(addr)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(addr._id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {addresses.length === 0 && !showForm && (
        <View style={styles.empty}>
          <MapPin size={40} color="#d1d5db" />
          <Text style={styles.emptyText}>No saved addresses.</Text>
        </View>
      )}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  formCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  formTitle: { fontSize: 14, fontFamily: fontFamilyBold, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14, fontFamily },
  formActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  cancelText: { color: '#6b7280', fontSize: 14, fontFamily },
  saveBtn: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  saveBtnText: { color: '#fff', fontFamily: fontFamilyBold },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: '#93c5fd', borderRadius: 12, marginBottom: 16 },
  addBtnText: { color: '#2563eb', fontFamily: fontFamilyBold },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  cardIcon: { marginRight: 12 },
  cardBody: { flex: 1 },
  cardName: { fontFamily: fontFamilyBold, color: '#111' },
  cardAddress: { fontSize: 14, fontFamily, color: '#6b7280', marginTop: 4 },
  cardPhone: { fontSize: 12, fontFamily, color: '#9ca3af', marginTop: 8 },
  cardActions: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  editText: { color: '#2563eb', fontFamily: fontFamilyBold, fontSize: 12 },
  deleteText: { color: '#ef4444', fontFamily: fontFamilyBold, fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontFamily, color: '#9ca3af', marginTop: 12 },
});
