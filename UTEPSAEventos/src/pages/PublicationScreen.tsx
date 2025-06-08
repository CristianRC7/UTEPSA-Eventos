import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import PublicationCard from '../components/Publication/PublicationCard';
import FloatingButton from '../components/FloatingButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getSession } from '../utils/sessionStorage';
import { BASE_URL } from '../utils/Config';
import BottomSheet from '../components/BottomSheet';
import LoadingPulseCardAnimation from '../components/LoadingPulseCardAnimation';
import { useFocusEffect } from '@react-navigation/native';
import PublicationFilterModal from '../components/Publication/PublicationFilterModal';

const PublicationScreen = () => {
  const [publications, setPublications] = useState<any[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterOption, setFilterOption] = useState('all');
  const [filtering, setFiltering] = useState(false);
  const [eventFilterModalVisible, setEventFilterModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventList, setEventList] = useState([]);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventPage, setEventPage] = useState(1);
  const [eventTotalPages, setEventTotalPages] = useState(1);

  // Función para consultar publicaciones
  const fetchUserAndPublications = async () => {
    setLoading(true);
    const userData = await getSession();
    const id_usuario = userData?.id_usuario;
    try {
      const response = await fetch(`${BASE_URL}/get_publicaciones.php?id_usuario=${id_usuario}`);
      const data = await response.json();
      if (data.success) {
        setPublications(data.publications);
        setFilteredPublications(data.publications);
      } else {
        setPublications([]);
        setFilteredPublications([]);
      }
    } catch (error) {
      setPublications([]);
      setFilteredPublications([]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserAndPublications();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    const userData = await getSession();
    const id_usuario = userData?.id_usuario;
    try {
      const response = await fetch(`${BASE_URL}/get_publicaciones.php?id_usuario=${id_usuario}`);
      const data = await response.json();
      if (data.success) {
        setPublications(data.publications);
        setFilteredPublications(applyFilter(data.publications, filterOption));
      } else {
        setPublications([]);
        setFilteredPublications([]);
      }
    } catch (error) {
      setPublications([]);
      setFilteredPublications([]);
    }
    setRefreshing(false);
  };

  const handleShare = (userName: string) => {
    Alert.alert('Compartir', `Has compartido la publicación de: ${userName}`);
  };

  // Obtener eventos para el filtro
  const fetchEvents = async (page = 1, perPage = 3) => {
    setEventLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/Events.php`);
      const data = await response.json();
      if (data.success) {
        setEventList(data.events);
        setEventTotalPages(Math.ceil(data.events.length / perPage));
      } else {
        setEventList([]);
        setEventTotalPages(1);
      }
    } catch (error) {
      setEventList([]);
      setEventTotalPages(1);
    }
    setEventLoading(false);
  };

  const handleEventFilter = () => {
    setEventFilterModalVisible(true);
    fetchEvents();
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setFilterOption('event');
    setFilteredPublications(applyFilter(publications, 'event', event));
    setEventFilterModalVisible(false);
    setFilterModalVisible(false);
  };

  const applyFilter = (data: any[], option: string, event: any = null) => {
    switch (option) {
      case 'popular':
        return [...data].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'liked':
        return data.filter((item: any) => item.hasUserLiked);
      case 'event':
        if (!event) return data;
        return data.filter((item: any) => item.eventName === event.titulo);
      case 'all':
      default:
        return [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  };

  const handleFilter = (option: string) => {
    setFiltering(true);
    setFilterOption(option);
    setFilteredPublications(applyFilter(publications, option));
    setFiltering(false);
    setFilterModalVisible(false);
  };

  const renderItem = ({ item }: any) => (
    <PublicationCard
      publication={item}
      onShare={() => handleShare(item.userName)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Publicaciones</Text>
          <TouchableOpacity
            style={[styles.filterButton, filterModalVisible && styles.filterButtonActive]}
            onPress={() => setFilterModalVisible(true)}
          >
            <Icon name={filterModalVisible ? 'filter-list-off' : 'filter-list'} size={24} color={filterModalVisible ? '#FFF' : '#000'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Comparte tus momentos de los eventos
        </Text>
      </View>

      {(loading || filtering || refreshing) ? (
        <LoadingPulseCardAnimation />
      ) : (
        <FlatList
          data={filteredPublications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#000']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay publicaciones disponibles</Text>
              <Text style={styles.emptySubtext}>
                Las publicaciones aparecerán aquí cuando sean compartidas.
              </Text>
            </View>
          }
        />
      )}

      <BottomSheet
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        title="Filtrar publicaciones"
        height={340}
      >
        <TouchableOpacity
          style={[styles.filterOption, filterOption === 'all' && styles.selectedFilterOption]}
          onPress={() => handleFilter('all')}
        >
          <Icon name="view-list" size={20} color={filterOption === 'all' ? '#FFF' : '#000'} />
          <Text style={[styles.filterText, filterOption === 'all' && styles.selectedFilterText]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterOption, filterOption === 'popular' && styles.selectedFilterOption]}
          onPress={() => handleFilter('popular')}
        >
          <Icon name="star" size={20} color={filterOption === 'popular' ? '#FFF' : '#000'} />
          <Text style={[styles.filterText, filterOption === 'popular' && styles.selectedFilterText]}>Más populares</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterOption, filterOption === 'liked' && styles.selectedFilterOption]}
          onPress={() => handleFilter('liked')}
        >
          <Icon name="favorite" size={20} color={filterOption === 'liked' ? '#FFF' : '#000'} />
          <Text style={[styles.filterText, filterOption === 'liked' && styles.selectedFilterText]}>Me gustan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterOption, filterOption === 'event' && styles.selectedFilterOption]}
          onPress={handleEventFilter}
        >
          <Icon name="event" size={20} color={filterOption === 'event' ? '#FFF' : '#000'} />
          <Text style={[styles.filterText, filterOption === 'event' && styles.selectedFilterText]}>Filtrar por evento</Text>
          {selectedEvent && (
            <Text style={{ marginLeft: 8, color: '#ffffff', fontWeight: 'bold' }}>{selectedEvent.titulo}</Text>
          )}
        </TouchableOpacity>
      </BottomSheet>

      <PublicationFilterModal
        visible={eventFilterModalVisible}
        onClose={() => setEventFilterModalVisible(false)}
        eventList={eventList}
        loading={eventLoading}
        page={eventPage}
        totalPages={eventTotalPages}
        onSelect={handleSelectEvent}
        selectedEvent={selectedEvent}
        setPage={setEventPage}
      />

      <View style={styles.floatingButtonContainer}>
        <FloatingButton />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#cf152d',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#cf152d',
    borderColor: '#cf152d',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cf152d',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 25,
    right: 25,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFilterOption: {
    backgroundColor: '#cf152d',
  },
  filterText: {
    fontSize: 16,
    color: '#111',
    marginLeft: 12,
  },
  selectedFilterText: {
    color: '#FFF',
    fontWeight: '500',
  },
});

export default PublicationScreen;