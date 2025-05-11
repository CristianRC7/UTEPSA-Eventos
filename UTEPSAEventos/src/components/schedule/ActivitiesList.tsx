import React from 'react';
import { FlatList, StyleSheet, Alert } from 'react-native';
import { ScheduleActivity } from '../../types/ScheduleTypes';
import ActivityCard from './ActivityCard';
import EmptyState from './EmptyState';
import { getSession } from '../../utils/sessionStorage';
import { BASE_URL } from '../../utils/Config';

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
  const handleActivityPress = async (activity: ScheduleActivity) => {
    if (activity.inscripcion_habilitada) {
      Alert.alert(
        "¿Deseas inscribirte a la actividad?",
        "",
        [
          { text: "No", style: "cancel" },
          { text: "Sí", onPress: async () => {
              try {
                const userData = await getSession();
                if (!userData || !userData.id_usuario) {
                  Alert.alert('Error', 'No se pudo obtener el usuario.');
                  return;
                }
                const response = await fetch(`${BASE_URL}/InscripcionActividades.php`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id_usuario: userData.id_usuario,
                    id_actividad: activity.id_actividad
                  })
                });
                const data = await response.json();
                if (data.success) {
                  Alert.alert('¡Inscripción exitosa!', data.message || 'Te has inscrito correctamente.');
                } else {
                  Alert.alert('Error', data.message || 'No se pudo inscribir.');
                }
              } catch (error) {
                Alert.alert('Error', 'Ocurrió un error al inscribirse.');
              }
            }
          }
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
