import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, StatusBar, ActivityIndicator, StyleSheet, Alert, View } from 'react-native';
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
    };
  };
}

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { eventId } = route.params;
  const [schedule, setSchedule] = useState<GroupedSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ScheduleActivity | null>(null);

  const fetchSchedule = useCallback(async () => {
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
  }, [eventId, selectedDay]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, fetchSchedule]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSchedule();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const getCurrentDayActivities = () => {
    if (selectedDay === null || schedule.length === 0) {
      return [];
    }

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
          {schedule.length > 0 ? (
            <>
              <View style={styles.dayTabsWrapper}>
                <DayTabs
                  schedule={schedule}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                />
              </View>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayTabs: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  dayTabsWrapper: {
    marginTop: 24,
  },
});

export default ScheduleScreen;
