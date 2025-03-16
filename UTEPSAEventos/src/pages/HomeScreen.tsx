import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../utils/Config';

// Home Tab Screen Component
const HomeScreen = ({ route }: any) => {
  const navigation = useNavigation();
  const userData = route.params?.userData;
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const moveAnim = React.useRef(new Animated.Value(30)).current;
  
  // Format date to a more readable format
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split(' ');
    if (parts.length >= 2) {
      return `${parts[0]} - ${parts[1]}`;
    }
    return dateStr;
  };
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(moveAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Load events on initial render
    fetchEvents();
  }, []);
  
  const fetchEvents = async (query = '') => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/Events.php?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
      } else {
        setEvents([]);
        // Don't show alert for empty results
        if (query && data.message !== 'No se encontraron eventos') {
          Alert.alert('Error', data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'No se pudieron cargar los eventos');
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleSearch = () => {
    fetchEvents(searchQuery);
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    fetchEvents('');
  };
  
  const handleEventPress = (event: any) => {
    navigation.navigate('DashboardEvent', { event });
  };
  
  const renderEventItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.eventTitle}>{item.titulo}</Text>
      <Text style={styles.eventDescription} numberOfLines={2}>
        {item.descripcion}
      </Text>
      <View style={styles.eventDateContainer}>
        <Text style={styles.eventDateLabel}>Inicio:</Text>
        <Text style={styles.eventDate}>{formatDate(item.fecha_inicio)}</Text>
      </View>
      <View style={styles.eventDateContainer}>
        <Text style={styles.eventDateLabel}>Fin:</Text>
        <Text style={styles.eventDate}>{formatDate(item.fecha_fin)}</Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No hay eventos disponibles</Text>
      <Text style={styles.emptySubtext}>
        Los eventos aparecerán aquí una vez que estén programados.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: moveAnim }]
          }
        ]}>
          <Text style={styles.welcomeChip}>
            {userData?.rol === 'interno' ? 'Usuario Interno' : 'Usuario Externo'}
          </Text>
          <Text style={styles.headerTitle}>Bienvenido</Text>
          <Text style={styles.headerSubtitle}>
            {userData?.nombre} {userData?.apellidos}
          </Text>
        </Animated.View>
        
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: moveAnim }]
        }}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Buscar</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#000" style={styles.loader} />
          ) : (
            <FlatList
              data={events}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id_evento.toString()}
              ListEmptyComponent={renderEmptyList}
              style={styles.eventsList}
              scrollEnabled={false}
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 30,
  },
  welcomeChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#000',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#000',
    height: 50,
    paddingHorizontal: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
    letterSpacing: -0.3,
  },
  eventsList: {
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 10,
  },
  eventDateContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  eventDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
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
  loader: {
    marginVertical: 20,
  },
});

export default HomeScreen;