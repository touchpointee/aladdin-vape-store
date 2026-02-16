import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search } from './Icons';
import { get } from '../api/client';
import { API_BASE_URL } from '../api/config';
import { fontFamily, fontFamilyBold } from '../theme';
import type { Product } from '../types';

const baseUrl = API_BASE_URL.replace(/\/$/, '');
const imageUrl = (path: string | undefined) =>
  !path ? '' : path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

/**
 * Home search bar with live results - matches website MobileSearch:
 * debounced search, dropdown with product results, "View all X results".
 */
export default function HomeSearchBar() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.trim().length <= 1) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await get<{ products?: Product[] } | Product[]>('api/products', {
          search: query.trim(),
          limit: '8',
        });
        const list = Array.isArray(res) ? res : (res?.products || []);
        setSearchResults(list);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const handleSubmit = () => {
    if (!query.trim()) return;
    setShowResults(false);
    navigation.navigate('Products', { query: query.trim() });
  };

  const openProduct = (id: string, slug?: string) => {
    setShowResults(false);
    navigation.navigate('ProductDetail', { id, slug });
  };

  const showDropdown = showResults && query.trim().length > 1;

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        <Search size={20} color="#9ca3af" />
        <TextInput
          style={styles.input}
          placeholder="Search products..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 220)}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          {isSearching ? (
            <View style={styles.dropdownRow}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.searchingText}>Searching...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.slice(0, 5).map((product) => {
                const img = product.images?.[0];
                const uri = img ? imageUrl(img) : undefined;
                return (
                  <TouchableOpacity
                    key={product._id}
                    style={styles.resultRow}
                    onPress={() => openProduct(product._id, product.slug)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultThumb}>
                      {uri ? (
                        <Image source={{ uri }} style={styles.resultThumbImg} resizeMode="cover" />
                      ) : (
                        <View style={styles.resultThumbPlaceholder} />
                      )}
                    </View>
                    <View style={styles.resultBody}>
                      <Text style={styles.resultName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.resultPrice}>
                        ₹{product.discountPrice != null && product.discountPrice < product.price
                          ? product.discountPrice
                          : product.price}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.viewAllRow} onPress={handleSubmit}>
                <Text style={styles.viewAllText}>View all {searchResults.length} results</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.dropdownRow}>
              <Text style={styles.noResultsText}>No products found.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111',
    paddingVertical: 2,
    fontFamily: fontFamily,
  },
  dropdown: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '100%',
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
  },
  searchingText: {
    fontSize: 14,
    fontFamily: fontFamily,
    color: '#6b7280',
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: fontFamily,
    color: '#6b7280',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    overflow: 'hidden',
  },
  resultThumbImg: {
    width: '100%',
    height: '100%',
  },
  resultThumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  resultBody: { flex: 1, minWidth: 0 },
  resultName: {
    fontSize: 14,
    fontFamily: fontFamilyBold,
    color: '#111',
  },
  resultPrice: {
    fontSize: 13,
    fontFamily: fontFamily,
    color: '#2563eb',
    marginTop: 2,
  },
  viewAllRow: {
    padding: 12,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 12,
    fontFamily: fontFamilyBold,
    color: '#2563eb',
  },
});
