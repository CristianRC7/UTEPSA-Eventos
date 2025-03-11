import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';

interface Publication {
  id: number;
  userName: string;
  userRole: string;
  eventName: string;
  status: 'esperando_aprobacion' | 'rechazado' | 'aprobado';
  date: string;
  imageUrl: string;
}

interface PublicationCardProps {
  publication: Publication;
  onLike?: () => void;
}

const PublicationCard = ({ publication, onLike }: PublicationCardProps) => {
  const handleShare = async () => {
    try {
      await Share.open({
        title: 'Compartir evento',
        message: `¡Mira este evento: ${publication.eventName}!`,
        url: publication.imageUrl,
      });
    } catch (error) {
      console.log('Error al compartir:', error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>
              {publication.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{publication.userName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.eventName}>{publication.eventName}</Text>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: publication.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <Text style={styles.date}>{publication.date}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Icon name="favorite-outline" size={22} color="#666" />
          <Text style={styles.actionText}>Me gusta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Icon name="share" size={22} color="#666" />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5DEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardContent: {
    marginBottom: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#F9F9F9',
  },
  date: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
});

export default PublicationCard;
