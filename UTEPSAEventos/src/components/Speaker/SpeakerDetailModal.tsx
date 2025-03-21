import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Speaker } from '../../types/SpeakerTypes';
import { BASE_URL } from '../../utils/Config';

interface SpeakerDetailModalProps {
  visible: boolean;
  speaker: Speaker | null;
  onClose: () => void;
}

const SpeakerDetailModal: React.FC<SpeakerDetailModalProps> = ({ visible, speaker, onClose }) => {
  const getFullName = (speaker: Speaker) => {
    return `${speaker.nombre} ${speaker.apellido_paterno} ${speaker.apellido_materno}`;
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) {
      return null;
    }
    return { uri: `${BASE_URL}/upload/${imageUrl}` };
  };

  if (!speaker) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              {speaker.imagen_url ? (
                <View style={styles.modalImageContainer}>
                  <Image
                    source={getImageUrl(speaker.imagen_url) || undefined}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={styles.modalPlaceholderContainer}>
                  <Icon name="person" size={80} color="#CCCCCC" />
                </View>
              )}
              <Text style={styles.modalName}>{getFullName(speaker)}</Text>
            </View>

            <View style={styles.modalDivider} />

            <View style={styles.modalBody}>
              <Text style={styles.modalSectionTitle}>Biografía</Text>
              <Text style={styles.modalDescription}>{speaker.descripcion}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 6,
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  modalImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#F3F4F6",
  },
  modalPlaceholderContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalImage: {
    width: "100%",
    height: "100%",
  },
  modalName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 20,
    marginHorizontal: 24,
  },
  modalBody: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    textAlign: "justify",
  },
});

export default SpeakerDetailModal;
