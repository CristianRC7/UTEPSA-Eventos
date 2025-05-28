import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ScheduleActivity } from '../../types/ScheduleTypes';
import ActivityCard from './ActivityCard';
import EmptyState from './EmptyState';

interface ActivitiesListProps {
  activities: ScheduleActivity[];
  refreshing: boolean;
  onRefresh: () => void;
  onInscriptionRequest: (activity: ScheduleActivity) => void;
}

const ActivitiesList: React.FC<ActivitiesListProps> = ({ 
  activities, 
  refreshing, 
  onRefresh,
  onInscriptionRequest
}) => {
  const handleActivityPress = (activity: ScheduleActivity) => {
    if (activity.inscripcion_habilitada) {
      onInscriptionRequest(activity);
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
