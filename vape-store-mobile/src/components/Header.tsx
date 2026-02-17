import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShoppingBag, Heart } from './Icons';
import { get } from '../api/client';
import { getApiBaseUrl } from '../api/config';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { fontFamily, fontFamilyBold } from '../theme';

export default function Header() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [siteLogo, setSiteLogo] = useState('/logo.jpg');
  const totalItems = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);

  useEffect(() => {
    get<{ site_logo?: string }>('api/settings')
      .then((data) => data?.site_logo && setSiteLogo(data.site_logo))
      .catch(() => {});
  }, []);

  const logoUri = siteLogo.startsWith('http') ? siteLogo : `${getApiBaseUrl()}${siteLogo}`;

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {/* Logo - left */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Tabs')}
          style={styles.logoWrap}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: logoUri }}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Right: Wishlist + Cart */}
        <View style={styles.icons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Tabs', { screen: 'Wishlist' })}
            style={styles.iconBtn}
          >
            <Heart size={24} color="#6b7280" />
            {wishlistCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlistCount > 99 ? '99+' : wishlistCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.iconBtn}>
            <ShoppingBag size={24} color="#6b7280" />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems > 99 ? '99+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.promoStrip}>
        <View style={styles.promoRow}>
          <Text style={styles.promoText}>All India Delivery</Text>
          <Text style={styles.promoDot}>|</Text>
          <Text style={styles.promoText}>2 Hour Delivery in Trivandrum</Text>
        </View>
        <Text style={styles.promoBold}>Chat with Us on WhatsApp</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  promoStrip: {
    backgroundColor: '#111',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  promoText: {
    fontSize: 10,
    fontFamily: fontFamilyBold,
    color: '#fff',
    letterSpacing: 1,
  },
  promoDot: {
    fontSize: 10,
    fontFamily: fontFamily,
    color: 'rgba(255,255,255,0.4)',
  },
  promoBold: {
    fontSize: 10,
    fontFamily: fontFamilyBold,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoWrap: {
    height: 44,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: '100%',
  },
  icons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: fontFamilyBold,
  },
});
