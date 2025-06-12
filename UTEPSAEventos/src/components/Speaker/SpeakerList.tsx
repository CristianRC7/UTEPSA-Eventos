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
          key={item.id_expositor}
          speaker={item}
          onPress={onSelectSpeaker}
        />
      )}
      keyExtractor={(item) => item.id_expositor.toString()}
      contentContainerStyle={styles.speakerList}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListEmptyComponent={EmptyState}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  speakerList: {
    padding: 16,
    paddingTop: 8,
  },
});

export default SpeakerList;
