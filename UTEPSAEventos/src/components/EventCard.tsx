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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
    borderLeftWidth: 8,
    borderLeftColor: '#cf152d',
  },
  eventTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  eventDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 10,
  },
  eventDateContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  eventDateLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#cf152d',
    marginRight: 5,
  },
  eventDate: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
});

export default EventCard;