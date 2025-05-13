import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Image, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';
import { Ionicons } from '@expo/vector-icons';

const FollowingScreen = ({ navigation }) => {
  const [peopleToFollow, setPeopleToFollow] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [token, setToken] = useState('');
  const [viewFollowers, setViewFollowers] = useState(false);
  const [userData, setUserData] = useState(null);  // State for user profile data
  const [isModalVisible, setIsModalVisible] = useState(false); // For showing modals
  const [modalType, setModalType] = useState(''); // To track which modal to show ('followers' or 'following')

  // Fetch user data and other related data when token is available
  const fetchProfile = async (token) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setUserData(res.data); // Assuming the response data is structured correctly
      } else {
        console.error('Profile data is empty');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  useEffect(() => {
    const getToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          setToken(savedToken);
          fetchProfile(savedToken);  // Now this function is defined
        }
      } catch (err) {
        console.error('Error retrieving token:', err);
      }
    };

    getToken();
  }, []); // Only runs once when the component mounts

  // Fetch people to follow and followers once token is set
  useEffect(() => {
    if (token) {
      // Fetch people to follow
      const fetchPeople = async () => {
        try {
          const response = await axios.get(`${ipAdd}:5000/follow/following`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setPeopleToFollow(response.data);
        } catch (error) {
          console.error('Error fetching people:', error);
          Alert.alert('Error', 'Failed to fetch people data.');
        }
      };

      // Fetch followers
      const fetchFollowers = async () => {
        try {
          const response = await axios.get(`${ipAdd}:5000/follow/followers`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setFollowers(response.data);
        } catch (error) {
          console.error('Error fetching followers:', error);
          Alert.alert('Error', 'Failed to fetch followers data.');
        }
      };

      fetchPeople();
      fetchFollowers();
    }
  }, [token]);  // Runs only when token is set

  // Unfollow handler
  const handleUnfollow = async (personId) => {
    try {
      const response = await axios.delete(`${ipAdd}:5000/follow/${personId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Unfollowed successfully!');
        setPeopleToFollow((prevState) =>
          prevState.filter((person) => person.id !== personId)
        );
      } else {
        Alert.alert('Error', 'Failed to unfollow.');
      }
    } catch (error) {
      console.error('Unfollow error:', error);
      Alert.alert('Error', 'Failed to connect to the server.');
    }
  };

  // Render list item
  const renderItem = ({ item }) => (
    <View style={styles.personCard}>
      <View style={styles.profileContainer}>
        {item.profile_picture ? (
          <Image source={{ uri: item.profile_picture }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.initials}>{item.username.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.personName}>{item.username}</Text>
      </View>
      {modalType === 'followers' && (
        <TouchableOpacity
          style={styles.unfollowButton}
          onPress={() => handleUnfollow(item.id)}
        >
          <Text style={styles.unfollowButtonText}>Unfollow</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        {userData?.profile_picture ? (
          <Image source={{ uri: userData.profile_picture }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.initials}>{userData?.username?.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.userName}>{userData?.username}</Text>
        <Text style={styles.bio}>{userData?.bio || 'No bio available'}</Text>
      </View>

      {/* Icons to toggle between modals */}
      <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={() => {
            setModalType('followers');
            setIsModalVisible(true);
          }}
        >
          <Ionicons name="people-circle-outline" size={30} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setModalType('following');
            setIsModalVisible(true);
          }}
        >
          <Ionicons name="person-add-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Modal to show either followers or following */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'followers' ? 'People Following You' : 'People You Are Following'}
            </Text>

            <FlatList
              data={modalType === 'followers' ? followers : peopleToFollow}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  bio: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personName: {
    fontSize: 18,
    color: '#333',
  },
  unfollowButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginLeft: 15,
  },
  unfollowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FollowingScreen;
