import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Appbar, Card, TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import ipAdd from '../scripts/helpers/ipAddress';
const ProfileScreen = () => {
  const [profile, setProfile] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [token, setToken] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [mySkills, setMySkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
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
            {item.profile_picture && (
              <Image source={{ uri: item.profile_picture }} style={styles.profileImage} />
            )}

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
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
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
});

export default ProfileScreen;
