import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DashboardEvent = ({ route }: any) => {
  const navigation = useNavigation();
  const { event } = route.params || {};
  
  const handleButtonPress = (feature: string) => {
    Alert.alert('Información', `Apartado ${feature} en desarrollo`);
  };
  
  const handleBack = () => {
    navigation.goBack();
  };

  // Menu options for the dashboard
  const menuOptions = [
    { name: 'Cronograma', icon: 'event', color: '#4F46E5' },
    { name: 'Expositores', icon: 'people', color: '#10B981' },
    { name: 'Pagina Web', icon: 'language', color: '#F59E0B' },
    { name: 'Formulario', icon: 'assignment', color: '#EC4899' },
    { name: 'Puntos de inscripción', icon: 'place', color: '#3B82F6' },
    { name: 'Soporte', icon: 'help', color: '#8B5CF6' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Evento</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.eventInfoSection}>
          <Text style={styles.eventTitle}>{event?.titulo || 'Evento'}</Text>
          <Text style={styles.eventDescription}>{event?.descripcion || 'Sin descripción disponible'}</Text>
          
          <View style={styles.dateInfoContainer}>
            <View style={styles.dateInfo}>
              <Icon name="event" size={18} color="#666" style={styles.dateIcon} />
              <View>
                <Text style={styles.dateLabel}>Fecha de inicio</Text>
                <Text style={styles.dateValue}>{event?.fecha_inicio || 'No disponible'}</Text>
              </View>
            </View>
            
            <View style={styles.dateInfo}>
              <Icon name="event" size={18} color="#666" style={styles.dateIcon} />
              <View>
                <Text style={styles.dateLabel}>Fecha de fin</Text>
                <Text style={styles.dateValue}>{event?.fecha_fin || 'No disponible'}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Opciones del evento</Text>
          
          <View style={styles.menuGrid}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleButtonPress(option.name)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                  <Icon name={option.icon} size={24} color="#FFF" />
                </View>
                <Text style={styles.menuItemText}>{option.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  contentContainer: {
    padding: 20,
  },
  eventInfoSection: {
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  eventDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  dateInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    flex: 0.48,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  menuSection: {
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
});

export default DashboardEvent;
