import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BASE_URL } from '../../utils/Config';

interface MyPublicationCardProps {
  publication: any;
  onEdit: (pub: any) => void;
  onDelete: (id: number) => void;
  actionLoading?: boolean;
  setDeletingId?: (id: number | null) => void;
}

const estadoBox = (estado: string) => ({
  backgroundColor: estado === 'aprobado'
    ? '#4CAF50'
    : estado === 'rechazado'
    ? '#F44336'
    : '#FFC107',
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 4,
});
const estadoText = { color: '#FFF', fontWeight: '700' as const, fontSize: 12, textTransform: 'capitalize' as const };

const MyPublicationCard: React.FC<MyPublicationCardProps> = ({ publication, onEdit, onDelete, actionLoading: _actionLoading, setDeletingId }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{publication.eventName}</Text>
        <View style={estadoBox(publication.estado)}>
          <Text style={estadoText}>{publication.estado.replace('_', ' ')}</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollViewMargin}>
        {publication.imageUrls.map((img: string, idx: number) => (
          <View key={idx} style={styles.imgPreviewBox}>
            <View style={styles.imgPreview}>
              <Image source={img ? { uri: `${BASE_URL}/${img}` } : undefined} style={[styles.imgReal]} resizeMode="cover" />
            </View>
            <Text style={styles.imgLabel}>Imagen {idx + 1}</Text>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.cardDesc}>{publication.publicationDescription}</Text>
      <Text style={styles.cardDate}>{publication.date}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtnBlack} onPress={() => onEdit(publication)}>
          <Icon name="edit" size={20} color="#FFF" />
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeletingId ? setDeletingId(publication.id) : onDelete(publication.id)}>
          <Icon name="delete" size={20} color="#FFF" />
          <Text style={styles.deleteBtnText}>Eliminar</Text>
        </TouchableOpacity>
        <View style={styles.likesBox}>
          <Icon name="favorite" size={18} color="#F44336" />
          <Text style={styles.likesText}>{publication.likes}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#EFEFEF', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  imgPreviewBox: { alignItems: 'center', marginRight: 12 },
  imgPreview: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F0EAFF', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  imgLabel: { fontSize: 12, color: '#666' },
  cardDesc: { fontSize: 14, color: '#666', marginBottom: 8 },
  cardDate: { fontSize: 12, color: '#999', marginBottom: 8 },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editBtnBlack: { backgroundColor: '#000', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  editBtnText: { color: '#FFF', fontWeight: '600', marginLeft: 4 },
  deleteBtn: { backgroundColor: '#F44336', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  deleteBtnText: { color: '#FFF', fontWeight: '600', marginLeft: 4 },
  likesBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  likesText: { color: '#F44336', fontWeight: '700', marginLeft: 4 },
  imgReal: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#EEE' },
  scrollViewMargin: { marginVertical: 8 },
});

export default MyPublicationCard;
