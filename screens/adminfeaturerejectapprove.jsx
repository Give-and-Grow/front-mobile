import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LayoutWithFiltersAdmin from './LayoutWithFiltersAdmin';
import ipAdd from "../scripts/helpers/ipAddress";
import BottomTabBar from './BottomTabBar';

const API_BASE = `${ipAdd}:5000`;

export default function AdminFeatureRejectApprove({ navigation }) {
  const [users, setUsers] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rerejectapprove');

  const fetchData = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    try {
      const [userRes, orgRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/users/identity`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/admin/organizations/proof`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUsers(userRes.data);
      setOrgs(orgRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (id, type, status) => {
    const token = await AsyncStorage.getItem('token');
    const url =
      type === 'user'
        ? `${API_BASE}/admin/users/identity/${id}/verification`
        : `${API_BASE}/admin/organizations/proof/${id}/status`;

    try {
      await axios.put(
        url,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error.response?.data || error);
    }
  };

  const statusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'pending':
        return styles.statusPending;
      default:
        return styles.statusDefault;
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('adminfeaturerejectapprove');
  };

  useEffect(() => {
    fetchData();
  }, []);
 const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  return (
    <View style={{ flex: 1 }}>
        <LayoutWithFiltersAdmin onFilterSelect={handleFilterSelect} initialFilter="approve_reject">
      <View style={styles.container}>
        {/* Filters */}
        <View style={styles.filterWrapper}>
          {['all', 'users', 'orgs'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterOption, filter === f && styles.filterOptionActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterOptionText, filter === f && styles.filterOptionTextActive]}>
                {f === 'all' ? 'All' : f === 'users' ? 'Users' : 'Organizations'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 20 }} />}

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Users Section */}
          {(filter === 'all' || filter === 'users') && (
            <>
              <Text style={styles.sectionTitle}>User Identity Verification</Text>
              {users.length === 0 ? (
                <Text style={styles.noData}>No users data available.</Text>
              ) : (
                users.map((user) => (
                  <View key={user.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{user.full_name}</Text>
                    <Text style={styles.cardText}>City: {user.city || 'Not specified'}</Text>
                    <Text style={styles.cardText}>Gender: {user.gender}</Text>
                    <Text style={styles.cardText}>
                      Status:{' '}
                      <Text style={[styles.status, statusStyle(user.verification_status)]}>
                        {user.verification_status}
                      </Text>
                    </Text>
                   {user.identity_picture ? (
  <Image
    source={{ uri: user.identity_picture }}
    style={styles.idImage}
    resizeMode="contain"
  />
) : (
  <Text style={styles.noImage}>No ID image</Text>
)}

                    <View style={styles.btnGroup}>
                      <TouchableOpacity
                        style={[styles.btn, styles.approveBtn]}
                        onPress={() => updateStatus(user.id, 'user', 'approved')}
                      >
                        <Icon name="check-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.btnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btn, styles.rejectBtn]}
                        onPress={() => updateStatus(user.id, 'user', 'rejected')}
                      >
                        <Icon name="times-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.btnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}

          {/* Orgs Section */}
          {(filter === 'all' || filter === 'orgs') && (
            <>
              <Text style={styles.sectionTitle}>Organization Proof Verification</Text>
              {orgs.length === 0 ? (
                <Text style={styles.noData}>No organizations data available.</Text>
              ) : (
                orgs.map((org) => (
                  <View key={org.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{org.name}</Text>
                    <Text style={styles.cardText}>Address: {org.address}</Text>
                    <Text style={styles.cardText}>Phone: {org.phone}</Text>
                    <Text style={styles.cardText}>
                      Status:{' '}
                      <Text style={[styles.status, statusStyle(org.verification_status)]}>
                        {org.verification_status}
                      </Text>
                    </Text>
                    {org.proof_image ? (
                      <Image
                        source={{ uri: org.proof_image }}
                        style={styles.idImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.noImage}>No proof image</Text>
                    )}
                    <View style={styles.btnGroup}>
                      <TouchableOpacity
                        style={[styles.btn, styles.approveBtn]}
                        onPress={() => updateStatus(org.id, 'org', 'approved')}
                      >
                        <Icon name="check-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.btnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.btn, styles.rejectBtn]}
                        onPress={() => updateStatus(org.id, 'org', 'rejected')}
                      >
                        <Icon name="times-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.btnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </>
          )}
        </ScrollView>
      </View>

      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleProfilePress={handleProfilePress}
      />
      </LayoutWithFiltersAdmin>
    </View>
      
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#16a34a',
    marginHorizontal: 6,
  },
  filterOptionActive: {
    backgroundColor: '#16a34a',
  },
  filterOptionText: {
    color: '#16a34a',
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 10,
    textAlign: 'center',
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#059669',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 15,
    color: '#065f46',
    marginBottom: 4,
  },
  status: {
    fontWeight: '700',
  },
  statusApproved: {
    color: '#16a34a',
  },
  statusRejected: {
    color: '#dc2626',
  },
  statusPending: {
    color: '#d97706',
  },
  statusDefault: {
    color: '#374151',
  },
  idImage: {
    width: '100%',
    height: 180,
    marginVertical: 12,
    borderRadius: 12,
  },
  noImage: {
    fontStyle: 'italic',
    color: '#6b7280',
    marginVertical: 12,
  },
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  approveBtn: {
    backgroundColor: '#16a34a',
  },
  rejectBtn: {
    backgroundColor: '#dc2626',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
