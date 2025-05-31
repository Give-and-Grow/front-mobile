import React, { useEffect, useState } from 'react';
//import * as FileSystem from 'expo-file-system';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';
import ScreenLayout from '../screens/ScreenLayout';
import BottomTabBar from './BottomTabBar';

const ApplicationsScreen = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('application');
  const navigation = useNavigation();

  useEffect(() => {
    const loadTokenAndFetch = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        console.log('✅ Retrieved token:', storedToken);
        setToken(storedToken);
        if (storedToken) {
          await fetchApplications(storedToken);
        }
      } catch (err) {
        console.error('❌ Error retrieving token:', err);
        setLoading(false);
      }
    };

    loadTokenAndFetch();
  }, []);

  const fetchApplications = async (authToken) => {
    try {
      console.log('📡 Fetching applications with token:', authToken);
      const res = await axios.get(`${ipAdd}:5000/user-participation/applications`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('✅ Applications fetched:', JSON.stringify(res.data, null, 2));
      setApplications(res.data);
    } catch (err) {
      console.error('❌ Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    console.log('🧾 Rendering application item:', item);

    const today = new Date();
    const endDate = new Date(item.opportunity.end_date);
    const showCertificateButton = item.certificate && endDate < today;


    console.log('📅 Dates - Today:', today, '| End Date:', endDate);
    console.log('🎯 Conditions -item.certificate  :', item.certificate , '| showCertificateButton:', showCertificateButton);

    const downloadCertificate = (applicationId, token) => {
  Alert.alert(
    "Confirm Download",
    "Do you want to download the certificate?",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "OK",
        onPress: async () => {
          try {
            await axios.get(
              `http://127.0.0.1:5000/certificates/download-certificate/${applicationId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert("Success", "The certificate has been sent to your email.");
          } catch (error) {
            console.error(error);
            Alert.alert("Error", "An error occurred while sending the certificate.");
          }
        }
      }
    ],
    { cancelable: false }
  );
};
    
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Icon name="briefcase-outline" size={24} color="#2e7d32" />
          <Text style={styles.title}>{item.opportunity.title}</Text>
        </View>
        <Text style={styles.description}>{item.opportunity.description}</Text>
        <Text style={styles.date}>
          From {item.opportunity.start_date} to {item.opportunity.end_date}
        </Text>
        <Text style={styles.status}>Status: {item.status}</Text>

        {item.can_evaluate && (
          <TouchableOpacity
            style={styles.evaluateButton}
            onPress={() =>
              navigation.navigate('EvaluateScreen', { participantId: item.id })
            }
          >
            <Text style={styles.evaluateText}>Evaluate Opportunity</Text>
            <Icon name="star-check" size={20} color="#fff" />
          </TouchableOpacity>
        )}

       {showCertificateButton && (
          <TouchableOpacity
            style={[styles.evaluateButton, { backgroundColor: '#388e3c', marginTop: 10 }]}
            onPress={downloadCertificate}
          >
            <Text style={styles.evaluateText}>Download Certificate</Text>
            <Icon name="download" size={20} color="#fff" />
          </TouchableOpacity>
       )}
      </View>
    );
  };

  const handleProfilePress = () => {
    navigation.navigate('ApplicationsScreen');
  };

  const handleFilterSelect = (selectedFilter) => {
    console.log('🔍 Filter selected:', selectedFilter);
  };

  return (
    <ScreenLayout onFilterSelect={handleFilterSelect} initialFilter="Eval">
      <View style={styles.container}>
        <Text style={styles.screenTitle}>My Applications</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2e7d32" />
        ) : (
          <FlatList
            data={applications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleProfilePress={handleProfilePress}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#2e7d32',
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 8,
  },
  evaluateButton: {
    backgroundColor: '#66bb6a',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  evaluateText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ApplicationsScreen;
