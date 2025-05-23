// screens/EvaluationScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, Modal, TextInput, ScrollView, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LayoutWithFilters from './LayoutWithFiltersOrg';
import BottomTabBar from './BottomTabBar';
const RateParticipantsScreen = () => {
   const [activeTab, setActiveTab] = useState('Rate');
         const [filter, setFilter] = useState("evaluate");         
              const handleProfilePress = () => {
                navigation.navigate('RateParticipantsScreen');
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

  const fetchEvaluations = async () => {
    if (!selectedDate || !selectedOpportunity) return;
    setLoading(true);
    try {
      const res = await fetch(`${ipAdd}:5000/evaluation/${selectedOpportunity.id}?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const withEvaluationFields = data.participants.map(p => ({
        ...p,
        score: p.score === -1 ? 0 : p.score,
        notes: p.notes || ''
      }));
      setParticipants(withEvaluationFields);
      setModalVisible(true);
    } catch {
      Alert.alert('Error', 'Failed to fetch evaluations');
    }
    setLoading(false);
  };

  const handleRatingChange = (id, score) => {
    setParticipants(prev =>
      prev.map(p =>
        p.participant_id === id ? { ...p, score } : p
      )
    );
  };

  const handleNoteChange = (id, notes) => {
    setParticipants(prev =>
      prev.map(p =>
        p.participant_id === id ? { ...p, notes } : p
      )
    );
  };

  const saveEvaluations = async () => {
    if (!selectedDate || !selectedOpportunity) return;
    setLoading(true);
  
    const evaluationsPayload = participants.map(({ participant_id, score, notes }) => ({
      participant_id,
      score,
      notes,
      date: selectedDate
    }));
  
    console.log("Sending participants data:", evaluationsPayload);
  
    try {
      const res = await fetch(`${ipAdd}:5000/evaluation/${selectedOpportunity.id}?date=${selectedDate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(evaluationsPayload),
      });
      const data = await res.json();
  
      console.log("Response status:", res.status);
      console.log("Response data:", data);
  
      Alert.alert('Success', data.message || 'Evaluations saved');
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving evaluations:", error);
      Alert.alert('Error', 'Failed to save evaluations');
    }
    setLoading(false);
  };
  
  
  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };

  return (
    <LayoutWithFilters onFilterSelect={handleFilterSelect} initialFilter="evaluate">
    <View style={{flex: 1, backgroundColor: '#e8f5e9'}}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
     
      <Text style={styles.title}>🌟 Participant Evaluation</Text>

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
        style={[styles.button, { backgroundColor: '#388e3c' }]}
        onPress={fetchEvaluations}
        disabled={!selectedDate || !selectedOpportunity}
      >
        <Icon name="account-search-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}> Show Participants</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}><Icon name="star-check" size={22} /> Evaluate Participants</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#1e88e5" />
            ) : (
              <FlatList
                data={participants}
                keyExtractor={item => item.participant_id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.participantCard}>
                    <Image source={{ uri: item.profile_picture }} style={styles.avatar} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.name}>{item.name}</Text>
                    

                      <TextInput
                        style={styles.noteInput}
                        placeholder="Write notes..."
                        value={item.notes}
                        onChangeText={text => handleNoteChange(item.participant_id, text)}
                      />

                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <TouchableOpacity key={i} onPress={() => handleRatingChange(item.participant_id, i)}>
                            <Icon
                              name={i <= item.score ? 'star' : 'star-outline'}
                              size={24}
                              color="#FFD700"
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              />
            )}

            <TouchableOpacity style={styles.button} onPress={saveEvaluations}>
              <Icon name="content-save" size={20} color="#fff" />
              <Text style={styles.buttonText}> Save Evaluations</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, { backgroundColor: '#aaa' }]} onPress={() => setModalVisible(false)}>
              <Icon name="close" size={20} color="#fff" />
              <Text style={styles.buttonText}> Close</Text>
            </TouchableOpacity>
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
    backgroundColor: '#e8f5e9',  // أخضر فاتح
    flexGrow: 1
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32',  // أخضر غامق
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#2e7d32'  // أخضر غامق
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#a5d6a7',  // أخضر فاتح متوسط
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginBottom: 15
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#388e3c',  // أخضر متوسط
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
    backgroundColor: 'rgba(46,125,50,0.4)', // ظل أخضر شفاف بدلاً من الأسود
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#2e7d32',  // ظل أخضر غامق
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',  // أخضر غامق
    marginBottom: 10,
    textAlign: 'center',
  },
  participantCard: {
    flexDirection: 'row',
    backgroundColor: '#c8e6c9',  // أخضر فاتح أكثر
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1b5e20' }, // أخضر غامق جدا للنص
  phone: { fontSize: 14, color: '#4caf50' },  // أخضر متوسط للنص الثانوي
  noteInput: {
    borderWidth: 1,
    borderColor: '#81c784', // أخضر فاتح
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
    backgroundColor: '#ffffff'
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 5
  }
});

export default RateParticipantsScreen;
