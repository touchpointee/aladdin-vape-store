import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { get } from '../api/client';
import ProductCard from '../components/ProductCard';
import { Filter, X } from '../components/Icons';
import type { Product, Category, Brand } from '../types';
import { fontFamily, fontFamilySemiBold, fontFamilyBold } from '../theme';

type Params = { category?: string; brand?: string; query?: string; isHot?: string; isTopSelling?: string; isNewArrival?: string };

const SORT_OPTIONS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function ProductsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: Params }, 'params'>>();
  const params = (route.params || {}) as Params;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | null>(params.category || null);
  const [filterBrand, setFilterBrand] = useState<string | null>(params.brand || null);
  const [modalCategory, setModalCategory] = useState<string | null>(params.category || null);
  const [modalBrand, setModalBrand] = useState<string | null>(params.brand || null);
  const [modalSort, setModalSort] = useState(sort);
  const { width } = Dimensions.get('window');
  const cardWidth = (width - 12 * 3) / 2;

  useEffect(() => {
    get<Category[]>('api/categories').then((d) => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    get<Brand[]>('api/brands').then((d) => setBrands(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    setSearchQuery(params.query || '');
  }, [params?.query]);

  useEffect(() => {
    setFilterCategory(params.category || null);
    setFilterBrand(params.brand || null);
  }, [params?.category, params?.brand]);

  const load = async (pageNum: number = 1, append: boolean = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const q: Record<string, string> = { page: String(pageNum), limit: '20' };
      if (filterCategory) q.category = filterCategory;
      if (filterBrand) q.brand = filterBrand;
      if (params.isHot === 'true') q.isHot = 'true';
      if (params.isTopSelling === 'true') q.isTopSelling = 'true';
      if (params.isNewArrival === 'true') q.isNewArrival = 'true';
      const queryToUse = params?.query ?? searchQuery;
      if (queryToUse.trim()) q.search = queryToUse.trim();
      if (sort) q.sort = sort;

      const res = await get<{ products: Product[]; pagination: { pages: number } }>('api/products', q);
      const list = res?.products || [];
      setProducts(append ? (prev) => [...prev, ...list] : list);
      setHasMore(list.length === 20 && (res?.pagination?.pages ?? 1) > pageNum);
    } catch (e) {
      console.warn('Products load error', e);
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    load(1, false);
  }, [filterCategory, filterBrand, params?.query, params?.isHot, params?.isTopSelling, params?.isNewArrival, sort]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    load(1, false);
  };

  const onEndReached = () => {
    if (!loadingMore && hasMore && products.length >= 20) {
      const next = page + 1;
      setPage(next);
      load(next, true);
    }
  };

  const doSearch = () => {
    setPage(1);
    load(1, false);
  };

  const openFilter = () => {
    setModalCategory(filterCategory);
    setModalBrand(filterBrand);
    setModalSort(sort);
    setFilterModalVisible(true);
  };

  const applyFilter = () => {
    setFilterCategory(modalCategory);
    setFilterBrand(modalBrand);
    setSort(modalSort);
    setFilterModalVisible(false);
    setPage(1);
    // useEffect will trigger load when filterCategory, filterBrand, sort change
  };

  const catId = (c: Category) => (c as any).slug || c._id;
  const brandId = (b: Brand) => (b as any).slug || b._id;
  const hasActiveFilter = filterCategory || filterBrand;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={doSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={doSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.toolbar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}
          style={styles.sortScroll}
        >
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value || 'newest'}
              style={[styles.sortChip, sort === opt.value && styles.sortChipActive]}
              onPress={() => setSort(opt.value)}
            >
              <Text style={[styles.sortChipText, sort === opt.value && styles.sortChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={[styles.filterBtn, hasActiveFilter && styles.filterBtnActive]} onPress={openFilter}>
          <Filter size={18} color={hasActiveFilter ? '#fff' : '#374151'} />
          <Text style={[styles.filterBtnText, hasActiveFilter && styles.filterBtnTextActive]}>Filter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No products found.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color="#2563eb" /> : null}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              width={cardWidth}
              onPress={() => navigation.navigate('ProductDetail', { id: item._id, slug: item.slug })}
            />
          )}
        />
      )}

      <Modal visible={filterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setFilterModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters & Sort</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.modalClose}>
                <X size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortOptionsModal}>
                {SORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value || 'newest'}
                    style={[styles.modalChip, modalSort === opt.value && styles.modalChipActive]}
                    onPress={() => setModalSort(opt.value)}
                  >
                    <Text style={[styles.modalChipText, modalSort === opt.value && styles.modalChipTextActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>Category</Text>
              {categories.length === 0 ? (
                <Text style={styles.filterEmpty}>No categories</Text>
              ) : (
                <View style={styles.optionList}>
                  <TouchableOpacity
                    style={[styles.optionRow, !modalCategory && styles.optionRowActive]}
                    onPress={() => setModalCategory(null)}
                  >
                    <View style={[styles.radio, !modalCategory && styles.radioActive]}>
                      {!modalCategory && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.optionLabel, !modalCategory && styles.optionLabelActive]}>All</Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat._id}
                      style={[styles.optionRow, modalCategory === catId(cat) && styles.optionRowActive]}
                      onPress={() => setModalCategory(catId(cat))}
                    >
                      <View style={[styles.radio, modalCategory === catId(cat) && styles.radioActive]}>
                        {modalCategory === catId(cat) && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.optionLabel, modalCategory === catId(cat) && styles.optionLabelActive]}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.filterSectionTitle}>Brand</Text>
              {brands.length === 0 ? (
                <Text style={styles.filterEmpty}>No brands</Text>
              ) : (
                <View style={styles.optionList}>
                  <TouchableOpacity
                    style={[styles.optionRow, !modalBrand && styles.optionRowActive]}
                    onPress={() => setModalBrand(null)}
                  >
                    <View style={[styles.radio, !modalBrand && styles.radioActive]}>
                      {!modalBrand && <View style={styles.radioDot} />}
                    </View>
                    <Text style={[styles.optionLabel, !modalBrand && styles.optionLabelActive]}>All</Text>
                  </TouchableOpacity>
                  {brands.map((b) => (
                    <TouchableOpacity
                      key={b._id}
                      style={[styles.optionRow, modalBrand === brandId(b) && styles.optionRowActive]}
                      onPress={() => setModalBrand(brandId(b))}
                    >
                      <View style={[styles.radio, modalBrand === brandId(b) && styles.radioActive]}>
                        {modalBrand === brandId(b) && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.optionLabel, modalBrand === brandId(b) && styles.optionLabelActive]}>{b.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={{ height: 24 }} />
            </ScrollView>
            <TouchableOpacity style={styles.applyBtn} onPress={applyFilter}>
              <Text style={styles.applyBtnText}>Show Results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchRow: { flexDirection: 'row', padding: 16, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily },
  searchBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 10 },
  searchBtnText: { color: '#fff', fontFamily: fontFamilyBold },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
    minHeight: 48,
  },
  sortScroll: { flex: 1, marginRight: 0 },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    minHeight: 36,
    justifyContent: 'center',
  },
  sortChipActive: { backgroundColor: '#2563eb' },
  sortChipText: { fontSize: 12, fontFamily: fontFamilySemiBold, color: '#374151' },
  sortChipTextActive: { color: '#fff' },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  filterBtnActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  filterBtnText: { fontSize: 12, fontFamily: fontFamilySemiBold, color: '#374151' },
  filterBtnTextActive: { color: '#fff' },
  listContent: { padding: 12, paddingBottom: 100 },
  row: { gap: 12, marginBottom: 12, justifyContent: 'flex-start' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontFamily, color: '#6b7280', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: { fontSize: 18, fontFamily: fontFamilyBold, color: '#111' },
  modalClose: { padding: 4 },
  modalBody: { paddingHorizontal: 20, paddingTop: 16, maxHeight: 400 },
  filterSectionTitle: {
    fontSize: 11,
    fontFamily: fontFamilyBold,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sortOptionsModal: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  modalChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f3f4f6' },
  modalChipActive: { backgroundColor: '#111' },
  modalChipText: { fontSize: 13, fontFamily: fontFamilySemiBold, color: '#374151' },
  modalChipTextActive: { color: '#fff' },
  optionList: { marginBottom: 20 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  optionRowActive: {},
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: '#111', backgroundColor: '#111' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  optionLabel: { fontSize: 14, fontFamily: fontFamily, color: '#374151' },
  optionLabelActive: { fontFamily: fontFamilyBold, color: '#111' },
  filterEmpty: { fontSize: 13, fontFamily: fontFamily, color: '#9ca3af', marginBottom: 12 },
  applyBtn: {
    margin: 20,
    marginTop: 8,
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontSize: 14, fontFamily: fontFamilyBold },
});
