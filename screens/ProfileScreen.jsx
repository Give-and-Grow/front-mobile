import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, Text, View, FlatList, TouchableOpacity, Alert, Modal} from 'react-native';
import { Appbar, Card, TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import ipAdd from '../scripts/helpers/ipAddress';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
  

  const [peopleToFollow, setPeopleToFollow] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [viewFollowers, setViewFollowers] = useState(false);
  const [userData, setUserData] = useState(null);  // State for user profile data
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [mySkills, setMySkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false); // For showing modals
  const [modalType, setModalType] = useState(''); // To track which modal to show ('followers' or 'following')
  const navigation = useNavigation();

  useEffect(() => {
    const getToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (savedToken) {
          setToken(savedToken);
          fetchProfile(savedToken);
          fetchMySkills(savedToken);
          fetchAvailableSkills(savedToken);
         
        }
      } catch (err) {
        console.error('Error retrieving token:', err);
      }
    };

    getToken();
  }, []);
  const fetchPeople = async () => {
    try {
      const response = await axios.get(`${ipAdd}:5000/follow/following`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPeopleToFollow(response.data);
    } catch (error) {
      console.error('Error fetching people:', error);
      Alert.alert('Error', 'Failed to fetch people data.');
    }
  };
  useEffect(() => {
    if (token) {
      // Fetch people to follow
     

      // Fetch followers
      const fetchFollowers = async () => {
        try {
          const response = await axios.get(`${ipAdd}:5000/follow/followers`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setFollowers(response.data);
        } catch (error) {
          console.error('Error fetching followers:', error);
          Alert.alert('Error', 'Failed to fetch followers data.');
        }
      };

      fetchPeople();
      fetchFollowers();
    }
  }, [token]);  // Runs only when token is set
  const handleUnfollow = async (personId) => {
    try {
      const response = await axios.delete(`${ipAdd}:5000/follow/${personId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Unfollowed successfully!');
        await fetchPeople(); // ✅ هذا يكفي لتحديث القائمة بشكل صحيح
      } else {
        Alert.alert('Error', 'Failed to unfollow.');
      }
    } catch (error) {
      console.error('Unfollow error:', error);
      Alert.alert('Error', 'Failed to connect to the server.');
    }
  };
  
  const fetchProfile = async (token) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      if (res.data.country) {
        setSelectedCountry(res.data.country);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };
  const renderItem = ({ item }) => (
    <View style={styles.personCard}>
      <View style={styles.profileContainer}>
        {item.profile_picture ? (
          <Image source={{ uri: item.profile_picture }} style={styles.profileImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.initials}>{item.username.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.personName}>{item.username}</Text>
      </View>
      {modalType === 'followers' && (
        <TouchableOpacity
          style={styles.unfollowButton}
          onPress={() => handleUnfollow(item.id)}
        >
          <Text style={styles.unfollowButtonText}>Unfollow</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  const fetchMySkills = async (t) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/user-skills/`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setMySkills(res.data.skills);
    } catch (err) {
      Alert.alert('Error', 'Failed to load my skills');
    }
  };

  const fetchAvailableSkills = async (t) => {
    try {
      const res = await axios.get(`${ipAdd}:5000/user-skills/available`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setAvailableSkills(res.data.available_skills);
    } catch (err) {
      Alert.alert('Error', 'Failed to load available skills');
    }
  };

  const addSkill = async (skillId, skillName) => {
    try {
      await axios.post(`${ipAdd}:5000/user-skills/add/${skillId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // إذا كانت المهارات موجودة، أضف المهارة الجديدة في سطر جديد، وإذا لم تكن موجودة، قم بوضعها كأول مهارة
      setProfile((prevProfile) => ({
        ...prevProfile,
        skills: prevProfile.skills ? `${prevProfile.skills}\n${skillName}` : skillName,
      }));

      fetchMySkills(token);
      fetchAvailableSkills(token);
    } catch {
      Alert.alert('Error', 'Could not add skill');
    }
  };

  const removeSkill = async (skillId, skillName) => {
    try {
      await axios.delete(`${ipAdd}:5000/user-skills/remove/${skillId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // إذا كانت المهارات موجودة، أزل المهارة التي تريد حذفها وقم بترتيب المهارات في سطور جديدة
      setProfile((prevProfile) => ({
        ...prevProfile,
        skills: prevProfile.skills
          .split('\n')  // تقسيم المهارات باستخدام السطر الجديد
          .filter((skill) => skill !== skillName)  // إزالة المهارة المحددة
          .join('\n'),  // إعادة ترتيب المهارات في سطور جديدة
      }));

      fetchMySkills(token);
      fetchAvailableSkills(token);
    } catch {
      Alert.alert('Error', 'Could not remove skill');
    }
  };

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async () => {
    const editableFields = [
      'name', 'last_name', 'username', 'phone_number', 'gender',
      'city', 'village', 'country', 'bio', 'experience', 'date_of_birth', 'profile_picture'
    ];

    const cleanedProfile = {};
    editableFields.forEach((key) => {
      if (profile[key] !== undefined && profile[key] !== null) {
        cleanedProfile[key] = profile[key];
      }
    });

    try {
      const res = await axios.put(`${ipAdd}:5000/profile/`, cleanedProfile, {
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

  // مكون SkillItem لعرض المهارة
  const SkillItem = ({ skill, isMySkill, onAdd, onRemove }) => (
    <View style={styles.skillItem}>
      <Text style={styles.skillText}>{skill.name}</Text>
      {isMySkill ? (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(skill.id, skill.name)}
        >
          <Icon name="times-circle" size={22} color="#fff" style={styles.icon} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAdd(skill.id, skill.name)}
        >
          <Icon name="check-circle" size={22} color="#fff" style={styles.icon} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <Appbar.Header style={{ backgroundColor: '#E8F5E9' }}>
        <Appbar.Content title="My Profile" />
      </Appbar.Header>

      <FlatList
      data={[profile]} // We only have one profile, so we wrap it in an array for FlatList
      keyExtractor={() => 'profile'} // Unique key for each list item
      renderItem={({ item }) => (
        <View style={styles.container}>
          {/* Display Profile Image */}
       
          <View style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
      {item.profile_picture ? (
            <Image source={{ uri: item.profile_picture }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.initials}>
                {item.username?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        
      </View>

     {/* Icons to toggle between modals */}
     <View style={styles.iconContainer}>
        <TouchableOpacity
          onPress={() => {
            setModalType('followers');
            setIsModalVisible(true);
          }}
        >
          <Ionicons name="people-circle-outline" size={30} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setModalType('following');
            setIsModalVisible(true);
          }}
        >
          <Ionicons name="person-add-outline" size={30} color="#333" />
        </TouchableOpacity>
      </View>





 {/* Modal to show either followers or following */}
 <Modal
  visible={isModalVisible}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setIsModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        {modalType === 'followers' ? 'People Following You' : 'People You Are Following'}
      </Text>

      <FlatList
        data={modalType === 'followers' ? followers : peopleToFollow}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        style={styles.flatList}
      />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setIsModalVisible(false)}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </View>
<Card style={styles.card}>
              <Card.Title title="Basic Information" />
              <Card.Content>
                <View style={styles.inputWithIcon}>
                  <Icon name="user" size={20} color="#4d6642" />
                  <TextInput
                    label="First Name"
                    value={item.name || ''}
                    onChangeText={(text) => handleChange('name', text)}
                    disabled={!isEditing}
                    mode="outlined"
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputWithIcon}>
                  <Icon name="user" size={20} color="#4d6642" />
                  <TextInput
                    label="Last Name"
                    value={item.last_name || ''}
                    onChangeText={(text) => handleChange('last_name', text)}
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
              </Card.Content>
            </Card>

          {/* Contact Info */}
          <Card style={styles.card}>
              <Card.Title title="Contact Information" />
              <Card.Content>
                <View style={styles.inputWithIcon}>
                  <Icon name="envelope" size={20} color="#4d6642" />
                  <TextInput
                    label="Email"
                    value={profile.email || ''}
                    disabled
                    mode="outlined"
                    multiline
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputWithIcon}>
                  <Icon name="phone" size={20} color="#4d6642" />
                  <TextInput
                    label="Phone Number"
                    value={profile.phone_number || ''}
                    onChangeText={(text) => handleChange('phone_number', text)}
                    disabled={!isEditing}
                    mode="outlined"
                    multiline
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputWithIcon}>
                  <Icon name="city" size={20} color="#4d6642" />
                  <TextInput
                    label="City"
                    value={profile.city || ''}
                    onChangeText={(text) => handleChange('city', text)}
                    disabled={!isEditing}
                    mode="outlined"
                    multiline
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputWithIcon}>
                  <Icon name="map-marker-alt" size={20} color="#4d6642" />
                  <TextInput
                    label="Village"
                    value={profile.village || ''}
                    onChangeText={(text) => handleChange('village', text)}
                    disabled={!isEditing}
                    mode="outlined"
                    multiline
                    style={styles.input}
                  />
                </View>

                {/* Country Dropdown */}
                <Text style={styles.dropdownLabel}>Country</Text>
                <Picker
                  selectedValue={selectedCountry}
                  onValueChange={(itemValue) => {
                    setSelectedCountry(itemValue);
                    handleChange('country', itemValue);
                  }}
                  enabled={isEditing}
                  style={[styles.picker, isEditing ? styles.pickerEditable : styles.pickerDisabled]}
                >
                  <Picker.Item label="Select Country" value="" />
                  <Picker.Item label="United States" value="United States" />
                  <Picker.Item label="Canada" value="Canada" />
                  <Picker.Item label="Australia" value="Australia" />
                  <Picker.Item label="Egypt" value="Egypt" />
                  <Picker.Item label="Germany" value="Germany" />
                  <Picker.Item label="United Kingdom" value="United Kingdom" />
                  {/* Add more countries as needed */}
                </Picker>
              </Card.Content>
            </Card>

        {/* Volunteer Info */}
<Card style={styles.card}>
  <Card.Title title="Volunteer Information" />
  <Card.Content>
    <View style={styles.inputWithIcon}>
      <Icon name="transgender" size={20} color="#4d6642" />
      <TextInput
        label="Gender"
        value={profile.gender || ''}
        onChangeText={(text) => handleChange('gender', text)}
        disabled={!isEditing}
        mode="outlined"
        multiline
        style={styles.input}
      />
    </View>
    <View style={styles.inputWithIcon}>
      <Icon name="calendar-alt" size={20} color="#4d6642" />
      <TextInput
        label="Date of Birth"
        value={profile.date_of_birth || ''}
        onChangeText={(text) => handleChange('date_of_birth', text)}
        disabled={!isEditing}
        mode="outlined"
        multiline
        style={styles.input}
        placeholder="YYYY-MM-DD"
      />
    </View>
    <View style={styles.inputWithIcon}>
      <Icon name="user" size={20} color="#4d6642" />
      <TextInput
        label="Bio"
        value={profile.bio || ''}
        onChangeText={(text) => handleChange('bio', text)}
        disabled={!isEditing}
        mode="outlined"
        multiline
        style={styles.input}
      />
    </View>
    <View style={styles.inputWithIcon}>
      <Icon name="briefcase" size={20} color="#4d6642" />
      <TextInput
        label="Experience"
        value={profile.experience || ''}
        onChangeText={(text) => handleChange('experience', text)}
        disabled={!isEditing}
        mode="outlined"
        multiline
        style={styles.input}
      />
    </View>
    <View style={styles.inputWithIcon}>
  <Icon name="wrench" size={20} color="#4d6642" />
  <TextInput
  label="Skills"
  value={profile.skills || ''}
  onChangeText={() => {}}
  disabled // بدل disabled
  mode="outlined"
  multiline
  style={styles.input}
/>
</View>
  </Card.Content>
</Card>


            {/* Skills */}
            <Card style={styles.card}>
              <Card.Title title="Skills" />
              <Card.Content>
                <FlatList
                  data={mySkills}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => <SkillItem skill={item} isMySkill onRemove={removeSkill} />}
                />
                <Text style={{ marginBottom: 10, fontSize: 16 }}>Available Skills</Text>
                <FlatList
                  data={availableSkills}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <SkillItem skill={item} isMySkill={false} onAdd={addSkill} />
                  )}
                />
              </Card.Content>
            </Card>

            {/* Action Buttons */}
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
                buttonColor="#4d6642"
                onPress={() => setIsEditing(!isEditing)}
                style={styles.actionButton}
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </Button>

              {isEditing && (
                <Button
                  icon={() => <Icon name="save" size={18} color="white" />}
                  mode="contained"
                  buttonColor="#4d6642"
                  onPress={handleSave}
                  style={styles.actionButton}
                >
                  Save Changes
                </Button>
              )}

              <Button
                icon={() => <Icon name="lock" size={18} color="white" />}
                mode="contained"
                buttonColor="#4d6642"
                onPress={() => navigation.navigate('ChangePasswordProfile')}
                style={styles.actionButton}
              >
                Update Password
              </Button>
            </View>
          </View>
        )}
      />
    </>
  );
  
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
 
  card: {
    marginBottom: 10,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  saveButton: {
    marginTop: 20,
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 20
  },
  skillItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginVertical: 5,
    flexWrap: 'wrap', // يسمح بتوزيع العناصر على عدة صفوف
    width: '48%', // عرض العنصر ليشغل نصف المساحة (يحتاج إلى تعديل حسب عدد الأعمدة)
  },
  skillText: {  
    color: '#4d6642', 
    fontSize: 16, 
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4d6642',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginBottom: 5,
  },
  removeButton: {
    backgroundColor: '#660702',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginBottom: 5,
  },
  icon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  
  
  buttonText: { color: '#fff' },
  dropdownLabel: {
    marginVertical: 5,
    fontSize: 16,
    color: '#4d6642',
  },
  picker: {
    height: 50,
    marginBottom: 15,
  },
  pickerEditable: {
    backgroundColor: '#e8f5e9',
  },
  pickerDisabled: {
    backgroundColor: '#e0e0e0',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
    marginBottom: 20,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  bio: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personName: {
    fontSize: 18,
    color: '#333',
  },
  
 
  toggleButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
 
  unfollowButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginLeft: 15,
  },
  unfollowButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // خلفية شفافة مظللة
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    width: '95%', // جعل المودال أعرض
    maxHeight: '75%',
    borderRadius: 25,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2e7d32', // أخضر أنيق
    marginBottom: 15,
    textAlign: 'center',
  },
  flatList: {
    marginBottom: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  closeButton: {
    backgroundColor: '#43a047', // أخضر مريح
    paddingVertical: 12,
    paddingHorizontal: 70,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
