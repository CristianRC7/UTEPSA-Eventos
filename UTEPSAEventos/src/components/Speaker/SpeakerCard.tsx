import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Speaker } from '../../types/SpeakerTypes';
import { BASE_URL } from '../../utils/Config';

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
      <View style={styles.rowContainer}>
        <View style={styles.speakerImageContainer}>
          {speaker.imagen_url ? (
            <Image 
              source={getImageUrl(speaker.imagen_url) || undefined} 
              style={styles.speakerImage} 
              resizeMode="cover" 
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Icon name="person" size={48} color="#CCCCCC" />
            </View>
          )}
        </View>
        <View style={styles.speakerInfo}>
          <Text style={styles.speakerName} numberOfLines={2}>
            {getFullName(speaker)}
          </Text>
        </View>
        <Icon name="chevron-right" size={28} color="#cf152d" style={styles.arrowIcon} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  speakerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#cf152d",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  speakerImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 18,
  },
  placeholderContainer: {
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 36,
  },
  speakerImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  speakerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  speakerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  arrowIcon: {
    marginLeft: 12,
    color: "#cf152d",
  },
});

export default SpeakerCard;
