import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Chip } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BottomTabBar from './BottomTabBar';
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
    setTags(tags.filter((tag) => tag !== tagToRemove));
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

    const filteredTags = tags.filter((tag) => tag.trim() !== '');
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
          Authorization: `Bearer ${token}`,
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
          const uri = response.assets[0].uri;
          setImageLinks([...imageLinks, uri]);
        }
      }
    );
  };
 const handleProfilePress = () => {
    navigation.navigate('CreatePost');
  
  };
  const [activeTab, setActiveTab] = useState('postcreate');
  return (
    <View style={{ flex: 1, backgroundColor: '#e8f5e9' }}>
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 25, backgroundColor: '#e8f5e9' }}>
      <Text style={styles.header}>
        <MaterialIcons name="post-add" size={30} color="#2e7d32" /> Create New Post
      </Text>

      {/* Title */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <MaterialIcons name="title" size={20} color="#1b5e20" /> Title
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter post title"
          placeholderTextColor="#a5d6a7"
          style={styles.input}
        />
      </View>

      {/* Content */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <MaterialIcons name="notes" size={20} color="#1b5e20" /> Content
        </Text>
        <TextInput
          value={content}
          onChangeText={setContent}
          placeholder="Write your content"
          multiline
          placeholderTextColor="#a5d6a7"
          style={[styles.input, styles.textarea]}
        />
      </View>

      {/* Tags */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <MaterialIcons name="local-offer" size={20} color="#1b5e20" /> Tags
        </Text>
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
            <MaterialIcons name="add-circle" size={28} color="#fff" />
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
      </View>

      {/* Image Links */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          <MaterialIcons name="image" size={20} color="#1b5e20" /> Image Links
        </Text>
        {imageLinks.map((link, index) => (
          <TextInput
            key={index}
            value={link}
            onChangeText={(value) => handleChangeImageLink(index, value)}
            placeholder={`Image URL ${index + 1}`}
            placeholderTextColor="#a5d6a7"
            style={styles.input}
          />
        ))}

        <TouchableOpacity style={styles.imageAddButton} onPress={handleAddImageLink}>
          <MaterialIcons name="add-photo-alternate" size={24} color="#fff" />
          <Text style={styles.imageAddButtonText}>Add Another Image</Text>
        </TouchableOpacity>
      </View>

     
      {/* Submit */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <MaterialIcons name="publish" size={26} color="white" />
          <Text style={styles.submitButtonText}>Publish Post</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    
    <View>
        <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleProfilePress={handleProfilePress}
      />
       </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#e8f5e9',
    flexGrow: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 30,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 1,
  },
  label: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1b5e20',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#a5d6a7',
    backgroundColor: '#ffffff',
    color: '#2e7d32',
    padding: 14,
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
  addButton: {
    backgroundColor: '#388e3c',
    borderRadius: 50,
    padding: 6,
    elevation: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
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
    marginTop: 15,
    backgroundColor: '#66bb6a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    elevation: 5,
  },
  imageAddButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  submitButtonContainer: {
    //marginTop: 1, // أو 5 أو حتى 0 حسب رغبتك
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
  },
  
  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default CreatePost;
