import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Home, LayoutGrid, Heart, User } from '../components/Icons';
import { fontFamilySemiBold, fontFamilyBold } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AccountScreen from '../screens/AccountScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddressesScreen from '../screens/AddressesScreen';
import HelpScreen from '../screens/HelpScreen';

import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ Icon, focused }: { Icon: React.ComponentType<{ size?: number; color?: string }>; focused: boolean }) {
  const color = focused ? '#2563eb' : '#6b7280';
  return (
    <View style={styles.tabIcon}>
      <Icon size={20} color={color} />
    </View>
  );
}

function HomeTabs() {
  const totalItems = useCartStore((s) => s.totalItems());
  const wishlistItems = useWishlistStore((s) => s.items);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', fontFamily: fontFamilySemiBold },
      }}
    >
      <Tab.Screen
        name="Shop"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={Home} focused={focused} /> }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon Icon={LayoutGrid} focused={focused} /> }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Heart} focused={focused} />,
          tabBarBadge: wishlistItems.length > 0 ? wishlistItems.length : undefined,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#111',
          headerTitleStyle: { fontWeight: '700', fontSize: 18, fontFamily: fontFamilyBold },
        }}
      >
        <Stack.Screen name="Tabs" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
        <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders' }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: 'Saved Addresses' }} />
        <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help & Support' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingBottom: 8,
    paddingTop: 8,
    height: 64,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
