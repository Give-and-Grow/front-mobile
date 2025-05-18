import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';

const EditPostScreen = ({ route, navigation }) => {
  const { postId } = route.params;
  const [token, setToken] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState(''); // string separated by commas
  const [images, setImages] = useState(''); // string separated by commas

  useEffect(() => {
    const fetchToken = async () => {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        setToken(savedToken);
      }
    };
    fetchToken();
  }, []);

  const handleSave = async () => {
    try {
      await axios.put(`${ipAdd}:5000/posts/${postId}`, {
        title,
        content,
        tags: tags.split(',').map(t => t.trim()),
        images: images.split(',').map(i => i.trim()),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Success', 'Post updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update post:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to update post');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Title:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title"
      />

      <Text style={styles.label}>Content:</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="Enter content"
      />

      <Text style={styles.label}>Tags (comma separated):</Text>
      <TextInput
        style={styles.input}
        value={tags}
        onChangeText={setTags}
        placeholder="tag1, tag2, tag3"
      />

      <Text style={styles.label}>Images URLs (comma separated):</Text>
      <TextInput
        style={styles.input}
        value={images}
        onChangeText={setImages}
        placeholder="http://image1.jpg, http://image2.jpg"
      />

      <Button title="Save Changes" onPress={handleSave} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#E8F5E9',
    flexGrow: 1,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
    color: '#2e7d32',
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    borderColor: '#2e7d32',
    borderWidth: 1,
  },
});

export default EditPostScreen;
