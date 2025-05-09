import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';

const AdminFetchAllOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Pending', value: 'pending' },
  ];

  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (storedToken) return storedToken;
      Alert.alert('Authentication Error', 'Token not found, please login again.');
      return null;
    } catch (e) {
      console.error('Failed to retrieve token', e);
      return null;
    }
  };

  const fetchOrganizations = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${ipAdd}:5000/admin/organizations/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOrganizations(data);
        setFilteredOrgs(data);
      } else {
        console.error('Error fetching organizations:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteOrganization = async (orgId) => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${ipAdd}:5000/admin/organizations/${orgId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Deleted', 'Organization deleted successfully.');
        fetchOrganizations();
      } else {
        const msg = data.error?.includes('foreign key')
          ? 'Organization has opportunities and cannot be deleted.'
          : 'Error deleting organization.';
        Alert.alert('Error', msg);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    let results = organizations.filter((org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filterStatus !== 'all') {
      results = results.filter((org) => org.proof_verification_status === filterStatus);
    }
    setFilteredOrgs(results);
  }, [searchQuery, filterStatus, organizations]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Organization Management</Text>

      {/* Search and Filter */}
      <View style={styles.searchFilterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownVisible(!isDropdownVisible)}
          >
            <Text style={styles.dropdownText}>
              {statusOptions.find((o) => o.value === filterStatus)?.label}
            </Text>
          </TouchableOpacity>

          {isDropdownVisible && (
            <View style={styles.dropdownMenu}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFilterStatus(option.value);
                    setDropdownVisible(false);
                  }}
                >
                  <Text>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Organization List */}
      {filteredOrgs.length > 0 ? (
        filteredOrgs.map((org) => (
          <View key={org.id} style={styles.card}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteOrganization(org.id)}
            >
              <Text style={styles.deleteButtonText}>🗑</Text>
            </TouchableOpacity>
                  <View style={styles.cardHeader}>
                                  <Text style={styles.name}>{org.name}</Text>
                               
                                </View>
            {/* Address, Phone and Industries with icons */}
                         <View style={styles.infoContainer}>
                           <Text style={styles.infoText}>📍 <Text style={styles.label}>Address:</Text> {org.address}</Text>
                           <Text style={styles.infoText}>📞 <Text style={styles.label}>Phone:</Text> {org.phone}</Text>
                           <Text style={styles.infoText}>🛠️ <Text style={styles.label}>Industries:</Text> {org.industries.map(ind => ind.name).join(', ')}</Text>
                         </View>
                     
                         {/* Description */}
                         <ScrollView style={styles.descriptionContainer}>
                           <Text style={styles.description}>📝 <Text style={styles.label}>Description:</Text> {org.description}</Text>
                         </ScrollView>

            <Text
              style={[
                styles.status,
                org.proof_verification_status === 'approved'
                  ? styles.approved
                  : org.proof_verification_status === 'rejected'
                  ? styles.rejected
                  : styles.pending,
              ]}
            >
              {org.proof_verification_status.toUpperCase()}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noResults}>No organizations match your search.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F7F9FB' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2E7D32' },
  searchFilterRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
    marginRight: 10,
  },
  dropdown: {
    padding: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: 140,
    height: 50,
    justifyContent: 'center',
  },
  dropdownText: { fontSize: 16 },
  dropdownMenu: {
    position: 'absolute',
    top: 55,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: 140,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  card: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  
    padding: 6,
    borderRadius: 20,
  },
  deleteButtonText: { color: '#fff', fontSize: 16 },
  orgName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 5,
  },
  orgDetail: { fontSize: 14, marginBottom: 4, color: '#555' },
  status: {
    marginTop: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  approved: { color: 'green' },
  rejected: { color: 'red' },
  pending: { color: '#f0a500' },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 30,
  },
  infoContainer: {
    marginVertical: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
  },
  label: {
    fontWeight: 'bold',
    color: '#388E3C',
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 15,
    lineHeight: 20,
  },
  descriptionContainer: {
    maxHeight: 100,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#388E3C',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#444',
    marginBottom: 4,
  },
});

export default AdminFetchAllOrganizations;
