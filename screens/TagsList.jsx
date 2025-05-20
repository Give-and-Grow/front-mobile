/*import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native';
import axios from 'axios';
import ipAdd from '../scripts/helpers/ipAddress';
const TagsList = ({ opportunityId }) => { // تأكد من تمرير الـ opportunityId كـ prop
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // استرجاع البيانات من الـ API
    const fetchTags = async () => {
      try {
        // تغيير الـ URL ليأخذ الـ opportunityId
        const response = await axios.get(`${ipAdd}:5000/tags/opportunity/${opportunityId}`);
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, [opportunityId]); // التحديث عند تغيير الـ opportunityId

  const renderTagItem = ({ item }) => (
    <TouchableOpacity style={styles.tagItem} onPress={() => handleTagPress(item)}>
      <Text style={styles.tagName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleTagPress = (tag) => {
    setSelectedTag(tag);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTag(null);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tags}
        renderItem={renderTagItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {selectedTag && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tag Details</Text>
              <View style={styles.modelBody}>
                <Text style={styles.modelLabel}>ID:</Text>
                <Text style={styles.modelText}>{selectedTag.id}</Text>
              </View>
              <View style={styles.modelBody}>
                <Text style={styles.modelLabel}>Name:</Text>
                <Text style={styles.modelText}>{selectedTag.name}</Text>
              </View>
              <Button title="Close" onPress={closeModal} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  tagItem: {
    padding: 15,
    backgroundColor: '#4caf50',
    marginBottom: 10,
    borderRadius: 5,
  },
  tagName: {
    color: '#fff',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modelBody: {
    marginBottom: 10,
    width: '100%',
  },
  modelLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modelText: {
    fontSize: 16,
    color: '#333',
  },
});

export default TagsList;
*/
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const homepage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [userType, setUserType] = useState(null); // 'volunteer' or 'organization'
  const [opportunities, setOpportunities] = useState([]);
  const [loadingOpps, setLoadingOpps] = useState(true);
  const [errorOpps, setErrorOpps] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Retrieve the user's role from AsyncStorage to automatically set the user type
    const getUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserType(role); // Set userType based on the stored role
        console.log('Retrieved role:', role);
      } catch (error) {
        console.error('Error retrieving user role:', error);
      }
    };
    
    getUserRole();
  }, []

);

  const handleProfilePress = () => {
    if (!userType) {
      alert('Please select a user type first');
      return;
    }
    if (userType === 'user') {
      navigation.navigate('FollowingScreen');
    } else if (userType === 'organization') {
      navigation.navigate('ProfileOrganizationScreen');
    } 
    else if (userType === 'admin') {
      navigation.navigate('AdminProfile');
    } 
    else {
      console.log('No user type selected');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Image source={require('../assets/images/volunter1.jpg')} style={styles.logo} />
          <Text style={styles.logoText}>GIVE & GROW</Text>
        </View>

        <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.menuButton}>
          <Icon name="bars" size={25} color="#66bb6a" />
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
          <Icon name="user" size={25} color="#66bb6a" />
        </TouchableOpacity>

        {showMenu && (
          <View style={styles.menuDropdown}>
            {['Home', 'Discover Opportunities', 'Job', 'Search', 'Login', 'Sign Up', 'Help Center'].map((item, index) => (
              <TouchableOpacity key={index}>
                <Text style={styles.menuItem}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Hero Section */}
      <ImageBackground style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <Text style={styles.title}>Remarkable Network</Text>
          <Text style={styles.subtitle}>
            VolunteerMatch is the largest network in the nonprofit world, with the most
            volunteers, nonprofits, and opportunities to make a difference.
          </Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search City or Zip Code"
              placeholderTextColor="#888"
              value="Ramallah"
            />
            <TouchableOpacity style={styles.searchButton}>
              <Text style={styles.searchButtonText}>Find Opportunities</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      {/* Impact Section */}
      <View style={styles.impactSection}>
        <Image source={require('../assets/images/volunter2.jpg')} style={styles.impactImage} />
        <View style={styles.impactTextContainer}>
          <Text style={styles.impactTitle}>More people.{"\n"}More impact.</Text>
          <Text style={styles.impactParagraph}>
            VolunteerMatch is the most effective way to recruit highly qualified volunteers for your nonprofit.
            We match you with people who are passionate about and committed to your cause, and who can help
            when and where you need them.
          </Text>
          <Text style={styles.impactParagraph}>
            And because volunteers are often donors as well, we make it easy for them to contribute their time and money.
          </Text>
        </View>
      </View>

      {/* Apply, Give, Grow Section */}
      <View style={styles.stepsContainer}>
        {[{
          id: '01',
          title: 'Apply',
          image: require('../assets/images/volunter1.jpg'),
          description: 'Business leaders may submit our form to take the first step in arranging your Give Day. We’ll then review your application and reach out to begin the planning process.',
        }, {
          id: '02',
          title: 'Give',
          image: require('../assets/images/volunter1.jpg'),
          description: 'We create a unique, guided experience where you and your team can spend the day supporting people in your community without the usual daily distractions.',
        }, {
          id: '03',
          title: 'Grow',
          image: require('../assets/images/volunter1.jpg'),
          description: 'Rediscover your purpose by giving back to the community. Make a lasting impact.',
        }].map((step) => (
          <View key={step.id} style={styles.stepCard}>
            <Image source={step.image} style={styles.stepImage} />
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        ))}
      </View>
     
      {userType === 'organization' && (
  <View >
    {/* Add Volunteering Opportunity Button */}
    <TouchableOpacity
      style={styles.opportunityListButton}
      onPress={() => navigation.navigate('RateParticipantsScreen')}
    >
      <Text style={styles.opportunityListButtonText}>➕ Rate User </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.opportunityListButton}
      onPress={() => navigation.navigate('ManageTagsScreenOrg')}
    >
      <Text style={styles.opportunityListButtonText}>➕ Manage tage  </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.opportunityListButton}
      onPress={() => navigation.navigate('CreatevolunterOpportunity')}
    >
      <Text style={styles.opportunityListButtonText}>➕   Add Volunteering Opportunity</Text>
    </TouchableOpacity>

    {/* Add Job Opportunity Button */}
    <TouchableOpacity
      style={styles.opportunityListButton}
      onPress={() => navigation.navigate('CreateJobOpportunity')}
    >
      <Text style={styles.opportunityListButtonText}>➕    Add Job Opportunity</Text>
    </TouchableOpacity>
    <TouchableOpacity
  style={styles.opportunityListButton}
  onPress={() => navigation.navigate('OpportunityList')}
>
  <Text style={styles.opportunityListButtonText}>📋 View All Opportunities</Text>
</TouchableOpacity>

  </View>
)}
{userType === 'user' && (
  <TouchableOpacity
    style={styles.opportunityListButton}
    onPress={() => navigation.navigate('CreatePost')}
  >
    <Text style={styles.opportunityListButtonText}>📍 follow screen </Text>
  </TouchableOpacity>
)}
{userType === 'user' && (
  <TouchableOpacity
    style={styles.opportunityListButton}
    onPress={() => navigation.navigate('nearby_opportunitiesUser')}
  >
    <Text style={styles.opportunityListButtonText}>📍 View Nearby Opportunities</Text>
  </TouchableOpacity>
)}
{userType === 'user' && (
  <TouchableOpacity
    style={styles.opportunityListButton}
    onPress={() => navigation.navigate('AllOppertinitesUser')}
  >
    <Text style={styles.opportunityListButtonText}>📍 View  Opportunities User </Text>
  </TouchableOpacity>
)}
{userType === 'admin' && (
  <TouchableOpacity
    style={styles.opportunityListButton}
    onPress={() => navigation.navigate('AdminDashboardScreen')}
  >
    <Text style={styles.opportunityListButtonText}>📍 Dashbord admin</Text>
  </TouchableOpacity>
  
)}
{userType === 'admin' && (
  <TouchableOpacity
    style={styles.opportunityListButton}
    onPress={() => navigation.navigate('adminfeaturerejectapprove')}
  >
    <Text style={styles.opportunityListButtonText}>📍 adminfeature</Text>
  </TouchableOpacity>
  
)}
{userType === 'admin' && (
  <TouchableOpacity
    style={styles.opportunityListButton}
    onPress={() => navigation.navigate('adminfeatchallorganizationandDelete')}
  >
    <Text style={styles.opportunityListButtonText}>📍 adminfeatureDelete or giveAll</Text>
  </TouchableOpacity>
  
)}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
    color: '#388e3c',
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 10,
  },
  profileButton: {
    padding: 10,
  },
  menuDropdown: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: 10,
  },
  menuItem: {
    fontSize: 16,
    paddingVertical: 5,
  },
  background: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  input: {
    width: '70%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginRight: 10,
  },
  searchButton: {
    padding: 10,
    backgroundColor: '#66bb6a',
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  arrow: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 5,
  },
  impactSection: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#f1f8e9',
  },
  impactImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginRight: 20,
  },
  impactTextContainer: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  impactParagraph: {
    fontSize: 16,
    marginTop: 10,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 20,
  },
  stepCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  stepImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  stepDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  opportunityListButton: {
    margin: 20,
    padding: 12,
    backgroundColor: '#66bb6a',
    borderRadius: 8,
    alignItems: 'center',
  },
  opportunityListButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  
});

