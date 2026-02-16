import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart } from '../components/Icons';
import { get } from '../api/client';
import { useWishlistStore } from '../store/wishlistStore';
import { fontFamily, fontFamilyBold } from '../theme';
import { useCartStore } from '../store/cartStore';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { items, removeItem, syncItems } = useWishlistStore();
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    get<{ products: Product[] }>('api/products', { ids: items.join(',') })
      .then((data) => {
        const list = (data?.products || data) as Product[];
        const listArr = Array.isArray(list) ? list : (list as any)?.products || [];
        setProducts(listArr);
        syncItems(listArr.map((p) => p._id));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [items.join(',')]);

  const { width } = Dimensions.get('window');
  const cardWidth = (width - 12 * 3) / 2;

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Heart size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySub}>Save items you love to find them later.</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Tabs')}>
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      numColumns={2}
      keyExtractor={(item) => item._id}
      contentContainerStyle={[styles.list, { paddingTop: 12 + insets.top }]}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <View style={styles.cardWrap}>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeItem(item._id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Heart size={20} color="#ef4444" />
          </TouchableOpacity>
          <ProductCard
            product={item}
            width={cardWidth}
            onPress={() => navigation.navigate('ProductDetail', { id: item._id, slug: item.slug })}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, paddingBottom: 100 },
  row: { gap: 12, marginBottom: 12, justifyContent: 'flex-start' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontFamily: fontFamilyBold, color: '#111', marginTop: 16 },
  emptySub: { fontFamily, color: '#6b7280', marginTop: 8, marginBottom: 24 },
  shopBtn: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  shopBtnText: { color: '#fff', fontFamily: fontFamilyBold },
  cardWrap: { position: 'relative' },
  removeBtn: { position: 'absolute', top: 8, right: 8, zIndex: 10, backgroundColor: '#fff', padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#f3f4f6' },
});
