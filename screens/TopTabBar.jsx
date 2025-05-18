// TopTabBar.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const TopTabBar = ({ handleProfilePress }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={{ zIndex: 20 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <Icon name="bars" size={25} color="#66bb6a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GIVE & GROW</Text>
        <TouchableOpacity onPress={handleProfilePress}>
          <Icon name="user" size={25} color="#66bb6a" />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.dropdownMenu}>
          {['Home', 'Discover', 'Jobs', 'Login', 'Sign Up', 'Help'].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.menuText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
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
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default TopTabBar;
