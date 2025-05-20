import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ipAdd from '../scripts/helpers/ipAddress';
import LayoutWithFilters from './LayoutWithFiltersOrg';
import BottomTabBar from './BottomTabBar';
const OrganizationRejectAcceptUser = () => {
    const [activeTab, setActiveTab] = useState('orgrejectoraccept');
       const [filter, setFilter] = useState("manage_participants");         
            const handleProfilePress = () => {
              navigation.navigate('OrganizationRejectAcceptUser');
            };
  const [opportunities, setOpportunities] = useState([]);
  const [expandedOpportunityId, setExpandedOpportunityId] = useState(null);
  const [participantsMap, setParticipantsMap] = useState({}); // تخزين المشاركين لكل فرصة
  const [loading, setLoading] = useState(false);

  // جلب الفرص
  const fetchOpportunities = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.warn('No token found, please login first.');
        setOpportunities([]);
        return;
      }
      const res = await fetch(`${ipAdd}:5000/opportunities/organization`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data.opportunities)) {
        setOpportunities(data.opportunities);
      } else {
        setOpportunities([]);
        console.warn('Unexpected response format:', data);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setOpportunities([]);
    }
  };
  

  // جلب المشاركين لفرصة معينة
  const fetchParticipants = async (opportunityId) => {
    if (!opportunityId) return;
    setLoading(true);
    try {
        const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(
        `${ipAdd}:5000/org/opportunities/${opportunityId}/participants`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setParticipantsMap((prev) => ({
        ...prev,
        [opportunityId]: Array.isArray(data) ? data : [],
      }));
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipantsMap((prev) => ({ ...prev, [opportunityId]: [] }));
    } finally {
      setLoading(false);
    }
  };

  // تغيير حالة مشاركة
  const updateStatus = async (opportunityId, userId, status) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
      const res = await fetch(
        `${ipAdd}:5000/org/opportunities/${opportunityId}/participants/${userId}/status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const result = await res.json();
      Alert.alert('Success', result.message);
      // تحديث المشاركين بعد التغيير
      fetchParticipants(opportunityId);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // عند الضغط على كرت فرصة: توسيع أو تصغير
  const toggleExpand = (opportunityId) => {
    if (expandedOpportunityId === opportunityId) {
      setExpandedOpportunityId(null); // تصغير
    } else {
      setExpandedOpportunityId(opportunityId); // توسيع
      fetchParticipants(opportunityId); // جلب المشاركين
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);
  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  const renderParticipant = (item, opportunityId) => {
    const { status, user_id, user_name, user_profile_image } = item;
  
    return (
      
      <View key={user_id} style={styles.participantCard}>
        <Image
          source={{ uri: user_profile_image || 'https://via.placeholder.com/100' }}
          style={styles.participantImage}
        />
        <View style={styles.participantInfo}>
          <Text style={styles.participantName}>{user_name}</Text>
          <Text style={styles.participantStatus}>Status: {status}</Text>
          <View style={styles.buttons}>
            {status === 'accepted' && (
              <TouchableOpacity
                style={[styles.button, styles.reject]}
                onPress={() => updateStatus(opportunityId, user_id, 'rejected')}
              >
                <Icon name="cancel" size={20} color="#fff" />
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            )}
  
            {status === 'rejected' && (
              <TouchableOpacity
                style={[styles.button, styles.accept]}
                onPress={() => updateStatus(opportunityId, user_id, 'accepted')}
              >
                <Icon name="check-circle" size={20} color="#fff" />
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
            )}
  
            {status !== 'accepted' && status !== 'rejected' && (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.accept]}
                  onPress={() => updateStatus(opportunityId, user_id, 'accepted')}
                >
                  <Icon name="check-circle" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.reject]}
                  onPress={() => updateStatus(opportunityId, user_id, 'rejected')}
                >
                  <Icon name="cancel" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
       
      </View>
    
    );
  };
  

  const renderOpportunity = ({ item }) => {
    const isExpanded = item.id === expandedOpportunityId;
    const participants = participantsMap[item.id] || [];

    return (
      <View style={styles.opportunityCard}>
        <TouchableOpacity
          onPress={() => toggleExpand(item.id)}
          style={styles.opportunityHeader}
        >
          <Text style={styles.opportunityTitle}>{item.title}</Text>
          <Icon
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={28}
            color="#2e7d32"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.participantsContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#4caf50" />
            ) : participants.length === 0 ? (
              <Text style={{ textAlign: 'center', color: '#666' }}>
                No participants found.
              </Text>
            ) : (
              participants.map((p) => renderParticipant(p, item.id))
            )}
          </View>
        )}
      </View>
    );
    
  };

  return (
    <LayoutWithFilters onFilterSelect={handleFilterSelect} initialFilter="manage_participants">
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Volunteer Applications</Text>
        <FlatList
          data={opportunities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOpportunity}
          contentContainerStyle={{ paddingBottom: 20 }}
          scrollEnabled={false} // Scroll managed by ScrollView الرئيسي
        />
      </ScrollView>
  
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleProfilePress={handleProfilePress}
      />
       
    </View>
    </LayoutWithFilters>
  );
  
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f5e9',
      },
      content: {
        flex: 1,
        padding: 16,
      },
      title: {
        fontSize: 26,
        color: '#1b5e20',
        fontWeight: '900',
        marginBottom: 24,
        textAlign: 'center',
        textShadowColor: '#a5d6a7',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
      },
    opportunityCard: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      marginBottom: 18,
      shadowColor: '#388e3c',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    opportunityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 18,
      backgroundColor: '#a5d6a7',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      shadowColor: '#81c784',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
    },
    opportunityTitle: {
      fontSize: 20,
      color: '#1b5e20',
      fontWeight: 'bold',
    },
    participantsContainer: {
      borderTopWidth: 1,
      borderTopColor: '#c8e6c9',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#f0fff4',
    },
    participantCard: {
      flexDirection: 'row',
      backgroundColor: '#dcedc8',
      borderRadius: 12,
      padding: 14,
      marginVertical: 6,
      alignItems: 'center',
      shadowColor: '#7cb342',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 4,
    },
    participantImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 14,
      backgroundColor: '#aed581',
      borderWidth: 2,
      borderColor: '#558b2f',
      shadowColor: '#33691e',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
    },
    participantInfo: {
      flex: 1,
    },
    participantName: {
      fontSize: 17,
      color: '#2e7d32',
      fontWeight: '700',
      textShadowColor: '#a5d6a7',
      textShadowOffset: { width: 0.5, height: 0.5 },
      textShadowRadius: 1,
    },
    participantStatus: {
      fontSize: 14,
      color: '#33691e',
      marginVertical: 3,
      fontStyle: 'italic',
    },
    buttons: {
      flexDirection: 'row',
      // gap غير مدعوم بشكل رسمي في RN، بديلها marginRight في كل زر
      marginTop: 6,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 12,
      marginRight: 12,
      shadowColor: '#4caf50',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 5,
    },
    accept: {
      backgroundColor: '#43a047',
    },
    reject: {
      backgroundColor: '#e53935',
      shadowColor: '#e53935',
    },
    buttonText: {
      color: '#fff',
      marginLeft: 8,
      fontWeight: 'bold',
      fontSize: 15,
      letterSpacing: 0.5,
    },
  });
  

export default OrganizationRejectAcceptUser;
