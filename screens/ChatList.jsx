import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ipAdd from '../scripts/helpers/ipAddress';
import BottomTabBar from './BottomTabBar';
import { useNavigation } from '@react-navigation/native';
const ChatList = () => {
  
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
const navigation = useNavigation();
const [activeTab, setActiveTab] = useState('chatList');

  const handleProfilePress = () => {
    navigation.navigate('ChatList');
  
  };
  // Fetch token and role on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        const savedRole = await AsyncStorage.getItem('userRole');

        if (savedToken) {
          setToken(savedToken);
          setRole(savedRole);
          fetchChats(savedToken, savedRole);
        }
      } catch (err) {
        console.error('Error fetching token or role:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch chats
  const fetchChats = async (tok, userRole) => {
    try {
      setLoading(true);
      const endpoint =
        userRole === 'organization'
          ? `${ipAdd}:5000/chat/my-organization-chats`
          : `${ipAdd}:5000/chat/my-user-chats`;

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${tok}` },
      });
      setChats(response.data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search chats
  const searchChats = async (query) => {
    try {
      const response = await axios.get(
        `${ipAdd}:5000/chat/search-chats?q=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChats(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Toggle chat lock/unlock
  const toggleChatLock = async (opportunityId, isLocked) => {
    const url = `${ipAdd}:5000/chat/${isLocked ? 'unlock' : 'lock'}-chat/${opportunityId}`;
    try {
      await axios.put(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchChats(token, role); // Refresh chats
    } catch (err) {
      console.error('Failed to toggle lock:', err);
    }
  };

  const renderChatItem = ({ item }) => (
  <TouchableOpacity
    style={styles.chatBox}
    onPress={() =>
      navigation.navigate('ChatBox', {
        opportunityId: item.opportunity_id,
        title: item.opportunity_title,
      })
    }
  >
    <Text style={styles.chatTitle}>{item.opportunity_title}</Text>
    <Text style={styles.chatDate}>
      {new Date(item.created_at).toLocaleDateString()}
    </Text>
    {role === 'organization' && (
      <TouchableOpacity
        style={styles.lockBtn}
        onPress={() => toggleChatLock(item.opportunity_id, item.is_locked)}
      >
        <Icon
          name={item.is_locked ? 'lock' : 'lock-open-variant'}
          size={24}
          color="#fff"
        />
        <Text style={styles.lockText}>
          {item.is_locked ? 'close' : 'open'}
        </Text>
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

  return (
   <View style={{ flex: 1 }}>
   
    <View style={styles.container}>
      <Text style={styles.header}>Chat </Text>
      <TextInput
        style={styles.searchInput}
        placeholder="search..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          if (text.length >= 2) searchChats(text);
          else fetchChats(token, role);
        }}
      />
      {loading ? (
        <ActivityIndicator color="green" size="large" />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.chat_id}
          renderItem={renderChatItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
        
    </View>
   
     <BottomTabBar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleProfilePress={handleProfilePress}
            />
    </View>
 
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4', // لون خلفية أفتح ومريح للعين
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32', // أخضر داكن
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#a5d6a7',
    marginBottom: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  chatBox: {
    backgroundColor: '#c8e6c9',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e20',
    marginBottom: 6,
  },
  chatDate: {
    fontSize: 13,
    color: '#4b4b4b',
  },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#388e3c',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  lockText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 15,
  },
});

export default ChatList;
