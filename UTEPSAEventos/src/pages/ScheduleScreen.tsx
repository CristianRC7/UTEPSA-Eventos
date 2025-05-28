import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../utils/Config';
import { getSession } from '../utils/sessionStorage';

import ScheduleHeader from '../components/schedule/ScheduleHeader';
import DayTabs from '../components/schedule/DayTabs';
import ActivitiesList from '../components/schedule/ActivitiesList';
import EmptyState from '../components/schedule/EmptyState';
import ModalInscription from '../components/schedule/ModalInscription';
import { GroupedSchedule, ScheduleActivity } from '../types/ScheduleTypes';

interface ScheduleScreenProps {
  route: {
    params: {
      eventId: number;
      eventTitle: string;
    };
  };
}

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { eventId, eventTitle } = route.params;
  const [schedule, setSchedule] = useState<GroupedSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ScheduleActivity | null>(null);

  const fetchSchedule = async () => {
    try {
      const userData = await getSession();
      const id_usuario = userData?.id_usuario;
      const url = id_usuario ? `${BASE_URL}/Schedule.php?event_id=${eventId}&id_usuario=${id_usuario}` : `${BASE_URL}/Schedule.php?event_id=${eventId}`;
      const response = await fetch(url);
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
    const dateGroups: { [key: string]: ScheduleActivity[] } = {};

    activities.forEach(activity => {
      if (!dateGroups[activity.fecha]) {
        dateGroups[activity.fecha] = [];
      }
      dateGroups[activity.fecha].push(activity);
    });

    const sortedDates = Object.keys(dateGroups).sort();

    return sortedDates.map((date, index) => {
      const dayNumber = index + 1;

      const activitiesForDate = dateGroups[date]
        .map(activity => ({
          ...activity,
          dia_numero: dayNumber
        }))
        .sort((a, b) => a.hora.localeCompare(b.hora));

      return {
        fecha: date,
        dia_numero: dayNumber,
        actividades: activitiesForDate
      };
    });
  };

  useEffect(() => {
    fetchSchedule();
  }, [eventId, fetchSchedule]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSchedule();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getCurrentDayActivities = () => {
    if (selectedDay === null || schedule.length === 0) return [];

    const selectedDayData = schedule.find(day => day.dia_numero === selectedDay);
    return selectedDayData ? selectedDayData.actividades : [];
  };

  const handleInscriptionRequest = (activity: ScheduleActivity) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#cf152d" />
      <ScheduleHeader title="Cronograma" onBack={handleBack} />

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <>
          <Text style={styles.eventTitle}>{eventTitle}</Text>

          {schedule.length > 0 ? (
            <>
              <DayTabs 
                schedule={schedule} 
                selectedDay={selectedDay} 
                onSelectDay={setSelectedDay} 
              />
              <ActivitiesList 
                activities={getCurrentDayActivities()}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onInscriptionRequest={handleInscriptionRequest}
              />
            </>
          ) : (
            <EmptyState 
              title="No hay cronograma disponible"
              message="No se han registrado actividades para este evento."
              icon="event-busy"
            />
          )}

          <ModalInscription 
            visible={modalVisible}
            activity={selectedActivity}
            onClose={() => setModalVisible(false)}
            onSuccess={() => {
              setModalVisible(false);
              fetchSchedule();
            }}
          />
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
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScheduleScreen;
