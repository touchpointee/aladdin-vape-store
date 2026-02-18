import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Minus, Plus, MessageCircle, Star } from '../components/Icons';
import { get, post } from '../api/client';
import { storage } from '../store/storage';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import type { Product } from '../types';
import { getApiBaseUrl } from '../api/config';
import { fontFamily, fontFamilySemiBold, fontFamilyBold, fontFamilyExtraBold } from '../theme';

type Params = { id: string; slug?: string };

export default function ProductDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: Params }, 'params'>>();
  const { id } = (route.params || {}) as Params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedFlavour, setSelectedFlavour] = useState<string>('');
  const [selectedNicotine, setSelectedNicotine] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [firstAddressName, setFirstAddressName] = useState('');

  const addItem = useCartStore((s) => s.addItem);
  const { user, isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn && user?.phone && !user?.name) {
      get<{ name?: string }[]>('api/addresses', { phone: user.phone })
        .then((data) => {
          const name = Array.isArray(data) && data[0]?.name ? data[0].name : '';
          setFirstAddressName(name);
        })
        .catch(() => {});
    } else {
      setFirstAddressName('');
    }
  }, [isLoggedIn, user?.phone, user?.name]);

  const REVIEW_GUEST_KEY = 'review_guest_id';
  const getOrCreateGuestId = async (): Promise<string> => {
    let id = await storage.getItem(REVIEW_GUEST_KEY);
    if (!id) {
      id = 'guest:' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      await storage.setItem(REVIEW_GUEST_KEY, id);
    }
    return id;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await get<Product>(`api/products/${id}`);
        if (!cancelled) {
          setProduct(p);
          setSelectedFlavour(p.flavours?.[0] || '');
          setSelectedNicotine(p.variants?.[0]?.nicotine || '');
        }
      } catch (e) {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    get<{ value: unknown }>('api/settings', { key: 'whatsapp_number' })
      .then((r) => {
        const v = r?.value;
        setWhatsappNumber(typeof v === 'string' ? v : v != null ? String(v) : '');
      })
      .catch(() => {});
  }, []);

  const fetchReviews = React.useCallback(async () => {
    try {
      const data = await get<{ reviews: any[]; averageRating: number; total: number }>(`api/products/${id}/reviews`);
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating ?? 0);
      setReviewsTotal(data.total ?? 0);
    } catch (_) {}
    setReviewsLoading(false);
  }, [id]);

  useEffect(() => {
    if (product) fetchReviews();
  }, [product?._id, fetchReviews]);

  if (loading || !product) {
    return (
      <View style={styles.centered}>
        {loading ? <ActivityIndicator size="large" color="#2563eb" /> : <Text>Product not found</Text>}
      </View>
    );
  }

  const variant = product.variants?.find((v) => v.nicotine === selectedNicotine);
  const basePrice = variant ? variant.price : product.price;
  const discountedPrice =
    variant ? (variant.discountPrice && variant.discountPrice < variant.price ? variant.discountPrice : variant.price)
    : (product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price);

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.name,
      price: discountedPrice,
      image: product.images?.[0] || '',
      quantity,
      puffCount: product.puffCount,
      capacity: product.capacity,
      resistance: product.resistance,
      selectedFlavour: selectedFlavour || undefined,
      selectedNicotine: selectedNicotine || undefined,
    });
    navigation.navigate('Tabs', { screen: 'Cart' });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigation.navigate('Tabs', { screen: 'Cart' });
  };

  const handleWhatsApp = async () => {
    const digits = String(whatsappNumber ?? '').replace(/\D/g, '');
    if (!digits || digits.length < 10) {
      Alert.alert('WhatsApp number not set', 'Please contact the store. WhatsApp number is not configured.');
      return;
    }
    const msg = `Hi, I want to buy:\nProduct: ${product.name}\n${selectedFlavour ? `Flavour: ${selectedFlavour}\n` : ''}${selectedNicotine ? `Nicotine: ${selectedNicotine}\n` : ''}Quantity: ${quantity}\nPrice: ₹${discountedPrice * quantity}`;
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
    try {
      await Linking.openURL(url);
    } catch (_) {
      Alert.alert('Error', 'Could not open WhatsApp. Please try again or contact the store by another method.');
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating < 1 || reviewRating > 5) return;
    setReviewSubmitting(true);
    try {
      const authorName = (isLoggedIn && (user?.name || firstAddressName)) ? (user?.name || firstAddressName) : (reviewName.trim() || 'Guest');
      const customerId = isLoggedIn && user?.phone ? 'user:' + user.phone : await getOrCreateGuestId();
      await post(`api/products/${product._id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        authorName,
        customerId,
      });
      setReviewRating(0);
      setReviewComment('');
      if (!isLoggedIn) setReviewName('');
      fetchReviews();
    } catch (_) {
      Alert.alert('Error', 'Could not submit review. Try again.');
    }
    setReviewSubmitting(false);
  };

  const imageUri = product.images?.[0]
    ? (product.images[0].startsWith('http') ? product.images[0] : `${getApiBaseUrl()}${product.images[0]}`)
    : 'https://via.placeholder.com/400';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        {product.isHot && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotBadgeText}>HOT</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>{product.name}</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={14} color={s <= Math.round(averageRating) ? '#eab308' : '#d1d5db'} fill={s <= Math.round(averageRating) ? '#eab308' : 'transparent'} />
          ))}
          <Text style={styles.ratingText}>{reviewsLoading ? '...' : reviewsTotal === 0 ? 'No reviews' : `${averageRating.toFixed(1)} (${reviewsTotal})`}</Text>
        </View>
        <View style={styles.priceBox}>
          <Text style={styles.price}>₹{discountedPrice}</Text>
          {basePrice > discountedPrice && <Text style={styles.originalPrice}>₹{basePrice}</Text>}
        </View>

        {product.flavours && product.flavours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Flavour</Text>
            <View style={styles.chipRow}>
              {product.flavours.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, selectedFlavour === f && styles.chipActive]}
                  onPress={() => setSelectedFlavour(f)}
                >
                  <Text style={[styles.chipText, selectedFlavour === f && styles.chipTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {product.variants && product.variants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Nicotine / Version</Text>
            <View style={styles.chipRow}>
              {product.variants.map((v) => (
                <TouchableOpacity
                  key={v.nicotine}
                  style={[styles.chip, selectedNicotine === v.nicotine && styles.chipActivePurple]}
                  onPress={() => setSelectedNicotine(v.nicotine)}
                >
                  <Text style={[styles.chipText, selectedNicotine === v.nicotine && styles.chipTextActive]}>{v.nicotine}</Text>
                  <Text style={styles.chipSub}>₹{v.discountPrice || v.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.tags}>
          {product.puffCount != null && <Text style={styles.tag}>{product.puffCount} Puffs</Text>}
          {product.capacity && <Text style={styles.tag}>{product.capacity}</Text>}
          {product.resistance && <Text style={styles.tag}>{product.resistance}</Text>}
        </View>

        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Quantity:</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity onPress={() => setQuantity((q) => Math.max(1, q - 1))} style={styles.qtyBtn}>
              <Minus size={20} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity((q) => q + 1)} style={styles.qtyBtn}>
              <Plus size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {product.description ? <Text style={styles.desc}>{product.description}</Text> : null}

        <TouchableOpacity style={styles.btnSecondary} onPress={handleAddToCart}>
          <Text style={styles.btnSecondaryText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleBuyNow}>
          <Text style={styles.btnPrimaryText}>Buy Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnWhatsApp} onPress={handleWhatsApp}>
          <MessageCircle size={22} color="#fff" />
          <Text style={styles.btnWhatsAppText}>Buy via WhatsApp</Text>
        </TouchableOpacity>

        <View style={styles.reviewsSection}>
          <Text style={styles.reviewsTitle}>Customer Reviews</Text>
          {reviewsLoading ? (
            <Text style={styles.reviewsMeta}>Loading...</Text>
          ) : (
            <>
              {reviews.length > 0 && (
                <View style={styles.reviewList}>
                  {reviews.map((r: any) => (
                    <View key={r._id} style={styles.reviewItem}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.starRow}>
                          {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} color={s <= r.rating ? '#eab308' : '#d1d5db'} fill={s <= r.rating ? '#eab308' : 'transparent'} />)}
                        </View>
                        <Text style={styles.reviewAuthor}>{r.authorName || 'Guest'}</Text>
                        <Text style={styles.reviewDate}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                      </View>
                      {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.reviewForm}>
                <Text style={styles.reviewFormTitle}>Write a review</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setReviewRating(s)} style={styles.starBtn}>
                      <Star size={28} color={s <= reviewRating ? '#eab308' : '#d1d5db'} fill={s <= reviewRating ? '#eab308' : 'transparent'} />
                    </TouchableOpacity>
                  ))}
                </View>
                {isLoggedIn && (user?.name || firstAddressName) ? (
                  <Text style={styles.reviewPostingAs}>Posting as <Text style={styles.reviewPostingAsBold}>{user?.name || firstAddressName}</Text></Text>
                ) : (
                  <>
                    <Text style={styles.reviewInputLabel}>Name</Text>
                    <TextInput placeholder="Name" value={reviewName} onChangeText={setReviewName} style={styles.textInput} placeholderTextColor="#9ca3af" />
                  </>
                )}
                <Text style={styles.reviewInputLabel}>Review</Text>
                <TextInput placeholder="Review" value={reviewComment} onChangeText={setReviewComment} style={[styles.textInput, styles.textArea]} placeholderTextColor="#9ca3af" multiline numberOfLines={2} />
                <TouchableOpacity style={[styles.submitReviewBtn, (reviewSubmitting || reviewRating < 1) && styles.submitReviewBtnDisabled]} onPress={handleSubmitReview} disabled={reviewSubmitting || reviewRating < 1}>
                  <Text style={styles.submitReviewBtnText}>Submit Review</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#f9fafb', position: 'relative' },
  image: { width: '100%', height: '100%' },
  hotBadge: { position: 'absolute', top: 16, left: 16, backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  hotBadgeText: { color: '#fff', fontSize: 10, fontFamily: fontFamilyExtraBold },
  body: { padding: 16 },
  name: { fontSize: 22, fontFamily: fontFamilyBold, color: '#111', marginBottom: 12 },
  priceBox: { flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 20, backgroundColor: '#f9fafb', padding: 16, borderRadius: 12 },
  price: { fontSize: 28, fontFamily: fontFamilyExtraBold, color: '#2563eb' },
  originalPrice: { fontSize: 16, fontFamily, color: '#9ca3af', textDecorationLine: 'line-through' },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontFamily: fontFamilyBold, color: '#374151', marginBottom: 8, textTransform: 'uppercase' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  chipActive: { borderColor: '#2563eb', backgroundColor: '#2563eb' },
  chipActivePurple: { borderColor: '#7c3aed', backgroundColor: '#ede9fe' },
  chipText: { fontSize: 14, fontFamily: fontFamilySemiBold, color: '#374151' },
  chipTextActive: { color: '#fff' },
  chipSub: { fontSize: 11, fontFamily, color: '#6b7280', marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, fontSize: 12, fontFamily, color: '#6b7280' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  qtyLabel: { fontSize: 14, fontFamily: fontFamilySemiBold, color: '#374151' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 },
  qtyBtn: { padding: 12 },
  qtyValue: { minWidth: 36, textAlign: 'center', fontFamily: fontFamilyBold, color: '#111' },
  desc: { fontSize: 14, fontFamily, color: '#6b7280', lineHeight: 22, marginBottom: 24 },
  btnSecondary: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnSecondaryText: { color: '#2563eb', fontFamily: fontFamilyBold, fontSize: 14 },
  btnPrimary: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnPrimaryText: { color: '#fff', fontFamily: fontFamilyBold, fontSize: 14 },
  btnWhatsApp: { backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnWhatsAppText: { color: '#fff', fontFamily: fontFamilyBold, fontSize: 14 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  ratingText: { fontSize: 12, fontFamily, color: '#6b7280' },
  reviewsSection: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  reviewsTitle: { fontSize: 18, fontFamily: fontFamilyBold, color: '#111', marginBottom: 12 },
  reviewsMeta: { fontSize: 14, fontFamily, color: '#6b7280', marginBottom: 12 },
  reviewList: { marginBottom: 16 },
  reviewItem: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  reviewHeader: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 },
  starRow: { flexDirection: 'row', gap: 2 },
  reviewAuthor: { fontSize: 13, fontFamily: fontFamilySemiBold, color: '#374151' },
  reviewDate: { fontSize: 11, fontFamily, color: '#9ca3af' },
  reviewComment: { fontSize: 14, fontFamily, color: '#6b7280', lineHeight: 20 },
  reviewForm: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  reviewFormTitle: { fontSize: 14, fontFamily: fontFamilySemiBold, color: '#374151', marginBottom: 10 },
  starBtn: { padding: 4 },
  reviewInputLabel: { fontSize: 12, fontFamily: fontFamilySemiBold, color: '#6b7280', marginTop: 10, marginBottom: 4 },
  reviewPostingAs: { fontSize: 14, fontFamily, color: '#6b7280', marginTop: 10, marginBottom: 4 },
  reviewPostingAsBold: { fontFamily: fontFamilyBold, color: '#111' },
  textInput: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily, color: '#111', backgroundColor: '#fff' },
  textArea: { minHeight: 64, textAlignVertical: 'top' },
  submitReviewBtn: { backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  submitReviewBtnDisabled: { opacity: 0.5 },
  submitReviewBtnText: { color: '#fff', fontFamily: fontFamilyBold, fontSize: 14 },
});
