import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useReviewScreenshotModalStore } from '../store/reviewScreenshotModalStore';
import { fontFamily } from '../theme';

const { width: winWidth, height: winHeight } = Dimensions.get('window');

export default function ReviewScreenshotModal() {
  const { url, caption, close } = useReviewScreenshotModalStore();
  const visible = !!url;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <TouchableOpacity
        style={[styles.wrap, styles.wrapFullScreen, { width: winWidth, height: winHeight }]}
        activeOpacity={1}
        onPress={close}
      >
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={close}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.content}>
          {url ? (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {}}
              style={styles.imageTouchable}
            >
              <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
              {caption ? <Text style={styles.caption}>{caption}</Text> : null}
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
