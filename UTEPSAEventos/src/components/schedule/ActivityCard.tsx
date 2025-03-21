import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ScheduleActivity } from '../../types/ScheduleTypes';

interface ActivityCardProps {
  activity: ScheduleActivity;
  onPress: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
  const formatTime = (timeStr: string) => {
    try {
      return `${timeStr.split(':')[0]}:${timeStr.split(':')[1]}`;
    } catch (error) {
      return timeStr;
    }
  };

  return (
    <TouchableOpacity 
      style={styles.activityCard}
      onPress={onPress}
      activeOpacity={activity.inscripcion_habilitada ? 0.7 : 1}
    >
      <View style={styles.activityTimeContainer}>
        <Text style={styles.activityTime}>{formatTime(activity.hora)}</Text>
      </View>
      <View style={styles.activityContentContainer}>
        <Text style={styles.activityTitle}>{activity.titulo}</Text>
        <Text style={styles.activityDescription} numberOfLines={3}>
          {activity.descripcion}
        </Text>
        <View style={styles.activityLocation}>
          <Icon name="place" size={14} color="#666" />
          <Text style={styles.activityLocationText}>{activity.ubicacion}</Text>
        </View>
        {activity.inscripcion_habilitada && (
          <View style={styles.inscriptionBadge}>
            <Icon name="event-available" size={14} color="#4F46E5" />
            <Text style={styles.inscriptionBadgeText}>Inscripción habilitada</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 4,
  },
  activityLocationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  inscriptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  inscriptionBadgeText: {
    fontSize: 12,
    color: '#4F46E5',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default ActivityCard;
