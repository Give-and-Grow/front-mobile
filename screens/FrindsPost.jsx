import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity , Image , ScrollView,} from 'react-native';
import { Card, Paragraph, Avatar, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import ipAdd from '../scripts/helpers/ipAddress';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-paper';
import BottomTabBar from './BottomTabBar';

const FrindsPost = () => {
  const [activeTab, setActiveTab] = useState('my');
  const [myPosts, setMyPosts] = useState([]);
  const [friendsPosts, setFriendsPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const res = await axios.get(`${ipAdd}:5000/posts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyPosts(res.data);
    } catch (err) {
      console.error('Error fetching my posts:', err);
    }
  };

  const fetchFriendsPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const res = await axios.get(`${ipAdd}:5000/posts/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendsPosts(res.data);
    } catch (err) {
      console.error('Error fetching friends posts:', err);
    }
  };

  const onRefresh = () => {
    setLoading(true);
    Promise.all([fetchMyPosts(), fetchFriendsPosts()]).finally(() => setLoading(false));
  };

  useEffect(() => {
    onRefresh();
  }, []);

  const displayedPosts = activeTab === 'my' ? myPosts : friendsPosts;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <MaterialCommunityIcons
            name="account-circle"
            size={20}
            color={activeTab === 'my' ? '#fff' : '#4caf50'}
          />
          <Text style={styles.tabText}> My Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color={activeTab === 'friends' ? '#fff' : '#4caf50'}
          />
          <Text style={styles.tabText}> Friends' Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={24} color="#66bb6a" />
        </TouchableOpacity>
      </View>

      {/* Posts List */}
      <FlatList
        data={displayedPosts}
        keyExtractor={(item) => item.post_id?.toString() || item.id?.toString()}
        renderItem={({ item }) => <PostCard item={item} />}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No posts found</Text>}
        contentContainerStyle={displayedPosts.length === 0 && { flex: 1, justifyContent: 'center' }}
      />

      {/* Bottom Tab Bar خارج المنشورات */}
      <View>
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleProfilePress={() => {
          // استدعاء التنقل هنا إذا كان موجوداً، مثال:
          navigation.navigate('FrindsPost');
        }}
      />
      </View>
    </View>
  );
};

