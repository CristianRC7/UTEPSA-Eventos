import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../utils/Config';

interface ScheduleScreenProps {
  route: {
    params: {
      eventId: number;
      eventTitle: string;
    };
  };
}

interface ScheduleActivity {
  id_actividad: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  dia_numero: number;
}

interface GroupedSchedule {
  fecha: string;
  dia_numero: number;
  actividades: ScheduleActivity[];
}

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ route }) => {
    const navigation = useNavigation();
    const { eventId, eventTitle } = route.params;
    const [schedule, setSchedule] = useState<GroupedSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`${BASE_URL}/Schedule.php?event_id=${eventId}`);
        const data = await response.json();
  
        if (data.success) {
          const processedData = processScheduleData(data.activities);
          setSchedule(processedData);
          
          if (processedData.length > 0 && selectedDay === null) {
            setSelectedDay(processedData[0].dia_numero);
          }
        } else {
          setSchedule([]);
          if (data.message !== 'No se encontraron actividades') {
            Alert.alert('Error', data.message);
          }
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        Alert.alert('Error', 'No se pudo cargar el cronograma');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
  
    const processScheduleData = (activities: ScheduleActivity[]): GroupedSchedule[] => {
      // Agrupamos las actividades por fecha exactamente como vienen de la base de datos
      // sin conversiones de timezone
      const dateGroups: { [key: string]: ScheduleActivity[] } = {};
  
      activities.forEach(activity => {
        if (!dateGroups[activity.fecha]) {
          dateGroups[activity.fecha] = [];
        }
        dateGroups[activity.fecha].push(activity);
      });
  
      // Ordenamos las fechas para asignar los números de día en orden cronológico
      const sortedDates = Object.keys(dateGroups).sort();
  
      return sortedDates.map((date, index) => {
        const dayNumber = index + 1;
        
        // Ordenamos las actividades del día por hora
        const activitiesForDate = dateGroups[date]
          .map(activity => ({
            ...activity,
            dia_numero: dayNumber
          }))
          .sort((a, b) => {
            // Ordenar por hora (sin considerar la fecha)
            return a.hora.localeCompare(b.hora);
          });
  
        return {
          fecha: date,
          dia_numero: dayNumber,
          actividades: activitiesForDate
        };
      });
    };
  
    useEffect(() => {
      fetchSchedule();
    }, [eventId]);
  
    const handleRefresh = () => {
      setRefreshing(true);
      fetchSchedule();
    };
  
    const handleBack = () => {
      navigation.goBack();
    };
  
    const formatTime = (timeStr: string) => {
      try {
        return `${timeStr.split(':')[0]}:${timeStr.split(':')[1]}`;
      } catch (error) {
        return timeStr;
      }
    };
  
    const formatDate = (dateStr: string) => {
      // Simplemente devolvemos la fecha tal como viene de la base de datos
      // asumiendo que ya está en formato correcto "DD/MM/YYYY"
      return dateStr;
    };
  
    // Renderizado de botones de días en filas de 3
    const renderDayTabs = () => {
      // Dividir los días en grupos de 3 para mostrarlos en filas
      const rows = [];
      for (let i = 0; i < schedule.length; i += 3) {
        rows.push(schedule.slice(i, i + 3));
      }

    return (
        <View style={styles.dayTabsGrid}>
          {rows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.dayTabsRow}>
              {row.map((item) => (
                <TouchableOpacity
                  key={item.fecha}
                  style={[
                    styles.dayTab,
                    selectedDay === item.dia_numero && styles.dayTabSelected
                  ]}
                  onPress={() => setSelectedDay(item.dia_numero)}
                >
                  <Text
                    style={[
                      styles.dayTabText,
                      selectedDay === item.dia_numero && styles.dayTabTextSelected
                    ]}
                  >
                    Día {item.dia_numero}
                  </Text>
                  <Text
                    style={[
                      styles.dayTabDate,
                      selectedDay === item.dia_numero && styles.dayTabDateSelected
                    ]}
                  >
                    {formatDate(item.fecha)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      );
    };

  const renderActivityItem = ({ item }: { item: ScheduleActivity }) => {
    return (
      <View style={styles.activityCard}>
        <View style={styles.activityTimeContainer}>
          <Text style={styles.activityTime}>{formatTime(item.hora)}</Text>
        </View>
        <View style={styles.activityContentContainer}>
          <Text style={styles.activityTitle}>{item.titulo}</Text>
          <Text style={styles.activityDescription} numberOfLines={3}>
            {item.descripcion}
          </Text>
          <View style={styles.activityLocation}>
            <Icon name="place" size={14} color="#666" />
            <Text style={styles.activityLocationText}>{item.ubicacion}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="event-busy" size={50} color="#CCCCCC" />
      <Text style={styles.emptyText}>No hay actividades programadas</Text>
      <Text style={styles.emptySubtext}>
        No se han registrado actividades para este día.
      </Text>
    </View>
  );

  const getCurrentDayActivities = () => {
    if (selectedDay === null || schedule.length === 0) return [];
    
    const selectedDayData = schedule.find(day => day.dia_numero === selectedDay);
    return selectedDayData ? selectedDayData.actividades : [];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cronograma</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <>
          <Text style={styles.eventTitle}>{eventTitle}</Text>
          
          {schedule.length > 0 ? (
            <>
              {renderDayTabs()}
              <FlatList
                data={getCurrentDayActivities()}
                renderItem={renderActivityItem}
                keyExtractor={(item) => item.id_actividad.toString()}
                contentContainerStyle={styles.activitiesList}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={renderEmptyList}
              />
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="event-busy" size={50} color="#CCCCCC" />
              <Text style={styles.emptyText}>No hay cronograma disponible</Text>
              <Text style={styles.emptySubtext}>
                No se han registrado actividades para este evento.
              </Text>
            </View>
          )}
        </>
      )}
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
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  // Estilos para la cuadrícula de botones de días
  dayTabsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dayTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayTab: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 70,
    width: '30%', // Aproximadamente 3 por fila con espacio entre ellos
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTabSelected: {
    backgroundColor: '#4F46E5',
  },
  dayTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  dayTabTextSelected: {
    color: '#FFFFFF',
  },
  dayTabDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  dayTabDateSelected: {
    color: '#E0E7FF',
  },
  activitiesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activityTimeContainer: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    minWidth: 70,
  },
  activityTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  activityContentContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityLocationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
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
});

export default ScheduleScreen;
