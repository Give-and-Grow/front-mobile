import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import FilterComponent from './FilterComponent';
import OpportunityFilters from './OpportunityFilters';
import BottomTabBar from './BottomTabBar';
import ipAdd from '../scripts/helpers/ipAddress';  
export default function VolunteerOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participationStatus, setParticipationStatus] = useState({});
  const [showMoreDetails, setShowMoreDetails] = useState({});
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) fetchOpportunities();
  }, [isFocused]);

  const fetchOpportunities = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    const response = await fetch(`${ipAdd}:5000/recommendations/opportunities?type=volunteer`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    const items = Array.isArray(data) ? data : data.opportunities || [];

    setOpportunities(items);
    setFilteredOpportunities(items);
    fetchParticipationStatuses(items);
  } catch (err) {
   // console.error(err);
    setError('Failed to load opportunities');
  } finally {
    setLoading(false);
  }
};

  const fetchParticipationStatuses = async (opps) => {
    const token = await AsyncStorage.getItem('userToken');
    const newStatus = {};
    for (const opp of opps) {
      try {
        const res = await fetch(`${ipAdd}:5000/user-participation/${opp.id}/is_participant`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        newStatus[opp.id] = data.status || 'not_joined';
      } catch {
        newStatus[opp.id] = 'error';
      }
    }
    setParticipationStatus(newStatus);
  };

  const handleJoin = async (opportunityId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${ipAdd}:5000/user-participation/${opportunityId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Joined successfully');
        setParticipationStatus(prev => ({ ...prev, [opportunityId]: 'joined' }));
      } else {
        Alert.alert('Error', data.msg || 'Failed to join');
      }
    } catch (err) {
      Alert.alert('Error', 'Join request failed');
    }
  };

  const handleLeave = async (opportunityId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(`${ipAdd}:5000/user-participation/${opportunityId}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Info', 'You have left the opportunity');
        setParticipationStatus(prev => ({ ...prev, [opportunityId]: 'not_joined' }));
      } else {
        Alert.alert('Error', data.msg || 'Failed to leave');
      }
    } catch (err) {
      Alert.alert('Error', 'Leave request failed');
    }
  };

  const toggleDetails = (id) => {
    setShowMoreDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>🌱 Volunteer Opportunities</Text>
        {loading ? (
          <ActivityIndicator size="large" color="green" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          filteredOpportunities.map((opp) => (
            <View key={opp.id} style={styles.card}>
              {opp.image_url && (
                <Image source={{ uri: opp.image_url }} style={styles.image} />
              )}
              <Text style={styles.cardTitle}>🎯 {opp.title}</Text>
              <Text>🏢 {opp.organization_name}</Text>
              <Text>🕓 {opp.start_time} - {opp.end_time}</Text>
              <Text>📍 {opp.location}</Text>
              <TouchableOpacity onPress={() => toggleDetails(opp.id)}>
                <Text style={styles.detailsBtn}>{showMoreDetails[opp.id] ? 'Hide Details ▲' : 'Show Details ▼'}</Text>
              </TouchableOpacity>
              {showMoreDetails[opp.id] && (
                <View>
                  <Text>📅 {opp.start_date} to {opp.end_date}</Text>
                  <Text>🛠️ Skills:</Text>
                  {opp.skills.map(skill => (
                    <Text key={skill.id} style={styles.badge}>💡 {skill.name}</Text>
                  ))}
                  <Text>Status: {opp.status.value}</Text>
                </View>
              )}
              <View style={styles.btnRow}>
                {opp.status === 'open' && !['accepted', 'pending'].includes(participationStatus[opp.id]) && (
                  <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(opp.id)}>
                    <Text style={styles.btnText}>Join</Text>
                  </TouchableOpacity>
                )}
                {participationStatus[opp.id] === 'pending' && (
                  <TouchableOpacity style={styles.leaveBtn} onPress={() => handleLeave(opp.id)}>
                    <Text style={styles.btnText}>Withdraw</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7', padding: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 },
  error: { color: 'red', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  image: { width: '100%', height: 150, borderRadius: 10, marginBottom: 10 },
  detailsBtn: { color: '#388e3c', marginTop: 8, fontWeight: 'bold' },
  badge: { backgroundColor: '#e0f2f1', padding: 4, borderRadius: 4, marginTop: 2 },
  btnRow: { flexDirection: 'row', marginTop: 10 },
  joinBtn: { backgroundColor: '#4caf50', padding: 10, borderRadius: 6 },
  leaveBtn: { backgroundColor: '#d32f2f', padding: 10, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold' },
});
