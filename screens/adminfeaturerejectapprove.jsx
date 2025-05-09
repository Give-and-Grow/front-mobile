import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Image } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from "../scripts/helpers/ipAddress";
const BASE_URL = `${ipAdd}:5000`;  // Replace with your backend URL

const adminfeaturerejectapprove = () => {
  const [organizations, setOrganizations] = useState([]);
  const [token, setToken] = useState(null);

  // Get token from AsyncStorage
  const getToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      setToken(storedToken);
      return storedToken || null;
    } catch (e) {
      console.error('Failed to retrieve token', e);
      return null;
    }
  };

  // Fetch pending organizations from the backend
  const fetchPendingOrganizations = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${ipAdd}:5000/admin/organizations/pending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setOrganizations(data);
      } else {
        console.error('Error fetching pending organizations:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Approve organization
  const approveOrganization = async (orgId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${ipAdd}:5000/admin/organizations/${orgId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      const text = await response.text();
      console.log('Response status:', response.status);
      console.log('Response body:', text);
  
      if (response.ok) {
        alert(`Organization ${orgId} approved.`);
        fetchPendingOrganizations();  // Re-fetch the pending list
      } else {
        console.error('Error approving organization:', text);
        alert(`Error approving organization: ${text}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Reject organization
  const rejectOrganization = async (orgId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${ipAdd}:5000/admin/organizations/${orgId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        alert(`Organization ${orgId} rejected.`);
        fetchPendingOrganizations();  // Re-fetch the pending list
      } else {
        console.error('Error rejecting organization:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchPendingOrganizations();  // Fetch pending organizations on load
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Admin Organization Management</Text>
        {organizations.length > 0 ? (
          organizations.map((org) => (
            <View key={org.id} style={styles.card}>
              {/* Header with name and date */}
              <View style={styles.cardHeader}>
                <Text style={styles.name}>{org.name}</Text>
                <Text style={styles.date}>{new Date(org.created_at).toLocaleDateString()}</Text>
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

              {/* Approve/Reject Buttons */}
              <View style={styles.buttonContainer}>
                <Button
                  title="✔️"
                  onPress={() => approveOrganization(org.id)}
                  color="#4CAF50"
                />
                <Button
                  title="❌"
                  onPress={() => rejectOrganization(org.id)}
                  color="#F44336"
                />
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noOrganizations}>No pending organizations.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
    backgroundColor: '#F0F4F8', // Calm background color
  },
  container: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 20,
    alignSelf: 'center',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginBottom: 10,
  },
  noOrganizations: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
    marginVertical: 30,
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
  date: {
    fontSize: 14,
    color: '#888',
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
  card: {
    backgroundColor: '#E8F5E9', // Light green background for card
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
});

export default adminfeaturerejectapprove;
