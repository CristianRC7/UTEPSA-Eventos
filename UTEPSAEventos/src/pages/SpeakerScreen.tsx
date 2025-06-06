import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Text,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../utils/Config';
import { Speaker } from '../types/SpeakerTypes';
import SpeakerHeader from '../components/Speaker/SpeakerHeader';
import SpeakerList from '../components/Speaker/SpeakerList';

interface SpeakerScreenProps {
  route: {
    params: {
      eventId: number;
    };
  };
}

const SpeakerScreen: React.FC<SpeakerScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { eventId } = route.params;
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSpeakers = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/Speakers.php?event_id=${eventId}`);
      const data = await response.json();

      if (data.success) {
        setSpeakers(data.speakers);
      } else {
        setSpeakers([]);
        if (data.message !== 'No se encontraron expositores') {
          Alert.alert('Error', data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching speakers:', error);
      Alert.alert('Error', 'No se pudieron cargar los expositores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSpeakers();
  }, [eventId, fetchSpeakers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSpeakers();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSelectSpeaker = (speaker: Speaker) => {
    navigation.navigate('SpeakerDetailPage', { speaker });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#cf152d" />
      <SpeakerHeader
        title="Expositores"
        onBack={handleBack}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando expositores...</Text>
        </View>
      ) : (
        <SpeakerList
          speakers={speakers}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onSelectSpeaker={handleSelectSpeaker}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default SpeakerScreen;
