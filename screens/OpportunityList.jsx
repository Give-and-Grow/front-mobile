import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, TextInput, Image, Modal, Alert, StyleSheet, ScrollView, ActivityIndicator 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ipAdd from '../scripts/helpers/ipAddress';
import LayoutWithFilters from './LayoutWithFiltersOrg';
import BottomTabBar from './BottomTabBar';
const OpportunityList = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [filters, setFilters] = useState({ location: '', status: '' });
  const [showDeleted, setShowDeleted] = useState(false);
  const [newStatus, setNewStatus] = useState('');
const [activeTab, setActiveTab] = useState('list');
    const [filter, setFilter] = useState("list_all");

    const handleProfilePress = () => {
      navigation.navigate('OpportunityList');
    };
  const [updatedData, setUpdatedData] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    status: '',
    max_participants: '',
    base_points: '',
    required_points: '',
  });

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setError('Token not found');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${ipAdd}:5000/opportunities/organization?is_deleted=${showDeleted}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updated = response.data.opportunities.map(o => ({
          ...o,
          required_points: o.required_points || 0,
        }));

        setOpportunities(updated);
        setError(null);
      } catch (err) {
        setError('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [showDeleted]);

  const handleChangeStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(`${ipAdd}:5000/opportunities/${selectedOpportunity.id}/change-status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpportunities(prev =>
        prev.map(o => o.id === selectedOpportunity.id ? { ...o, status: newStatus } : o)
      );

      closeModal();
      Alert.alert('Success', 'Status updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.delete(`${ipAdd}:5000/opportunities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpportunities(prev => prev.filter(o => o.id !== id));
      Alert.alert('Success', 'Deleted successfully');
    } catch {
      setError('Failed to delete opportunity');
    }
  };

  const handleMorePress = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setModalType('details');
    setModalVisible(true);
  };

  const handleEdit = (opportunity) => {
    setSelectedOpportunity(opportunity);
    const commonFields = {
      title: opportunity.title,
      description: opportunity.description,
      location: opportunity.location,
      start_date: opportunity.start_date,
      end_date: opportunity.end_date,
    };

    if (opportunity.opportunity_type === 'volunteer') {
      setUpdatedData({
        ...commonFields,
        status: opportunity.status || '',
        max_participants: opportunity.max_participants ? String(opportunity.max_participants) : '',
        base_points: opportunity.base_points ? String(opportunity.base_points) : '',
        required_points: '',
      });
    } else if (opportunity.opportunity_type === 'job') {
      setUpdatedData({
        ...commonFields,
        status: opportunity.status || '',
        required_points: opportunity.required_points ? String(opportunity.required_points) : '',
        max_participants: '',
        base_points: '',
      });
    }

    setModalType('edit');
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const type = selectedOpportunity.opportunity_type;

      const allowedFields =
        type === 'volunteer'
          ? ['title', 'description', 'location', 'start_date', 'end_date', 'status', 'max_participants', 'base_points']
          : ['title', 'description', 'location', 'start_date', 'end_date', 'status', 'required_points'];

      const filteredData = {};
      for (const key of allowedFields) {
        if (updatedData[key] !== undefined) {
          filteredData[key] = updatedData[key];
        }
      }

      await axios.put(`${ipAdd}:5000/opportunities/${selectedOpportunity.id}`, filteredData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOpportunities(prev =>
        prev.map(o => o.id === selectedOpportunity.id ? { ...o, ...filteredData } : o)
      );

      closeModal();
      Alert.alert('Success', 'Updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Update failed');
    }
  };

  const handleRestore = async (id) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(`${ipAdd}:5000/opportunities/${id}/restore`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpportunities(prev =>
        prev.map(o => o.id === id ? { ...o, is_deleted: false } : o)
      );

      Alert.alert('Success', 'Opportunity restored successfully');
    } catch (err) {
      setError('Failed to restore opportunity');
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOpportunity(null);
  };

  const filteredOpportunities = opportunities.filter(o =>
    o.location.toLowerCase().includes(filters.location.toLowerCase()) &&
    o.status.toLowerCase().includes(filters.status.toLowerCase())
  );

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#66bb6a" />
    </View>
  );

  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.error}>{error}</Text>
    </View>
  );
 const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  return (
    <View style={{ flex: 1 }}>
       <LayoutWithFilters onFilterSelect={handleFilterSelect} initialFilter="list_all">
    <View style={styles.container}>
      <Text style={styles.title}>Available Opportunities</Text>

      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() => setShowDeleted(!showDeleted)}
      >
        <Text style={styles.toggleBtnText}>
          {showDeleted ? 'Show Active Opportunities' : 'Show Deleted Opportunities'}
        </Text>
      </TouchableOpacity>

      {/* Filters */}
      <View style={styles.filters}>
        <TextInput
          placeholder="Filter by location"
          style={styles.input}
          value={filters.location}
          onChangeText={(text) => setFilters(prev => ({ ...prev, location: text }))}
        />
        <TextInput
          placeholder="Filter by status"
          style={styles.input}
          value={filters.status}
          onChangeText={(text) => setFilters(prev => ({ ...prev, status: text }))}
        />
      </View>

      <FlatList
        data={filteredOpportunities}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : null}
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
             
              <Text><Text style={{ fontWeight: 'bold' }}>Description:</Text> {item.description}</Text>
              <Text><Text style={{ fontWeight: 'bold' }}>Location:</Text> {item.location}</Text>
              <Text><Text style={{ fontWeight: 'bold' }}>Start Date:</Text> {item.start_date}</Text>
              <Text><Text style={{ fontWeight: 'bold' }}>End Date:</Text> {item.end_date}</Text>
              <Text><Text style={{ fontWeight: 'bold' }}>Status:</Text> {item.status}</Text>

              {/* Skills */}
              {item.skills && item.skills.length > 0 && (
                <View style={styles.skillsContainer}>
                  <Text style={styles.skillsTitle}>🛠️ Skills Required:</Text>
                  <View style={styles.skillBadgesContainer}>
                    {item.skills.map(skill => (
                      <Text key={skill.id} style={styles.skillBadge}>💡 {skill.name}</Text>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.buttons}>
                <TouchableOpacity style={[styles.btn, styles.detailsBtn]} onPress={() => handleMorePress(item)}>
                  <Text style={styles.btnText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.updateBtn]} onPress={() => handleEdit(item)}>
                  <Text style={styles.btnText}>Update</Text>
                </TouchableOpacity>

                {showDeleted ? (
                  <TouchableOpacity style={[styles.btn, styles.restoreBtn]} onPress={() => handleRestore(item.id)}>
                    <Text style={styles.btnText}>Restore</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.btnText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      />

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {modalType === 'details' && selectedOpportunity && (
              <ScrollView>
                <Text style={styles.modalTitle}>{selectedOpportunity.title}</Text>
                <Text>{selectedOpportunity.description}</Text>
                <Text>Location: {selectedOpportunity.location}</Text>
                <Text>Start Date: {selectedOpportunity.start_date}</Text>
                <Text>End Date: {selectedOpportunity.end_date}</Text>
                <Text>Status: {selectedOpportunity.status}</Text>
                {selectedOpportunity.skills && selectedOpportunity.skills.length > 0 && (
                  <View>
                    <Text>Skills:</Text>
                    {selectedOpportunity.skills.map(skill => (
                      <Text key={skill.id}>- {skill.name}</Text>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.btn, styles.closeBtn]}
                  onPress={closeModal}
                >
                  <Text style={styles.btnText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {modalType === 'edit' && selectedOpportunity && (
              <ScrollView>
                <Text style={styles.modalTitle}>Edit Opportunity</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Title"
                  value={updatedData.title}
                  onChangeText={text => setUpdatedData(prev => ({ ...prev, title: text }))}
                />
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Description"
                  multiline
                  value={updatedData.description}
                  onChangeText={text => setUpdatedData(prev => ({ ...prev, description: text }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Location"
                  value={updatedData.location}
                  onChangeText={text => setUpdatedData(prev => ({ ...prev, location: text }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Start Date (YYYY-MM-DD)"
                  value={updatedData.start_date}
                  onChangeText={text => setUpdatedData(prev => ({ ...prev, start_date: text }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="End Date (YYYY-MM-DD)"
                  value={updatedData.end_date}
                  onChangeText={text => setUpdatedData(prev => ({ ...prev, end_date: text }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Status"
                  value={updatedData.status}
                  onChangeText={text => setUpdatedData(prev => ({ ...prev, status: text }))}
                />

                {selectedOpportunity.opportunity_type === 'volunteer' && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Max Participants"
                      keyboardType="numeric"
                      value={updatedData.max_participants}
                      onChangeText={text => setUpdatedData(prev => ({ ...prev, max_participants: text }))}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Base Points"
                      keyboardType="numeric"
                      value={updatedData.base_points}
                      onChangeText={text => setUpdatedData(prev => ({ ...prev, base_points: text }))}
                    />
                  </>
                )}

                {selectedOpportunity.opportunity_type === 'job' && (
                  <TextInput
                    style={styles.input}
                    placeholder="Required Points"
                    keyboardType="numeric"
                    value={updatedData.required_points}
                    onChangeText={text => setUpdatedData(prev => ({ ...prev, required_points: text }))}
                  />
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleUpdate}>
                    <Text style={styles.btnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={closeModal}>
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}

            {modalType === 'changeStatus' && selectedOpportunity && (
              <View>
                <Text style={styles.modalTitle}>Change Status</Text>
                <TextInput
                  style={styles.input}
                  placeholder="New Status"
                  value={newStatus}
                  onChangeText={setNewStatus}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleChangeStatus}>
                    <Text style={styles.btnText}>Update</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.closeBtn]} onPress={closeModal}>
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
    </View>
     <BottomTabBar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  handleProfilePress={handleProfilePress}
/>
 </LayoutWithFilters>
    </View>
  );
};

export default OpportunityList;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#e8f5e9',  // أخضر فاتح هادي ومنعش
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
    color: '#2e7d32', // أخضر داكن للعنوان لتميزه
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  toggleBtn: {
    backgroundColor: '#43a047', // أخضر متوسط
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 30, // زوايا دائرية كبيرة للمظهر العصري
    marginBottom: 16,
    alignSelf: 'center',
    elevation: 5, // ظل لرفع البوتون بشكل جميل
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  toggleBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.8,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#81c784',  // أخضر فاتح للحدود
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    flex: 1,
    fontSize: 16,
    color: '#2e7d32',
    shadowColor: '#4caf50',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 7,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  cardImage: {
    width: '100%',
    height: 300,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    color: '#1b5e20',
    letterSpacing: 0.5,
  },
  skillsContainer: {
    marginTop: 12,
  },
  skillsTitle: {
    fontWeight: '700',
    marginBottom: 6,
    color: '#388e3c',
    fontSize: 16,
  },
  skillBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillBadge: {
    backgroundColor: '#a5d6a7',
    color: '#2e7d32',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    elevation: 2,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-around',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  detailsBtn: {
    backgroundColor: '#4caf50',
  },
  updateBtn: {
    backgroundColor: '#2e7d32',
  },
  deleteBtn: {
    backgroundColor: '#e53935',
  },
  restoreBtn: {
    backgroundColor: '#43a047',
  },
  btnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.7,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#c62828',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(46, 125, 50, 0.45)', // ظل أخضر شفاف
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    maxHeight: '90%',
    elevation: 12,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 18,
    color: '#1b5e20',
    textAlign: 'center',
    letterSpacing: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  saveBtn: {
    backgroundColor: '#388e3c',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  closeBtn: {
    backgroundColor: '#9e9e9e',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
});

