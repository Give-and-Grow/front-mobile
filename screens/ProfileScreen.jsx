// ProfileScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { Feather, FontAwesome5, MaterialIcons, Entypo } from '@expo/vector-icons';
import ipAdd from "../scripts/helpers/ipAddress";
const ProfileScreen = () => {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const loadProfile = async () => {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (!savedToken) {
        navigation.navigate('LoginPage');
        return;
      }
      setToken(savedToken);
      fetchProfile(savedToken);
    };

    loadProfile();
  }, []);

  const fetchProfile = async (t) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/profile/`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setProfile(res.data);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to load profile');
    }
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (field) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.cancelled) {
      const uri = result.assets[0].uri;
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'upload.jpg',
        type: 'image/jpeg',
      });
      formData.append('upload_preset', 'my_unsigned_preset');
      formData.append('cloud_name', 'dhrugparh');

      try {
        setIsUploading(true);
        const res = await axios.post('https://api.cloudinary.com/v1_1/dhrugparh/image/upload', formData);
        setProfile((prev) => ({ ...prev, [field]: res.data.secure_url }));
      } catch (err) {
        Alert.alert('Upload failed', err.message);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    const editableFields = [
      'username', 'name', 'last_name', 'phone_number', 'gender',
      'country', 'city', 'village', 'bio', 'experience', 'date_of_birth',
      'profile_picture', 'identity_picture', 'skills'
    ];

    const cleanedProfile = {};
    editableFields.forEach((key) => {
      if (profile[key] !== undefined && profile[key] !== null) {
        if (key === 'skills') {
          if (Array.isArray(profile.skills)) {
            cleanedProfile.skills = profile.skills.filter(s => typeof s === 'string' && s.trim() !== '');
          } else if (typeof profile.skills === 'string') {
            cleanedProfile.skills = profile.skills.split(',').map(s => s.trim()).filter(s => s !== '');
          }
        } else {
          cleanedProfile[key] = profile[key];
        }
      }
    });

    try {
      await axios.put(`${ipAdd}:5000/profile/`, cleanedProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditing(false);
      fetchProfile(token);
    } catch (err) {
      Alert.alert('Save Failed', err.response?.data?.msg || 'Update error');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => isEditing && handleImageUpload('profile_picture')}>
        {profile.profile_picture ? (
          <Image source={{ uri: profile.profile_picture }} style={styles.image} />
        ) : (
          <Text>No Profile Picture</Text>
        )}
      </TouchableOpacity>

      {['name', 'last_name', 'username', 'phone_number', 'country', 'city', 'village', 'bio', 'experience'].map((field) => (
        <TextInput
          key={field}
          placeholder={field.replace('_', ' ')}
          style={styles.input}
          value={profile[field] || ''}
          onChangeText={(text) => handleChange(field, text)}
          editable={isEditing}
        />
      ))}

      <Text>Date of Birth</Text>
      <TextInput
        style={styles.input}
        value={profile.date_of_birth || ''}
        onChangeText={(text) => handleChange('date_of_birth', text)}
        editable={isEditing}
        placeholder="YYYY-MM-DD"
      />

      <Text>Gender</Text>
      <Picker
        selectedValue={profile.gender || ''}
        onValueChange={(val) => handleChange('gender', val)}
        enabled={isEditing}
      >
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Male" value="male" />
        <Picker.Item label="Female" value="female" />
      </Picker>

      <TouchableOpacity onPress={() => isEditing && handleImageUpload('identity_picture')}>
        {profile.identity_picture ? (
          <Image source={{ uri: profile.identity_picture }} style={styles.idImage} />
        ) : (
          <Text>No Identity Picture</Text>
        )}
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setIsEditing(!isEditing)}>
          <Text>{isEditing ? 'Cancel' : 'Edit Profile'}</Text>
        </TouchableOpacity>
        {isEditing && (
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text>Save</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePasswordProfile')}>
          <Text>Update Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SkillsSection')}>
          <Text>Skills</Text>
        </TouchableOpacity>
      </View>

      {isUploading && <ActivityIndicator size="large" color="green" />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 8,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
  },
  idImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    alignSelf: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#a5d6a7',
    padding: 10,
    borderRadius: 6,
    margin: 4,
  },
});

export default ProfileScreen;