import React, { useEffect } from 'react';
import { Modal, View, TouchableOpacity, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Image } from 'react-native';

interface PublicationModalProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
  BASE_URL: string;
}

const PublicationModal: React.FC<PublicationModalProps> = ({ visible, imageUrl, onClose, BASE_URL }) => {
  // Animaciones
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);
  const borderRadius = useSharedValue(30);

  useEffect(() => {
    if (visible) {
      scale.value = 0.85;
      opacity.value = 0;
      borderRadius.value = 30;
      // Animación más suave y natural
      scale.value = withTiming(1, { duration: 600, easing: Easing.bezier(0.22, 1, 0.36, 1) });
      borderRadius.value = withTiming(10, { duration: 600, easing: Easing.bezier(0.22, 1, 0.36, 1) });
      // Opacidad con leve retraso para mayor suavidad
      setTimeout(() => {
        opacity.value = withTiming(1, { duration: 400, easing: Easing.bezier(0.22, 1, 0.36, 1) });
      }, 80);
    } else {
      scale.value = 0.85;
      opacity.value = 0;
      borderRadius.value = 30;
    }
  }, [visible, opacity, scale, borderRadius]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    borderRadius: borderRadius.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bouncesZoom={true}
            centerContent={true}
          >
            {imageUrl && (
              <Animated.View style={[styles.animatedImageContainer, animatedImageStyle]}>
                <Image
                  source={{ uri: `${BASE_URL}/${imageUrl}` }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </Animated.View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 30,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  animatedImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').height * 0.7,
    borderRadius: 10,
  },
});

export default PublicationModal; 