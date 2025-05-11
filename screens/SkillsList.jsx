import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ipAdd from '../scripts/helpers/ipAddress';
const SkillsList = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${ipAdd}:5000/skills/`);
      setSkills(response.data.skills || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSkill = ({ item }) => (
    <View style={styles.skillItem}>
      <Text style={styles.skillText}>• {item.name}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Skills</Text>
      <FlatList
        data={skills}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderSkill}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default SkillsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9', // Light green background
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32', // Dark green title
    marginBottom: 12,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  skillItem: {
    backgroundColor: '#A5D6A7', // Soft green item background
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  skillText: {
    color: '#1B5E20', // Darker green text
    fontSize: 16,
  },
});
