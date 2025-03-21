import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Speaker } from '../../types/SpeakerTypes';
import SpeakerCard from './SpeakerCard';
import EmptyState from './EmptyState';

interface SpeakerListProps {
  speakers: Speaker[];
  refreshing: boolean;
  onRefresh: () => void;
  onSelectSpeaker: (speaker: Speaker) => void;
}

const SpeakerList: React.FC<SpeakerListProps> = ({ 
  speakers, 
  refreshing, 
  onRefresh, 
  onSelectSpeaker 
}) => {
  return (
    <FlatList
      data={speakers}
      renderItem={({ item }) => (
        <SpeakerCard 
          speaker={item} 
          onPress={onSelectSpeaker} 
        />
      )}
      keyExtractor={(item) => item.id_expositor.toString()}
      contentContainerStyle={styles.speakerList}
      numColumns={2}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={EmptyState}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  speakerList: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});

export default SpeakerList;
