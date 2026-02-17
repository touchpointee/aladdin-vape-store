import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import RootNavigator from './src/navigation/RootNavigator';
import { loadApiConfig } from './src/api/config';

const SPLASH_MIN_MS = 2200;

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!fontsLoaded) return;
    let cancelled = false;
    Promise.all([
      loadApiConfig(4000),
      new Promise((r) => setTimeout(r, SPLASH_MIN_MS)),
    ]).then(() => {
      if (!cancelled) setShowSplash(false);
    });
    return () => { cancelled = true; };
  }, [fontsLoaded]);

  if (showSplash) {
    return (
      <View style={styles.splash}>
        <StatusBar style="light" />
        <Image
          source={require('./assets/splash.png')}
          style={styles.splashImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#000',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});
