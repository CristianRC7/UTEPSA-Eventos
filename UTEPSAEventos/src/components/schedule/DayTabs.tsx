import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GroupedSchedule } from '../../types/ScheduleTypes';

interface DayTabsProps {
  schedule: GroupedSchedule[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
}

const DayTabs: React.FC<DayTabsProps> = ({ schedule, selectedDay, onSelectDay }) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr; // Si la fecha no es válida, devuelve el valor original
      }
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateStr; // Devuelve el valor original si ocurre un error
    }
  };
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
              onPress={() => onSelectDay(item.dia_numero)}
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

const styles = StyleSheet.create({
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
});

export default DayTabs;
