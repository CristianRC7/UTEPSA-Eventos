import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { getSession } from '../utils/sessionStorage';
import { BASE_URL } from '../utils/Config';
import BottomSheet from '../components/BottomSheet';
import MyPublicationCard from '../components/MyPublication/MyPublicationCard';
import LoadingPulseCardAnimation from '../components/LoadingPulseCardAnimation';

const MAX_DESCRIPTION_LENGTH = 250;

const MyPublication = () => {
  const navigation = useNavigation();
  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPub, setEditingPub] = useState<any | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [editEventName, setEditEventName] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEventSelector, setShowEventSelector] = useState(false);
  const [eventList, setEventList] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);

  const fetchPublications = useCallback(async () => {
    if (!refreshing) setLoading(true);
    const userData = await getSession();
    if (!userData?.id_usuario) return;
    try {
      const response = await fetch(`${BASE_URL}/MyPublications.php?id_usuario=${userData.id_usuario}`);
      const data = await response.json();
      if (data.success) {
        setPublications(data.publications);
      } else {
        setPublications([]);
      }
    } catch (error) {
      setPublications([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [refreshing]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  const fetchEvents = async () => {
    setEventLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/Events.php`);
      const data = await response.json();
      if (data.success) {
        setEventList(data.events);
      } else {
        setEventList([]);
      }
    } catch (error) {
      setEventList([]);
    }
    setEventLoading(false);
  };

  const handleEdit = (pub: any) => {
    setEditingPub(pub);
    setEditDesc(pub.publicationDescription || '');
    setEditEventId(pub.id_evento);
    setEditEventName(pub.eventName);
    setShowEditModal(true);
    fetchEvents();
  };

  const handleSaveEdit = async () => {
    if (!editingPub || !editEventId) return;
    if (editDesc.length > MAX_DESCRIPTION_LENGTH) {
      Alert.alert('Error', 'La descripción es demasiado larga.');
      return;
    }
    setActionLoading(true);
    const formData = new FormData();
    formData.append('action', 'edit');
    formData.append('id_publicacion', editingPub.id);
    formData.append('id_evento', editEventId);
    formData.append('descripcion', editDesc);
    try {
      const response = await fetch(`${BASE_URL}/MyPublications.php`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        fetchPublications();
        Alert.alert('Éxito', 'Publicación editada. Ahora está esperando aprobación.');
      } else {
        Alert.alert('Error', 'No se pudo editar la publicación.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo editar la publicación.');
    }
    setActionLoading(false);
  };

  const handleDelete = async (id: number) => {
    setActionLoading(true);
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id_publicacion', id);
    try {
      const response = await fetch(`${BASE_URL}/MyPublications.php`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        fetchPublications();
        Alert.alert('Eliminado', 'La publicación fue eliminada.');
      } else {
        Alert.alert('Error', 'No se pudo eliminar la publicación.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la publicación.');
    }
    setActionLoading(false);
    setDeletingId(null);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPublications();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Publicaciones</Text>
        <View style={styles.rightPlaceholder} />
      </View>
      {loading ? (
        <LoadingPulseCardAnimation />
      ) : (
        <FlatList
          data={publications}
          renderItem={({ item }) => (
            <MyPublicationCard
              publication={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              setDeletingId={setDeletingId}
            />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{padding:16, paddingBottom:40}}
          ListEmptyComponent={<Text style={{textAlign:'center', color:'#999', marginTop:40}}>No tienes publicaciones.</Text>}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
      {/* Modal de edición */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={()=>setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar publicación</Text>
            <TouchableOpacity style={styles.selectContainer} onPress={()=>setShowEventSelector(true)}>
              <Icon name="event" size={20} color="#555" style={styles.inputIcon} />
              <Text style={[styles.selectText, !editEventName && styles.selectPlaceholder]}>
                {editEventName || "Selecciona un evento"}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#555" />
            </TouchableOpacity>
            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={styles.textArea}
              value={editDesc}
              onChangeText={text => { if (text.length <= MAX_DESCRIPTION_LENGTH) setEditDesc(text); }}
              placeholder="Escribe una descripción..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={MAX_DESCRIPTION_LENGTH+1}
            />
            <Text style={{alignSelf:'flex-end', color:editDesc.length>MAX_DESCRIPTION_LENGTH?'red':'#999', fontSize:12}}>
              {editDesc.length}/{MAX_DESCRIPTION_LENGTH}
            </Text>
            <View style={{flexDirection:'row', justifyContent:'flex-end', marginTop:16}}>
              <TouchableOpacity style={[styles.editBtnBlack, {marginRight:8}]} onPress={handleSaveEdit} disabled={actionLoading}>
                {actionLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.editBtnText}>Guardar</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={()=>setShowEditModal(false)}>
                <Text style={styles.deleteBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Modal selector de evento reemplazado por BottomSheet */}
        <BottomSheet
          visible={showEventSelector}
          onClose={()=>setShowEventSelector(false)}
          title="Selecciona un evento"
          height={400}
          loading={eventLoading}
        >
          <FlatList
            data={eventList}
            keyExtractor={item => item.id_evento.toString()}
            renderItem={({item})=>(
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  editEventId===item.id_evento && styles.selectedFilterOption
                ]}
                onPress={()=>{
                  setEditEventId(item.id_evento);
                  setEditEventName(item.titulo);
                  setShowEventSelector(false);
                }}
              >
                <Icon name="event" size={20} color={editEventId===item.id_evento?"#FFF":"#111"} style={styles.eventIcon}/>
                <Text style={[
                  styles.filterText,
                  editEventId===item.id_evento && styles.selectedFilterText
                ]}>{item.titulo}</Text>
                {editEventId===item.id_evento && <Icon name="check" size={20} color="#FFF" style={styles.checkIcon}/>} 
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.eventsList}
          />
        </BottomSheet>
      </Modal>
      {/* Modal de confirmación de eliminación */}
      <Modal visible={!!deletingId} transparent animationType="fade" onRequestClose={()=>setDeletingId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Eliminar publicación?</Text>
            <Text style={{color:'#666', marginBottom:20}}>Esta acción eliminará la publicación, sus imágenes y sus likes. ¿Estás seguro?</Text>
            <View style={{flexDirection:'row', justifyContent:'flex-end'}}>
              <TouchableOpacity style={[styles.deleteBtnConfirm, {marginRight:8}]} onPress={()=>handleDelete(deletingId!)} disabled={actionLoading}>
                {actionLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.deleteBtnConfirmText}>Eliminar</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={()=>setDeletingId(null)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EFEFEF', backgroundColor: '#cf152d' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  rightPlaceholder: { width: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#EFEFEF', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  imgPreviewBox: { alignItems: 'center', marginRight: 12 },
  imgPreview: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  imgLabel: { fontSize: 12, color: '#999' },
  cardDesc: { fontSize: 14, color: '#666', marginBottom: 8 },
  cardDate: { fontSize: 12, color: '#999', marginBottom: 8 },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editBtnBlack: { backgroundColor: '#111', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  editBtnText: { color: '#FFF', fontWeight: '600', marginLeft: 4 },
  deleteBtn: { backgroundColor: '#cf152d', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  deleteBtnText: { color: '#FFF', fontWeight: '600', marginLeft: 4 },
  likesBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  likesText: { color: '#cf152d', fontWeight: '700', marginLeft: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, width: '85%', maxWidth: 400 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#cf152d', marginBottom: 16 },
  selectContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, backgroundColor: '#F5F5F5', height: 48 },
  selectText: { flex: 1, fontSize: 16, color: '#333' },
  selectPlaceholder: { color: '#999' },
  inputIcon: { marginRight: 8 },
  inputLabel: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 8 },
  textArea: { fontSize: 16, color: '#333', minHeight: 80, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, backgroundColor: '#F5F5F5' },
  eventItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 8, backgroundColor: '#F5F5F5' },
  eventItemSelected: { backgroundColor: '#000' },
  eventIcon: { marginRight: 12 },
  eventText: { flex: 1, fontSize: 16, color: '#333' },
  eventTextSelected: { color: '#FFF' },
  checkIcon: { marginLeft: 8 },
  eventsList: { padding: 16 },
  imgReal: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#EEE' },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
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
  deleteBtnConfirm: { backgroundColor: '#cf152d', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  deleteBtnConfirmText: { color: '#FFF', fontWeight: '600', marginLeft: 4 },
  cancelBtn: { backgroundColor: '#FFF', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: '#cf152d', flexDirection: 'row', alignItems: 'center' },
  cancelBtnText: { color: '#cf152d', fontWeight: '600', marginLeft: 4 },
});

export default MyPublication;
