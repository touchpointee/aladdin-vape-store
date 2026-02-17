import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle, MapPin, Plus, Banknote, CreditCard } from '../components/Icons';
import { get, post, put } from '../api/client';
import { useCartStore } from '../store/cartStore';
import { fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';
import { useAuthStore } from '../store/authStore';
import { getApiBaseUrl } from '../api/config';
import type { Address } from '../types';

const DELIVERY_CHARGE = 100;

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { items, subtotal, clearCart } = useCartStore();
  const { user, isLoggedIn, login, updateUser } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PREPAID'>('COD');
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentQrCode, setPaymentQrCode] = useState('');
  const [onlinePaymentEnabled, setOnlinePaymentEnabled] = useState(true);
  const [showUtrModal, setShowUtrModal] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    get<{ value: string }>('api/settings', { key: 'payment_qr_code' })
      .then((r) => r?.value && setPaymentQrCode(r.value))
      .catch(() => {});
    get<{ value: { online_enabled?: boolean } }>('api/settings', { key: 'payment_settings' })
      .then((r) => {
        if (r?.value?.online_enabled !== undefined) {
          setOnlinePaymentEnabled(r.value.online_enabled);
          if (!r.value.online_enabled) setPaymentMethod('COD');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      const ids = items.map((i) => i.id).join(',');
      get<{ products: any[] }>('api/products', { ids })
        .then((data) => {
          const list = data?.products || data;
          useCartStore.getState().syncCartWithServer(Array.isArray(list) ? list : (list as any).products || []);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && user?.phone) {
      setFormData((prev) => ({ ...prev, phone: user.phone! }));
      fetchAddresses(user.phone);
    }
  }, [isLoggedIn, user?.phone]);

  const fetchAddresses = async (phone: string) => {
    try {
      const data = await get<Address[]>('api/addresses', { phone });
      const list = Array.isArray(data) ? data : [];
      setSavedAddresses(list);
      if (list.length > 0) fillAddress(list[0]);
      else setShowNewAddressForm(true);
    } catch {
      setSavedAddresses([]);
    }
  };

  const fillAddress = (addr: Address) => {
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
    setSelectedAddressId(addr._id);
    setShowNewAddressForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (paymentMethod === 'PREPAID' && (!utrNumber.trim() || utrNumber.trim().length !== 12)) {
      Alert.alert('Error', 'Please enter a valid 12-digit UTR number');
      setShowUtrModal(true);
      return;
    }

    setLoading(true);
    try {
      const normalizedData = {
        ...formData,
        phone: formData.phone.trim(),
        age: Number(formData.age),
      };

      if (!isLoggedIn || showNewAddressForm) {
        const method = editingId && isLoggedIn ? put : post;
        const body = editingId && isLoggedIn ? { ...normalizedData, _id: editingId } : normalizedData;
        await method('api/addresses', body);
        if (!isLoggedIn) {
          login(normalizedData.phone);
          updateUser({ name: normalizedData.name });
        }
        if (isLoggedIn && user?.phone) await fetchAddresses(user.phone);
      }

      const orderData: any = {
        customer: normalizedData,
        products: items.map((item) => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
          flavour: item.selectedFlavour,
          nicotine: item.selectedNicotine,
        })),
        totalPrice: subtotal() + DELIVERY_CHARGE,
        paymentMode: paymentMethod,
        orderSource: 'app',
      };
      if (paymentMethod === 'PREPAID') orderData.utrNumber = utrNumber.trim();

      await post('api/orders', orderData);
      updateUser({ name: normalizedData.name });
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.centered}>
        <View style={styles.successIcon}>
          <CheckCircle size={64} color="#22c55e" />
        </View>
        <Text style={styles.successTitle}>Order Placed Successfully!</Text>
        <Text style={styles.successSub}>
          {paymentMethod === 'PREPAID'
            ? 'Your payment is pending verification. We will confirm your order shortly.'
            : 'Thank you for your purchase. We will ship your order soon.'}
        </Text>
        <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.navigate('Tabs')}>
          <Text style={styles.continueBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Tabs')}>
          <Text style={styles.link}>Go to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = subtotal() + DELIVERY_CHARGE;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {isLoggedIn && savedAddresses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          {savedAddresses.map((addr) => (
            <TouchableOpacity
              key={addr._id}
              style={[styles.addressCard, selectedAddressId === addr._id && styles.addressCardActive]}
              onPress={() => fillAddress(addr)}
            >
              <MapPin size={18} color={selectedAddressId === addr._id ? '#2563eb' : '#9ca3af'} />
              <View style={styles.addressBody}>
                <Text style={styles.addressName}>{addr.name} ({addr.age} Yrs)</Text>
                <Text style={styles.addressLine}>{addr.address}, {addr.city} - {addr.pincode}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  fillAddress(addr);
                  setEditingId(addr._id);
                  setShowNewAddressForm(true);
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
                }}
              >
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addAddressBtn}
            onPress={() => {
              setFormData({ ...formData, email: '', address: '', landmark: '', city: '', state: '', pincode: '', age: '' });
              setSelectedAddressId(null);
              setEditingId(null);
              setShowNewAddressForm(true);
            }}
          >
            <Plus size={20} color="#2563eb" />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      )}

      {(showNewAddressForm || savedAddresses.length === 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Details</Text>
          {['name', 'email', 'phone', 'age', 'address', 'landmark', 'city', 'state', 'pincode'].map((key) => (
            <TextInput
              key={key}
              style={styles.input}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              value={(formData as any)[key]}
              onChangeText={(t) => setFormData((prev) => ({ ...prev, [key]: key === 'phone' ? t.replace(/\D/g, '').slice(0, 10) : key === 'age' ? t.replace(/\D/g, '').slice(0, 3) : t }))}
              keyboardType={key === 'email' ? 'email-address' : key === 'phone' || key === 'age' ? 'phone-pad' : 'default'}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity
          style={[styles.payOption, paymentMethod === 'COD' && styles.payOptionActive]}
          onPress={() => setPaymentMethod('COD')}
        >
          <Banknote size={22} color={paymentMethod === 'COD' ? '#2563eb' : '#6b7280'} />
          <Text style={styles.payOptionText}>Cash on Delivery (COD)</Text>
        </TouchableOpacity>
        {onlinePaymentEnabled && (
          <TouchableOpacity
            style={[styles.payOption, paymentMethod === 'PREPAID' && styles.payOptionActiveGreen]}
            onPress={() => setPaymentMethod('PREPAID')}
          >
            <CreditCard size={22} color={paymentMethod === 'PREPAID' ? '#22c55e' : '#6b7280'} />
            <Text style={styles.payOptionText}>Pay Online (UPI)</Text>
          </TouchableOpacity>
        )}
        {paymentMethod === 'PREPAID' && (
          <>
            {paymentQrCode ? (
              <View style={styles.qrWrap}>
                <Image source={{ uri: paymentQrCode.startsWith('http') ? paymentQrCode : `${getApiBaseUrl()}${paymentQrCode}` }} style={styles.qr} resizeMode="contain" />
              </View>
            ) : null}
            <Text style={styles.qrLabel}>Scan to pay ₹{total}</Text>
            <TouchableOpacity style={styles.utrBtn} onPress={() => setShowUtrModal(true)}>
              <CheckCircle size={20} color="#fff" />
              <Text style={styles.utrBtnText}>I've Paid - Enter UTR</Text>
            </TouchableOpacity>
            {utrNumber.length === 12 && (
              <View style={styles.utrOk}>
                <Text style={styles.utrOkText}>✓ UTR: {utrNumber}</Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {items.map((item) => (
          <View key={`${item.id}-${item.selectedFlavour}-${item.selectedNicotine}`} style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryName}>{item.name}</Text>
              <Text style={styles.summaryMeta}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.summaryPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.summaryDivider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{subtotal().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery</Text>
          <Text style={styles.summaryValue}>₹{DELIVERY_CHARGE}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, paymentMethod === 'PREPAID' && styles.submitBtnGreen]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{paymentMethod === 'PREPAID' ? 'Submit Order for Verification' : 'Confirm Order'}</Text>}
      </TouchableOpacity>

      <Modal visible={showUtrModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowUtrModal(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter UTR (12 digits)</Text>
            <TextInput
              style={styles.utrInput}
              value={utrNumber}
              onChangeText={(t) => setUtrNumber(t.replace(/\D/g, '').slice(0, 12))}
              placeholder="000000000000"
              keyboardType="number-pad"
              maxLength={12}
            />
            <TouchableOpacity
              style={[styles.modalBtn, utrNumber.length !== 12 && styles.modalBtnDisabled]}
              onPress={() => utrNumber.length === 12 && setShowUtrModal(false)}
              disabled={utrNumber.length !== 12}
            >
              <Text style={styles.modalBtnText}>Confirm UTR</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontFamily: fontFamilyBold, color: '#111', marginBottom: 8, textAlign: 'center' },
  successSub: { fontFamily, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  continueBtn: { backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  continueBtnText: { color: '#fff', fontFamily: fontFamilyBold },
  emptyTitle: { fontSize: 18, fontFamily: fontFamilyBold, marginBottom: 12 },
  link: { fontFamily: fontFamilyBold, color: '#2563eb' },
  section: { marginBottom: 24, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  sectionTitle: { fontSize: 12, fontFamily: fontFamilyBold, color: '#374151', marginBottom: 12, textTransform: 'uppercase' },
  addressCard: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8 },
  addressCardActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  addressBody: { flex: 1, marginLeft: 10 },
  addressName: { fontFamily: fontFamilyBold, color: '#111' },
  addressLine: { fontSize: 12, fontFamily, color: '#6b7280', marginTop: 4 },
  editBtn: { color: '#2563eb', fontFamily: fontFamilyBold, fontSize: 12 },
  addAddressBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: '#d1d5db', borderRadius: 10 },
  addAddressText: { fontFamily: fontFamilyBold, color: '#2563eb' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, fontSize: 14, fontFamily },
  payOption: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8 },
  payOptionActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  payOptionActiveGreen: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  payOptionText: { fontSize: 14, fontFamily: fontFamilySemiBold, color: '#111' },
  qrWrap: { width: 160, height: 160, alignSelf: 'center', marginVertical: 12, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  qr: { width: '100%', height: '100%' },
  qrLabel: { textAlign: 'center', marginBottom: 8, fontSize: 14, fontFamily, color: '#6b7280' },
  utrBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#22c55e', paddingVertical: 12, borderRadius: 10 },
  utrBtnText: { color: '#fff', fontFamily: fontFamilyBold },
  utrOk: { marginTop: 8, padding: 8, backgroundColor: '#f0fdf4', borderRadius: 8 },
  utrOkText: { color: '#166534', fontFamily: fontFamilyBold, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  summaryLeft: { flex: 1 },
  summaryName: { fontFamily: fontFamilySemiBold, color: '#111' },
  summaryMeta: { fontSize: 12, fontFamily, color: '#6b7280' },
  summaryPrice: { fontFamily: fontFamilyBold, color: '#111' },
  summaryDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 8 },
  summaryLabel: { fontFamily, color: '#6b7280' },
  summaryValue: { fontFamily: fontFamilySemiBold, color: '#111' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: 16, fontFamily: fontFamilyBold, color: '#111' },
  totalValue: { fontSize: 18, fontFamily: fontFamilyBold, color: '#dc2626' },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnGreen: { backgroundColor: '#22c55e' },
  submitBtnText: { color: '#fff', fontFamily: fontFamilyBold, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 18, fontFamily: fontFamilyBold, marginBottom: 16 },
  utrInput: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 10, padding: 16, fontSize: 18, textAlign: 'center', marginBottom: 16, fontFamily },
  modalBtn: { backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  modalBtnDisabled: { backgroundColor: '#d1d5db' },
  modalBtnText: { color: '#fff', fontFamily: fontFamilyBold },
});
