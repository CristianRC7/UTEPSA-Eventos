import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Speaker } from '../../types/SpeakerTypes';
import { BASE_URL } from '../../utils/Config';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.7;

const SpeakerDetailPage: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { speaker: Speaker } }, 'params'>>();
  const { speaker } = route.params;

  const getFullName = (speaker: Speaker) => {
    return `${speaker.nombre} ${speaker.apellido_paterno} ${speaker.apellido_materno}`;
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return undefined;
    return { uri: `${BASE_URL}/upload/${imageUrl}` };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Animated.View
        entering={FadeIn.duration(400)}
        exiting={FadeOut.duration(300)}
        style={styles.imageContainer}
      >
        <Image
          source={getImageUrl(speaker.imagen_url) || undefined}
          style={styles.image}
          resizeMode="contain"
        />
        {!speaker.imagen_url && (
          <View style={styles.placeholderIconContainer}>
            <Icon name="person" size={90} color="#CCCCCC" />
          </View>
        )}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color="#cf152d" />
        </TouchableOpacity>
        <View style={styles.overlay} />
        <View style={styles.titleOverlay}>
          <Text style={styles.title}>{getFullName(speaker)}</Text>
        </View>
      </Animated.View>
      <Animated.View entering={SlideInDown.delay(200).duration(500)} style={styles.detailContainer}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.aboutTitle}>Biografia</Text>
          <Text style={styles.aboutText}>{speaker.descripcion || 'Sin biografía disponible.'}</Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
    justifyContent: 'flex-end',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    zIndex: 2,
    backgroundColor: '#fff',
    borderRadius: 0,
    padding: 6,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    textAlign: 'justify',
  },
  placeholderIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default SpeakerDetailPage; 