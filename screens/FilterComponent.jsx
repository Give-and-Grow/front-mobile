import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FilterComponent = ({ onApplyFilters }) => {
  const initialFilters = {
    status: null,
    opportunity_type: null,
    location: null,
    skill_id: null,
    organization_id: null,
    start_time: null,
    end_time: null,
    volunteer_days: null,
  };

  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onApplyFilters(newFilters);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    onApplyFilters(initialFilters);
  };

  const fields = [
    {
      label: 'Status',
      icon: 'information-outline',
      key: 'status',
      options: [
        { label: 'Open', value: 'Open' },
        { label: 'Closed', value: 'Closed' }
      ]
    },
    {
      label: 'Opportunity Type',
      icon: 'briefcase-check-outline',
      key: 'opportunity_type',
      options: [
        { label: 'Job', value: 'Job' },
        { label: 'Volunteer', value: 'Volunteer' }
      ]
    },
    {
      label: 'Location',
      icon: 'map-marker-radius',
      key: 'location',
      options: [
        { label: 'Ramallah', value: 'Ramallah' },
        { label: 'Jerusalem', value: 'Jerusalem' },
        { label: 'Gaza', value: 'Gaza' },
      
      ]
    },
    {
      label: 'Skill',
      icon: 'star-outline',
      key: 'skill_id',
      options: [
        { label: 'Programming', value: '1' },
        { label: 'Design', value: '2' },
        { label: 'Marketing', value: '3' },
     
      ]
    },
    {
      label: 'Organization',
      icon: 'account-group-outline',
      key: 'organization_id',
      options: [
        { label: 'Red Crescent', value: '10' },
        { label: 'UNICEF', value: '11' },
        { label: 'Green NGO', value: '12' },
       
      ]
    },
    {
      label: 'Start Time',
      icon: 'clock-outline',
      key: 'start_time',
      options: [
        { label: '06:00', value: '06:00' },
        { label: '08:00', value: '08:00' },
        { label: '10:00', value: '10:00' },
        { label: '12:00', value: '12:00' },
        { label: '14:00', value: '14:00' },
        { label: '16:00', value: '16:00' },
        { label: '18:00', value: '18:00' },
        { label: '20:00', value: '20:00' },
        { label: '22:00', value: '22:00' }
      ]
    },
    {
      label: 'End Time',
      icon: 'clock-check-outline',
      key: 'end_time',
      options: [
        { label: '06:00', value: '06:00' },
        { label: '08:00', value: '08:00' },
      
      ]
    },
    {
      label: 'Days',
      icon: 'calendar-check-outline',
      key: 'volunteer_days',
      options: [
        { label: 'Monday', value: 'Monday' },
       { label: 'Tuesday', value: 'Tuesday' },
       
      ]
    }
  ];

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {fields.map(({ label, icon, key, options }) => (
        <View key={key} style={styles.dropdownContainer}>
          <View style={styles.labelContainer}>
            <Icon name={icon} size={22} color="#2E7D32" style={styles.icon} />
            <Text style={styles.label}>{label}</Text>
          </View>
          <Dropdown
            style={[styles.dropdown, filters[key] && styles.dropdownSelected]}
            data={options}
            labelField="label"
            valueField="value"
            placeholder={`Select ${label}`}
            placeholderStyle={styles.placeholderStyle}
            value={filters[key]}
            onChange={item => handleChange(key, item.value)}
            maxHeight={200}
            showsVerticalScrollIndicator
            search
            searchPlaceholder="Search..."
            selectedTextStyle={styles.selectedTextStyle}
            activeColor="#C8E6C9"
            dropdownPosition="bottom"
          />
        </View>
      ))}

      <TouchableOpacity style={styles.resetButton} onPress={resetFilters} activeOpacity={0.7}>
        <Text style={styles.resetButtonText}>Reset Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        backgroundColor: '#FFFFFF',
        width: '45%',           // حجم أصغر (40% من عرض الشاشة مثلاً)
        alignSelf: 'flex-start' // محاذاة إلى اليسار
      },
  dropdownContainer: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: '700',
    color: '#2E7D32',
    fontSize: 16,
  },
  dropdown: {
    height: 50,
    borderColor: '#A5D6A7',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F1F8E9',
  },
  dropdownSelected: {
    borderColor: '#388E3C',
    backgroundColor: '#E8F5E9',
  },
  placeholderStyle: {
    color: '#7CB342',
    fontSize: 15,
  },
  selectedTextStyle: {
    color: '#2E7D32',
    fontWeight: '600',
    fontSize: 15,
  },
  resetButton: {
    backgroundColor: '#388E3C',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  resetButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default FilterComponent;
