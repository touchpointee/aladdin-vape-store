import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useReviewScreenshotModalStore } from '../store/reviewScreenshotModalStore';
import { fontFamily } from '../theme';

const { width: winWidth, height: winHeight } = Dimensions.get('window');
const IMAGE_PADDING = 48;
const IMAGE_MAX_WIDTH = winWidth - IMAGE_PADDING;
const IMAGE_MAX_HEIGHT = winHeight * 0.85 - 80;

export default function ReviewScreenshotModal() {
  const { url, caption, close } = useReviewScreenshotModalStore();
  const visible = !!url;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleClose = () => {
    setImageLoading(true);
    setImageError(false);
    close();
  };

  useEffect(() => {
    if (url) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [url]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <TouchableOpacity
        style={[styles.wrap, styles.wrapFullScreen, { width: winWidth, height: winHeight }]}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={handleClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.content}>
          {url ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={[styles.imageTouchable, { width: IMAGE_MAX_WIDTH, maxHeight: IMAGE_MAX_HEIGHT }]}
            >
              {imageLoading && !imageError ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color="rgba(255,255,255,0.9)" />
                </View>
              ) : null}
              <Image
                source={{ uri: url }}
                style={styles.image}
                resizeMode="contain"
                onLoadStart={() => { setImageLoading(true); setImageError(false); }}
                onLoad={() => setImageLoading(false)}
                onError={() => { setImageLoading(false); setImageError(true); }}
              />
              {imageError ? (
                <Text style={styles.errorText}>Could not load image</Text>
              ) : null}
              {caption && !imageError ? <Text style={styles.caption}>{caption}</Text> : null}
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    </Modal>
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
    ...(Platform.OS === 'android' ? { elevation: 9999 } : {}),
  },
  wrapFullScreen: {
    width: winWidth,
    height: winHeight,
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
  loadingWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontFamily: fontFamily,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
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
    width: IMAGE_MAX_WIDTH,
    maxHeight: IMAGE_MAX_HEIGHT,
    aspectRatio: 9 / 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  caption: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontFamily: fontFamily,
  },
});
