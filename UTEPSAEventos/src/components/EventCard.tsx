import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface EventCardProps {
  event: {
    id_evento: string;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    pagina_web?: string;
  };
  onPress: (event: any) => void;
  formatDate: (date: string) => string;
}

const EventCard = ({ event, onPress, formatDate }: EventCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.eventCard}
      onPress={() => onPress(event)}
      activeOpacity={0.7}
    >
      <Text style={styles.eventTitle}>{event.titulo}</Text>
      <Text style={styles.eventDescription} numberOfLines={2}>
        {event.descripcion}
      </Text>
      <View style={styles.eventDateContainer}>
        <Text style={styles.eventDateLabel}>Inicio:</Text>
        <Text style={styles.eventDate}>{formatDate(event.fecha_inicio)}</Text>
      </View>
      <View style={styles.eventDateContainer}>
        <Text style={styles.eventDateLabel}>Fin:</Text>
        <Text style={styles.eventDate}>{formatDate(event.fecha_fin)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 10,
  },
  eventDateContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  eventDateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default EventCard;