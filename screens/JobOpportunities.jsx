import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import ipAdd from '../scripts/helpers/ipAddress'; 
import ScreenLayout from '../screens/ScreenLayout'; 
import BottomTabBar from './BottomTabBar';
export default function JobOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summaries, setSummaries] = useState({});
  const [summaryLoading, setSummaryLoading] = useState({});
  const [participationStatus, setParticipationStatus] = useState({});
  const [showMoreDetails, setShowMoreDetails] = useState({});
  const [activeTab, setActiveTab] = useState('JobOpportunities');
   const [filter, setFilter] = useState("Jobs");
  const handleProfilePress = () => {
    navigation.navigate('JobOpportunities');
  
  }; 
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${ipAdd}:5000/recommendations/opportunities?type=job`, { headers });
        const data = await res.json();

        if (res.ok) {
          const list = Array.isArray(data) ? data : data.opportunities || [];
          setOpportunities(list);
          setFilteredOpportunities(list);
        } else {
          setError(data.msg || 'Failed to fetch opportunities');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  useEffect(() => {
    const fetchParticipationStatus = async () => {
      const token = await AsyncStorage.getItem("userToken");
      const statusMap = {};
      for (const opp of opportunities) {
        try {
          const res = await fetch(`${ipAdd}:5000/user-participation/${opp.id}/is_participant`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await res.json();
          statusMap[opp.id] = data.status || 'not_joined';
        } catch {
          statusMap[opp.id] = 'error';
        }
      }
      setParticipationStatus(statusMap);
    };

    if (opportunities.length > 0) fetchParticipationStatus();
  }, [opportunities]);

  const fetchSummary = async (id) => {
    if (summaries[id]) return summaries[id];

    const token = await AsyncStorage.getItem("userToken");
    if (!token) return Alert.alert('Please login first');

    setSummaryLoading((prev) => ({ ...prev, [id]: true }));

    try {
      const res = await fetch(`${ipAdd}:5000/opportunities/summary/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.summary) {
        setSummaries((prev) => ({ ...prev, [id]: data.summary }));
      } else {
        Alert.alert(data.msg || 'Failed to fetch summary');
      }
    } catch {
      Alert.alert('An error occurred while fetching summary');
    } finally {
      setSummaryLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleJoin = async (id) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${ipAdd}:5000/user-participation/${id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('✅ Joined successfully!');
        setParticipationStatus((prev) => ({ ...prev, [id]: 'joined' }));
      } else {
        Alert.alert(data.msg || 'Failed to join');
      }
    } catch {
      Alert.alert('Failed to join the opportunity');
    }
  };

  const handleLeave = async (id) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await fetch(`${ipAdd}:5000/user-participation/${id}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('❌ Left successfully!');
        setParticipationStatus((prev) => ({ ...prev, [id]: 'not_joined' }));
      } else {
        Alert.alert(data.msg || 'Failed to leave');
      }
    } catch {
      Alert.alert('Failed to leave the opportunity');
    }
  };
  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  return (
      <ScreenLayout onFilterSelect={handleFilterSelect} initialFilter="All">
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🌱 Job Opportunities</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        filteredOpportunities.map((opp) => (
          <View key={opp.id} style={styles.card}>
            {opp.image_url && <Image source={{ uri: opp.image_url }} style={styles.image} />}
            <Text style={styles.cardTitle}>🎯 {opp.title}</Text>
            <Text>🏢 {opp.organization_name || opp.organization_id}</Text>
            <Text>🕓 {opp.start_time} - {opp.end_time}</Text>
            <Text>📝 {opp.description}</Text>

            {summaryLoading[opp.id] ? (
              <ActivityIndicator size="small" color="#388e3c" />
            ) : summaries[opp.id] ? (
              <View style={styles.summaryBox}>
                <Text style={styles.summaryTitle}>📌 Summary:</Text>
                <Text>{summaries[opp.id].summary}</Text>
              </View>
            ) : (
              <TouchableOpacity onPress={() => fetchSummary(opp.id)}>
                <Text style={styles.link}>✨ View Summary</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setShowMoreDetails(prev => ({ ...prev, [opp.id]: !prev[opp.id] }))}>
              <Text style={styles.link}>{showMoreDetails[opp.id] ? 'Hide Details ▲' : 'Show Details ▼'}</Text>
            </TouchableOpacity>

            {showMoreDetails[opp.id] && (
              <View>
                <Text>📆 Days: {opp.volunteer_days.join(', ')}</Text>
                <Text>📍 {opp.location}</Text>
                <Text>🎯 {opp.opportunity_type}</Text>
                <Text>🛠️ {opp.skills.map(s => s.name).join(', ')}</Text>
                <Text>📅 Start: {opp.start_date}</Text>
                <Text>📅 End: {opp.end_date}</Text>
                <Text>✉️ {opp.contact_email}</Text>
              </View>
            )}

            {opp.status === 'filled' ? (
              <Text style={styles.full}>Full</Text>
            ) : opp.status === 'open' ? (
              participationStatus[opp.id] === 'accepted' ? (
                <Text style={styles.accepted}>Accepted</Text>
              ) : participationStatus[opp.id] === 'rejected' ? (
                <Text style={styles.rejected}>Rejected</Text>
              ) : participationStatus[opp.id] === 'pending' ? (
                <TouchableOpacity onPress={() => handleLeave(opp.id)}>
                  <Text style={styles.leave}>Withdraw</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => handleJoin(opp.id)}>
                  <Text style={styles.join}>Join</Text>
                </TouchableOpacity>
              )
            ) : (
              <Text style={styles.closed}>Closed</Text>
            )}
          
          </View>
        ))
      )}
       
    </ScrollView>
     <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleProfilePress={handleProfilePress}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0fdf4' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32', marginBottom: 16 },
  card: { backgroundColor: '#fff', padding: 16, marginBottom: 12, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8 },
  link: { color: '#2e7d32', fontWeight: 'bold', marginTop: 8 },
  summaryBox: { backgroundColor: '#e8f5e9', padding: 10, borderRadius: 10, marginTop: 8 },
  summaryTitle: { color: '#2e7d32', fontWeight: 'bold' },
  join: { color: '#fff', backgroundColor: '#4CAF50', textAlign: 'center', padding: 8, borderRadius: 8, marginTop: 8 },
  leave: { color: '#fff', backgroundColor: '#e53935', textAlign: 'center', padding: 8, borderRadius: 8, marginTop: 8 },
  accepted: { color: '#388e3c', marginTop: 8, fontWeight: 'bold' },
  rejected: { color: '#d32f2f', marginTop: 8, fontWeight: 'bold' },
  full: { color: '#999', marginTop: 8 },
  closed: { color: '#555', marginTop: 8 },
  error: { color: 'red', marginBottom: 10 },
});