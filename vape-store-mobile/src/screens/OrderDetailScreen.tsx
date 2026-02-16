import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { CheckCircle, XCircle, Package } from '../components/Icons';
import { get } from '../api/client';
import { API_BASE_URL } from '../api/config';
import type { Order } from '../types';
import { fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

type Params = { id: string };

export default function OrderDetailScreen() {
  const route = useRoute<RouteProp<{ params: Params }, 'params'>>();
  const { id } = (route.params || {}) as Params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    get<Order>(`api/orders/${id}`)
      .then((data) => {
        if (!cancelled) setOrder(data);
        if (data?.awbNumber && data?.shipmentStatus === 'Created' && data?.status !== 'Cancelled' && data?.status !== 'Delivered') {
          get<{ status?: string }>(`api/orders/${id}/track`)
            .then((track) => track?.status && !cancelled && setOrder((prev) => (prev ? { ...prev, status: track.status! } : prev)))
            .catch(() => {});
        }
      })
      .catch(() => { if (!cancelled) setOrder(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Order not found</Text>
      </View>
    );
  }

  const c = order.customer;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={styles.statusIcon}>
            {order.status === 'Delivered' && <CheckCircle size={24} color="#22c55e" />}
            {order.status === 'Cancelled' && <XCircle size={24} color="#ef4444" />}
            {order.status !== 'Delivered' && order.status !== 'Cancelled' && <Package size={24} color="#2563eb" />}
          </View>
          <View style={styles.statusBody}>
            <Text style={styles.statusText}>{order.status}</Text>
            <Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString()}</Text>
          </View>
          {order.awbNumber ? <Text style={styles.awb}>{order.awbNumber}</Text> : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Items ({order.products?.length || 0})</Text>
        {(order.products || []).map((item: any, idx: number) => (
          <View key={idx} style={styles.itemRow}>
            <Image
              source={{ uri: item.product?.images?.[0]?.startsWith('http') ? item.product.images[0] : `${API_BASE_URL}${item.product?.images?.[0] || ''}` }}
              style={styles.itemThumb}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={1}>{item.product?.name}</Text>
              <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
              {item.flavour && <Text style={styles.itemMeta}>Flavour: {item.flavour}</Text>}
              {item.nicotine && <Text style={styles.itemMeta}>Nicotine: {item.nicotine}</Text>}
              <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Shipping Address</Text>
        <Text style={styles.addrName}>{c?.name}</Text>
        <Text style={styles.addrLine}>{c?.address}</Text>
        <Text style={styles.addrLine}>{c?.city} - {c?.pincode}</Text>
        <Text style={styles.addrPhone}>Phone: {c?.phone}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{order.products?.reduce((s: number, i: any) => s + i.price * i.quantity, 0) || 0}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>₹100</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{order.totalPrice}</Text>
        </View>
        <View style={styles.payMode}>
          <Text style={styles.payModeText}>Payment: {order.paymentMode}</Text>
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 16, fontFamily, color: '#6b7280' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  cardTitle: { fontSize: 14, fontFamily: fontFamilyBold, color: '#111', marginBottom: 12 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  statusBody: { flex: 1, marginLeft: 12 },
  statusText: { fontFamily: fontFamilyBold, color: '#111' },
  date: { fontSize: 12, fontFamily, color: '#6b7280', marginTop: 2 },
  awb: { fontSize: 11, fontFamily: 'monospace', color: '#374151' },
  itemRow: { flexDirection: 'row', marginBottom: 12 },
  itemThumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#f3f4f6' },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemName: { fontFamily: fontFamilySemiBold, color: '#111' },
  itemMeta: { fontSize: 11, fontFamily, color: '#6b7280', marginTop: 2 },
  itemPrice: { fontSize: 14, fontFamily: fontFamilyBold, color: '#111', marginTop: 4 },
  addrName: { fontFamily: fontFamilyBold, color: '#111' },
  addrLine: { fontSize: 14, fontFamily, color: '#6b7280', marginTop: 4 },
  addrPhone: { fontSize: 14, fontFamily: fontFamilySemiBold, color: '#374151', marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontFamily, color: '#6b7280' },
  summaryValue: { fontFamily: fontFamilySemiBold, color: '#111' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 8, paddingTop: 12 },
  totalLabel: { fontFamily: fontFamilyBold, color: '#111' },
  totalValue: { fontSize: 18, fontFamily: fontFamilyBold, color: '#111' },
  payMode: { marginTop: 12, backgroundColor: '#eff6ff', padding: 10, borderRadius: 8 },
  payModeText: { fontSize: 12, fontFamily: fontFamilySemiBold, color: '#2563eb', textAlign: 'center' },
});