function PostCard({ item }) {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
   const [editingCommentContent, setEditingCommentContent] = useState('');

   const handleDeleteComment = async (comment_id) => {
    console.log('Trying to delete comment with id:', comment_id);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        console.log('No token found');
        return;
      }
      const res = await axios.delete(`${ipAdd}:5000/posts/${item.post_id}/comments/${comment_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delete response:', res.data);
      fetchComments(); // إعادة تحميل التعليقات بعد الحذف
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };
  
  
  const handleEditComment = (comment_id, currentContent) => {
    // يمكنك فتح نافذة منبثقة أو شاشة تعديل مع تمرير comment_id والمحتوى الحالي
    // أو يمكنك استبدال Text بعنصر TextInput مؤقت داخل التعليق نفسه (edit mode)
    setEditingCommentId(comment_id);
    setEditingCommentContent(currentContent);
  };
  
  const submitEditComment = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(
        `${ipAdd}:5000/posts/${item.post_id}/comments/${editingCommentId}`,
        { content: editingCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      setEditingCommentContent('');
      fetchComments(); // تحديث بعد التعديل
    } catch (err) {
      console.error('Error editing comment:', err);
    }
  };
  
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const optionsDate = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString(undefined, optionsDate);
    const optionsTime = { hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedTime = date.toLocaleTimeString(undefined, optionsTime);
    return `${formattedDate} ${formattedTime}`;
  };

  const fetchComments = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;
      const res = await axios.get(`${ipAdd}:5000/posts/${item.post_id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const toggleComments = () => {
    if (!showComments) fetchComments();
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(
        `${ipAdd}:5000/posts/${item.post_id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ ...styles.container, flexGrow: 1, paddingBottom: 80}}>
    <Card style={styles.card} elevation={3}>
      <Card.Title
        title={
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color="#66bb6a" />
            <Text style={styles.titleText}>  {item.title}</Text>
          </View>
        }
        subtitle={
        

          <View style={styles.subtitleContainer}>
            {item.owner_info?.profile_picture || item.user?.profile_picture ? (
              <Image
                source={{ uri: item.owner_info?.profile_picture || item.user?.profile_picture }}
                style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8 }}
              />
            ) : null}
            <Text style={styles.subtitleText}>
              By: {item.owner_info?.name || item.user?.name || 'Unknown'}
            </Text>
            <Text style={[styles.subtitleText, { marginLeft: 8 }]}>
              {formatDateTime(item.created_at)}
            </Text>
          </View>
          
        }
        left={(props) => (
          <Avatar.Text
            {...props}
            label={item.title?.[0]?.toUpperCase() || '?'}
            style={{ backgroundColor: '#66bb6a' }}
          />
        )}
      />
{item.images && item.images.length > 0 && (
  <View style={styles.imagesContainer}>
    {item.images.map((imgUrl, index) => (
      <View key={index} style={styles.imageWrapper}>
        <Image
          source={{ uri: imgUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    ))}
  </View>
)}

      {item.content && (
        <Card.Content>
          <Paragraph style={styles.postContent}>{item.content}</Paragraph>
        </Card.Content>
      )}

      <View style={styles.likeButtonContainer}>
        <TouchableOpacity onPress={() => setLiked(!liked)}>
          <MaterialCommunityIcons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? '#e53935' : '#555'}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleComments} style={{ marginLeft: 20 }}>
          <MaterialCommunityIcons name="comment" size={24} color="#4caf50" />
        </TouchableOpacity>
      </View>

      {showComments && (
        <View style={styles.commentsContainer}>
       {comments.map((comment, idx) => (
  <View key={idx} style={styles.commentItem}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  {comment.owner_info?.profile_picture && (
    <Image
      source={{ uri: comment.owner_info.profile_picture }}
      style={{ width: 30, height: 30, borderRadius: 15, marginRight: 8 }}
    />
  )}
  <Text style={styles.commentUser}>{comment.owner_info?.name || 'Unknown User'}:</Text>
</View>

      <View style={{ flexDirection: 'row' }}>
        {comment.is_mine && (
          <>
           {editingCommentId === comment.id ? (
  <View style={{ backgroundColor: '#f1f8e9', padding: 10, borderRadius: 8 }}>
    <TextInput
      value={editingCommentContent}
      onChangeText={setEditingCommentContent}
      style={{
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 8,
        paddingHorizontal: 10
      }}
      mode="outlined"
      placeholder="Edit your comment..."
    />

    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
      <TouchableOpacity onPress={submitEditComment} style={{ marginRight: 15 }}>
        <MaterialCommunityIcons name="check" size={24} color="#4caf50" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setEditingCommentId(null)}>
        <MaterialCommunityIcons name="close" size={24} color="#e53935" />
      </TouchableOpacity>
    </View>
  </View>
) : (
  <TouchableOpacity onPress={() => handleEditComment(comment.id, comment.content)}>
    <MaterialCommunityIcons name="pencil" size={20} color="#4caf50" style={{ marginRight: 10 }} />
  </TouchableOpacity>
)}

          </>
        )}
        {(comment.is_mine || comment.is_post_owner) && (
          <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}
>
            <MaterialCommunityIcons name="delete" size={20} color="#e53935" />
          </TouchableOpacity>
        )}
      </View>
    </View>
    {editingCommentId === comment.id ? null : (
      <>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>{formatDateTime(comment.created_at)}</Text>
      </>
    )}
  </View>
))}



          <TextInput
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            style={styles.commentInput}
            mode="outlined"
            right={<TextInput.Icon icon="send" onPress={handleAddComment} />}
          />
        </View>
      )}
    </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf7ef',
    padding: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#c8e6c9',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  tabButton: {
    flexDirection: 'row',
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#66bb6a',
  },
  tabText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  refreshButton: {
    paddingHorizontal: 12,
  },
  card: {
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#777',
    fontStyle: 'italic',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#2e7d32',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitleText: {
    color: '#555',
    fontSize: 13,
  },
  likeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    paddingTop: 0,
  },
  commentsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  commentItem: {
    marginVertical: 1,
    backgroundColor: '#f1f8e9',
    borderRadius: 8,
    padding: 8,
  },
  commentUser: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  commentText: {
    color: '#333',
  },
  commentInput: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  commentTime: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
    textAlign: 'right',
  },
    imagesContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16, // أو استخدم marginBottom داخل imageWrapper
    marginBottom: 16,
  },
  imageWrapper: {
    maxHeight: 300,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
  },
});

export default FrindsPost;