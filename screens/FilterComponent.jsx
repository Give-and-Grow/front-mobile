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
        { label: 'Open', value: 'OPEN' },
        { label: 'Closed', value: 'CLOSED' }
      ]
    },
    {
      label: 'Opportunity Type',
      icon: 'briefcase-check-outline',
      key: 'opportunity_type',
      options: [
        { label: 'Job', value: 'JOB' },
        { label: 'Volunteer', value: 'VOLUNTEER' }
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
        { label: 'Nablus', value: 'Nablus' },
        { label: 'Hebron', value: 'Hebron' },
        { label: 'Bethlehem', value: 'Bethlehem' },
        { label: 'Jenin', value: 'Jenin' },
        { label: 'Tulkarm', value: 'Tulkarm' },
        { label: 'Qalqilya', value: 'Qalqilya' },
        { label: 'Salfit', value: 'Salfit' },
        { label: 'Tubas', value: 'Tubas' },
        { label: 'Rafah', value: 'Rafah' },
        { label: 'Khan Younis', value: 'Khan Younis' },
        // الأردن
        { label: 'Amman', value: 'Amman' },
        { label: 'Irbid', value: 'Irbid' },
        { label: 'Zarqa', value: 'Zarqa' },
        { label: 'Aqaba', value: 'Aqaba' },
        { label: 'Salt', value: 'Salt' },
        { label: 'Madaba', value: 'Madaba' },
        // لبنان
        { label: 'Beirut', value: 'Beirut' },
        { label: 'Tripoli', value: 'Tripoli' },
        { label: 'Sidon', value: 'Sidon' },
        // سوريا
        { label: 'Damascus', value: 'Damascus' },
        { label: 'Aleppo', value: 'Aleppo' },
        { label: 'Homs', value: 'Homs' },
        // مصر
        { label: 'Cairo', value: 'Cairo' },
        { label: 'Alexandria', value: 'Alexandria' },
        { label: 'Giza', value: 'Giza' },
        // العراق
        { label: 'Baghdad', value: 'Baghdad' },
        { label: 'Basra', value: 'Basra' },
        { label: 'Erbil', value: 'Erbil' },
        // الخليج
        { label: 'Riyadh', value: 'Riyadh' },
        { label: 'Jeddah', value: 'Jeddah' },
        { label: 'Mecca', value: 'Mecca' },
        { label: 'Doha', value: 'Doha' },
        { label: 'Dubai', value: 'Dubai' },
        { label: 'Abu Dhabi', value: 'Abu Dhabi' },
        { label: 'Kuwait City', value: 'Kuwait City' },
        { label: 'Manama', value: 'Manama' },
        { label: 'Muscat', value: 'Muscat' },
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
        { label: 'Project Management', value: '4' },
        { label: 'Data Analysis', value: '5' },
        { label: 'Public Speaking', value: '6' },
        { label: 'Teaching', value: '7' },
        { label: 'Writing & Editing', value: '8' },
        { label: 'Translation', value: '9' },
        { label: 'Photography', value: '10' },
        { label: 'Video Editing', value: '11' },
        { label: 'Customer Service', value: '12' },
        { label: 'Event Planning', value: '13' },
        { label: 'Social Media Management', value: '14' },
        { label: 'SEO', value: '15' },
        { label: 'Cybersecurity', value: '16' },
        { label: 'UI/UX Design', value: '17' },
        { label: 'Fundraising', value: '18' },
        { label: 'Human Resources', value: '19' },
        { label: 'Accounting', value: '20' },
        { label: 'Healthcare Support', value: '21' },
        { label: 'First Aid', value: '22' },
        { label: 'Logistics', value: '23' },
        { label: 'Software Testing', value: '24' },
        { label: 'Mentoring', value: '25' },
        { label: 'Leadership', value: '26' },
        { label: 'Sales', value: '27' },
        { label: 'Database Management', value: '28' },
        { label: 'Cloud Computing', value: '29' },
        { label: 'Machine Learning', value: '30' }
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
        { label: 'Doctors Without Borders', value: '13' },
        { label: 'Save the Children', value: '14' },
        { label: 'Palestinian Medical Relief Society', value: '15' },
        { label: 'Arab Youth Climate Movement', value: '16' },
        { label: 'Islamic Relief Worldwide', value: '17' },
        { label: 'CARE International', value: '18' },
        { label: 'World Food Programme', value: '19' },
        { label: 'United Nations Development Programme (UNDP)', value: '20' },
        { label: 'Rebuilding Alliance', value: '21' },
        { label: 'ANERA (American Near East Refugee Aid)', value: '22' },
        { label: 'Tamer Institute for Community Education', value: '23' },
        { label: 'Al Nayzak Organization', value: '24' },
        { label: 'Right To Play', value: '25' },
        { label: 'ActionAid Palestine', value: '26' },
        { label: 'OXFAM', value: '27' },
        { label: 'YMCA Palestine', value: '28' },
        { label: 'Youth Without Borders', value: '29' },
        { label: 'Terre des hommes', value: '30' }
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
      label: 'Days',
      icon: 'calendar-check-outline',
      key: 'volunteer_days',
      options: [
        { label: 'Monday', value: 'Monday' },
        { label: 'Tuesday', value: 'Tuesday' },
        { label: 'Wednesday', value: 'Wednesday' },
        { label: 'Thursday', value: 'Thursday' },
        { label: 'Friday', value: 'Friday' },
        { label: 'Saturday', value: 'Saturday' },
        { label: 'Sunday', value: 'Sunday' }
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
