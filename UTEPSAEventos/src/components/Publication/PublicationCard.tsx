import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import Carousel from '../Carousel';
import { BASE_URL } from '../../utils/Config';
import { getSession } from '../../utils/sessionStorage';
import PublicationModal from './PublicationModal';

interface Publication {
  id: number
  userName: string
  eventName: string
  publicationDescription?: string
  eventDescription?: string
  date: string
  imageUrl: string
  imageUrls?: string[] // Soporte para múltiples imágenes
  likes?: number
  hasUserLiked?: boolean
}

interface PublicationCardProps {
  publication: Publication
  onShare: () => void
}

const PublicationCard = ({ publication, onShare }: PublicationCardProps) => {
  const [liked, setLiked] = useState(publication.hasUserLiked || false);
  const [likeCount, setLikeCount] = useState(publication.likes || 0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [descLines, setDescLines] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    setLiked(publication.hasUserLiked || false);
    setLikeCount(publication.likes || 0);
  }, [publication.hasUserLiked, publication.likes]);

  const animateLike = () => {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Usar imageUrls si existe, de lo contrario usar imageUrl como un array de una sola imagen
  const images = publication.imageUrls || [publication.imageUrl];

  const handleLike = async () => {
    try {
      const userData = await getSession();
      if (!userData || !userData.id_usuario) {
        return;
      }
      const formData = new FormData();
      formData.append('id_usuario', userData.id_usuario);
      formData.append('id_publicacion', publication.id);
      const response = await fetch(`${BASE_URL}/LikePublication.php`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setLiked(data.hasUserLiked);
        setLikeCount(data.likes);
        animateLike();
      }
    } catch (error) {
      // Manejo de error opcional
    }
  }

  const handleShare = async () => {
    try {
      // Construir la URL de la página de compartido
      const params = new URLSearchParams({
        images: (publication.imageUrls || [publication.imageUrl]).join(','),
        user: publication.userName,
        event: publication.eventName,
        desc: publication.publicationDescription || ''
      });
      const shareUrl = `https://utepsa-eventos.vercel.app/sharedPublication?${params.toString()}`;
      await Share.open({
        title: 'Compartir publicación',
        message: `¡Mira esta publicación del evento: ${publication.eventName}!`,
        url: shareUrl,
      });
      onShare();
    } catch (error) {
      console.log('Error al compartir:', error);
    }
  };

  // NUEVO: función para abrir el modal
  const handleImagePress = (imageUrl: string) => {
    setModalImage(imageUrl);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <PublicationModal
        visible={modalVisible}
        imageUrl={modalImage}
        onClose={() => setModalVisible(false)}
        BASE_URL={BASE_URL}
      />
      <View style={styles.header}>
        <View style={styles.userInfoContainer}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>{publication.userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{publication.userName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.eventDetails}>
        <Text style={styles.eventName}>{publication.eventName}</Text>
        {publication.publicationDescription && (
          <View style={styles.descriptionContainer}>
            <Text
              style={styles.eventDescription}
              numberOfLines={showFullDescription ? undefined : 3}
              onTextLayout={e => setDescLines(e.nativeEvent.lines.length)}
            >
              {publication.publicationDescription}
            </Text>
            {descLines > 3 && !showFullDescription && (
              <TouchableOpacity onPress={() => setShowFullDescription(true)}>
                <Text style={styles.seeMoreText}>Ver más</Text>
              </TouchableOpacity>
            )}
            {showFullDescription && descLines > 3 && (
              <TouchableOpacity onPress={() => setShowFullDescription(false)}>
                <Text style={styles.seeMoreText}>Ocultar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={styles.dateContainer}>
          <Icon name="calendar-today" size={14} color="#666" style={styles.dateIcon} />
          <Text style={styles.date}>{publication.date}</Text>
        </View>
      </View>

      {/* Carrusel de imágenes */}
      <Carousel
        images={images}
        height={240}
        autoPlay={images.length > 1}
        showControls={images.length > 1}
        showPagination={images.length > 1}
        onImagePress={(imageUrl) => handleImagePress(imageUrl)}
      />

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Icon name={liked ? 'favorite' : 'favorite-outline'} size={24} color={liked ? '#F44336' : '#666'} />
          </Animated.View>
          <View style={styles.likeInfo}>
            <Text style={[styles.actionText, liked && styles.likedText]}>{liked ? 'Te gusta' : 'Me gusta'}</Text>
            <Text style={styles.likeCount}>{likeCount}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Icon name="share" size={24} color="#666" />
          <Text style={styles.actionText}>Compartir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userInfoContainer: {
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
  userDetails: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  eventDetails: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  likedText: {
    color: '#F44336',
  },
  likeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  seeMoreText: {
    color: '#8B5CF6',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
});

export default PublicationCard;
