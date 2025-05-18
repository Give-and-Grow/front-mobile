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
  // 🟩 Tabs for each user type
  const userTabs = [
    { name: 'Home', icon: 'home', screen: 'homepage' },
    { name: 'Search', icon: 'search', screen: 'Search' },
    { name: 'FriendsPosts', icon: 'users', screen: 'FrindsPost' },
    { name: 'Opportunities', icon: 'lightbulb-o', screen: 'AllOppertinitesUser' },
    { name: 'Profile', icon: 'user', screen: 'FollowingScreen' },
  ];

  const organizationTabs = [
    { name: 'Home', icon: 'home', screen: 'homepage' },
    { name: 'Search', icon: 'search', screen: 'Search' },
    { name: 'Posts', icon: 'users', screen: 'FrindsPost' },
    { name: 'ManageOpportunities', icon: 'lightbulb-o', screen: 'CreatevolunterOpportunity' },
    { name: 'Profile', icon: 'user', screen: 'FollowScreenOrganization' },
  ];

  const adminTabs = [
    { name: 'Home', icon: 'home', screen: 'homepage' },
    { name: 'ManageOpportunities', icon: 'lightbulb-o', screen: 'AdminDashboardScreen' },
    { name: 'Users', icon: 'users', screen: 'ManageUsers' },
    { name: 'Reports', icon: 'lightbulb-o', screen: 'ReportsScreen' },
    { name: 'Profile', icon: 'user', screen: 'AdminProfile' },
  ];

  let tabsToRender = [];

  if (userType === 'user') tabsToRender = userTabs;
  else if (userType === 'organization') tabsToRender = organizationTabs;
  else if (userType === 'admin') tabsToRender = adminTabs;

  const handleTabPress = (tab) => {
    navigation.navigate(tab.screen);
    setActiveTab(tab.name);
  };

  return (
    <View style={styles.bottomTab}>
      {tabsToRender.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tabButton}
          onPress={() => handleTabPress(tab)}
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
