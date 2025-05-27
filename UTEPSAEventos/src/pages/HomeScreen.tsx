import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '../utils/Config';
import EventCard from '../components/EventCard';
import LoadingPulseCardAnimation from '../components/LoadingPulseCardAnimation';
import Icon from 'react-native-vector-icons/MaterialIcons';
const AnimatedTextInput = Animated.createAnimatedComponent(require('react-native').TextInput);

// Home Tab Screen Component
const HEADER_MAX_HEIGHT = 180;
const HEADER_MIN_HEIGHT = 74;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const ANIMATION_RANGE = HEADER_SCROLL_DISTANCE * 1.5;
const SEARCH_MAX_HEIGHT = 52;
const SEARCH_MIN_HEIGHT = 40;
const SEARCH_MAX_RADIUS = 16;
const SEARCH_MIN_RADIUS = 10;
const HEADER_MAX_PADDING_TOP = 48;
const HEADER_MIN_PADDING_TOP = 12;
const HEADER_MAX_PADDING_BOTTOM = 32;
const HEADER_MIN_PADDING_BOTTOM = 10;

const HomeScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const userData = route.params?.userData;
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animación
  const scrollY = useRef(new Animated.Value(0)).current;

  // Format date to "day/month/year - Hour:Minute" format
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
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
      return dateStr;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
      return () => {};
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

  // Animaciones
  const headerHeight = scrollY.interpolate({
    inputRange: [0, ANIMATION_RANGE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  const headerPaddingTop = scrollY.interpolate({
    inputRange: [0, ANIMATION_RANGE],
    outputRange: [HEADER_MAX_PADDING_TOP, HEADER_MIN_PADDING_TOP],
    extrapolate: 'clamp',
  });
  const headerPaddingBottom = scrollY.interpolate({
    inputRange: [0, ANIMATION_RANGE],
    outputRange: [HEADER_MAX_PADDING_BOTTOM, HEADER_MIN_PADDING_BOTTOM],
    extrapolate: 'clamp',
  });
  const welcomeOpacity = scrollY.interpolate({
    inputRange: [0, 40, ANIMATION_RANGE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  const searchHeight = scrollY.interpolate({
    inputRange: [0, ANIMATION_RANGE],
    outputRange: [SEARCH_MAX_HEIGHT, SEARCH_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  const searchRadius = scrollY.interpolate({
    inputRange: [0, ANIMATION_RANGE],
    outputRange: [SEARCH_MAX_RADIUS, SEARCH_MIN_RADIUS],
    extrapolate: 'clamp',
  });
  const searchFontSize = scrollY.interpolate({
    inputRange: [0, ANIMATION_RANGE],
    outputRange: [16, 14],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#cf152d" />
      <Animated.View style={[styles.headerSection, {
        height: headerHeight,
        paddingTop: headerPaddingTop,
        paddingBottom: headerPaddingBottom,
      }]}
      >
        <Animated.View style={{ opacity: welcomeOpacity }}>
          <Text style={styles.headerTitle}>Bienvenido</Text>
          <Text style={styles.headerUserName}>
            {userData?.nombre} {userData?.apellidos}
          </Text>
        </Animated.View>
        <Animated.View style={styles.searchWrapper}>
          <Animated.View style={
            [styles.searchContainer,
              {
                height: searchHeight,
                borderRadius: searchRadius,
              }
            ]
          }>
            <AnimatedTextInput
              style={
                [styles.searchInput,
                  {
                    fontSize: searchFontSize,
                  }
                ]
              }
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              placeholderTextColor="#888"
            />
            <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
              <Icon name="search" size={26} color="#cf152d" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {loading ? (
        <View style={{ flex: 1 }}>
          <LoadingPulseCardAnimation />
        </View>
      ) : (
        <Animated.FlatList
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
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          style={{ flex: 1 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerSection: {
    // height, paddingTop y paddingBottom serán animados
    paddingHorizontal: 20,
    backgroundColor: '#cf152d',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 10,
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  headerUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
    marginBottom: 12,
  },
  searchWrapper: {
    paddingTop: 6,
    paddingBottom: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
    marginBottom: 0,
    marginTop: 0,
  },
  searchInput: {
    flex: 1,
    color: '#000',
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  searchIconContainer: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 18,
    letterSpacing: -0.3,
    marginTop: 0,
  },
  listContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginTop: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
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