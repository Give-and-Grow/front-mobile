import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Image, View } from 'react-native';
import { Appbar, Card, TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';  // استيراد useNavigation

const ProfileScreen = () => {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState('');
  const navigation = useNavigation();  // استخدام useNavigation

  useEffect(() => {
    const getToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          setToken(savedToken);
          fetchProfile(savedToken);
        }
      } catch (err) {
        console.error('Error retrieving token:', err);
      }
    };

    getToken();
  }, []);

  const fetchProfile = async (token) => {
    try {
      const res = await axios.get('http://192.168.1.107:5000/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    const editableFields = [
      'name', 'last_name', 'username', 'phone_number', 'gender',
      'city', 'village', 'bio', 'experience', 'date_of_birth', 'profile_picture'
    ];

    const cleanedProfile = {};
    editableFields.forEach((key) => {
      if (profile[key] !== undefined && profile[key] !== null) {
        cleanedProfile[key] = profile[key];
      }
    });

    try {
      const res = await axios.put('http://192.168.1.107:5000/profile', cleanedProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Profile updated:', res.data);
      setIsEditing(false);
    } catch (err) {
      if (err.response) {
        console.error('Validation error:', err.response.data);
        alert(JSON.stringify(err.response.data.errors || err.response.data.msg, null, 2));
      } else {
        console.error('Unknown error:', err.message);
      }
    }
  };

  return (
    <>
      <Appbar.Header style={{ backgroundColor: '#E8F5E9' }}>
        <Appbar.Content title="My Profile" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {profile.profile_picture && (
          <Image source={{ uri: profile.profile_picture }} style={styles.profileImage} />
        )}

        {/* Basic Info */}
        <Card style={styles.card}>
          <Card.Title title="Basic Information" />
          <Card.Content>
            <TextInput
              label="First Name"
              value={profile.name || ''}
              onChangeText={(text) => handleChange('name', text)}
              disabled={!isEditing}
              mode="outlined"
            />
            <TextInput
              label="Last Name"
              value={profile.last_name || ''}
              onChangeText={(text) => handleChange('last_name', text)}
              disabled={!isEditing}
              mode="outlined"
            />
            <TextInput
              label="Username"
              value={profile.username || ''}
              onChangeText={(text) => handleChange('username', text)}
              disabled={!isEditing}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Contact Info */}
        <Card style={styles.card}>
          <Card.Title title="Contact Information" />
          <Card.Content>
            <TextInput
              label="Email"
              value={profile.email || ''}
              disabled
              mode="outlined"
            />
            <TextInput
              label="Phone Number"
              value={profile.phone_number || ''}
              onChangeText={(text) => handleChange('phone_number', text)}
              disabled={!isEditing}
              mode="outlined"
            />
            <TextInput
              label="City"
              value={profile.city || ''}
              onChangeText={(text) => handleChange('city', text)}
              disabled={!isEditing}
              mode="outlined"
            />
            <TextInput
              label="Village"
              value={profile.village || ''}
              onChangeText={(text) => handleChange('village', text)}
              disabled={!isEditing}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Volunteer Info */}
        <Card style={styles.card}>
          <Card.Title title="Volunteer Information" />
          <Card.Content>
            <TextInput
              label="Gender"
              value={profile.gender || ''}
              onChangeText={(text) => handleChange('gender', text)}
              disabled={!isEditing}
              mode="outlined"
            />
            <TextInput
              label="Date of Birth"
              value={profile.date_of_birth || ''}
              onChangeText={(text) => handleChange('date_of_birth', text)}
              disabled={!isEditing}
              mode="outlined"
              placeholder="YYYY-MM-DD"
            />
            <TextInput
              label="Bio"
              value={profile.bio || ''}
              onChangeText={(text) => handleChange('bio', text)}
              disabled={!isEditing}
              mode="outlined"
              multiline
            />
            {/* Adding Experience field */}
            <TextInput
              label="Experience"
              value={profile.experience || ''}
              onChangeText={(text) => handleChange('experience', text)}
              disabled={!isEditing}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        <View style={styles.buttonGroup}>
          <Button
            icon={() => (
              <Icon
                name={isEditing ? 'times-circle' : 'edit'}
                size={18}
                color="white"
              />
            )}
            mode="contained"
            buttonColor={isEditing ? '#4d6642' : '#4d6642'}
            onPress={() => setIsEditing(!isEditing)}
            style={styles.actionButton}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </Button>

          {isEditing && (
            <Button
              icon={() => (
                <Icon
                  name="save"
                  size={18}
                  color="white"
                />
              )}
              mode="contained"
              buttonColor="#4d6642"
              onPress={handleSave}
              style={styles.actionButton}
            >
              Save Changes
            </Button>
          )}

          {/* New Button for updating password */}
          <Button
            icon={() => (
              <Icon
                name="lock"
                size={18}
                color="white"
              />
            )}
            mode="contained"
            buttonColor="#4d6642"
            onPress={() => navigation.navigate('ChangePasswordProfile')}  // الانتقال إلى شاشة تغيير كلمة السر
            style={styles.actionButton}
          >
            Update Password
          </Button>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#E8F5E9',
  },
  profileImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E8F5E9',
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    elevation: 3,
    shadowColor: '#14752e',
    shadowOpacity: 2,
    shadowRadius: 9,
    paddingBottom: 10,
  },
  buttonGroup: {
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  actionButton: {
    marginVertical: 8,
    borderRadius: 10,
  },
});

export default ProfileScreen;
