import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { Appbar, Card, TextInput, Button, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';
import { useNavigation } from '@react-navigation/native';  // Import useNavigation
const AdminProfile = () => {
  const [admin, setAdmin] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState('');
 const navigation = useNavigation();  // Using useNavigation
  useEffect(() => {
    const fetchTokenAndData = async () => {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        setToken(savedToken);
        fetchAdminProfile(savedToken);
      }
    };
    fetchTokenAndData();
  }, []);

  const fetchAdminProfile = async (t) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/profile/`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setAdmin(res.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  const handleChange = (field, value) => {
    console.log(`Changing ${field} to ${value}`);  // Log the field and value
    setAdmin({ ...admin, [field]: value });
  };
  

  const handleSave = async () => {
    console.log('Saving admin data...', admin);  // Check if admin data is correct
    try {
      const res = await axios.put(`${ipAdd}:5000/profile`, admin, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Save successful', res.data);  // Check response
      setIsEditing(false);  // Disable editing after save
    } catch (err) {
      console.error('Error saving changes:', err);  // Log any errors
    }
  };
  

  return (
    <>
      <Appbar.Header style={{ backgroundColor: '#C8E6C9' }}>
        <Appbar.Content title="Admin Profile" />
      </Appbar.Header>

      <FlatList
        data={[admin]}
        keyExtractor={() => 'admin-profile'}
        renderItem={({ item }) => (
          <View style={styles.container}>
            {item.profile_picture && (
              <Image source={{ uri: item.profile_picture }} style={styles.profileImage} />
            )}
            <Card style={styles.card}>
              <Card.Title title="Admin Information" />
              <Card.Content>
                <View style={styles.inputWithIcon}>
                  <Icon name="user-shield" size={20} color="#4d6642" />
                  <TextInput
                    label="Full Name"
                    value={item.name || ''}
                    onChangeText={(text) => handleChange('name', text)}
                    disabled={!isEditing}
                    mode="outlined"
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputWithIcon}>
                  <Icon name="user-tag" size={20} color="#4d6642" />
                  <TextInput
                    label="Username"
                    value={item.username || ''}
                    onChangeText={(text) => handleChange('username', text)}
                    disabled={!isEditing}
                    mode="outlined"
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputWithIcon}>
                  <Icon name="envelope" size={20} color="#4d6642" />
                  <TextInput
                    label="Email"
                    value={item.email || ''}
                    disabled
                    mode="outlined"
                    style={styles.input}
                  />
                </View>
                <View style={styles.infoRow}>
      <Icon name="user-cog" size={20} color="#4d6642" />
      <Text style={styles.detailText}>Role: {item.role}</Text>
    </View>

    <View style={styles.infoRow}>
      <Icon name="crown" size={20} color="#4d6642" />
      <Text style={styles.detailText}>Role Level: {item.role_level}</Text>
    </View>
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

              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Title title="Admin Tools" />
              <Card.Content>
                <TouchableOpacity style={styles.adminTool}>
                  <Icon name="users-cog" size={20} color="#2e7d32" />
                  <Text style={styles.toolText}>Manage Users</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.adminTool}>
                  <Icon name="tasks" size={20} color="#2e7d32" />
                  <Text style={styles.toolText}>View System Logs</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          </View>
        )}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10 },
  profileImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    borderRadius: 60,
    marginVertical: 10,
  },
  card: {
    marginVertical: 8,
    backgroundColor: '#f4fdf5',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#81C784',
  },
  adminTool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    padding: 10,
    borderColor: '#AED581',
    borderWidth: 1,
    borderRadius: 10,
  },
  toolText: {
    fontSize: 16,
    color: '#33691E',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#2e7d32',
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

export default AdminProfile;
