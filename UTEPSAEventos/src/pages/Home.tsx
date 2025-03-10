import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const Home = ({ route, navigation }: any) => {
  const { userData } = route.params || {};
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const moveAnim = React.useRef(new Animated.Value(30)).current;
  
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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>
          
          <View style={styles.eventsContainer}>
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>No hay eventos disponibles</Text>
              <Text style={styles.eventDescription}>
                Los eventos aparecerán aquí una vez que estén programados.
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
    letterSpacing: -0.3,
  },
  eventsContainer: {
    marginBottom: 30,
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
  },
  logoutButton: {
    backgroundColor: '#F2F2F2',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  logoutButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Home;
