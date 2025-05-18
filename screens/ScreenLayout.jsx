import React from 'react';
import { View, StyleSheet } from 'react-native';
import OpportunityFilters from './OpportunityFilters';  // استدعاء الفلتر

const ScreenLayout = ({ children, onFilterSelect, initialFilter = 'All' }) => {
  return (
    <View style={styles.container}>
      <OpportunityFilters initialFilter={initialFilter} onFilterSelect={onFilterSelect} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1fdf5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default ScreenLayout;
