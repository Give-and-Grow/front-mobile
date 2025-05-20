// screens/AttendanceScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, Modal, Pressable, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LayoutWithFilters from './LayoutWithFiltersOrg';
import BottomTabBar from './BottomTabBar';
const AttendanceScreen = () => {
   const [activeTab, setActiveTab] = useState('attendce');
           const [filter, setFilter] = useState("attendance");         
                const handleProfilePress = () => {
                  navigation.navigate('AttendanceScreen');
                };
  const [token, setToken] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('userToken').then(storedToken => {
      if (storedToken) {
        setToken(storedToken);
        fetchOpportunities(storedToken);
      }
    });
  }, []);

  const fetchOpportunities = async (authToken) => {
    setLoading(true);
    try {
      const res = await fetch(`${ipAdd}:5000/opportunities/organization`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      setOpportunities(data.opportunities || []);
    } catch {
      Alert.alert('Error', 'Failed to fetch opportunities');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedOpportunity) return;
    setDates([]);
    setSelectedDate(null);
    setParticipants([]);
    fetchDates(selectedOpportunity.id);
  }, [selectedOpportunity]);

  const fetchDates = async (opportunityId) => {
    try {
      const res = await fetch(`${ipAdd}:5000/attendance/${opportunityId}/dates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDates(data.dates || []);
    } catch {
      Alert.alert('Error', 'Failed to fetch dates');
    }
  };

  const fetchParticipants = async () => {
    if (!selectedDate || !selectedOpportunity) return;
    setLoading(true);
    try {
      const res = await fetch(`${ipAdd}:5000/attendance/${selectedOpportunity.id}?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setParticipants(data.participants || []);
      setModalVisible(true);
    } catch {
      Alert.alert('Error', 'Failed to fetch participants');
    }
    setLoading(false);
  };

  const toggleAttendance = (participant_id) => {
    setParticipants(prev =>
      prev.map(p =>
        p.participant_id === participant_id
          ? { ...p, status: p.status === 'present' ? 'absent' : 'present' }
          : p
      )
    );
  };

  const saveAttendance = async () => {
    if (!selectedDate || !selectedOpportunity) return;
    setLoading(true);
  
    const attendanceData = participants.map(p => ({
      participant_id: p.participant_id,
      status: p.status,
      date: selectedDate  // التاريخ ضروري حسب طلب السيرفر
    }));
  
    console.log('Saving attendance data:', attendanceData);
  
    try {
      const res = await fetch(`${ipAdd}:5000/attendance/${selectedOpportunity.id}?date=${selectedDate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(attendanceData),
      });
      const data = await res.json();
      console.log('Server response:', data);
      Alert.alert('Success', data.message || 'Attendance saved');
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
      Alert.alert('Error', 'Failed to save attendance');
    }
    setLoading(false);
  };
  
   
  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  
  return (
    <LayoutWithFilters onFilterSelect={handleFilterSelect} initialFilter="attendance">
    <View style={{flex: 1, backgroundColor: '#e8f5e9'}}>
    <ScrollView contentContainerStyle={styles.container}
   
      keyboardShouldPersistTaps="always"
      style={{ flex: 1 }}
    >
      
      <Text style={styles.title}>📋 Attendance Tracker</Text>

      <Text style={styles.label}><Icon name="briefcase-outline" size={18} /> Select Opportunity:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedOpportunity?.id}
          onValueChange={(id) => {
            const opp = opportunities.find(o => o.id === id);
            setSelectedOpportunity(opp || null);
          }}
        >
          <Picker.Item label="Choose opportunity" value={null} />
          {opportunities.map(opp => (
            <Picker.Item key={opp.id} label={opp.title} value={opp.id} />
          ))}
        </Picker>
      </View>

      {dates.length > 0 && (
        <>
          <Text style={styles.label}><Icon name="calendar-month-outline" size={18} /> Select Date:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedDate}
              onValueChange={setSelectedDate}
            >
              <Picker.Item label="Choose date" value={null} />
              {dates.map(date => (
                <Picker.Item key={date} label={date} value={date} />
              ))}
            </Picker>
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#43a047' }]}
        onPress={fetchParticipants}
        disabled={!selectedDate || !selectedOpportunity}
      >
        <Icon name="account-group-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}> Show Participants</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}><Icon name="account-multiple-check" size={22} /> Participants</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#43a047" />
            ) : (
              <FlatList
                data={participants}
                keyExtractor={item => item.participant_id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.participantCard,
                      item.status === 'present' ? styles.present : styles.absent
                    ]}
                    onPress={() => toggleAttendance(item.participant_id)}
                  >
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.status}>
                      {item.status === 'present' ? '✔️ Present' : '✘ Absent'}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity style={styles.button} onPress={saveAttendance}>
              <Icon name="content-save-check-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}> Save Attendance</Text>
            </TouchableOpacity>

            <Pressable style={[styles.button, { backgroundColor: '#aaa' }]} onPress={() => setModalVisible(false)}>
              <Icon name="close" size={20} color="#fff" />
              <Text style={styles.buttonText}> Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <View style={{ height: 100 }} />
      </ScrollView>
      
    <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleProfilePress={handleProfilePress}
      />

    </View>
    </LayoutWithFilters>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e8f5e9',
    flexGrow: 1
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#2e7d32'
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 15
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
    textAlign: 'center',
  },
  participantCard: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2
  },
  present: { backgroundColor: '#c8e6c9' },
  absent: { backgroundColor: '#ffcdd2' },
  name: { fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 16 },
});

export default AttendanceScreen;
