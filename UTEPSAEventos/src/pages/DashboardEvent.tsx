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
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface DashboardEventProps {
  route: {
    params: {
      event: {
        id_evento: number;
        titulo: string;
        descripcion: string;
        fecha_inicio: string;
        fecha_fin: string;
        pagina_web?: string;
      };
    };
  };
}

const DashboardEvent: React.FC<DashboardEventProps> = ({ route }) => {
  const navigation = useNavigation<any>();
  const { event } = route.params || {};
  
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
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr; // Return original string if formatting fails
    }
  };
  
  const handleButtonPress = (feature: string) => {
    if (feature === 'Expositores') {
      navigation.navigate('SpeakerScreen', { eventId: event.id_evento, eventTitle: event.titulo });
    } else if (feature === 'Cronograma') {
      navigation.navigate('ScheduleScreen', { eventId: event.id_evento, eventTitle: event.titulo });
    } else if (feature === 'Soporte') {
      Alert.alert('Soporte', 'Si necesitas ayuda, contáctate con soporte en el 3er piso, bloque este o al correo soporte.campusvirtual@utepsa.edu');
    } else if (feature === 'Mis inscripciones') {
      navigation.navigate('MyInscription', { id_evento: event.id_evento });
    } else if (feature === 'Formulario') {
      navigation.navigate('MyFormsEvent');
    } else if (feature === 'Puntos de inscripción') {
      navigation.navigate('RegistrationPoints');
    } else {
      Alert.alert('Información', `Apartado ${feature} en desarrollo`);
    }
  };
  
  const handleBack = () => {
    navigation.goBack();
  };

  // Menu options for the dashboard
  const menuOptions = [
    { name: 'Cronograma', icon: 'event', color: '#4F46E5' },
    { name: 'Expositores', icon: 'people', color: '#10B981' },
    { name: 'Formulario', icon: 'assignment', color: '#EC4899' },
    { name: 'Puntos de inscripción', icon: 'place', color: '#3B82F6' },
    { name: 'Mis inscripciones', icon: 'assignment-turned-in', color: '#F59E0B' },
    { name: 'Soporte', icon: 'help', color: '#8B5CF6' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#cf152d" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Evento</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.eventInfoSection}>
          <Text style={styles.eventTitle}>{event?.titulo || 'Evento'}</Text>
          <Text style={styles.eventDescription}>{event?.descripcion || 'Sin descripción disponible'}</Text>
          {event?.pagina_web && (
            <TouchableOpacity
              onPress={() => {
                if (!event?.pagina_web) return;
                const webUrl = !event.pagina_web.startsWith('http://') && !event.pagina_web.startsWith('https://')
                  ? 'https://' + event.pagina_web
                  : event.pagina_web;
                Linking.openURL(webUrl as string).catch(() => {
                  Alert.alert('Error', 'No se pudo abrir el sitio web');
                });
              }}
            >
              <Text style={styles.websiteLink}>Visita nuestra página web</Text>
            </TouchableOpacity>
          )}
          <View style={styles.dateInfoContainer}>
            <View style={styles.dateInfo}>
              <Icon name="event" size={18} color="#666" style={styles.dateIcon} />
              <View>
                <Text style={styles.dateLabel}>Fecha de inicio</Text>
                <Text style={styles.dateValue}>{formatDate(event?.fecha_inicio) || 'No disponible'}</Text>
              </View>
            </View>
            <View style={styles.dateInfo}>
              <Icon name="event" size={18} color="#666" style={styles.dateIcon} />
              <View>
                <Text style={styles.dateLabel}>Fecha de fin</Text>
                <Text style={styles.dateValue}>{formatDate(event?.fecha_fin) || 'No disponible'}</Text>
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
    backgroundColor: '#cf152d',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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
    marginBottom: 12,
    textAlign: 'justify',
  },
  websiteLink: {
    fontSize: 16,
    color: '#1E90FF',
    textDecorationLine: 'underline',
    marginBottom: 12,
  },
  websiteIcon: {
    marginRight: 6,
  },
  websiteLinkText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
    textDecorationLine: 'underline',
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
