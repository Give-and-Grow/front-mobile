import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ipAdd from '../scripts/helpers/ipAddress';
import LayoutWithFilters from './LayoutWithFiltersOrg';
import BottomTabBar from './BottomTabBar';
import InviteFrame from './InviteFrame';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';

const CreatevolunterOpportunity = () => {
  const [activeTab, setActiveTab] = useState('creatvoulunter');
    const [createdOpportunityId, setCreatedOpportunityId] = useState(null);

    const handleProfilePress = () => {
      navigation.navigate('CreatevolunterOpportunity');
    };
    const [showInviteFrame, setShowInviteFrame] = useState(false);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [applicationLink, setApplicationLink] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [maxParticipants, setMaxParticipants] = useState('');
  const [basePoints, setBasePoints] = useState('');
const [filter, setFilter] = useState("add_job");
const [startTime, setStartTime] = useState('');
const [endTime, setEndTime] = useState('');
const [successMessage, setSuccessMessage] = useState('');

const [volunteerDays, setVolunteerDays] = useState([]);
const timeOptions = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];
const dayOptions = [
  { label: 'Sunday', value: 'sunday' },
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
];


  const navigation = useNavigation();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get(`${ipAdd}:5000/skills/`);
        setAvailableSkills(response.data);
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to fetch skills');
      }
    };

    fetchSkills();
  }, []);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token || null;
    } catch (e) {
      console.error('Failed to retrieve token', e);
      return null;
    }
  };
