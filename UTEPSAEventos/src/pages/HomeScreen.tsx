import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  TextInput,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../utils/Config';
import EventCard from '../components/EventCard';
import LoadingPulseCardAnimation from '../components/LoadingPulseCardAnimation';

// Home Tab Screen Component
const HomeScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const userData = route.params?.userData;
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const moveAnim = React.useRef(new Animated.Value(30)).current;

  // Format date to "day/month/year - Hour:Minute" format
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // If date parsing fails, try to extract parts manually
        return dateStr;
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} - ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr; // Return original string if formatting fails
    }
  };

  // Animation effect on component mount
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
  }, [fadeAnim, moveAnim]);

  // Fetch events when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
      return () => {
      };
    }, [])
  );

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
      <Animated.View style={[
        styles.headerSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: moveAnim }]
        }
      ]}>
        <Text style={styles.headerTitle}>Bienvenido</Text>
        <Text style={styles.headerSubtitle}>
          {userData?.nombre} {userData?.apellidos}
        </Text>
      </Animated.View>

      <Animated.View style={{
        opacity: fadeAnim,
        transform: [{ translateY: moveAnim }],
        paddingHorizontal: 20,
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
      </Animated.View>

      {loading ? (
        <View style={{ flex: 1 }}>
          <LoadingPulseCardAnimation />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={({ item }) => (
            <EventCard 
              event={item}
              onPress={handleEventPress}
              formatDate={formatDate}
            />
          )}
          keyExtractor={(item) => item.id_evento.toString()}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#000"]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSection: {
    padding: 20,
    paddingBottom: 10,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    marginVertical: 20,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default HomeScreen;