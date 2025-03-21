import React from 'react';
import { FlatList, StyleSheet, Alert } from 'react-native';
import { ScheduleActivity } from '../../types/ScheduleTypes';
import ActivityCard from './ActivityCard';
import EmptyState from './EmptyState';

interface ActivitiesListProps {
  activities: ScheduleActivity[];
  refreshing: boolean;
  onRefresh: () => void;
}

const ActivitiesList: React.FC<ActivitiesListProps> = ({ 
  activities, 
  refreshing, 
  onRefresh 
}) => {
  const handleActivityPress = (activity: ScheduleActivity) => {
    if (activity.inscripcion_habilitada) {
      Alert.alert(
        "Deseas asistir a este evento?",
        "",
        [
          { text: "No", style: "cancel" },
          { text: "Sí", onPress: () => console.log("Usuario confirmó asistencia") }
        ]
      );
    }
  };

  const renderEmptyList = () => (
    <EmptyState 
      title="No hay actividades programadas"
      message="No se han registrado actividades para este día."
      icon="event-busy"
    />
  );

  return (
    <FlatList
      data={activities}
      renderItem={({ item }) => (
        <ActivityCard 
          activity={item} 
          onPress={() => handleActivityPress(item)}
        />
      )}
      keyExtractor={(item) => item.id_actividad.toString()}
      contentContainerStyle={styles.activitiesList}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={renderEmptyList}
    />
  );
};

const styles = StyleSheet.create({
  activitiesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  }
});

export default ActivitiesList;
