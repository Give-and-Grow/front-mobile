import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import BottomTabBar from './BottomTabBar';
const screenHeight = Dimensions.get('window').height;

const HomePage = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [userRole, setUserRole] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserRole(role);
      } catch (error) {
        console.error('Error retrieving user role:', error);
      }
    };
    getUserRole();
  }, []);

  const handleProfilePress = () => {
    if (!userRole) {
      alert('Please log in first.');
      return;
    }
    switch (userRole) {
      case 'user':
        navigation.navigate('FollowingScreen');
        break;
      case 'organization':
        navigation.navigate('FollowScreenOrganization');
        break;
      case 'admin':
        navigation.navigate('AdminProfile');
        break;
      default:
        alert('Unknown user role.');
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <Icon name="bars" size={25} color="#66bb6a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GIVE & GROW</Text>
        <TouchableOpacity onPress={handleProfilePress}>
          <Icon name="user" size={25} color="#66bb6a" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {showMenu && (
        <Animatable.View animation="fadeInDown" style={styles.dropdownMenu}>
          {['Home', 'Discover', 'Jobs', 'Login', 'Sign Up', 'Help'].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.menuText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </Animatable.View>
      )}
<View style={styles.fixedTabBar}>
  <BottomTabBar
    activeTab={activeTab}
    setActiveTab={setActiveTab}
  />
</View>


      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 80 }}>
        <Animatable.Image
          source={{
            uri: 'https://cdn.pixabay.com/photo/2017/02/01/22/02/volunteer-2033054_1280.jpg',
          }}
          animation="fadeIn"
          delay={300}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Animatable.Text animation="fadeInUp" delay={500} style={styles.mainQuote}>
          "Be the reason someone smiles today." 🌟
        </Animatable.Text>

        <Animatable.Text animation="fadeInUp" delay={700} style={styles.subQuote}>
          Join our volunteering community and start making an impact!
        </Animatable.Text>

        <Animatable.View animation="fadeInUp" delay={900}>
          <Text style={styles.sectionTitle}>🌱 Why Volunteer?</Text>
          <Text style={styles.sectionText}>
            Volunteering empowers individuals, builds communities, and helps you grow both personally and professionally.
          </Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={1100}>
          <Text style={styles.sectionTitle}>🤝 How You Can Help</Text>
          <Text style={styles.sectionText}>
            Whether remotely or in person, every action matters. Discover opportunities that match your skills and passion.
          </Text>
        </Animatable.View>
      </ScrollView>

      {/* Bottom Tab Bar */}
    
    </View>
  );
 
};


const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#388e3c',
    fontWeight: 'bold',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    left: 15,
    right: 15,
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 20,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f1f8e9',
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  mainQuote: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 10,
  },
  subQuote: {
    fontSize: 16,
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
    lineHeight: 22,
  },
  bottomTab: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  tabButton: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  fixedTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    zIndex: 10,
  },
  
});

export default HomePage;
