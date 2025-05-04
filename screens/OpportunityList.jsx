import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert, Animated, TouchableOpacity, Image, Modal, Linking, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OpportunitiesList = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [modalType, setModalType] = useState(null); // 'details' or 'update'

  const [updateData, setUpdateData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    required_points: '',
  });

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setError('Token not found');
          setLoading(false);
          return;
        }
  
        const response = await axios.get('http://192.168.1.107:5000/opportunities/organization', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        // التأكد من أن `required_points` موجود لكل فرصة
        const updatedOpportunities = response.data.opportunities.map(opportunity => ({
          ...opportunity,
          required_points: opportunity.required_points || 0, // تعيين قيمة افتراضية إذا كانت غير موجودة
        }));
  
        setOpportunities(updatedOpportunities);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        setError('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };
  
    fetchOpportunities();
  }, []);
  

  const handleDelete = async (opportunityId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Token not found');
        return;
      }

      const response = await axios.delete(`http://192.168.1.107:5000/opportunities/${opportunityId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setOpportunities(opportunities.filter((opportunity) => opportunity.id !== opportunityId));
        Alert.alert('Success', 'Opportunity deleted successfully');
      }
    } catch (error) {
      setError('Failed to delete opportunity');
    }
  };
 
  

  const handleSubmitUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('Token not found');
        return;
      }

      const response = await axios.put(
        `http://192.168.1.107:5000/opportunities/${selectedOpportunity.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedOpportunities = opportunities.map((opportunity) =>
          opportunity.id === selectedOpportunity.id ? { ...opportunity, ...updateData } : opportunity
        );
        setOpportunities(updatedOpportunities);
        Alert.alert('Success', 'Opportunity updated successfully');
        closeModal();
      }
    } catch (error) {
      setError('Failed to update opportunity');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOpportunity(null);
    setModalType(null);
  };
  
  const handleMorePress = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setModalType('details');
    setModalVisible(true);
  };

  const handleUpdate = (opportunity) => {
    if (opportunity.opportunity_type === 'OpportunityType.JOB') {
      setSelectedOpportunity(opportunity);
      setUpdateData({
        title: opportunity.title,
        description: opportunity.description,
        location: opportunity.location,
        start_date: opportunity.start_date,
        end_date: opportunity.end_date,
        required_points: opportunity.required_points ? opportunity.required_points.toString() : '',
      });
      setModalType('update');
      setModalVisible(true);
    } else if (opportunity.opportunity_type === 'OpportunityType.VOLUNTEER') {
      setSelectedOpportunity(opportunity);
      setUpdateData({
        title: opportunity.title,
        description: opportunity.description,
        location: opportunity.location,
        start_date: opportunity.start_date,
        end_date: opportunity.end_date,
        max_participants: opportunity.max_participants ? opportunity.max_participants.toString() : '',
        base_points: opportunity.base_points ? opportunity.base_points.toString() : '',
      });
      setModalType('update');
      setModalVisible(true);
    } else {
      Alert.alert('Update Not Available', 'This opportunity cannot be updated.');
    }
  };
  const formatKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };
  if (loading) return <ActivityIndicator size="large" color="#4CAF50" />;
  if (error) return <Text style={styles.errorText}>{error}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Available Opportunities</Text>
      {opportunities.map((opportunity) => (
        <Animated.View key={opportunity.id} style={[styles.card, { opacity: fadeAnim }]}>
          {opportunity.image_url && <Image source={{ uri: opportunity.image_url }} style={styles.image} />}

          {/* زر الحذف */}
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(opportunity.id)}>
            <Text style={styles.deleteText}>❌</Text>
          </TouchableOpacity>

          {/* زر التحديث */}
          <TouchableOpacity style={styles.updateButton} onPress={() => handleUpdate(opportunity)}>
            <Text style={styles.updateText}>✏️</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{opportunity.title}</Text>
          <Text style={styles.description}>{opportunity.description}</Text>
          <Text style={styles.details}><Text style={styles.bold}>Location:</Text> {opportunity.location}</Text>
          <Text style={styles.details}><Text style={styles.bold}>Start Date:</Text> {opportunity.start_date}</Text>
          <Text style={styles.details}><Text style={styles.bold}>End Date:</Text> {opportunity.end_date}</Text>
          <Text style={styles.details}><Text style={styles.bold}>Opportunity Type:</Text> {opportunity.opportunity_type}</Text>
          <Text style={styles.details}><Text style={styles.bold}>Status:</Text> {opportunity.status}</Text>

          <TouchableOpacity style={styles.button} onPress={() => handleMorePress(opportunity)}>
            <Text style={styles.buttonText}>More Details</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}

     {/* Modal لتحديث بيانات الفرصة */}
{modalVisible && selectedOpportunity && modalType === 'update' && (
  <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Update Opportunity</Text>
        
        {/* الحقول المشتركة */}
        <TextInput
          style={styles.input}
          value={updateData.title}
          onChangeText={(text) => setUpdateData({ ...updateData, title: text })}
          placeholder="Title"
        />
        <TextInput
          style={styles.input}
          value={updateData.description}
          onChangeText={(text) => setUpdateData({ ...updateData, description: text })}
          placeholder="Description"
        />
        <TextInput
          style={styles.input}
          value={updateData.location}
          onChangeText={(text) => setUpdateData({ ...updateData, location: text })}
          placeholder="Location"
        />
        <TextInput
          style={styles.input}
          value={updateData.start_date}
          onChangeText={(text) => setUpdateData({ ...updateData, start_date: text })}
          placeholder="Start Date"
        />
        <TextInput
          style={styles.input}
          value={updateData.end_date}
          onChangeText={(text) => setUpdateData({ ...updateData, end_date: text })}
          placeholder="End Date"
        />

        {/* الحقول الخاصة بـ JOB */}
        {selectedOpportunity.opportunity_type === 'OpportunityType.JOB' && (
          <TextInput
            style={styles.input}
            value={updateData.required_points}
            onChangeText={(text) => setUpdateData({ ...updateData, required_points: text })}
            placeholder="Required Points"
            keyboardType="numeric"
          />
        )}

        {/* الحقول الخاصة بـ VOLUNTEER */}
        {selectedOpportunity.opportunity_type === 'OpportunityType.VOLUNTEER' && (
          <>
            <TextInput
              style={styles.input}
              value={updateData.max_participants}
              onChangeText={(text) => setUpdateData({ ...updateData, max_participants: text })}
              placeholder="Max Participants"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={updateData.base_points}
              onChangeText={(text) => setUpdateData({ ...updateData, base_points: text })}
              placeholder="Base Points"
              keyboardType="numeric"
            />
          </>
        )}

        <TouchableOpacity style={styles.modalButton} onPress={handleSubmitUpdate}>
          <Text style={styles.buttonText}>Submit Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}
  


{modalVisible && selectedOpportunity && modalType === 'details' && (
  <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Opportunity Details</Text>

        {Object.entries(selectedOpportunity).map(([key, value]) => (
          <Text key={key} style={styles.modalDetails}>
            <Text style={styles.bold}>{formatKey(key)}:</Text> {String(value)}
          </Text>
        ))}

        <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
  },
  container: {
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    color: '#66bb6a',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#E8F5E9',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#7F8C8D',
    marginVertical: 12,
    lineHeight: 22,
  },
  details: {
    fontSize: 15,
    color: '#2C3E50',
    marginVertical: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#66bb6a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#246113',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  updateButton: {
    position: 'absolute',
    top: 10,
    right: 50,
   // backgroundColor: '#66bb6a',
    borderRadius: 25,
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34495E',
    marginBottom: 15,
  },
  modalDetails: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 10,
  },
  link: {
    color: '#1ABC9C',
    textDecorationLine: 'underline',
  },
  modalButton: {
    backgroundColor: '#66bb6a',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
    alignItems: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    //backgroundColor: '#388E3C',
    borderRadius: 25,
    padding: 15,
    shadowColor: '#388E3C',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  deleteText: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  updateText: {
    color: '#fff', // النص سيكون باللون الأبيض ليظهر بوضوح على الخلفية الخضراء
    fontWeight: 'bold',
    fontSize: 24,
  }, 

});

export default OpportunitiesList;
