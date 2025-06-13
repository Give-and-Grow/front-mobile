import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert,
  Image, Modal,Button
} from 'react-native';
import axios from 'axios';
import Svg, { Circle, Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ipAdd from '../scripts/helpers/ipAddress';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BottomTabBar from './BottomTabBar';
import TopTabBar from './TopTabBar';
const FollowScreenOrganization = ({ navigation }) => {
  const [liked, setLiked] = useState(false);
  
  const toggleLike = () => {
    setLiked(!liked);
  };
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [activeTab, setActiveTab] = useState('following');
  
  const handleProfilePress = () => {
    navigation.navigate('FollowingScreen');
  };
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

  const handleDeletePost = async (postId) => {
    try {
      setPosts(posts.filter((post) => post.id !== postId));
      await axios.delete(`${ipAdd}:5000/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Delete failed', error);
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

      {item.images && item.images.length > 0 && (
        <View style={styles.postImages}>
          {item.images.map((img, i) => (
            <Image key={i} source={{ uri: img }} style={styles.postImage} />
          ))}
        </View>
      )}

      <Text style={styles.postContent}>{item.content}</Text>

      <View style={styles.tagsContainer}>
        {item.tags && item.tags.map((tag, i) => (
          <Text key={i} style={styles.tag}>#{tag}</Text>
        ))}
      </View>

      <Text style={styles.postDate}>
        {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
      </Text>

      <View style={styles.reactions}>
      <View style={styles.reactions}>
      
</View>

      </View>

      <View style={styles.actionButtons}>
      <TouchableOpacity
  onPress={() => navigation.navigate('EditPostScreen', { postId: item.id })}
  style={styles.editBtn}
>
  <Ionicons name="create-outline" size={24} color="#4caf50" />
</TouchableOpacity>


  <TouchableOpacity
    onPress={() => handleDeletePost(item.id)}
    style={styles.deleteBtn}
  >
    <Ionicons name="trash-outline" size={24} color="#f44336" />
  </TouchableOpacity>
</View>

    </View>
  );

  return (
    <View style={styles.container}>
      {/* Profile Header */}
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
          <TouchableOpacity onPress={() => navigation.navigate('ProfileOrganizationScreen')}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.followStats}>
            <View style={styles.followStat}>
              <Text style={styles.followLabel}>Followers</Text>
              <Text style={styles.followCount}>{followers.length}</Text>
              <TouchableOpacity onPress={() => { setModalType('followers'); setModalVisible(true); }} style={styles.iconButton}>
                <Ionicons name="people-circle-outline" size={30} color="#333" />
              </TouchableOpacity>
            </View>
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

      {/* Add Post Button */}
      <TouchableOpacity
        style={styles.addPostButton}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle" size={40} color="#4CAF50" />
        <Text style={styles.addPostText}> Add post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        style={styles.postList}
      />
<BottomTabBar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  handleProfilePress={handleProfilePress}
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
  container: { flex: 1, backgroundColor: 'white', padding: 10 },
 
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
  postCard: {
    backgroundColor: '#f9fff9',  // أخضر فاتح هادي
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#2e7d32',      // ظل أخضر غامق
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2e7d32',            // لون العنوان أخضر غامق
    marginBottom: 8,
    fontFamily: 'Arial',         // خط واضح
  },
  postImages: {
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  postImage: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',      // حدود خفيفة للصورة بلون أخضر فاتح
  },
  postContent: {
    fontSize: 16,
    color: '#3e3e3e',
    marginBottom: 12,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#a5d6a7',  // أخضر فاتح متوسط
    color: '#1b5e20',           // أخضر غامق للخط
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  postDate: {
    fontSize: 12,
    color: '#7b8a6b',            // رمادي مخضر
    marginBottom: 14,
    fontStyle: 'italic',
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#dcedc8',   // خط فاصل أخضر باهت
    paddingTop: 10,
  },
  addPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 6,      // تخفيف البادينغ عمودياً
    paddingHorizontal: 16,   // توسعة عرضي متناسق
    borderRadius: 20,        // تدوير أقل عشان يكون أنحف
    marginVertical: 6,
    alignSelf: 'center',
    width: 130,              // عرض أقل شوي
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  
  addPostText: {
    color: '#4CAF50',
    fontWeight: '600',        // أقل ثخانة شوي عشان يطلع مرتب
    fontSize: 14,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between', // يفصلهم لأقصى اليسار واليمين
    alignItems: 'center',
    width: '100%',  // لازم تعطينا عرض كامل عشان يفصلهم صح
  },
  editBtn: {
    padding: 8,
    borderRadius: 5,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 5,
  },
  verifiedContainer: {
    marginLeft: 8,
  },
});

export default FollowScreenOrganization;