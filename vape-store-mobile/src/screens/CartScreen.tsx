import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Minus, Plus, Trash2 } from '../components/Icons';
import { useCartStore } from '../store/cartStore';
import { get } from '../api/client';
import { API_BASE_URL } from '../api/config';
import { fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

function uniqueKey(item: { id: string; selectedFlavour?: string; selectedNicotine?: string }) {
  return `${item.id}-${item.selectedFlavour || 'none'}-${item.selectedNicotine || 'none'}`;
}

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const { items, removeItem, updateQuantity, subtotal, syncCartWithServer } = useCartStore();

  useEffect(() => {
    if (items.length > 0) {
      const ids = items.map((i) => i.id).join(',');
      get<{ products: any[] }>('api/products', { ids })
        .then((data) => {
          const list = data?.products || data;
          syncCartWithServer(Array.isArray(list) ? list : (list as any).products || []);
        })
        .catch(() => {});
    }
  }, [items.length]);

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Tabs')}>
          <Text style={styles.shopBtnText}>Go to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {items.map((item) => {
          const key = uniqueKey(item);
          const imgUri = item.image?.startsWith('http') ? item.image : item.image ? `${API_BASE_URL}${item.image}` : 'https://via.placeholder.com/80';
          return (
            <View key={key} style={styles.row}>
              <Image source={{ uri: imgUri }} style={styles.thumb} />
              <View style={styles.details}>
                <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                {(item.selectedFlavour || item.selectedNicotine) && (
                  <Text style={styles.meta}>
                    {[item.selectedFlavour, item.selectedNicotine].filter(Boolean).join(' • ')}
                  </Text>
                )}
                <View style={styles.qtyRow}>
                  <View style={styles.qtyWrap}>
                    <TouchableOpacity onPress={() => updateQuantity(key, item.quantity - 1)}>
                      <Minus size={18} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(key, item.quantity + 1)}>
                      <Plus size={18} color="#374151" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                </View>
                <TouchableOpacity onPress={() => removeItem(key)} style={styles.removeBtn}>
                  <Trash2 size={16} color="#ef4444" />
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal:</Text>
          <Text style={styles.subtotalValue}>₹{subtotal().toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutBtnText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontFamily: fontFamilyBold, color: '#111', marginBottom: 16 },
  shopBtn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { color: '#fff', fontFamily: fontFamilyBold },
  row: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  thumb: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f3f4f6' },
  details: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontFamily: fontFamilySemiBold, color: '#111' },
  meta: { fontSize: 11, fontFamily, color: '#6b7280', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  qtyWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 },
  qtyText: { marginHorizontal: 12, fontFamily: fontFamilyBold, minWidth: 24, textAlign: 'center' },
  itemPrice: { fontSize: 14, fontFamily: fontFamilyBold, color: '#2563eb' },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  removeText: { fontSize: 12, fontFamily: fontFamilySemiBold, color: '#ef4444' },
  footer: { padding: 16, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  subtotalLabel: { fontSize: 14, fontFamily: fontFamilySemiBold, color: '#374151' },
  subtotalValue: { fontSize: 18, fontFamily: fontFamilyBold, color: '#111' },
  checkoutBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontFamily: fontFamilyBold, fontSize: 16 },
});
