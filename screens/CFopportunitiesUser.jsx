import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import ipAdd from "../scripts/helpers/ipAddress";
import ScreenLayout from '../screens/ScreenLayout';
import BottomTabBar from './BottomTabBar';
const CFOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participationStatus, setParticipationStatus] = useState({});
 const handleProfilePress = () => {
    navigation.navigate('CFOpportunities');
  
  };
  const [activeTab, setActiveTab] = useState('CFopp');
  useEffect(() => {
    const fetchTokenAndOpportunities = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) return;

        const response = await axios.get(`${ipAdd}:5000/recommendations/CFopportunities`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        setOpportunities(response.data);
        response.data.forEach((opportunity) => fetchParticipationStatus(opportunity.id, storedToken));
      } catch (error) {
        console.error('Error fetching CF opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenAndOpportunities();
  }, []);

  const fetchParticipationStatus = async (id, token) => {
    try {
      const response = await fetch(
        `${ipAdd}:5000/opportunity-participants/opportunities/${id}/check-participation`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setParticipationStatus((prev) => ({
        ...prev,
        [id]: data.is_participating ? 'joined' : 'not joined',
      }));
    } catch (error) {
      console.error('Error checking participation:', error);
    }
  };

  const handleJoinOpportunity = async (jobId) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return Alert.alert('Error', 'Please login first');
  
    try {
      // لاحظ أني أزلت body لأن غالباً الراوت لا يحتاجه، إذا كان يحتاجه رجعها
      const response = await fetch(`${ipAdd}:5000/opportunity-participants/opportunities/${jobId}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // body: JSON.stringify({ opportunity_id: jobId }), // احتمال ما تحتاجها
      });
  
      const data = await response.json();
  
      console.log('Join response status:', response.status);
      console.log('Join response data:', data);
  
      if (response.ok) {
        Alert.alert('Success', 'You joined this volunteer opportunity');
        setParticipationStatus((prev) => ({
          ...prev,
          [jobId]: 'joined',
        }));
      } else {
        if (data.msg && data.msg.includes('Volunteer settings not found')) {
          Alert.alert('Volunteer Settings Missing', 'Please complete your volunteer profile first.');
        } else if (data.message) {
          Alert.alert('Error', data.message);
        } else if (data.msg) {
          Alert.alert('Error', data.msg);
        } else {
          Alert.alert('Error', 'Failed to join');
        }
      }
    } catch (err) {
      console.error('Join error:', err);
      Alert.alert('Error', 'Something went wrong while joining');
    }
  };
  
  const handleWithdrawOpportunity = async (id) => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return Alert.alert('Error', 'Please login first');

    try {
      const response = await fetch(`${ipAdd}:5000/opportunity-participants/opportunities/${id}/withdraw`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'You withdrew from this opportunity');
        setParticipationStatus((prev) => ({
          ...prev,
          [id]: 'not joined',
        }));
      } else {
        Alert.alert('Error', 'Failed to withdraw');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong while withdrawing');
    }
  };

  const renderItem = ({ item }) => {
    const status = participationStatus[item.id];

    return (
      <View style={styles.card}>
        <Text style={styles.title}>
          <Icon name="briefcase" size={18} color="#2f855a" /> {item.title}
        </Text>
        <Text style={styles.info}><Icon name="map-marker" size={16} /> {item.location}</Text>
        <Text style={styles.info}><Icon name="calendar" size={16} /> {item.start_date} - {item.end_date}</Text>
        <Text style={styles.info}><Icon name="envelope" size={16} /> {item.contact_email}</Text>

        <Text style={styles.label}>Skills:</Text>
        {item.skills.map((skill, index) => (
          <Text key={index} style={styles.skill}>• {skill}</Text>
        ))}

        <Text style={styles.label}>Tags:</Text>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <Text key={index} style={styles.tag}>#{tag}</Text>
          ))}
        </View>

        <Text style={styles.description}>
          {item.description.substring(0, 150)}...
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: status === 'joined' ? '#e53e3e' : '#38a169' },
          ]}
          onPress={() =>
            status === 'joined'
              ? handleWithdrawOpportunity(item.id)
              : handleJoinOpportunity(item.id)
          }
        >
          <Text style={styles.buttonText}>
            {status === 'joined' ? 'Withdraw' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#38a169" />
      </View>
    );
  }

  return (
    <ScreenLayout initialFilter="CF">
      <FlatList
        data={opportunities}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        ListHeaderComponent={<Text style={styles.header}>Recommended Opportunities</Text>}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />
       <View>
    <BottomTabBar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  handleProfilePress={handleProfilePress}
/>
    </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0fff4',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#276749',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f855a',
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: '#4a5568',
    marginVertical: 2,
  },
  label: {
    fontWeight: 'bold',
    color: '#2f855a',
    marginTop: 8,
  },
  skill: {
    color: '#2d3748',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#c6f6d5',
    color: '#22543d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginTop: 4,
    fontSize: 12,
  },
  description: {
    marginTop: 8,
    color: '#2d3748',
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CFOpportunities;
