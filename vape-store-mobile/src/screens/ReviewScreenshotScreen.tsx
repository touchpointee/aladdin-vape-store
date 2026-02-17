import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontFamily } from '../theme';

const { width: winWidth, height: winHeight } = Dimensions.get('window');

type RouteParams = { url: string; caption?: string };

export default function ReviewScreenshotScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { url, caption } = (route.params || {}) as RouteParams;

  const close = () => navigation.goBack();

  if (!url) {
    close();
    return null;
  }

  return (
    <View style={[styles.wrap, { width: winWidth, height: winHeight }]}>
      <StatusBar hidden />
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={close}
      />
      <TouchableOpacity
        style={[styles.closeBtn, { top: Math.max(16, insets.top) }]}
        onPress={close}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.content} pointerEvents="box-none">
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={styles.imageTouchable}>
          <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  imageTouchable: {
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  image: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: '85%',
    borderRadius: 12,
  },
  caption: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontFamily: fontFamily,
  },
});
