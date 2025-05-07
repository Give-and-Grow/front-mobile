import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import ipAdd from '../scripts/helpers/ipAddress';
const CreateTagAssigner = () => {
  const [opportunityId, setOpportunityId] = useState('5');
  const [tagsInput, setTagsInput] = useState('');
  const [message, setMessage] = useState('');
  const [isOrganization, setIsOrganization] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      const storedToken = await getTokenFromStorage();
      if (!storedToken) {
        console.log('Token not found!');
        Alert.alert('Error', 'Token not found.');
        return;
      }

      setToken(storedToken);
      console.log('Token retrieved:', storedToken); // Verify stored token

      try {
        const decoded = jwt_decode(storedToken);
        setIsOrganization(decoded.role === 'organization');
      } catch (err) {
        console.error('Invalid token format:', err);
        Alert.alert('Error', 'Invalid token.');
      }
    };

    getToken();
  }, []);

  const getTokenFromStorage = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token || null;
    } catch (e) {
      console.error('Failed to retrieve token', e);
      return null;
    }
  };

  const assignTags = async () => {
    if (!isOrganization) {
      Alert.alert('Permission Denied', 'Only organization accounts can assign tags.');
      return;
    }

    try {
      const tagsArray = tagsInput.split(',').map(tag => tag.trim().toLowerCase());

      const response = await axios.post(
       `${ipAdd}:5000/tags/assign/${opportunityId}`,
        { tags: tagsArray },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage(response.data.message || 'Tags assigned successfully.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Something went wrong.');
    }
  };

  if (!isOrganization) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Access Denied</Text>
        <Text style={styles.message}>Only organizations can assign tags.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Tags to Opportunity</Text>

      <Text style={styles.label}>Opportunity ID:</Text>
      <TextInput
        style={styles.input}
        value={opportunityId}
        onChangeText={setOpportunityId}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Tags (comma-separated):</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. education, remote"
        value={tagsInput}
        onChangeText={setTagsInput}
      />

      <TouchableOpacity style={styles.button} onPress={assignTags}>
        <Text style={styles.buttonText}>Assign Tags</Text>
      </TouchableOpacity>

      {message !== '' && <Text style={message.includes('success') ? styles.successMessage : styles.errorMessage}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Fill the screen
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
    padding: 20,
    backgroundColor: '#f2fdf2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    color: '#2e8b57',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2e8b57',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 5,
    marginBottom: 10,
    fontSize: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#2e8b57',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  message: {
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  successMessage: {
    color: 'green',
  },
  errorMessage: {
    color: 'red',
  },
});

export default CreateTagAssigner;
