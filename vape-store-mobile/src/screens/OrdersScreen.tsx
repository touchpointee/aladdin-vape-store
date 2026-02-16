import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Package } from '../components/Icons';
import { get } from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Order } from '../types';
import { fontFamily, fontFamilyBold } from '../theme';

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const { user, isLoggedIn } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn && user?.phone) {
      get<Order[]>('api/orders', { phone: user.phone })
        .then((data) => setOrders(Array.isArray(data) ? data : []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, user?.phone]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={styles.centered}>
        <Text style={styles.msg}>Please login to view your orders.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Login Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centered}>
        <Package size={48} color="#9ca3af" />
        <Text style={styles.msg}>No orders found.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Tabs')}>
          <Text style={styles.link}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusStyle = (status: string) => {
    if (status === 'Delivered') return styles.badgeGreen;
    if (status === 'Cancelled') return styles.badgeRed;
    return styles.badgeGray;
  };

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('OrderDetail', { id: item._id })}
          activeOpacity={0.9}
        >
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.orderId}>Order #{item._id.slice(-6)}</Text>
              <Text style={styles.itemCount}>{item.products?.length || 0} Item(s)</Text>
            </View>
            <View style={[styles.badge, statusStyle(item.status)]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{item.totalPrice}</Text>
            </View>
            <Text style={styles.viewDetails}>View Details</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 80 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  msg: { fontFamily, color: '#6b7280', marginBottom: 12 },
  link: { fontFamily: fontFamilyBold, color: '#2563eb' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 11, fontFamily: fontFamilyBold, color: '#9ca3af' },
  itemCount: { fontSize: 14, fontFamily: fontFamilyBold, color: '#111', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeGreen: { backgroundColor: '#dcfce7' },
  badgeRed: { backgroundColor: '#fee2e2' },
  badgeGray: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 10, fontFamily: fontFamilyBold, color: '#374151' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  totalLabel: { fontSize: 11, fontFamily, color: '#6b7280' },
  totalValue: { fontSize: 18, fontFamily: fontFamilyBold, color: '#111' },
  viewDetails: { fontSize: 12, fontFamily: fontFamilyBold, color: '#2563eb' },
});
