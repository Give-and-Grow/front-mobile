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
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';

const RateParticipantsScreen = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [rating, setRating] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login first');
        return;
      }

      const response = await axios.get(`${ipAdd}:5000/opportunities/organization`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOpportunities(response.data.opportunities);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setError('Failed to load opportunities');
      Alert.alert('Error', 'Failed to load opportunities');
    }
  };

  const fetchParticipants = async (opportunityId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login first');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${ipAdd}:5000/opportunity-participants/opportunities/${opportunityId}/participants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedParticipants(response.data);
      setLoading(false);
      setSelectedOpportunity(opportunityId);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load participants');
    }
  };

  const handleRateParticipant = async () => {
    if (!rating || !feedback) {
      Alert.alert('Error', 'Please provide both rating and feedback');
      return;
    }
  
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please login first');
        return;
      }
  
      // تحديد حالة الحضور (attendance_status)، هنا قمت بتحديد "attended" كمثال
      const attendanceStatus = "attended";  // يمكنك تعديلها بناءً على الحالة الفعلية
  
      const response = await axios.post(
        `${ipAdd}:5000/opportunity-participants/${selectedParticipant.id}/rate`,
        {
          rating: parseInt(rating),
          feedback: feedback,
          attendance_status: attendanceStatus,  // إضافة حالة الحضور هنا
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      Alert.alert('Success', response.data.msg);
      setModalVisible(false);
      fetchParticipants(selectedOpportunity); // إعادة تحميل المشاركين
    } catch (error) {
      console.error('Error rating participant:', error);
      Alert.alert('Error', 'Failed to rate participant');
    }
  };
  

  

  const renderOpportunity = ({ item }) => (
    <View style={styles.card}>
      {item.image_url && <Image source={{ uri: item.image_url }} style={styles.image} />}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.info}>
        <Text style={styles.label}>Type:</Text> {item.opportunity_type?.split('.')[1]}
      </Text>
      <Text style={styles.info}>
        <Text style={styles.label}>Location:</Text> {item.location}
      </Text>
      <Text style={styles.info}>
        <Text style={styles.label}>Start:</Text> {item.start_date}
      </Text>
      <Text style={styles.info}>
        <Text style={styles.label}>End:</Text> {item.end_date}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => fetchParticipants(item.id)}
      >
        <Text style={styles.buttonText}>View Participants</Text>
      </TouchableOpacity>
    </View>
  );

  const renderParticipant = ({ item }) => (
    <View style={styles.participantCard}>
      <View style={styles.participantInfo}>
        {item.user.profile_picture ? (
          <Image source={{ uri: item.user.profile_picture }} style={styles.participantImage} />
        ) : (
          <View style={styles.placeholderImage}></View>
        )}
        <View style={styles.participantTextContainer}>
          <Text style={styles.participantName}>
            {item.user.name} {item.user.last_name}
          </Text>
          <Text style={styles.participantStatus}>Attendance: {item.attendance_status}</Text>
          <Text style={styles.participantPoints}>Points: {item.points_earned}</Text>
          <Text style={styles.participantRating}>Rating: {item.rating || 'Not Rated'}</Text>
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => {
              setSelectedParticipant(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.rateButtonText}>Rate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={opportunities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOpportunity}
        ListEmptyComponent={<Text style={styles.emptyText}>No opportunities found.</Text>}
        ListHeaderComponent={<Text style={styles.heading}>Opportunities</Text>}
      />

      {selectedOpportunity && (
        <View style={styles.participantListContainer}>
          <Text style={styles.heading}>Participants</Text>
          <FlatList
            data={selectedParticipants}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderParticipant}
            ListEmptyComponent={<Text style={styles.emptyText}>No participants found.</Text>}
          />
        </View>
      )}

<Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Rate Participant</Text>

      <TextInput
        style={styles.input}
        placeholder="Rating (1-5)"
        value={rating}
        keyboardType="numeric"
        onChangeText={setRating}
      />

      <TextInput
        style={styles.input}
        placeholder="Feedback"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleRateParticipant}>
        <Text style={styles.submitButtonText}>Submit Rating</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => setModalVisible(false)}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9', // لون خلفية مريح
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#a5d6a7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 4,
  },
  image: {
    height: 180,
    width: '100%',
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#616161',
    marginBottom: 10,
    lineHeight: 22,
  },
  info: {
    fontSize: 14,
    marginTop: 6,
    color: '#333',
  },
  label: {
    fontWeight: '600',
    color: '#388E3C',
  },
  button: {
    backgroundColor: '#66bb6a',
    paddingVertical: 12,
    borderRadius: 18,
    marginTop: 20,
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  participantListContainer: {
    marginTop: 30,
  },
  participantCard: {
    backgroundColor: '#dcedc8',
    padding: 18,
    marginVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a5d6a7',
    elevation: 2,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 18,
  },
  placeholderImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#c8e6c9',
    marginRight: 18,
  },
  participantTextContainer: {
    flexDirection: 'column',
  },
  participantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#388E3C',
    marginBottom: 4,
  },
  participantStatus: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 6,
  },
  participantPoints: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 6,
  },
  participantRating: {
    fontSize: 14,
    color: '#388E3C',
  },
  loading: {
    marginTop: 30,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#388E3C',
    fontWeight: '600',
  },
  rateButton: {
    backgroundColor: '#66bb6a',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  rateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#388E3C',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
  }
});

export default RateParticipantsScreen;
