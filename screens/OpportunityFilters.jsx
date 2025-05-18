import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Menu, Button, Divider } from 'react-native-paper'; // هذه لو مش مستخدمها ممكن تحذفها
import { useNavigation } from '@react-navigation/native';
import BottomTabBar from './BottomTabBar';

const OpportunityFilters = ({ onFilterSelect = () => {}, initialFilter = 'All' }) => {
  const [selected, setSelected] = useState(initialFilter);
  const navigation = useNavigation();
const [activeTab, setActiveTab] = useState('opp');
  const filters = [
    { label: 'All Opportunities', value: 'All', screen: 'AllOppertinitesUser' },
    { label: 'Nearby Opportunities', value: 'Nearby', screen: 'nearby_opportunitiesUser' },
    { label: 'Jobs', value: 'Jobs', screen: 'JobOpportunities' },
    { label: 'Volunteering', value: 'Volunteer', screen: 'VolunterOpprtunities' },
    { label: 'CF Opportunities', value: 'CF', screen: 'CFopportunitiesUser' },
    { label: 'Similar to You', value: 'Similar', screen: 'CFSimilarOpportunities' },
  ];
 
  const handleSelect = (value, screen) => {
    setSelected(value);
    onFilterSelect(value);
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
         style={styles.filterButton}
         onPress={() => handleSelect(filter.value, filter.screen)}
       >
         <Text style={styles.filterText}>
           {filter.label}
         </Text>
       </TouchableOpacity>
       
        ))}
          
      </ScrollView>
   <View>
  
   </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    backgroundColor: '#e8f5e9',
  },
  filterButton: {
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
});
export default OpportunityFilters;
