// screens/LayoutWithFiltersAdmin.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import AdminFilters from './AdminFilters'; // تأكد أنك أنشأت AdminFilters.js

const LayoutWithFiltersAdmin = ({ children, onFilterSelect, initialFilter = 'approve_reject' }) => {
  return (
    <View style={styles.container}>
      <AdminFilters initialFilter={initialFilter} onFilterSelect={onFilterSelect} />
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

export default LayoutWithFiltersAdmin;
