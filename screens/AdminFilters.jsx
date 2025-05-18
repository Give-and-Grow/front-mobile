import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AdminFilters = ({ initialFilter = null, onFilterSelect }) => {
  const navigation = useNavigation();
  const [selected, setSelected] = useState(initialFilter);

  const filters = [
    {
      label: 'Dashboard',
      value: 'dashboard',
      screen: 'AdminDashboardScreen',
      icon: 'view-dashboard',
    },
    {
      label: 'Approve/Reject Features',
      value: 'approve_reject',
      screen: 'adminfeaturerejectapprove',
      icon: 'check-decagram',
    },
    {
      label: 'Manage Organizations',
      value: 'manage_orgs',
      screen: 'adminfeatchallorganizationandDelete',
      icon: 'account-multiple',
    },
  ];

  const handleSelect = (value, screen) => {
    setSelected(value);
    if (onFilterSelect) {
      onFilterSelect(value);
    }
    if (screen) {
      navigation.navigate(screen);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.value}
            style={[
              styles.filterButton,
              selected === filter.value && styles.selectedFilter
            ]}
            onPress={() => handleSelect(filter.value, filter.screen)}
          >
            <Icon
              name={filter.icon}
              size={18}
              color={selected === filter.value ? 'white' : '#2e7d32'}
              style={styles.icon}
            />
            <Text style={[
              styles.filterText,
              selected === filter.value && styles.selectedText
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: '#e8f5e9',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#c8e6c9',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  selectedFilter: {
    backgroundColor: '#388e3c',
  },
  filterText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    color: 'white',
  },
  icon: {
    marginRight: 6,
  },
});

export default AdminFilters;