export default homepage;




const handleProfilePress = () => {
  if (userType === 'admin') {
    navigation.navigate('AdminProfile');
  } else if(userType === 'organization') {
    navigation.navigate('FollowScreenOrganization');
  }
  else if(userType === 'user') {
    navigation.navigate('FollowingScreen');
  }
};


const fields = [
  {
    label: 'Status',
    icon: 'information-outline',
    key: 'status',
    options: [
      { label: 'Open', value: 'OPEN' },
      { label: 'Closed', value: 'CLOSED' }
    ]
  },
  {
    label: 'Opportunity Type',
    icon: 'briefcase-check-outline',
    key: 'opportunity_type',
    options: [
      { label: 'Job', value: 'JOB' },
      { label: 'Volunteer', value: 'VOLUNTEER' }
    ]
  },
  {
    label: 'Location',
    icon: 'map-marker-radius',
    key: 'location',
    options: [
      { label: 'Ramallah', value: 'Ramallah' },
      { label: 'Jerusalem', value: 'Jerusalem' },
      { label: 'Gaza', value: 'Gaza' },
      { label: 'Nablus', value: 'Nablus' },
      { label: 'Hebron', value: 'Hebron' },
      { label: 'Bethlehem', value: 'Bethlehem' },
      { label: 'Jenin', value: 'Jenin' },
      { label: 'Tulkarm', value: 'Tulkarm' },
      { label: 'Qalqilya', value: 'Qalqilya' },
      { label: 'Salfit', value: 'Salfit' },
      { label: 'Tubas', value: 'Tubas' },
      { label: 'Rafah', value: 'Rafah' },
      { label: 'Khan Younis', value: 'Khan Younis' },
      // الأردن
      { label: 'Amman', value: 'Amman' },
      { label: 'Irbid', value: 'Irbid' },
      { label: 'Zarqa', value: 'Zarqa' },
      { label: 'Aqaba', value: 'Aqaba' },
      { label: 'Salt', value: 'Salt' },
      { label: 'Madaba', value: 'Madaba' },
      // لبنان
      { label: 'Beirut', value: 'Beirut' },
      { label: 'Tripoli', value: 'Tripoli' },
      { label: 'Sidon', value: 'Sidon' },
      // سوريا
      { label: 'Damascus', value: 'Damascus' },
      { label: 'Aleppo', value: 'Aleppo' },
      { label: 'Homs', value: 'Homs' },
      // مصر
      { label: 'Cairo', value: 'Cairo' },
      { label: 'Alexandria', value: 'Alexandria' },
      { label: 'Giza', value: 'Giza' },
      // العراق
      { label: 'Baghdad', value: 'Baghdad' },
      { label: 'Basra', value: 'Basra' },
      { label: 'Erbil', value: 'Erbil' },
      // الخليج
      { label: 'Riyadh', value: 'Riyadh' },
      { label: 'Jeddah', value: 'Jeddah' },
      { label: 'Mecca', value: 'Mecca' },
      { label: 'Doha', value: 'Doha' },
      { label: 'Dubai', value: 'Dubai' },
      { label: 'Abu Dhabi', value: 'Abu Dhabi' },
      { label: 'Kuwait City', value: 'Kuwait City' },
      { label: 'Manama', value: 'Manama' },
      { label: 'Muscat', value: 'Muscat' },
    ]
  },
  {
    label: 'Skill',
    icon: 'star-outline',
    key: 'skill_id',
    options: [
      { label: 'Programming', value: '1' },
      { label: 'Design', value: '2' },
      { label: 'Marketing', value: '3' },
      { label: 'Project Management', value: '4' },
      { label: 'Data Analysis', value: '5' },
      { label: 'Public Speaking', value: '6' },
      { label: 'Teaching', value: '7' },
      { label: 'Writing & Editing', value: '8' },
      { label: 'Translation', value: '9' },
      { label: 'Photography', value: '10' },
      { label: 'Video Editing', value: '11' },
      { label: 'Customer Service', value: '12' },
      { label: 'Event Planning', value: '13' },
      { label: 'Social Media Management', value: '14' },
      { label: 'SEO', value: '15' },
      { label: 'Cybersecurity', value: '16' },
      { label: 'UI/UX Design', value: '17' },
      { label: 'Fundraising', value: '18' },
      { label: 'Human Resources', value: '19' },
      { label: 'Accounting', value: '20' },
      { label: 'Healthcare Support', value: '21' },
      { label: 'First Aid', value: '22' },
      { label: 'Logistics', value: '23' },
      { label: 'Software Testing', value: '24' },
      { label: 'Mentoring', value: '25' },
      { label: 'Leadership', value: '26' },
      { label: 'Sales', value: '27' },
      { label: 'Database Management', value: '28' },
      { label: 'Cloud Computing', value: '29' },
      { label: 'Machine Learning', value: '30' }
    ]
  },
  {
    label: 'Organization',
    icon: 'account-group-outline',
    key: 'organization_id',
    options: [
      { label: 'Red Crescent', value: '10' },
      { label: 'UNICEF', value: '11' },
      { label: 'Green NGO', value: '12' },
      { label: 'Doctors Without Borders', value: '13' },
      { label: 'Save the Children', value: '14' },
      { label: 'Palestinian Medical Relief Society', value: '15' },
      { label: 'Arab Youth Climate Movement', value: '16' },
      { label: 'Islamic Relief Worldwide', value: '17' },
      { label: 'CARE International', value: '18' },
      { label: 'World Food Programme', value: '19' },
      { label: 'United Nations Development Programme (UNDP)', value: '20' },
      { label: 'Rebuilding Alliance', value: '21' },
      { label: 'ANERA (American Near East Refugee Aid)', value: '22' },
      { label: 'Tamer Institute for Community Education', value: '23' },
      { label: 'Al Nayzak Organization', value: '24' },
      { label: 'Right To Play', value: '25' },
      { label: 'ActionAid Palestine', value: '26' },
      { label: 'OXFAM', value: '27' },
      { label: 'YMCA Palestine', value: '28' },
      { label: 'Youth Without Borders', value: '29' },
      { label: 'Terre des hommes', value: '30' }
    ]
  },
  {
    label: 'Start Time',
    icon: 'clock-outline',
    key: 'start_time',
    options: [
      { label: '06:00', value: '06:00' },
      { label: '08:00', value: '08:00' },
      { label: '10:00', value: '10:00' },
      { label: '12:00', value: '12:00' },
      { label: '14:00', value: '14:00' },
      { label: '16:00', value: '16:00' },
      { label: '18:00', value: '18:00' },
      { label: '20:00', value: '20:00' },
      { label: '22:00', value: '22:00' }
    ]
  },
  {
    label: 'End Time',
    icon: 'clock-check-outline',
    key: 'end_time',
    options: [
      { label: '06:00', value: '06:00' },
      { label: '08:00', value: '08:00' },
      { label: '10:00', value: '10:00' },
      { label: '12:00', value: '12:00' },
      { label: '14:00', value: '14:00' },
      { label: '16:00', value: '16:00' },
      { label: '18:00', value: '18:00' },
      { label: '20:00', value: '20:00' },
      { label: '22:00', value: '22:00' }
    ]
  },
  {
    label: 'Volunteer Days',
    icon: 'calendar-check-outline',
    key: 'volunteer_days',
    options: [
      { label: 'Monday', value: 'Monday' },
      { label: 'Tuesday', value: 'Tuesday' },
      { label: 'Wednesday', value: 'Wednesday' },
      { label: 'Thursday', value: 'Thursday' },
      { label: 'Friday', value: 'Friday' },
      { label: 'Saturday', value: 'Saturday' },
      { label: 'Sunday', value: 'Sunday' }
    ]
  }
];
