import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BottomTabBar = ({ activeTab, setActiveTab }) => {
  const navigation = useNavigation();
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        setUserType(role);
        console.log('Retrieved role:', role);
      } catch (error) {
        console.error('Error retrieving user role:', error);
      }
    };

    getUserRole();
  }, []);

  const tabs = [
    { name: 'Home', icon: 'home' },
    { name: 'Search', icon: 'search' },
    { name: 'FriendsPosts', icon: 'users' },
    { name: 'Opportunities', icon: 'lightbulb-o' },
    { name: 'Profile', icon: 'user' },
  ];

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

  return (
    <View style={styles.bottomTab}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tabButton}
          onPress={() => {
            if (tab.name === 'Home') {
              navigation.navigate('homepage');
              setActiveTab('Home');
            } else if (tab.name === 'Profile') {
              handleProfilePress();
              setActiveTab('Profile');
            } else if (tab.name === 'FriendsPosts') {
              navigation.navigate('FrindsPost');
              setActiveTab('FrindsPost');
            } else if (tab.name === 'Opportunities') {
              navigation.navigate('AllOppertinitesUser');
              setActiveTab('AllOppertinitesUser');
            } else {
              setActiveTab(tab.name);
            }
          }}
        >
          <Icon
            name={tab.icon}
            size={25}
            color={activeTab === tab.name ? '#388e3c' : '#999'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === tab.name && { color: '#388e3c' },
            ]}
          >
            {tab.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default BottomTabBar;
