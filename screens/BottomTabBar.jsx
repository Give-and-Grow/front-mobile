import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

  const userTabs = [
    { name: 'Home', icon: 'home', library: 'FontAwesome', screen: 'homepage' },
    { name: 'Chat', icon: 'chatbubble-outline', library: 'Ionicons', screen: 'ChatList' },
   { name: 'Notification', icon: 'notifications-outline', library: 'Ionicons', screen: 'Notification' },
 { name: 'HonorBoard', icon: 'medal-outline', library: 'Ionicons', screen: 'HonorBoard' },


    { name: 'Posts', icon: 'users', library: 'FontAwesome', screen: 'FrindsPost' },
    { name: 'Opportunities', icon: 'lightbulb-o', library: 'FontAwesome', screen: 'AllOppertinitesUser' },
    
  ];

  const organizationTabs = [
    { name: 'Home', icon: 'home', library: 'FontAwesome', screen: 'homepage' },
   { name: 'Chat', icon: 'chatbubble-outline', library: 'Ionicons', screen: 'ChatList' },
 { name: 'notification', icon: 'notifications-outline', library: 'Ionicons', screen: 'Notification' },
{ name: 'HonorBoard', icon: 'medal-outline', library: 'Ionicons', screen: 'HonorBoard' },

    { name: 'Posts', icon: 'users', library: 'FontAwesome', screen: 'FrindsPost' },
    { name: 'Opportunities', icon: 'lightbulb-o', library: 'FontAwesome', screen: 'CreatevolunterOpportunity' },
   
  ];

  const adminTabs = [
    { name: 'Home', icon: 'home', library: 'FontAwesome', screen: 'homepage' },
   { name: 'Manage', icon: 'tasks', library: 'FontAwesome', screen: 'adminfeaturerejectapprove' },

    { name: 'Users', icon: 'users', library: 'FontAwesome', screen: 'AccountsDashboard' },
    { name: 'Dashbord', icon: 'lightbulb-o', library: 'FontAwesome', screen: 'DashbordData' },
  { name: 'HonorBoard', icon: 'medal-outline', library: 'Ionicons', screen: 'HonorBoard' },


  ];

  let tabsToRender = [];

  if (userType === 'user') tabsToRender = userTabs;
  else if (userType === 'organization') tabsToRender = organizationTabs;
  else if (userType === 'admin') tabsToRender = adminTabs;

  const handleTabPress = (tab) => {
    navigation.navigate(tab.screen);
    setActiveTab(tab.name);
  };

  const renderIcon = (tab) => {
    const color = activeTab === tab.name ? '#388e3c' : '#999';
    const size = 25;

    switch (tab.library) {
      case 'Ionicons':
        return <Ionicons name={tab.icon} size={size} color={color} />;
      case 'FontAwesome':
      default:
        return <FontAwesome name={tab.icon} size={size} color={color} />;
    }
  };

  return (
    <View style={styles.bottomTab}>
      {tabsToRender.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tabButton}
          onPress={() => handleTabPress(tab)}
        >
          {renderIcon(tab)}
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