const handleSubmit = async () => {
  const token = await getToken();
  if (!token) {
    Alert.alert('Error', 'You must be logged in to create an opportunity.');
    return;
  }

  const formData = {
    title,
    description,
    location,
    start_date: startDate.trim(),
    end_date: endDate.trim(),
    status: 'open',
    image_url: imageUrl,
    application_link: applicationLink,
    contact_email: contactEmail.trim(),
    opportunity_type: 'volunteer',
    skills: selectedSkills,
    max_participants: parseInt(maxParticipants),
    base_points: parseInt(basePoints),
    start_time: startTime,
    end_time: endTime,
    volunteer_days: volunteerDays,
  };

  try {
    // Step 1: Create opportunity
    const response = await axios.post(`${ipAdd}:5000/opportunities/create`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const newOpportunityId = response.data?.opportunity_id;
    setCreatedOpportunityId(newOpportunityId);

    // Step 2: Create chat for this opportunity
    try {
      const chatResponse = await axios.post(`${ipAdd}:5000/chat/opportunity/${newOpportunityId}/create`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Chat created successfully:", chatResponse.data);

      setShowInviteFrame(true); // Show invite UI
      setSuccessMessage("Opportunity and chat created successfully!");

    } catch (chatError) {
      console.error("Failed to create chat", chatError.response?.data || chatError);
      setSuccessMessage("Opportunity created, but failed to create chat.");
    }

  } catch (error) {
    console.error("Failed to create opportunity", error.response?.data || error);
    Alert.alert("Error", "Failed to create opportunity.");
  }
};


  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {['Step 1', 'Step 2', 'Step 3'].map((_, index) => (
        <View
          key={index}
          style={[styles.stepCircle, step === index + 1 ? styles.activeStep : styles.inactiveStep]}
        >
          <Text style={styles.stepText}>{index + 1}</Text>
        </View>
      ))}
    </View>
  );
  const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  const handleSelectImage = () => {
  const options = {
    mediaType: 'photo',
    quality: 0.8,
  };

  launchImageLibrary(options, (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else if (response.assets && response.assets.length > 0) {
      const selectedImage = response.assets[0];
      setImageUrl(selectedImage.uri); // استبدل imageUrl بالـ URI
    }
  });
};

  return (
    
    <LayoutWithFilters onFilterSelect={handleFilterSelect} initialFilter="add_volunteer">
   <ScrollView contentContainerStyle={{ ...styles.container, flexGrow: 1, paddingBottom: 100 }}>

      <Image
        source={require('../assets/images/volunteroppertunites.webp')}
        style={styles.banner}
        resizeMode="contain"
      />
      <Text style={styles.heading}>Create Opportunity</Text>
      {renderStepIndicator()}

      {step === 1 && (
  <>
    <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
    <TextInput
      style={styles.input}
      placeholder="Description"
      value={description}
      onChangeText={setDescription}
      multiline
    />
    <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
    <TouchableOpacity style={[styles.button, { alignSelf: 'center' }]} onPress={() => setStep(2)}>
      <Text style={styles.buttonText}>Next</Text>
    </TouchableOpacity>
  </>
)}

      {step === 2 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Start Date (YYYY-MM-DD)"
            value={startDate}
            onChangeText={setStartDate}
          />
          <TextInput
            style={styles.input}
            placeholder="End Date (YYYY-MM-DD)"
            value={endDate}
            onChangeText={setEndDate}
          />
          <TextInput
            style={styles.input}
            placeholder="Contact Email"
            value={contactEmail}
            onChangeText={setContactEmail}
          />
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setStep(1)}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {step === 3 && (
        <>
       

          <TextInput
            style={styles.input}
            placeholder="Image URL"
            value={imageUrl}
            onChangeText={setImageUrl}
          />

<TouchableOpacity style={styles.uploadButton} onPress={handleSelectImage}>
  <Icon name="camera" size={20} color="#fff" style={{ marginRight: 10 }} />
  <Text style={styles.buttonText}>Choose Image</Text>
</TouchableOpacity>



          <TextInput
            style={styles.input}
            placeholder="Application Link"
            value={applicationLink}
            onChangeText={setApplicationLink}
          />
           <TextInput
            style={styles.input}
            placeholder="Max Participants"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Base Points"
            value={basePoints}
            onChangeText={setBasePoints}
            keyboardType="numeric"
          />
 <Text style={styles.label}>Start Time</Text>
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {timeOptions.map((time) => (
    <TouchableOpacity
      key={time}
      style={[
        styles.skillButton,
        startTime === time && styles.skillSelected,
        { marginRight: 10 },
      ]}
      onPress={() => setStartTime(time)}
    >
      <Text style={styles.skillText}>{time}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>

<Text style={styles.label}>End Time</Text>
<ScrollView horizontal showsHorizontalScrollIndicator={false}>
  {timeOptions.map((time) => (
    <TouchableOpacity
      key={time}
      style={[
        styles.skillButton,
        endTime === time && styles.skillSelected,
        { marginRight: 10 },
      ]}
      onPress={() => setEndTime(time)}
    >
      <Text style={styles.skillText}>{time}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>

<Text style={styles.label}>Volunteer Days</Text>
<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
  {dayOptions.map((day) => (
    <TouchableOpacity
      key={day.value}
      style={[
        styles.skillButton,
        volunteerDays.includes(day.value) && styles.skillSelected,
        { marginRight: 10, marginBottom: 10 },
      ]}
      onPress={() => {
        if (volunteerDays.includes(day.value)) {
          setVolunteerDays(volunteerDays.filter((d) => d !== day.value));
        } else {
          setVolunteerDays([...volunteerDays, day.value]);
        }
      }}
    >
      <Text style={styles.skillText}>{day.label}</Text>
    </TouchableOpacity>
  ))}
</View>
          <Text style={styles.label}>Select Skills:</Text>
          {availableSkills.map((skill) => (
            <TouchableOpacity
              key={skill.id}
              style={[styles.skillButton, selectedSkills.includes(skill.id) && styles.skillSelected]}
              onPress={() => {
                if (selectedSkills.includes(skill.id)) {
                  setSelectedSkills(selectedSkills.filter((id) => id !== skill.id));
                } else {
                  setSelectedSkills([...selectedSkills, skill.id]);
                }
              }}
            >
              <Text style={styles.skillText}>{skill.name}</Text>
            </TouchableOpacity>
          ))}

         
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
              <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
          {showInviteFrame && createdOpportunityId && (
  <InviteFrame
    onYes={() => {
      navigation.navigate('InviteUsersScreen', { opportunityId: createdOpportunityId });
    }}
    onNo={() => setShowInviteFrame(false)}
  />
)}


        </>
      )}
    </ScrollView>
    <BottomTabBar
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  handleProfilePress={handleProfilePress}
/>
    </LayoutWithFilters>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#E8F5E9',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#66bb6a',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#66bb6a',
    borderWidth: 2,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  activeStep: {
    backgroundColor: '#66bb6a',
  },
  inactiveStep: {
    backgroundColor: '#ccc',
  },
  stepText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#66bb6a',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  banner: {
    width: '100%',
    height: 180,
    marginBottom: 20,
    borderRadius: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#2e7d32',
    fontWeight: '600',
  },
  skillButton: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 25,
    backgroundColor: '#a5d6a7',
  },
  skillSelected: {
    backgroundColor: '#66bb6a',
  },
  skillText: {
    color: '#fff',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
 uploadButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#66bb6a', // أخضر أفتح
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 16,
  marginTop: 10,
  marginBottom: 16, // ✨ أضفنا مسافة من الأسفل
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
},



});

export default CreatevolunterOpportunity;
