import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Modal
} from 'react-native';
import PublicationCard from '../components/PublicationCard';
import FloatingButton from '../components/FloatingButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MOCK_PUBLICATIONS = [
  {
    id: 1,
    userName: 'Carlos Méndez',
    eventName: 'Conferencia de Tecnología',
    eventDescription: 'Exploración de las últimas tendencias tecnológicas del 2023.',
    date: '15/10/2023 - 14:30',
    imageUrl: 'https://picsum.photos/id/1/600/400',
    likes: 24,
    hasUserLiked: false
  },
  {
    id: 2,
    userName: 'María González',
    eventName: 'Seminario de Liderazgo',
    eventDescription: 'Desarrollo de habilidades de liderazgo en entornos cambiantes.',
    date: '20/10/2023 - 09:15',
    imageUrl: 'https://picsum.photos/id/20/600/400',
    likes: 8,
    hasUserLiked: true
  },
  {
    id: 3,
    userName: 'Roberto Silva',
    eventName: 'Jornada de Innovación',
    eventDescription: 'Espacio para compartir ideas innovadoras y proyectos disruptivos.',
    date: '05/11/2023 - 16:45',
    imageUrl: 'https://picsum.photos/id/37/600/400',
    likes: 0,
    hasUserLiked: false
  },
  {
    id: 4,
    userName: 'Ana López',
    eventName: 'Taller de Emprendimiento',
    eventDescription: 'Herramientas prácticas para iniciar y hacer crecer tu propio negocio.',
    date: '12/11/2023 - 10:00',
    imageUrl: 'https://picsum.photos/id/42/600/400',
    likes: 15,
    hasUserLiked: false
  },
];

const PublicationScreen = () => {
  const [publications, setPublications] = useState([]);
  const [filteredPublications, setFilteredPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterOption, setFilterOption] = useState('all');

  useEffect(() => {
    const fetchPublications = () => {
      setTimeout(() => {
        setPublications(MOCK_PUBLICATIONS);
        setFilteredPublications(MOCK_PUBLICATIONS);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    };

    fetchPublications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setPublications(MOCK_PUBLICATIONS);
      setFilteredPublications(applyFilter(MOCK_PUBLICATIONS, filterOption));
      setRefreshing(false);
    }, 1000);
  };

  const handleLike = (id: number) => {
    Alert.alert('Me gusta', `Le has dado me gusta a la publicación ${id}`);
  };

  const handleShare = (id: number) => {
    Alert.alert('Compartir', `Has compartido la publicación ${id}`);
  };

  const applyFilter = (data: any[], option: string) => {
    switch (option) {
      case 'popular':
        return [...data].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'recent':
        // This is just a mock sort by date for demonstration
        return [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'liked':
        return data.filter(item => item.hasUserLiked);
      default:
        return data;
    }
  };

  const handleFilter = (option: string) => {
    setFilterOption(option);
    setFilteredPublications(applyFilter(publications, option));
    setFilterModalVisible(false);
  };

  const renderItem = ({ item }: any) => (
    <PublicationCard
      publication={item}
      onLike={() => handleLike(item.id)}
      onShare={() => handleShare(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9b87f5" />
        <Text style={styles.loadingText}>Cargando publicaciones...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Publicaciones</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Icon name="filter-list" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Comparte tus momentos de los eventos
        </Text>
      </View>

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

      <Modal
        animationType="fade"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar publicaciones</Text>
            
            <TouchableOpacity 
              style={[styles.filterOption, filterOption === 'all' && styles.selectedFilter]}
              onPress={() => handleFilter('all')}
            >
              <Icon name="view-list" size={20} color={filterOption === 'all' ? "#8B5CF6" : "#666"} />
              <Text style={[styles.filterText, filterOption === 'all' && styles.selectedFilterText]}>Todas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, filterOption === 'popular' && styles.selectedFilter]}
              onPress={() => handleFilter('popular')}
            >
              <Icon name="star" size={20} color={filterOption === 'popular' ? "#8B5CF6" : "#666"} />
              <Text style={[styles.filterText, filterOption === 'popular' && styles.selectedFilterText]}>Más populares</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, filterOption === 'recent' && styles.selectedFilter]}
              onPress={() => handleFilter('recent')}
            >
              <Icon name="access-time" size={20} color={filterOption === 'recent' ? "#8B5CF6" : "#666"} />
              <Text style={[styles.filterText, filterOption === 'recent' && styles.selectedFilterText]}>Más recientes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterOption, filterOption === 'liked' && styles.selectedFilter]}
              onPress={() => handleFilter('liked')}
            >
              <Icon name="favorite" size={20} color={filterOption === 'liked' ? "#8B5CF6" : "#666"} />
              <Text style={[styles.filterText, filterOption === 'liked' && styles.selectedFilterText]}>Me gustan</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.floatingButtonContainer}>
        <FloatingButton />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    color: '#333',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0EAFF',
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
    color: '#333',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFilter: {
    backgroundColor: '#F0EAFF',
  },
  filterText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
  },
  selectedFilterText: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
});

export default PublicationScreen;
