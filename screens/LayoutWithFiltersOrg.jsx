// screens/LayoutWithFilters.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import OrganizationFilters from './OrganizationFilters';


const LayoutWithFiltersOrg = ({ children, onFilterSelect, initialFilter = 'add_volunteer' }) => {
  return (
    <View style={styles.container}>
      <OrganizationFilters initialFilter={initialFilter} onFilterSelect={onFilterSelect} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default LayoutWithFiltersOrg;
