import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Speaker } from '../../types/SpeakerTypes';
import { BASE_URL } from '../../utils/Config';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with padding

interface SpeakerCardProps {
  speaker: Speaker;
  onPress: (speaker: Speaker) => void;
}

const SpeakerCard: React.FC<SpeakerCardProps> = ({ speaker, onPress }) => {
  const getFullName = (speaker: Speaker) => {
    return `${speaker.nombre} ${speaker.apellido_paterno} ${speaker.apellido_materno}`;
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
      return null;
    }
    return { uri: `${BASE_URL}/upload/${imageUrl}` };
  };

  return (
    <TouchableOpacity 
      style={styles.speakerCard} 
      onPress={() => onPress(speaker)} 
      activeOpacity={0.7}
    >
      <View style={styles.speakerImageContainer}>
        {speaker.imagen_url ? (
          <Image 
            source={getImageUrl(speaker.imagen_url) || undefined} 
            style={styles.speakerImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name="person" size={60} color="#CCCCCC" />
          </View>
        )}
      </View>
      <View style={styles.speakerInfo}>
        <Text style={styles.speakerName} numberOfLines={2}>
          {getFullName(speaker)}
        </Text>
        <View style={styles.viewProfileContainer}>
          <Text style={styles.viewProfile}>Ver perfil</Text>
          <Icon name="arrow-forward" size={14} color="#10B981" style={styles.arrowIcon} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  speakerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: cardWidth,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  speakerImageContainer: {
    height: cardWidth,
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  speakerImage: {
    width: "100%",
    height: "100%",
  },
  speakerInfo: {
    padding: 16,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  viewProfileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewProfile: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  arrowIcon: {
    marginLeft: 4,
  },
});

export default SpeakerCard;
