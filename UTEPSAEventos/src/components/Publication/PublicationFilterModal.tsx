import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomSheet from '../BottomSheet';

const ITEMS_PER_PAGE = 3;

interface EventItem {
  id_evento: number;
  titulo: string;
}

interface PublicationFilterModalProps {
  visible: boolean;
  onClose: () => void;
  eventList: EventItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  onSelect: (event: EventItem) => void;
  selectedEvent: EventItem | null;
  setPage: (page: number) => void;
}

const PublicationFilterModal: React.FC<PublicationFilterModalProps> = ({
  visible,
  onClose,
  eventList = [],
  loading = false,
  page = 1,
  totalPages = 1,
  onSelect,
  selectedEvent,
  setPage
}) => {
  // PaginaciÃ³n
  const startIdx = (page - 1) * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const paginatedEvents = eventList.slice(startIdx, endIdx);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Selecciona un evento"
      height={400}
      loading={loading}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#cf152d" style={{ marginTop: 40 }} />
      ) : (
        <>
          <FlatList
            data={paginatedEvents}
            keyExtractor={(item) => item.id_evento.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedEvent && selectedEvent.id_evento === item.id_evento && styles.selectedFilterOption
                ]}
                onPress={() => onSelect(item)}
              >
                <Icon name="event" size={20} color={selectedEvent && selectedEvent.id_evento === item.id_evento ? '#FFF' : '#111'} style={styles.eventIcon} />
                <Text style={[
                  styles.filterText,
                  selectedEvent && selectedEvent.id_evento === item.id_evento && styles.selectedFilterText
                ]}>{item.titulo}</Text>
                {selectedEvent && selectedEvent.id_evento === item.id_evento && <Icon name="check" size={20} color="#FFF" style={styles.checkIcon} />}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.eventsList}
          />
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.pageButton, page === 1 && styles.disabledButton]}
              onPress={() => page > 1 && setPage(page - 1)}
              disabled={page === 1}
            >
              <Icon name="chevron-left" size={28} color={page === 1 ? '#ccc' : '#cf152d'} />
            </TouchableOpacity>
            <Text style={styles.pageText}>{page} / {totalPages}</Text>
            <TouchableOpacity
              style={[styles.pageButton, page === totalPages && styles.disabledButton]}
              onPress={() => page < totalPages && setPage(page + 1)}
              disabled={page === totalPages}
            >
              <Icon name="chevron-right" size={28} color={page === totalPages ? '#ccc' : '#cf152d'} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  selectedFilterOption: {
    backgroundColor: '#cf152d',
  },
  filterText: {
    fontSize: 16,
    color: '#111',
    marginLeft: 12,
  },
  selectedFilterText: {
    color: '#FFF',
    fontWeight: '500',
  },
  eventIcon: {
    marginRight: 4,
  },
  checkIcon: {
    marginLeft: 8,
  },
  eventsList: {
    paddingBottom: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  pageButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
  },
  pageText: {
    fontSize: 16,
    color: '#cf152d',
    fontWeight: 'bold',
  },
});

export default PublicationFilterModal;
