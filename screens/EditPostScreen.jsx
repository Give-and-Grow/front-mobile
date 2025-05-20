import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, ScrollView, Alert, StyleSheet, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';

const EditPostScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const [token, setToken] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [images, setImages] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) setToken(savedToken);
    };
    fetchToken();
  }, []);

  useEffect(() => {
    const fetchPostData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${ipAdd}:5000/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const post = response.data;
        setTitle(post.title || '');
        setContent(post.content || '');
        setTags(post.tags ? post.tags.join(', ') : '');
        setImages(post.images ? post.images.join(', ') : '');
      } catch (error) {
        console.error('Failed to fetch post data:', error.response ? error.response.data : error.message);
        Alert.alert('Error', 'Failed to load post data');
      }
      setLoading(false);
    };
    if (token) fetchPostData();
  }, [token, postId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${ipAdd}:5000/posts/${postId}`, {
        title,
        content,
        tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
        images: images.split(',').map(i => i.trim()).filter(i => i.length > 0),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Post updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update post:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to update post');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={{marginTop: 10, color: '#2e7d32'}}>Loading post data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Post</Text>

      <View style={styles.inputGroup}>
        <MaterialIcons name="title" size={24} color="#33691e" style={styles.icon} />
        <Text style={styles.label}>Title:</Text>
      </View>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title"
        placeholderTextColor="#a5d6a7"
      />

      <View style={styles.inputGroup}>
        <MaterialIcons name="description" size={24} color="#33691e" style={styles.icon} />
        <Text style={styles.label}>Content:</Text>
      </View>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="Enter content"
        placeholderTextColor="#a5d6a7"
      />

      <View style={styles.inputGroup}>
        <MaterialIcons name="label" size={24} color="#33691e" style={styles.icon} />
        <Text style={styles.label}>Tags (comma separated):</Text>
      </View>
      <TextInput
        style={styles.input}
        value={tags}
        onChangeText={setTags}
        placeholder="tag1, tag2, tag3"
        placeholderTextColor="#a5d6a7"
      />

      <View style={styles.inputGroup}>
        <MaterialIcons name="image" size={24} color="#33691e" style={styles.icon} />
        <Text style={styles.label}>Image URLs (comma separated):</Text>
      </View>
      <TextInput
        style={styles.input}
        value={images}
        onChangeText={setImages}
        placeholder="http://image1.jpg, http://image2.jpg"
        placeholderTextColor="#a5d6a7"
      />

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#dcedc8',
    flexGrow: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#33691e',
    marginBottom: 20,
    alignSelf: 'center',
    textShadowColor: '#a5d6a7',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontWeight: '600',
    color: '#2e7d32',
    fontSize: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 15,
    borderColor: '#558b2f',
    borderWidth: 1.5,
    fontSize: 16,
    shadowColor: '#558b2f',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#33691e',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
    shadowColor: '#2c6e15',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 7,
    elevation: 7,
  },
  buttonDisabled: {
    backgroundColor: '#9ccc65',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default EditPostScreen;
