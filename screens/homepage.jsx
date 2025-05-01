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
      navigation.navigate('ProfileScreen');
    } else if (userType === 'organization') {
      navigation.navigate('ProfileOrganizationScreen');
    } else {
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
        <Image source={require('../assets/images/volunter3.webp')} style={styles.impactImage} />
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
