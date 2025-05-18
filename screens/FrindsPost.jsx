import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  Alert,
  ActivityIndicator,
  Button,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';
import BottomTabBar from './BottomTabBar';
import Icon from 'react-native-vector-icons/Feather';
import IconFA from 'react-native-vector-icons/FontAwesome';

const FriendsPosts = () => {
  const [activeTab, setActiveTab] = useState('FriendsPosts');
  const [friendsPosts, setFriendsPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState({});
  const [commentText, setCommentText] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const scaleAnim = useState(new Animated.Value(1))[0];

  // للعرض وتعديل التعليقات في مودال
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [modalComments, setModalComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [refreshingComments, setRefreshingComments] = useState(false);
  const [errorComments, setErrorComments] = useState(null);
  

  // تعديل التعليق
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    fetchFriendsPostsAndComments();
    fetchMyPostsAndComments();
    
  }, []);

  // جلب منشورات الأصدقاء والتعليقات
  const fetchFriendsPostsAndComments = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.error('No token found');

      const response = await axios.get(`${ipAdd}:5000/posts/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedPosts = response.data;
      setFriendsPosts(fetchedPosts);
      await fetchCommentsForPosts(fetchedPosts, token);
    } catch (error) {
      console.error('Error fetching friends posts:', error);
    }
  };

  // جلب منشوراتي والتعليقات
  const fetchMyPostsAndComments = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.error('No token found');

      const response = await axios.get(`${ipAdd}:5000/posts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedMyPosts = response.data;
      setMyPosts(fetchedMyPosts);
      await fetchCommentsForPosts(fetchedMyPosts, token);
    } catch (error) {
      console.error('Error fetching my posts:', error);
    }
  };
  
  // جلب التعليقات لكل منشور
  const fetchCommentsForPosts = async (posts, token) => {
    const allComments = { ...commentsByPost };

    for (const post of posts) {
      try {
        const commentRes = await axios.get(`${ipAdd}:5000/posts/${post.id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allComments[post.id] = commentRes.data;
      } catch (err) {
        console.error(`Error fetching comments for post ${post.id}`, err);
      }
    }

    setCommentsByPost(allComments);
  };
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
  // تشغيل مودال التعليقات
  const openCommentsModal = async (postId) => {
    setSelectedPostId(postId);
    setModalVisible(true);
    await loadCommentsForModal(postId);
  };

  // جلب التعليقات للشاشة المودال
  const loadCommentsForModal = async (postId) => {
    setLoadingComments(true);
    setErrorComments(null);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No token found, please login.');

      const response = await axios.get(`${ipAdd}:5000/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModalComments(response.data);
    } catch (err) {
      setErrorComments(err.message || 'Failed to load comments');
    }
    setLoadingComments(false);
  };

  const onRefreshModalComments = async () => {
    setRefreshingComments(true);
    await loadCommentsForModal(selectedPostId);
    setRefreshingComments(false);
  };

  // حذف تعليق
  const handleDeleteComment = (commentId) => {
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

              await axios.delete(`${ipAdd}:5000/posts/${selectedPostId}/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              setModalComments((prev) => prev.filter((c) => c.id !== commentId));
              // تحديث تعليقات القائمة أيضاً
              setCommentsByPost((prev) => {
                const newComments = prev[selectedPostId].filter((c) => c.id !== commentId);
                return { ...prev, [selectedPostId]: newComments };
              });
            } catch (err) {
              Alert.alert("Error", err.response?.data?.error || err.message);
            }
          },
        },
      ]
    );
  };

  // فتح مودال تعديل التعليق
  const openEditModal = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
    setModalVisible(true);
  };
// حفظ تعديل التعليق
const saveEditedComment = async () => {
  if (!editingContent.trim()) {
    Alert.alert('Error', 'Content cannot be empty');
    return;
  }
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('No token found, please login.');

    await axios.put(
      `${ipAdd}:5000/posts/${selectedPostId}/comments/${editingCommentId}`,
      { content: editingContent.trim() },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // تحديث التعليقات في المودال
    const updatedComments = modalComments.map((c) =>
      c.id === editingCommentId ? { ...c, content: editingContent.trim() } : c
    );
    setModalComments(updatedComments);

    // تحديث تعليقات القائمة أيضاً بشكل صحيح
    setCommentsByPost((prev) => {
      console.log('commentsByPost before delete:', prev);
      const commentsForPost = prev[selectedPostId];
      console.log('commentsForPost:', commentsForPost);
    
      if (!Array.isArray(commentsForPost)) {
        return prev;
      }
    
      const newComments = commentsForPost.filter((c) => c.id !== commentId);
      return { ...prev, [selectedPostId]: newComments };
    });
    
    
    setEditingCommentId(null);
    setEditingContent('');
    Alert.alert('Success', 'Comment updated');
  } catch (err) {
    Alert.alert('Error', err.response?.data?.error || err.message);
  }
};


  // التبديل بين الإعجاب وعدم الإعجاب مع انميشن
  const toggleLike = (postId) => {
    const isLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // كتابة تعليق في القائمة
  const handleCommentChange = (text, postId) => {
    setCommentText((prev) => ({ ...prev, [postId]: text }));
  };

  // إرسال تعليق جديد في القائمة
  const handleCommentSubmit = async (postId) => {
    const comment = commentText[postId];
    if (!comment || comment.trim() === '') return;

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return console.error('No token found');

      await axios.post(
        `${ipAdd}:5000/posts/${postId}/comments`,
        { content: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // تحديث تعليقات القائمة
      await loadCommentsForModal(postId);
      setCommentText((prev) => ({ ...prev, [postId]: '' }));

      // إعادة تحميل التعليقات العامة في الصفحة الرئيسية
      await fetchCommentsForPosts(activeTab === 'FriendsPosts' ? friendsPosts : myPosts, token);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // عرض المنشورات حسب التبويب
  const postsToRender = activeTab === 'FriendsPosts' ? friendsPosts : myPosts;

  // عرض تعليق واحد (لعرض التعليقات في FlatList)
  const renderComment = ({ item }) => (
    <View style={styles.comment}>
      <Text style={styles.commentAuthor}>{item.userName}</Text>
      <Text>{item.content}</Text>
      <View style={{ flexDirection: 'row', marginTop: 5 }}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginRight: 10 }}>
          <Text style={{ color: 'blue' }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
          <Text style={{ color: 'red' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // عرض منشور واحد
  const renderPost = ({ item }) => {
    const isLiked = likedPosts[item.id] || false;
    const comments = commentsByPost[item.id] || [];
  
    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <Image source={{ uri: item.userImage }} style={styles.postUserImage} />
          <View>
            <Text style={styles.postUserName}>{item.userName}</Text>
            {/* عرض التاريخ مع تنسيق مناسب */}
            <Text style={styles.postTimestamp}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        </View>
  
        {/* عرض العنوان */}
        <Text style={styles.postTitle}>{item.title}</Text>
  
        {/* عرض المحتوى */}
        <Text style={styles.postContent}>{item.content}</Text>
  
        {/* عرض عدة صور */}
        <ScrollView horizontal style={{ marginVertical: 10 }}>
          {item.images && item.images.map((imgUrl, index) => (
           <View style={styles.imagesWrapper}>
           {item.images.map((imgUrl, idx) => (
             <Image key={idx} source={{ uri: imgUrl }} style={styles.postImage} />
           ))}
         </View>
         
          ))}
        </ScrollView>
  
        {/* عرض الوسوم */}
        <View style={styles.tagsContainer}>
          {item.tags && item.tags.map((tag, idx) => (
            <Text key={idx} style={styles.tag}>
              #{tag}
            </Text>
          ))}
        </View>
  
        <View style={styles.postActions}>
          <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.likeButton}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <IconFA name={isLiked ? 'heart' : 'heart-o'} size={24} color={isLiked ? 'red' : 'black'} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openCommentsModal(item.id)}>
            <Text style={styles.viewCommentsText}>View Comments ({comments.length})</Text>
          </TouchableOpacity>
        </View>
     

        {/* قسم التعليقات تحت كل منشور */}
        <View style={styles.commentsSection}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Text style={styles.commentAuthor}>{comment.userName}</Text>
              <Text>{comment.content}</Text>
            </View>
          ))}

          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={commentText[item.id] || ''}
              onChangeText={(text) => handleCommentChange(text, item.id)}
            />
            <TouchableOpacity onPress={() => handleCommentSubmit(item.id)} style={styles.sendButton}>
              <Text style={{ color: 'white' }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* التبويبات */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'FriendsPosts' && styles.activeTab]}
          onPress={() => setActiveTab('FriendsPosts')}
        >
          <Text style={activeTab === 'FriendsPosts' ? styles.activeTabText : styles.tabText}>Friends Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'MyPosts' && styles.activeTab]}
          onPress={() => setActiveTab('MyPosts')}
        >
          <Text style={activeTab === 'MyPosts' ? styles.activeTabText : styles.tabText}>My Posts</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={postsToRender}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* مودال التعليقات للمنشور */}
    {/* مودال التعليقات للمنشور */}
<Modal
  animationType="slide"
  transparent={false}
  visible={modalVisible}
  onRequestClose={() => {
    setModalVisible(false);
    setEditingCommentId(null);
    setEditingContent('');
  }}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalHeader}>
     
      <TouchableOpacity
  onPress={() => {
    setModalVisible(false);
    setEditingCommentId(null);
    setEditingContent('');
  }}
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50', // أخضر متوسط
    paddingVertical: 6,      // قللت الارتفاع شوي
    paddingHorizontal: 15,   // قللت العرض شوي
    borderRadius: 20,        // قللت نصف القطر عشان يكون أصغر
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  }}
  
>
  <Icon name="x" size={20} color="white" style={{ marginRight: 8 }} />
  <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Close</Text>
</TouchableOpacity>
    </View>

    {loadingComments ? (
      <ActivityIndicator size="large" color="#00ff00" />
    ) : errorComments ? (
      <Text style={{ color: 'red', padding: 10 }}>{errorComments}</Text>
    ) : (
      <FlatList
        data={modalComments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            {editingCommentId === item.id ? (
              <>
                <TextInput
                  style={styles.editCommentInput}
                  value={editingContent}
                  onChangeText={setEditingContent}
                  multiline
                />
              <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' }}>
  <TouchableOpacity
    onPress={saveEditedComment}
    style={{
      flex: 1,
      backgroundColor: '#4CAF50', // أخضر
      paddingVertical: 10,
      marginRight: 10,
      borderRadius: 25,
      alignItems: 'center',
      shadowColor: '#388E3C',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    }}
  >
    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Save</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => {
      setEditingCommentId(null);
      setEditingContent('');
    }}
    style={{
      flex: 1,
      backgroundColor: '#9E9E9E', // رمادي
      paddingVertical: 10,
      marginLeft: 10,
      borderRadius: 25,
      alignItems: 'center',
      shadowColor: '#6E6E6E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    }}
  >
    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
  </TouchableOpacity>
</View>

              </>
            ) : (
              <>
                <Text style={styles.commentAuthor}>{item.userName}</Text>
                <Text>{item.content}</Text>
                <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'flex-start' }}>
  <TouchableOpacity
    onPress={() => {
      setSelectedPostId(selectedPostId);
      setEditingCommentId(item.id);
      setEditingContent(item.content);
    }}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#388E3C', // أخضر غامق
      paddingVertical: 7,
      paddingHorizontal: 16,
      borderRadius: 25,
      marginRight: 12,
      shadowColor: '#2E7D32',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 5,
      elevation: 6,
    }}
  >
    <Icon name="edit-2" size={18} color="white" style={{ marginRight: 8 }} />
    <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>Edit</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => handleDeleteComment(item.id)}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#66BB6A', // أخضر فاتح
      paddingVertical: 7,
      paddingHorizontal: 16,
      borderRadius: 25,
      shadowColor: '#43A047',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    }}
  >
    <Icon name="trash-2" size={18} color="white" style={{ marginRight: 8 }} />
    <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>Delete</Text>
  </TouchableOpacity>
</View>

              </>
            )}
          </View>
        )}
        refreshing={refreshingComments}
        onRefresh={onRefreshModalComments}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    )}
  </View>
</Modal>

      <BottomTabBar />
    </View>
  );
};

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',  // أخضر متوسط
  },
  activeTab: {
    backgroundColor: '#4CAF50',  // أخضر متوسط
  },
  tabText: {
    color: '#4CAF50',  // أخضر متوسط
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 12,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postUserName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTimestamp: {
    color: 'gray',
    fontSize: 12,
  },
  postContent: {
    marginVertical: 10,
    fontSize: 14,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCommentsText: {
    marginLeft: 20,
    color: '#4CAF50',  // أخضر متوسط
  },
  commentsSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  comment: {
    marginBottom: 8,
    backgroundColor: '#f2f2f2',
    padding: 8,
    borderRadius: 8,
  },
  commentAuthor: {
    fontWeight: 'bold',
  },
  addCommentContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#A5D6A7', // أخضر فاتح
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#4CAF50',  // أخضر متوسط
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  editModal: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    elevation: 10,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#4CAF50',  // أخضر متوسط
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
    marginBottom: 10,
  },


  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postUserImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#777',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2a9d8f',
    marginBottom: 6,
  },
  postContent: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
    lineHeight: 22,
  },
  postImage: {
    width: 200,
    height: 120,
    borderRadius: 10,
    marginRight: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#e0f2f1',
    color: '#00796b',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  likeButton: {
    padding: 6,
  },
  viewCommentsText: {
    color: '#264653',
    fontWeight: '600',
    fontSize: 14,
  },


  
});

export default FriendsPosts;
