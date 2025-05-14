/*import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native';
import axios from 'axios';
import ipAdd from '../scripts/helpers/ipAddress';
const TagsList = ({ opportunityId }) => { // تأكد من تمرير الـ opportunityId كـ prop
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // استرجاع البيانات من الـ API
    const fetchTags = async () => {
      try {
        // تغيير الـ URL ليأخذ الـ opportunityId
        const response = await axios.get(`${ipAdd}:5000/tags/opportunity/${opportunityId}`);
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, [opportunityId]); // التحديث عند تغيير الـ opportunityId

  const renderTagItem = ({ item }) => (
    <TouchableOpacity style={styles.tagItem} onPress={() => handleTagPress(item)}>
      <Text style={styles.tagName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleTagPress = (tag) => {
    setSelectedTag(tag);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTag(null);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tags}
        renderItem={renderTagItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {selectedTag && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tag Details</Text>
              <View style={styles.modelBody}>
                <Text style={styles.modelLabel}>ID:</Text>
                <Text style={styles.modelText}>{selectedTag.id}</Text>
              </View>
              <View style={styles.modelBody}>
                <Text style={styles.modelLabel}>Name:</Text>
                <Text style={styles.modelText}>{selectedTag.name}</Text>
              </View>
              <Button title="Close" onPress={closeModal} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  tagItem: {
    padding: 15,
    backgroundColor: '#4caf50',
    marginBottom: 10,
    borderRadius: 5,
  },
  tagName: {
    color: '#fff',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modelBody: {
    marginBottom: 10,
    width: '100%',
  },
  modelLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modelText: {
    fontSize: 16,
    color: '#333',
  },
});

export default TagsList;
*/
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert,
  Image, Modal
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ipAdd from '../scripts/helpers/ipAddress';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FollowingScreen = ({ navigation }) => {
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    const getTokenAndFetch = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          setToken(savedToken);
          fetchProfile(savedToken);
          fetchPosts(savedToken);
          fetchFollowers(savedToken);
          fetchFollowing(savedToken);
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };
    getTokenAndFetch();
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(res.data);
    } catch (err) {
      console.error('Profile error:', err);
    }
  };

  const fetchPosts = async (token) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/posts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data || []);
    } catch (err) {
      console.error('Posts error:', err);
    }
  };

  const fetchFollowers = async (token) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/follow/followers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowers(res.data);
    } catch (err) {
      console.error('Followers error:', err);
    }
  };

  const fetchFollowing = async (token) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/follow/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowing(res.data);
    } catch (err) {
      console.error('Following error:', err);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const res = await axios.delete(`${ipAdd}:5000/follow/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setFollowing((prev) => prev.filter((user) => user.id !== userId));
        setFollowers((prev) => prev.filter((user) => user.id !== userId));
        Alert.alert('Success', 'Unfollowed successfully');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        {item.profile_picture ? (
          <Image source={{ uri: item.profile_picture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.username[0].toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.username}>{item.username}</Text>
      </View>
      <TouchableOpacity onPress={() => handleUnfollow(item.id)} style={styles.unfollowBtn}>
        <Text style={styles.unfollowText}>Unfollow</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostItem = ({ item }) => (
    <View style={styles.postCard}>
      <Text style={styles.postTitle}>{item.title}</Text>
      {item.images.length > 0 && (
        <View style={styles.postImages}>
          {item.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.postImage} />
          ))}
        </View>
      )}
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.reactions}>
        <Ionicons name="heart-outline" size={20} color="#ff4d4d" />
        <Ionicons name="chatbox-outline" size={20} color="#4CAF50" />
      </View>
    </View>
  );
  

  return (
    <View style={styles.container}>
  <View style={styles.profileHeader}>
  <View style={styles.profileInfo}>
    {userData?.profile_picture ? (
      <Image source={{ uri: userData.profile_picture }} style={styles.avatarBig} />
    ) : (
      <View style={styles.avatarPlaceholderBig}>
        <Text style={styles.avatarTextBig}>{userData?.username?.[0].toUpperCase()}</Text>
      </View>
    )}
    
    <Text style={styles.usernameBig}>{userData?.username}</Text>
    <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
    
    <Ionicons name="settings-outline" size={24} color="#333" />
  </TouchableOpacity>
    <View style={styles.followStats}>
      <View style={styles.followStat}>
        <Text style={styles.followLabel}>Followers</Text>
        <View style={styles.actionButtons}>   
  </View>
        <Text style={styles.followCount}>{followers.length}</Text>
        <TouchableOpacity onPress={() => { setModalType('followers'); setModalVisible(true); }} style={styles.iconButton}>
      <Ionicons name="people-circle-outline" size={30} color="#333" />
    </TouchableOpacity>
      </View>
      <Text style={styles.followLabel}>               </Text>
      <View style={styles.followStat}>
        <Text style={styles.followLabel}>Following</Text>
        <Text style={styles.followCount}>{following.length}</Text>
        <TouchableOpacity onPress={() => { setModalType('following'); setModalVisible(true); }} style={styles.iconButton}>
      <Ionicons name="person-add-outline" size={30} color="#333" />
    </TouchableOpacity>
      </View>
    </View>
    <View style={styles.bioContainer}>
      <View style={styles.bioRow}>
        <Icon name="edit-note" size={20} color="#2e7d32" style={styles.bioIcon} />
        <Text style={styles.bioText}>{userData?.bio || 'No bio available'}</Text>
      </View>
    </View>
  </View>

  

 
</View>



    
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        style={styles.postList}
      />

     

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalType === 'followers' ? 'Followers' : 'Following'}
            </Text>
            <FlatList
              data={modalType === 'followers' ? followers : following}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id.toString()}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9', padding: 10 },
 
  avatarBig: { width: 60, height: 60, borderRadius: 30 },
  avatarPlaceholderBig: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#c8e6c9', alignItems: 'center', justifyContent: 'center'
  },
  avatarTextBig: { fontSize: 24, color: '#388e3c' },
  usernameBig: { fontSize: 20, fontWeight: 'bold' },
  bio: { textAlign: 'center', marginVertical: 10, color: '#555' },
  postCard: {
    backgroundColor: '#E8F5E9', borderRadius: 10,
    padding: 10, marginBottom: 10,
  },
  

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff', padding: 20, borderRadius: 15,
    width: '80%', maxHeight: '70%'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  userCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f0f0f0', padding: 10, marginVertical: 5, borderRadius: 10,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#d0e8d0',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  avatarText: { fontSize: 18, color: '#2e7d32' },
  username: { fontSize: 16, fontWeight: '500' },
  unfollowBtn: { backgroundColor: '#e57373', padding: 5, borderRadius: 5 },
  unfollowText: { color: '#fff', fontWeight: 'bold' },
  closeBtn: { marginTop: 10, alignItems: 'center' },
  closeText: { color: '#4CAF50', fontSize: 16 },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
  },
  postImages: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6, // for better spacing between images
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 20,
  },
  bioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bioText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'left',
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bioIcon: {
    marginRight: 6,
  },

 
  profileHeader: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between', 
    marginBottom: 10,
    padding: 10, 
    backgroundColor: '#fff', 
    borderRadius: 10,
  },
  
  profileInfo: {
    flex: 1,
    paddingLeft: 10,
    alignItems: 'center',
  },
  
  followText: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    fontWeight: '500',
  },
  
  actionButtons: {
    flexDirection: 'row', 
    gap: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconButton: {
    padding: 10, // for better touch area
  },
  followStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  
  followStat: {
    alignItems: 'center',
  },
  
  followLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  
  followCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
  },
  

});

export default FollowingScreen;



