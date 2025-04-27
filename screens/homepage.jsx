import React, { useState } from 'react';
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
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const Homepage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const navigation = useNavigation(); // الوصول إلى التنقل

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
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={styles.profileButton}>
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
            volunteers, nonprofits and opportunities to make a difference.
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
          description: 'Rediscover your ability to profoundly impact others, your team and create more meaning in your own life.',
        }].map((step, index) => (
          <View key={index} style={styles.stepBox}>
            <Image source={step.image} style={styles.stepImage} />
            <Text style={styles.stepNumber}>{step.id}</Text>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>APPLY HERE</Text>
        </TouchableOpacity>
      </View>

      {/* Social Media Section */}
      <View style={styles.socialSection}>
        <Text style={styles.socialTitle}>Follow Us!</Text>
        <View style={styles.socialDivider} />
        <View style={styles.iconRow}>
          {['facebook', 'twitter', 'youtube-play', 'linkedin', 'instagram'].map((icon, i) => (
            <TouchableOpacity key={i} onPress={() => Linking.openURL(`https://${icon}.com`)}>
              <Icon name={icon} size={24} color="#555" style={styles.icon} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Homepage;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd', 
    position: 'relative', 
    zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 30, height: 30, marginRight: 8 },
  logoText: { fontSize: 15, fontWeight: 'italic', color: '#003366' },
  menuButton: { padding: 10 },
  profileButton: { padding: 10 },
  menuDropdown: { position: 'absolute', top: 60, right: 15, backgroundColor: '#fff', borderRadius: 6, borderColor: '#ccc', borderWidth: 1, width: 200, elevation: 6, zIndex: 999 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 15, borderBottomColor: '#eee', borderBottomWidth: 1, fontSize: 14, color: '#14752e' },
  background: { flex: 1, justifyContent: 'center' },
  overlay: { paddingHorizontal: 20, alignItems: 'center', backgroundColor: 'rgba(52, 179, 2, 0.3)', paddingVertical: 30 },
  title: { fontSize: 32, fontWeight: '300', color: '#fff', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 30, maxWidth: 340 },
  searchContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, alignItems: 'center', overflow: 'hidden', elevation: 4, width: '100%' },
  input: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, fontSize: 14, color: '#333' },
  searchButton: { backgroundColor: '#66bb6a', paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' },
  searchButtonText: { color: '#fff', fontWeight: '600', fontSize: 13, marginRight: 4 },
  arrow: { color: '#fff', fontSize: 18 },
  impactSection: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fdfdfd', flexWrap: 'wrap' },
  impactImage: { width: 160, height: 160, borderRadius: 100, marginRight: 20 },
  impactTextContainer: { flex: 1, minWidth: 220 },
  impactTitle: { fontSize: 24, fontWeight: '300', color: '#333', marginBottom: 10 },
  impactParagraph: { fontSize: 14, color: '#555', marginBottom: 6, lineHeight: 20 },
  stepsContainer: { padding: 30, backgroundColor: '#fff', alignItems: 'center' },
  stepBox: { width: '100%', maxWidth: 300, alignItems: 'center', marginBottom: 30 },
  stepImage: { width: 250, height: 150, borderRadius: 6, resizeMode: 'cover' },
  stepNumber: {
    fontSize: 20,
    color: '#388e3c',
    fontWeight: '800',
    marginTop: -0,
    position: 'absolute',
    top: -20,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
    fontFamily: 'Cursive',
    fontStyle: 'italic',
    letterSpacing: 2,
  },
  stepTitle: { fontSize: 22, fontWeight: '600', marginVertical: 6, color: '#000' },
  stepDescription: { fontSize: 14, textAlign: 'center', color: '#333', lineHeight: 20 },
  applyButton: { backgroundColor: '#14752e', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 6, marginTop: 10 },
  applyButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  socialSection: { padding: 20, backgroundColor: '#f1f1f1', alignItems: 'center' },
  socialTitle: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 10 },
  socialDivider: { width: '90%', height: 1, backgroundColor: '#aaa', marginBottom: 15 },
  iconRow: { flexDirection: 'row', justifyContent: 'space-around', width: '80%' },
  icon: { marginHorizontal: 10 },
});
