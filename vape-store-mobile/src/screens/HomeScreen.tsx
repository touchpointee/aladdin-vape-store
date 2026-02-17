import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { get } from '../api/client';
import { fontFamily, fontFamilyBold } from '../theme';
import Header from '../components/Header';
import HomeSearchBar from '../components/HomeSearchBar';
import ProductCard from '../components/ProductCard';
import { getApiBaseUrl } from '../api/config';
import type { Product, Category, Brand } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [hotRes, newRes, topRes, categoriesRes, brandsRes] = await Promise.all([
        get<{ products: Product[] }>('api/products', { isHot: 'true', limit: '8' }),
        get<{ products: Product[] }>('api/products', { isNewArrival: 'true', limit: '8' }),
        get<{ products: Product[] }>('api/products', { isTopSelling: 'true', limit: '8' }),
        get<Category[]>('api/categories'),
        get<Brand[]>('api/brands'),
      ]);
      setProducts(hotRes?.products || []);
      setNewArrivals(newRes?.products || []);
      setTopSelling(topRes?.products || []);
      setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      setBrands(Array.isArray(brandsRes) ? brandsRes : []);
    } catch (e) {
      console.warn('Home load error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const { width } = Dimensions.get('window');
  const padding = 16;
  const heroWidth = width - padding * 2;
  const heroHeight = heroWidth * (4 / 3); // aspect 3/4 like web
  const baseUrl = getApiBaseUrl();
  const imageUrl = (path: string | undefined) =>
    !path ? '' : path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  const catCardSize = (width - padding * 2 - 12) / 2; // 2-col grid, 12 gap
  const catCardHeight = 112; // match web h-28
  const brandCardWidth = (width - padding * 2 - 16) / 3; // 3 cols, 8 gap each
  const brandCardHeight = brandCardWidth * (4 / 3); // aspect 4/3 like web

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Header />
      <HomeSearchBar />

      {/* Home page hero image - match web brand-banner */}
      <View style={styles.heroContainer}>
        <TouchableOpacity
          style={[styles.heroWrap, { width: heroWidth, height: heroHeight }]}
          onPress={() => navigation.navigate('Products')}
          activeOpacity={0.98}
        >
          <Image
            source={{ uri: `${getApiBaseUrl()}/brand-banner.png` }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>

      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <View style={styles.catGrid}>
            {categories.slice(0, 8).map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={[styles.catCard, { width: catCardSize, height: catCardHeight }]}
                onPress={() => navigation.navigate('Products', { category: (cat as any).slug || cat._id })}
                activeOpacity={0.9}
              >
                <View style={styles.catCardBg}>
                  {cat.image ? (
                    <Image
                      source={{ uri: imageUrl(cat.image) }}
                      style={styles.catCardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.catCardPlaceholder} />
                  )}
                </View>
                <View style={styles.catCardOverlay}>
                  <Text style={styles.catNameOverlay} numberOfLines={1}>{cat.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {newArrivals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>New Arrivals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products', { isNewArrival: 'true' })}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={newArrivals}
            horizontal
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { id: item._id, slug: item.slug })}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {brands.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Brand</Text>
          <View style={styles.brandGrid}>
            {brands.map((b) => (
              <TouchableOpacity
                key={b._id}
                style={[styles.brandCard, { width: brandCardWidth, height: brandCardHeight + 28 }]}
                onPress={() => navigation.navigate('Products', { brand: (b as any).slug || b._id })}
                activeOpacity={0.9}
              >
                <View style={[styles.brandLogoWrap, { width: brandCardWidth, height: brandCardHeight }]}>
                  {b.logo ? (
                    <Image
                      source={{ uri: imageUrl(b.logo) }}
                      style={styles.brandLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.brandLogoPlaceholder}>
                      <Text style={styles.brandLogoLetter}>{b.name ? b.name[0] : '?'}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.brandName} numberOfLines={1}>{b.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {hotProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Hot Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products', { isHot: 'true' })}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={hotProducts}
            horizontal
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { id: item._id, slug: item.slug })}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {topSelling.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Top Selling</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products', { isTopSelling: 'true' })}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={topSelling}
            horizontal
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() => navigation.navigate('ProductDetail', { id: item._id, slug: item.slug })}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  heroWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', textTransform: 'uppercase', fontFamily: fontFamilyBold },
  viewAll: { fontSize: 12, fontFamily: fontFamilyBold, color: '#2563eb' },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  catCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  catCardBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e5e7eb',
  },
  catCardImage: {
    width: '100%',
    height: '100%',
  },
  catCardPlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  catCardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  catNameOverlay: {
    fontSize: 12,
    fontFamily: fontFamilyBold,
    color: '#fff',
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  brandCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  brandLogoWrap: {
    marginBottom: 6,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9fafb',
  },
  brandLogo: {
    width: '100%',
    height: '100%',
    padding: 8,
  },
  brandLogoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoLetter: {
    fontSize: 24,
    fontFamily: fontFamilyBold,
    color: '#d1d5db',
  },
  brandName: {
    fontSize: 10,
    fontFamily: fontFamilyBold,
    color: '#111',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
