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
import ipAdd from '../scripts/helpers/ipAddress';

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

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await fetch(`${ipAdd}:5000/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      setUserRole(null);
      navigation.navigate('LoginScreen'); // تأكد أن شاشة Login موجودة
    } catch (err) {
      console.error('Logout failed:', err);
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
         {[ 'Ads', 'Help'].map((item) => (
  <TouchableOpacity
    key={item}
    style={styles.menuItem}
    onPress={() => {
      setShowMenu(false);

      switch (item) {
       
        case 'Ads':
          navigation.navigate('AdsScreen'); // ← استبدلها بالشاشة المناسبة لديك
          break;
        case 'Help':
          navigation.navigate('HelpScreen'); // ← استبدلها بالشاشة المناسبة لديك
          break;
        default:
          break;
      }
    }}
  >
    <Text style={styles.menuText}>{item}</Text>
  </TouchableOpacity>
))}


          {userRole ? (
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuText}>Logout</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  navigation.navigate('LoginScreen');
                }}
              >
                <Text style={styles.menuText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  navigation.navigate('SignupFlow');
                }}
              >
                <Text style={styles.menuText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </Animatable.View>
      )}

      {/* Main Content */}
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
      <View style={styles.fixedTabBar}>
        <BottomTabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',  // أخضر فاتح ناعم
  },
  header: {
    height: 65,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#c8e6c9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowColor: '#4caf50',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: {
    fontSize: 22,
    color: '#2e7d32',
    fontWeight: '900',
    letterSpacing: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 65,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    shadowColor: '#4caf50',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 10,
    zIndex: 20,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0f2f1',
  },
  menuText: {
    fontSize: 17,
    color: '#388e3c',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e8f5e9',
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
    elevation: 12,
  },
  mainQuote: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1.2,
  },
  subQuote: {
    fontSize: 18,
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
    lineHeight: 26,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2e7d32',
    marginBottom: 14,
    borderLeftWidth: 6,
    borderLeftColor: '#66bb6a',
    paddingLeft: 14,
    letterSpacing: 0.6,
  },
  sectionText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    lineHeight: 24,
    fontWeight: '500',
  },
  fixedTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#c8e6c9',
    zIndex: 10,
    shadowColor: '#4caf50',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 12,
    elevation: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
});


export default HomePage;
