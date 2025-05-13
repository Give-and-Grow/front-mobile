import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'; 
import { Picker } from '@react-native-picker/picker'; 

const RateParticipantsScreen = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [rating, setRating] = useState('');
  const [feedback, setFeedback] = useState('');
  const [attendanceStatuses, setAttendanceStatuses] = useState([]);
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] = useState('');

  useEffect(() => {
    loadOpportunities();
    loadAttendanceStatuses();
  }, []);

  const loadOpportunities = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(`${ipAdd}:5000/opportunities/organization`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpportunities(res.data.opportunities || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch opportunities');
    }
  };

  const loadAttendanceStatuses = async () => {
    try {
      const res = await axios.get(`${ipAdd}:5000/dropdown/attendance-status`);
      setAttendanceStatuses(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch attendance statuses');
    }
  };

  const loadParticipants = async (opportunityId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const res = await axios.get(
        `${ipAdd}:5000/opportunity-participants/opportunities/${opportunityId}/participants`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParticipants(res.data);
      setSelectedOpportunity(opportunityId);
    } catch (err) {
      Alert.alert('Error', 'Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  const rateParticipant = async () => {
    if (!rating || !feedback || !selectedAttendanceStatus) {
      Alert.alert('Error', 'Please fill all fields: rating, feedback, and attendance status');
      return;
    }

    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      Alert.alert('Error', 'Rating must be between 1 and 5');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(
        `${ipAdd}:5000/opportunity-participants/${selectedParticipant.id}/rate`,
        {
          rating: ratingNum,
          feedback: feedback,
          attendance_status: selectedAttendanceStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Participant rated successfully');
      setModalVisible(false);
      loadParticipants(selectedOpportunity);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.msg || 'Failed to rate');
    }
  };

  const OpportunityCard = ({ item }) => (
    <View style={styles.card}>
      {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
      <Text style={styles.title}>{item.title}</Text>
      {/* Badges */}
      <View style={styles.badgeContainer}>
              <Text style={styles.badge}>📍 {item.location}</Text>
              <Text style={styles.badge}>🕒 {item.opportunity_type}</Text>
            </View>

            <Text style={styles.cardLabel}>📝 Description: </Text>
            <Text style={styles.cardText}>{item.description}</Text>

            <View style={styles.separator} />

            <Text style={styles.cardLabel}>📅 Start: </Text>
            <Text style={styles.cardText}>{item.start_date}</Text>

            <View style={styles.separator} />

            <Text style={styles.cardLabel}>📅 End: </Text>
            <Text style={styles.cardText}>{item.end_date}</Text>

            <View style={styles.separator} />

            <Text style={styles.cardLabel}>✉️ Contact: </Text>
            <Text style={styles.cardText}>{item.contact_email}</Text>

            <View style={styles.separator} />
      <TouchableOpacity
        style={styles.button}
        onPress={() => loadParticipants(item.id)}
      >
        <MaterialIcons name="group" size={24} color="white" />
        <Text style={styles.buttonText}>View Participants</Text>
      </TouchableOpacity>
    </View>
  );

  const ParticipantCard = ({ item }) => (
    <View style={styles.participantCard}>
      <Image
        source={{ uri: item.user.profile_picture || 'https://via.placeholder.com/70' }}
        style={styles.participantImage}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.participantName}>{item.user.name} {item.user.last_name}</Text>
        <Text>Status: {item.attendance_status}</Text>
        <Text>Rating: {item.rating || 'Not rated'}</Text>
        {!item.completed && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => {
              setSelectedParticipant(item);
              setModalVisible(true);
            }}
          >
            <FontAwesome name="star" size={18} color="white" />
            <Text style={styles.rateButtonText}>Rate</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={opportunities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={OpportunityCard}
        ListHeaderComponent={<Text style={styles.heading}>Opportunities</Text>}
      />
      {loading && <ActivityIndicator size="large" color="green" />}
      {selectedOpportunity && (
        <>
          <Text style={styles.heading}>Participants</Text>
          <FlatList
            data={participants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={ParticipantCard}
          />
        </>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Text style={styles.modalTitle}>Rate Participant</Text>
              <TextInput
                style={styles.input}
                placeholder="Rating (1-5)"
                keyboardType="numeric"
                value={rating}
                onChangeText={setRating}
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Feedback"
                multiline
                value={feedback}
                onChangeText={setFeedback}
              />
              <Text style={styles.inputLabel}>Attendance Status</Text>
              <Picker
                selectedValue={selectedAttendanceStatus}
                onValueChange={(itemValue) => setSelectedAttendanceStatus(itemValue)}
              >
                {attendanceStatuses.map((status) => (
                  <Picker.Item key={status} label={status} value={status} />
                ))}
              </Picker>
              <TouchableOpacity style={styles.submitButton} onPress={rateParticipant}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0fdf4' },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32', marginVertical: 12 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  descriptionContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoText: { marginLeft: 8, fontSize: 14 },
  button: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  participantCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  participantImage: { width: 70, height: 70, borderRadius: 35, marginRight: 16 },
  participantName: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  rateButton: { backgroundColor: '#4CAF50', padding: 8, borderRadius: 25, flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rateButtonText: { color: '#fff', marginLeft: 8 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  scrollContainer: { paddingBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginBottom: 16 },
  input: { borderColor: '#4CAF50', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12, height: 50 },
  inputLabel: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginBottom: 8 },
  submitButton: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 25, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButtonText: { color: '#4CAF50', textAlign: 'center', marginTop: 8, fontSize: 16 },
  badgeContainer: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  badge: {
    backgroundColor: "#c8e6c9",
    color: "#2e7d32",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 5,
  },
  cardLabel: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#1b5e20",
    marginTop: 6,
  },
  cardText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
});

export default RateParticipantsScreen;
