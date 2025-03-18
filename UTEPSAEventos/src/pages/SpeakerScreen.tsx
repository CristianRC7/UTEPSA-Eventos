import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../utils/Config';

interface SpeakerScreenProps {
  route: {
    params: {
      eventId: number;
      eventTitle: string;
    };
  };
}

interface Speaker {
  id_expositor: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  descripcion: string;
  imagen_url: string | null;
}

const SpeakerScreen: React.FC<SpeakerScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { eventId } = route.params;
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchSpeakers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/Speakers.php?event_id=${eventId}`);
      const data = await response.json();

      if (data.success) {
        setSpeakers(data.speakers);
      } else {
        setSpeakers([]);
        if (data.message !== 'No se encontraron expositores') {
          Alert.alert('Error', data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching speakers:', error);
      Alert.alert('Error', 'No se pudieron cargar los expositores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpeakers();
  }, [eventId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSpeakers();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const openSpeakerDetails = (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setModalVisible(true);
  };

  const getFullName = (speaker: Speaker) => {
    return `${speaker.nombre} ${speaker.apellido_paterno} ${speaker.apellido_materno}`;
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
      return null;
    }
    return { uri: `${BASE_URL}/upload/${imageUrl}` };
  };

  const renderSpeakerCard = ({ item }: { item: Speaker }) => {
    return (
      <TouchableOpacity
        style={styles.speakerCard}
        onPress={() => openSpeakerDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.speakerImageContainer}>
          {item.imagen_url ? (
            <Image
              source={getImageUrl(item.imagen_url) || undefined}
              style={styles.speakerImage}
              resizeMode="cover"
            />
          ) : (
            <Icon name="person" size={100} color="#CCCCCC" style={styles.speakerIcon} />
          )}
        </View>
        <View style={styles.speakerInfo}>
          <Text style={styles.speakerName} numberOfLines={2}>
            {getFullName(item)}
          </Text>
          <Text style={styles.viewProfile}>Ver perfil</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people" size={50} color="#CCCCCC" />
      <Text style={styles.emptyText}>No hay expositores registrados</Text>
      <Text style={styles.emptySubtext}>
        No se han registrado expositores para este evento.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expositores</Text>
        <View style={styles.spacer} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <FlatList
          data={speakers}
          renderItem={renderSpeakerCard}
          keyExtractor={(item) => item.id_expositor.toString()}
          contentContainerStyle={styles.speakerList}
          numColumns={2}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={renderEmptyList}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}

      {/* Modal for speaker details */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            {selectedSpeaker && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedSpeaker.imagen_url ? (
                  <View style={styles.modalImageContainer}>
                    <Image
                      source={getImageUrl(selectedSpeaker.imagen_url) || undefined}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  <Icon name="person" size={200} color="#CCCCCC" style={styles.modalIcon} />
                )}
                <Text style={styles.modalName}>{getFullName(selectedSpeaker)}</Text>
                <Text style={styles.modalDescription}>{selectedSpeaker.descripcion}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  spacer: {
    width: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  speakerList: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  speakerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  speakerImageContainer: {
    height: 150,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerImage: {
    width: '100%',
    height: '100%',
  },
  speakerIcon: {
    width: 100,
    height: 100,
  },
  speakerInfo: {
    padding: 12,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  viewProfile: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  modalImageContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalIcon: {
    alignSelf: 'center',
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
});
export default SpeakerScreen;