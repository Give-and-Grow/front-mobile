import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [imageLinks, setImageLinks] = useState(['']);
  const [token, setToken] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('userToken');
      setToken(storedToken);
    };
    fetchToken();
  }, []);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddImageLink = () => {
    setImageLinks([...imageLinks, '']);
  };

  const handleChangeImageLink = (index, value) => {
    const updated = [...imageLinks];
    updated[index] = value;
    setImageLinks(updated);
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Error', 'No token found. Please log in again.');
      return;
    }

    const filteredTags = tags.filter(tag => tag.trim() !== '');
    if (filteredTags.length === 0) {
      Alert.alert('Error', 'Please add at least one tag.');
      return;
    }

    const postData = {
      title,
      content,
      tags: filteredTags,
      images: imageLinks.filter(Boolean),
    };

    try {
      const response = await fetch(`http://192.168.1.107:5000/posts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Post created successfully!');
        setTitle('');
        setContent('');
        setTags([]);
        setImageLinks(['']);
      } else {
        Alert.alert('Error', data.message || 'Failed to create post.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server.');
    }
  };
  const handlePickImage = () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 1 },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else {
          // نضيف رابط أو مسار الصورة المختارة
          const uri = response.assets[0].uri;
          setImageLinks([...imageLinks, uri]);
        }
      }
    );
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create New Post</Text>

      <Text style={styles.label}>Title:</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Enter post title"
        style={styles.input}
      />

      <Text style={styles.label}>Content:</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Write your content"
        multiline
        style={[styles.input, styles.textarea]}
      />

      <Text style={styles.label}>Tags:</Text>
      <View style={styles.tagInputContainer}>
        <TextInput
          value={tagInput}
          onChangeText={setTagInput}
          placeholder="Add a tag"
          placeholderTextColor="#7cb342"
          style={styles.tagInput}
          onSubmitEditing={handleAddTag}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagContainer}>
        {tags.map((tag, index) => (
          <Chip
            key={index}
            onClose={() => handleRemoveTag(tag)}
            style={styles.chip}
            textStyle={styles.chipText}
            closeIcon="close"
          >
            #{tag}
          </Chip>
        ))}
      </View>

      <Text style={styles.label}>Image Links:</Text>
      {imageLinks.map((link, index) => (
        <TextInput
          key={index}
          value={link}
          onChangeText={(value) => handleChangeImageLink(index, value)}
          placeholder={`Image URL ${index + 1}`}
          style={styles.input}
        />
      ))}
      <TouchableOpacity style={styles.imageAddButton} onPress={handleAddImageLink}>
        <Text style={styles.imageAddButtonText}>+ Add Another Image</Text>
      </TouchableOpacity>

      <View style={styles.submitButtonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Publish Post</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#e8f5e9', // أخضر فاتح ناعم
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2e7d32', // أخضر داكن
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginTop: 15,
    fontWeight: '600',
    fontSize: 17,
    color: '#1b5e20', // أخضر غامق
  },
  input: {
    borderWidth: 1,
    borderColor: '#a5d6a7', // أخضر فاتح متناسق
    backgroundColor: '#ffffff',
    color: '#2e7d32',
    padding: 14,
    marginBottom: 15,
    borderRadius: 15,
    fontSize: 16,
    shadowColor: '#81c784',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  textarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#a5d6a7',
    backgroundColor: '#ffffff',
    color: '#2e7d32',
    padding: 12,
    borderRadius: 15,
    fontSize: 16,
    marginRight: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  chip: {
    backgroundColor: '#4caf50',
    margin: 5,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
  },
  chipText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageAddButton: {
    marginVertical: 15,
    backgroundColor: '#66bb6a',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 4,
  },
  imageAddButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  submitButtonContainer: {
    marginTop: 30,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 6,
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CreatePost;
