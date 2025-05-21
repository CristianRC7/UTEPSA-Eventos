import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getSession } from '../utils/sessionStorage';
import { BASE_URL } from '../utils/Config';
import { Alert } from 'react-native';

const MAX_RATING = 5;

const EventSurvey: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { titulo, id_actividad } = route.params || {};
  const [rating, setRating] = useState(0);
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      if (!session?.id_usuario) throw new Error('No hay sesión');
      const res = await fetch(`${BASE_URL}/SubmitSurvey.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: session.id_usuario,
          id_actividad,
          rating,
          descripcion,
        }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('¡Encuesta enviada!');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'Error al enviar la encuesta');
      }
    } catch (e) {
      Alert.alert('Error', 'Error de red o sesión');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={26} color="#222" />
      </TouchableOpacity>
      <Text style={styles.title}>{titulo}</Text>
      <Text style={styles.label}>Califica la actividad:</Text>
      <View style={styles.starsRow}>
        {[...Array(MAX_RATING)].map((_, i) => (
          <TouchableOpacity key={i} onPress={() => setRating(i + 1)}>
            <Icon
              name={i < rating ? 'star' : 'star-border'}
              size={36}
              color={i < rating ? '#FFD600' : '#CCC'}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Comentario (opcional):</Text>
      <TextInput
        style={styles.input}
        placeholder="Escribe tu comentario..."
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        numberOfLines={4}
        placeholderTextColor="#aaa"
      />
      <TouchableOpacity
        style={[styles.submitBtn, { opacity: rating > 0 && !loading ? 1 : 0.5 }]}
        disabled={rating === 0 || loading}
        onPress={handleSubmit}
      >
        <Text style={styles.submitBtnText}>{loading ? 'Enviando...' : 'Enviar'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  backBtn: {
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginTop: 18,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starIcon: {
    marginHorizontal: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#F7F7F7',
    color: '#222',
    marginBottom: 18,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EventSurvey; 