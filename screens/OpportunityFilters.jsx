import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // أيقونات
import { Dropdown } from 'react-native-element-dropdown';

const OpportunityFilters = ({ onFilterSelect = () => {}, initialFilter = 'All' }) => {
  const [selected, setSelected] = useState(initialFilter);
  const navigation = useNavigation();

  const filters = [
    { label: 'All Opportunities', value: 'All', screen: 'AllOppertinitesUser', icon: 'format-list-bulleted' },
    { label: 'Nearby Opportunities', value: 'Nearby', screen: 'nearby_opportunitiesUser', icon: 'map-marker-radius' },
    { label: 'Best Fit Jobs', value: 'Jobs', screen: 'JobOpportunities', icon: 'briefcase-check' },
    { label: 'Best Fit Volunteering', value: 'Volunteer', screen: 'VolunterOpprtunities', icon: 'account-star' },
    { label: 'Evaluate Opportunities', value: 'Eval', screen: 'ApplicationsScreen', icon: 'star-circle-outline' },
    { label: 'Similar to You', value: 'Similar', screen: 'CFSimilarOpportunities', icon: 'account-multiple-outline' },
  ];

  const handleSelect = (value, screen) => {
    setSelected(value);
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

export default OpportunityFilters;
