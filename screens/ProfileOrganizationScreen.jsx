import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Image, View } from 'react-native';
import { Appbar, Card, TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';  // Import useNavigation
import ipAdd from '../scripts/helpers/ipAddress';
import BottomTabBar from './BottomTabBar';
const ProfileOrganizationScreen = () => {
  const [activeTab, setActiveTab] = useState('profileorg');
        
      const handleProfilePress = () => {
        navigation.navigate('ProfileOrganizationScreen');
      };
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState('');
  const navigation = useNavigation();  // Using useNavigation

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
      console.log('Fetching profile with token:', token);  // Debug log
      const res = await axios.get(`${ipAdd}:5000/organization/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Profile fetched:', res.data);  // Debug log
      setProfile(res.data);
    } catch (err) {
      console.error('Fetch profile error:', err.response ? err.response.data : err.message);
      alert('Error fetching profile: ' + (err.response ? err.response.data : err.message));
    }
  };
  

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    const editableFields = [
      'name', 'description', 'phone', 'address', 'logo', 'proof_image'
    ];

    const cleanedProfile = {};
    editableFields.forEach((key) => {
      if (profile[key] !== undefined && profile[key] !== null) {
        cleanedProfile[key] = profile[key];
      }
    });

    try {
      const res = await axios.put(`${ipAdd}:5000/organization/profile`, cleanedProfile, {
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
        <Appbar.Content title="Organization Profile" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        {profile.logo && (
          <Image source={{ uri: profile.logo }} style={styles.profileImage} />
        )}

        {/* Organization Info */}
        <Card style={styles.card}>
          <Card.Title title="Organization Information" />
          <Card.Content>
            <TextInput
              label="Organization Name"
              value={profile.name || ''}
              onChangeText={(text) => handleChange('name', text)}
              disabled={!isEditing}
              mode="outlined"
            />
            <TextInput
              label="Description"
              value={profile.description || ''}
              onChangeText={(text) => handleChange('description', text)}
              disabled={!isEditing}
              mode="outlined"
              multiline
            />
            <TextInput
              label="Phone"
              value={profile.phone || ''}
              onChangeText={(text) => handleChange('phone', text)}
              disabled={!isEditing}
              mode="outlined"
            />
            <TextInput
              label="Address"
              value={profile.address || ''}
              onChangeText={(text) => handleChange('address', text)}
              disabled={!isEditing}
              mode="outlined"
            />
          </Card.Content>
        </Card>

        {/* Organization Proof */}
        {profile.proof_image && (
          <Card style={styles.card}>
            <Card.Title title="Proof Image" />
            <Card.Content>
              <Image source={{ uri: profile.proof_image }} style={styles.profileImage} />
            </Card.Content>
          </Card>
        )}

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
            onPress={() => navigation.navigate('ChangePasswordProfile')}  // Navigate to password change screen
            style={styles.actionButton}
          >
            Update Password
          </Button>
        </View>
      </ScrollView>
      <BottomTabBar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  handleProfilePress={handleProfilePress}
/>
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

export default ProfileOrganizationScreen;
