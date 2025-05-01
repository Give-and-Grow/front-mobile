import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const OpportunitiesList = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        // Retrieve token from AsyncStorage
        const token = await AsyncStorage.getItem('userToken'); // Use 'userToken' or the key you're using

        if (!token) {
          setError('Token not found');
          setLoading(false);
          return;
        }

        console.log('Token:', token); // Check the token value

        const response = await axios.get('http://192.168.1.107:5000/opportunities/organization', {
          headers: {
            Authorization: `Bearer ${token}` // Use the retrieved token
          }
        });

        console.log('Response Data:', response.data); // Log the response to check data
        setOpportunities(response.data.opportunities);
      } catch (error) {
        setError('Failed to load opportunities');
        console.error('Error loading opportunities:', error); // Log the error
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []); // Empty dependency array means it runs once on mount

  if (loading) return <ActivityIndicator size="large" color="#2d6a4f" />;
  if (error) return <Text>{error}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Available Opportunities</Text>
      {opportunities.map((opportunity) => (
        <View key={opportunity.id} style={styles.card}>
          <Text style={styles.title}>{opportunity.title}</Text>
          <Text style={styles.description}>{opportunity.description}</Text>
          <Text style={styles.details}><Text style={styles.bold}>Opportunity Type:</Text> {opportunity.type}</Text>
          <Text style={styles.details}><Text style={styles.bold}>Status:</Text> {opportunity.status}</Text>
          <Button title="More" color="#2d6a4f" onPress={() => handleMorePress(opportunity.id)} />
        </View>
      ))}
    </ScrollView>
  );

  function handleMorePress(id) {
    Alert.alert(`Opportunity Details ${id}`, "You can add additional details or a link for more information.");
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eaf5e4',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d6a4f',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginVertical: 10,
  },
  details: {
    fontSize: 14,
    color: '#2d6a4f',
    marginVertical: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default OpportunitiesList;
