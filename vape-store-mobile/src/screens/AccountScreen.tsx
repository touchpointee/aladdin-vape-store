import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Package, User, MapPin, Heart, HelpCircle, ChevronRight, LogOut } from '../components/Icons';
import { useAuthStore } from '../store/authStore';
import { fontFamily, fontFamilyBold } from '../theme';

const menuItems: { Icon: React.ComponentType<{ size?: number; color?: string }>; label: string; href: string; tab?: string; desc: string }[] = [
  { Icon: Package, label: 'My Orders', href: 'Orders', desc: 'View your order history' },
  { Icon: User, label: 'My Profile', href: 'Profile', desc: 'Edit your name and phone' },
  { Icon: MapPin, label: 'Saved Addresses', href: 'Addresses', desc: 'Manage shipping addresses' },
  { Icon: Heart, label: 'My Wishlist', href: 'Tabs', tab: 'Wishlist', desc: 'View your saved items' },
  { Icon: HelpCircle, label: 'Help & Support', href: 'Help', desc: 'FAQs and Contact' },
];

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, isLoggedIn, logout } = useAuthStore();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>My Account</Text>
        <Text style={styles.subtitle}>{isLoggedIn ? 'Welcome back!' : 'Welcome back, Guest!'}</Text>
        {isLoggedIn && user?.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}
      </View>

      {!isLoggedIn && (
        <View style={styles.loginCard}>
          <Text style={styles.loginText}>Login to view orders and profile.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoggedIn && (
        <View style={styles.menu}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.href + (item.tab || '')}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.href, item.tab ? { screen: item.tab } : undefined)}
              activeOpacity={0.8}
            >
              <View style={styles.menuIcon}>
                <item.Icon size={22} color="#2563eb" />
              </View>
              <View style={styles.menuBody}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={logout} activeOpacity={0.8}>
            <View style={[styles.menuIcon, styles.logoutIcon]}>
              <LogOut size={22} color="#ef4444" />
            </View>
            <View style={styles.menuBody}>
              <Text style={styles.logoutLabel}>Logout</Text>
              <Text style={styles.logoutDesc}>Sign out of your account</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', padding: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontSize: 24, fontFamily: fontFamilyBold, color: '#111' },
  subtitle: { fontSize: 14, fontFamily, color: '#6b7280', marginTop: 4 },
  phone: { fontSize: 12, fontFamily: fontFamilyBold, color: '#2563eb', marginTop: 6 },
  loginCard: { backgroundColor: '#fff', margin: 16, padding: 24, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  loginText: { fontFamily, color: '#6b7280', marginBottom: 16, textAlign: 'center' },
  loginBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontFamily: fontFamilyBold },
  menu: { padding: 16, paddingTop: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#f3f4f6' },
  menuIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuBody: { flex: 1 },
  menuLabel: { fontSize: 14, fontFamily: fontFamilyBold, color: '#111' },
  menuDesc: { fontSize: 12, fontFamily, color: '#6b7280', marginTop: 2 },
  logoutItem: { borderColor: '#fee2e2' },
  logoutIcon: { backgroundColor: '#fef2f2' },
  logoutLabel: { fontSize: 14, fontFamily: fontFamilyBold, color: '#ef4444' },
  logoutDesc: { fontSize: 12, fontFamily, color: '#fca5a5', marginTop: 2 },
});
