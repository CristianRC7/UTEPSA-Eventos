import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import PublicationCard from '../components/PublicationCard';
import FloatingButton from '../components/FloatingButton';

// Mock data to simulate publications from the database
const MOCK_PUBLICATIONS = [
  {
    id: 1,
    userName: 'Carlos Méndez',
    userRole: 'Usuario Interno',
    eventName: 'Conferencia de Tecnología',
    status: 'aprobado',
    date: '15/10/2023 - 14:30',
    imageUrl: 'https://picsum.photos/id/1/600/400',
  },
  {
    id: 2,
    userName: 'María González',
    userRole: 'Usuario Externo',
    eventName: 'Seminario de Liderazgo',
    status: 'esperando_aprobacion',
    date: '20/10/2023 - 09:15',
    imageUrl: 'https://picsum.photos/id/20/600/400',
  },
  {
    id: 3,
    userName: 'Roberto Silva',
    userRole: 'Usuario Interno',
    eventName: 'Jornada de Innovación',
    status: 'rechazado',
    date: '05/11/2023 - 16:45',
    imageUrl: 'https://picsum.photos/id/37/600/400',
  },
  {
    id: 4,
    userName: 'Ana López',
    userRole: 'Usuario Externo',
    eventName: 'Taller de Emprendimiento',
    status: 'aprobado',
    date: '12/11/2023 - 10:00',
    imageUrl: 'https://picsum.photos/id/42/600/400',
  },
];

const PublicationScreen= () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Simulating data fetch
  useEffect(() => {
    // Simulate API call delay
    const fetchPublications = () => {
      setTimeout(() => {
        setPublications(MOCK_PUBLICATIONS);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    };

    fetchPublications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // Reload publications
    setTimeout(() => {
      setPublications(MOCK_PUBLICATIONS);
      setRefreshing(false);
    }, 1000);
  };

  const handleLike = (id: number) => {
    Alert.alert('Me gusta', `Le has dado me gusta a la publicación ${id}`);
  };

  const handleComment = (id: number) => {
    Alert.alert('Comentar', `Has comentado la publicación ${id}`);
  };

  const handleShare = (id: number) => {
    Alert.alert('Compartir', `Has compartido la publicación ${id}`);
  };

  const handleAddPublication = () => {
    Alert.alert('Nueva Publicación', 'Aquí puedes crear una nueva publicación');
  };

  const renderItem = ({ item }: any) => (
    <PublicationCard
      publication={item}
      onLike={() => handleLike(item.id)}
      onComment={() => handleComment(item.id)}
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
        <Text style={styles.headerTitle}>Publicaciones</Text>
        <Text style={styles.headerSubtitle}>
          Comparte tus momentos de los eventos
        </Text>
      </View>

      <FlatList
        data={publications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#9b87f5']}
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

      <View style={styles.floatingButtonContainer}>
        <FloatingButton onPress={handleAddPublication} />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
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
});

export default PublicationScreen;
