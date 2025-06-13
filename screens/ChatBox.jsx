import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ipAdd from '../scripts/helpers/ipAddress';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTabBar from './BottomTabBar';
const ChatBox = ({ route }) => {
  
  const { opportunityId, title } = route.params;
  const [messages, setMessages] = useState([]);
  const [token, setToken] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
const [editModalVisible, setEditModalVisible] = useState(false);
const [editMessage, setEditMessage] = useState(null);
const [editContent, setEditContent] = useState('');

const [activeTab, setActiveTab] = useState('chatBoxx');

  const handleProfilePress = () => {
    navigation.navigate('ChatBox');
  
  };
  useEffect(() => {
    const initialize = async () => {
  const savedToken = await AsyncStorage.getItem('userToken');
  if (savedToken) {
    setToken(savedToken);
    const decoded = JSON.parse(atob(savedToken.split('.')[1])); // decode JWT
    setUserId(decoded.sub || decoded.user_id); // حسب الـ payload
    fetchMessages(savedToken);
  }
};

    initialize();
  }, []);
const handleDelete = async (messageId) => {
  try {
    await axios.delete(
      `${ipAdd}:5000/chat/opportunity/${opportunityId}/message/${messageId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchMessages(token);
  } catch (err) {
    console.error("Failed to delete message:", err.response?.data || err);
    alert(err.response?.data?.error || "Failed to delete message.");
  }
};
const handleEdit = (message) => {
  setEditMessage(message);
  setEditContent(message.content);
  setEditModalVisible(true);
};
const saveEdit = () => {
  if (editMessage && editContent.trim() !== '') {
    updateMessage(editMessage.id, editContent.trim());
    setEditModalVisible(false);
    setEditMessage(null);
    setEditContent('');
  } else {
    alert('Message cannot be empty.');
  }
};

const updateMessage = async (messageId, newContent) => {
  try {
    await axios.put(
      `${ipAdd}:5000/chat/opportunity/${opportunityId}/message/${messageId}`,
      { new_content: newContent },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchMessages(token);
  } catch (err) {
    console.error("Failed to edit message:", err.response?.data || err);
    alert(err.response?.data?.error || "Failed to update message.");
  }
};

  const fetchMessages = async (tok) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${ipAdd}:5000/chat/opportunity/${opportunityId}/messages`,
        {
          headers: { Authorization: `Bearer ${tok}` },
        }
      );
      setMessages(response.data.messages.reverse());
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(
        `${ipAdd}:5000/chat/opportunity/${opportunityId}/send`,
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMessage('');
      fetchMessages(token); // Reload messages after sending
    } catch (err) {
      console.error('Sending message failed:', err);
    }
  };

 const renderMessage = ({ item }) => {
  const isCurrentUser = item.user_id === userId;

  return (
    
    <View style={styles.messageContainer}>
      <Image source={{ uri: item.sender_profile_picture }} style={styles.avatar} />
      <View style={styles.messageContent}>
        <Text style={styles.senderName}>{item.sender_name}</Text>
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.sent_at).toLocaleTimeString()}
          {item.edited_at && " (edited)"}
        </Text>

        {isCurrentUser && (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
              <Icon name="pencil" size={18} color="#2e7d32" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
              <Icon name="delete" size={18} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};


  return (
      <View style={{ flex: 1 }}>
         
  <View style={styles.container}>
    <Text style={styles.header}> {title}</Text>
    {loading ? (
      <ActivityIndicator size="large" color="green" />
    ) : (
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    )}
    
    {/* input area */}
    <View style={styles.inputArea}>
      <TextInput
        style={styles.input}
        placeholder="Type a message..."
        value={newMessage}
        onChangeText={setNewMessage}
      />
      <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
        <Icon name="send" size={22} color="#fff" />
      </TouchableOpacity>
    </View>

    {/* مودال تعديل الرسالة */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{
          flex:1,
          justifyContent:'center',
          alignItems:'center',
          backgroundColor:'rgba(0,0,0,0.5)'
        }}>
          <View style={{
            width:'80%',
            backgroundColor:'white',
            padding:20,
            borderRadius:10,
            elevation:5
          }}>
            <Text style={{marginBottom:10, fontWeight:'bold', fontSize:16}}>Edit Message</Text>
            <TextInput
              multiline
              value={editContent}
              onChangeText={setEditContent}
              style={{
                borderWidth:1,
                borderColor:'#ccc',
                borderRadius:5,
                padding:10,
                height:100,
                textAlignVertical:'top'
              }}
            />
            <View style={{flexDirection:'row', justifyContent:'flex-end', marginTop:15}}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{marginRight:15}}>
                <Text style={{color:'#d32f2f', fontWeight:'bold'}}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit}>
                <Text style={{color:'#2e7d32', fontWeight:'bold'}}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  </View>
 
      
      </View>
);

};

export default ChatBox;
const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#f0fdf4', // لون خلفية أفتح ومريح للعين
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32', // أخضر غامق أنيق
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.7,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
    // رسائل المرسل لي على اليمين، المستقبل على اليسار (لو تحب ممكن تضيف شرط وتبدل الاتجاه)
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#a5d6a7',
  },
  messageContent: {
    backgroundColor: '#c8e6c9', // لون خلفية رقيق أخضر فاتح
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '75%',
    shadowColor: '#2e7d32',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 4,
  },
  senderName: {
    fontWeight: '700',
    color: '#1b5e20',
    fontSize: 14,
    marginBottom: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2f4f2f',
  },
  timestamp: {
    fontSize: 11,
    color: '#6a6a6a',
    marginTop: 6,
    alignSelf: 'flex-end',
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#4caf50',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
    color: '#2e7d32',
  },
  sendBtn: {
    backgroundColor: '#388e3c',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginLeft: 12,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  actionButtons: {
  flexDirection: 'row',
  marginTop: 6,
},
actionBtn: {
  marginRight: 8,
},

});

