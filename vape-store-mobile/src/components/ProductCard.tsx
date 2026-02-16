import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Heart } from '../components/Icons';
import { useCartStore } from '../store/cartStore';
import { fontFamily, fontFamilyBold } from '../theme';
import { useWishlistStore } from '../store/wishlistStore';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  width?: number;
}

export default function ProductCard({ product, onPress, width: customWidth }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const hasItem = useWishlistStore((s) => s.hasItem);
  const addToWishlist = useWishlistStore((s) => s.addItem);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);

  const isWishlisted = hasItem(product._id);
  const hasVariants = product.variants && product.variants.length > 0;
  const displayPrice = hasVariants ? product.variants![0].price : product.price;
  const displayDiscount = hasVariants
    ? product.variants![0].discountPrice
    : product.discountPrice;
  const showDiscount =
    displayDiscount != null && displayPrice != null && displayDiscount < displayPrice;

  const toggleWishlist = () => {
    if (isWishlisted) removeFromWishlist(product._id);
    else addToWishlist(product._id);
  };

  const onAddToCart = () => {
    const finalPrice = showDiscount ? displayDiscount! : displayPrice!;
    addItem({
      id: product._id,
      name: product.name,
      price: finalPrice,
      image: product.images?.[0] || '',
      quantity: 1,
      puffCount: product.puffCount,
      capacity: product.capacity,
      resistance: product.resistance,
      selectedFlavour: product.flavours?.[0],
      selectedNicotine: product.variants?.[0]?.nicotine,
    });
  };

  const cardStyle = customWidth ? [styles.card, { width: customWidth, marginRight: 0 }] : styles.card;
  return (
    <View style={cardStyle}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.badges}>
          {product.isHot && (
            <View style={[styles.badge, styles.badgeBlue]}>
              <Text style={styles.badgeText}>HOT</Text>
            </View>
          )}
          {showDiscount && displayPrice != null && (
            <View style={[styles.badge, styles.badgeOrange]}>
              <Text style={styles.badgeText}>
                -{Math.round(((displayPrice - displayDiscount!) / displayPrice) * 100)}%
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={toggleWishlist}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Heart
            size={18}
            color={isWishlisted ? '#ef4444' : '#374151'}
          />
        </TouchableOpacity>
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: product.images?.[0] || 'https://via.placeholder.com/200' }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.priceRow}>
          {showDiscount && (
            <Text style={styles.originalPrice}>₹{displayPrice}</Text>
          )}
          <Text style={styles.price}>
            ₹{showDiscount ? displayDiscount : displayPrice}
          </Text>
        </View>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {product.puffCount != null && (
          <Text style={styles.meta}>{product.puffCount} Puffs</Text>
        )}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={(e) => {
            e?.preventDefault?.();
            onAddToCart();
          }}
        >
          <Text style={styles.addBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
    paddingBottom: 12,
  },
  badges: { position: 'absolute', left: 0, top: 8, zIndex: 2, gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderTopRightRadius: 6, borderBottomRightRadius: 6 },
  badgeBlue: { backgroundColor: '#2563eb' },
  badgeOrange: { backgroundColor: '#f97316' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', fontFamily: fontFamilyBold },
  heartBtn: { position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: '#fff', padding: 6, borderRadius: 20 },
  imageWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#f9fafb', padding: 8 },
  image: { width: '100%', height: '100%' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, marginTop: 8 },
  originalPrice: { fontSize: 11, color: '#9ca3af', textDecorationLine: 'line-through' },
  price: { fontSize: 14, fontWeight: '700', color: '#dc2626' },
  name: { fontSize: 12, fontWeight: '600', color: '#374151', paddingHorizontal: 10, marginTop: 4, fontFamily: fontFamily },
  meta: { fontSize: 10, color: '#6b7280', paddingHorizontal: 10, marginTop: 2 },
  addBtn: {
    marginHorizontal: 10,
    marginTop: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 10, fontWeight: '700', fontFamily: fontFamilyBold },
});
