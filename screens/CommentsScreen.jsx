import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
  Button,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ipAdd from '../scripts/helpers/ipAddress';

const CommentsScreen = ({ route }) => {
  const { postId } = route.params;

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // جديد: حالة تعديل التعليق
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token found, please login.');

      const response = await axios.get(
        `${ipAdd}:5000/posts/${postId}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load comments');
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchComments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  // حذف تعليق (كما هو)
  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      "Confirm deletion",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              if (!token) throw new Error('No token found, please login.');

              await axios.delete(
                `${ipAdd}:5000/posts/${postId}/comments/${commentId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              setComments((prevComments) =>
                prevComments.filter((comment) => comment.id !== commentId)
              );
            } catch (err) {
              Alert.alert("Error", err.response?.data?.error || err.message);
            }
          },
        },
      ]
    );
  };

  // جديد: فتح نموذج تعديل التعليق
  const openEditModal = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setModalVisible(true);
  };

  // جديد: إرسال تعديل التعليق للباك اند
  const submitEditComment = async () => {
    if (!editingContent.trim()) {
      Alert.alert("Validation error", "Comment content cannot be empty.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token found, please login.');

      await axios.put(
        `${ipAdd}:5000/posts/${postId}/comments/${editingCommentId}`,
        { content: editingContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // تحديث التعليق في القائمة محلياً
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === editingCommentId
            ? { ...comment, content: editingContent }
            : comment
        )
      );

      setModalVisible(false);
      setEditingCommentId(null);
      setEditingContent('');
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || err.message);
    }
  };

  const renderComment = ({ item }) => {
    let backgroundColor = '#dcedc8'; 
    let borderColor = '#aed581'; 
    let icon = '💬';
    if (item.is_mine) {
      backgroundColor = '#a5d6a7';
      borderColor = '#81c784';
      icon = '🟢';
    } else if (item.is_post_owner) {
      backgroundColor = '#c8e6c9';
      borderColor = '#66bb6a';
      icon = '🏆';
    }

    return (
      <View style={[styles.commentBox, { backgroundColor, borderColor }]}>
        <View style={styles.commentHeader}>
          <Text style={styles.userId}>User ID: {item.user_id}</Text>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.infoText}>
          {item.is_mine
            ? 'This comment is yours 👈'
            : item.is_post_owner
            ? 'Post owner commented here 🏆'
            : 'Comment from another user'}
        </Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleString()}
        </Text>

        {(item.is_mine || item.is_post_owner) && (
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.deleteButton, { marginRight: 10 }]}
              onPress={() => handleDeleteComment(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>

            {/* زر تعديل */}
            {item.is_mine && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(item)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={styles.loadingText}>Loading comments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {comments.length === 0 ? (
        <Text style={styles.noComments}>No comments yet.</Text>
      ) : (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComment}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4caf50']} />
          }
          contentContainerStyle={{ paddingBottom: 30, paddingTop: 5 }}
        />
      )}

      {/* نموذج تعديل التعليق */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Comment</Text>
            <TextInput
              style={styles.input}
              multiline
              value={editingContent}
              onChangeText={setEditingContent}
              placeholder="Edit your comment here"
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Save" onPress={submitEditComment} color="#4caf50" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: '#f0fff0',
  },
  commentBox: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userId: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  icon: {
    fontSize: 18,
  },
  content: {
    fontSize: 16,
    color: '#33691e',
    marginTop: 5,
  },
  infoText: {
    fontSize: 12,
    color: '#558b2f',
    marginTop: 5,
  },
  date: {
    fontSize: 11,
    color: '#9e9e9e',
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#e53935',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#43a047',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4caf50',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  noComments: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#4caf50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2e7d32',
  },
  input: {
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CommentsScreen;
