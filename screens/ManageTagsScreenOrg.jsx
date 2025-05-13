import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';

const ManageTagsScreenOrg = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [tags, setTags] = useState({});
  const [availableTags, setAvailableTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setToken(storedToken);
        } else {
          Alert.alert('Error', 'User not logged in');
        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    if (token) {
      axios.get(`${ipAdd}:5000/opportunities/organization`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setOpportunities(response.data.opportunities);
          const tagsPromises = response.data.opportunities.map(opp =>
            axios.get(`${ipAdd}:5000/tags/opportunity/${opp.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then(res => ({ id: opp.id, tags: res.data }))
              .catch(() => ({ id: opp.id, tags: [] }))
          );

          Promise.all(tagsPromises).then(results => {
            const tagsMap = {};
            results.forEach(item => {
              tagsMap[item.id] = item.tags;
            });
            setTags(tagsMap);
          });
        })
        .catch(error => console.error(error));

      axios.get(`${ipAdd}:5000/tags/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => {
          setAvailableTags(response.data);
          setFilteredTags(response.data); // Initially show all tags
        })
        .catch(error => console.error(error));
    }
  }, [token]);

  const handleAssignTag = (opportunityId, tag) => {
    if (!token) {
      Alert.alert('Error', 'No token found');
      return;
    }

    if (!tag || !tag.id) {
      Alert.alert('Error', 'Tag data is invalid');
      return;
    }

    axios.post(`${ipAdd}:5000/tags/assign/${opportunityId}`, { tags: [tag.name] }, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const addedTags = response.data.tags_added; // The tags added in the response
        setTags(prevTags => {
          const updatedTags = { ...prevTags };
          updatedTags[opportunityId] = [
            ...(updatedTags[opportunityId] || []),
            ...addedTags.map(tagName => ({ id: tagName, name: tagName })),
          ];
          Alert.alert('Success', `Tags '${addedTags.join(', ')}' added successfully!`);
          return updatedTags;
        });
      })
      .catch(error => {
        if (error.response?.data?.error) {
          Alert.alert('Error', error.response.data.error);
        } else {
          console.error(error);
        }
      });
  };

  const handleRemoveTag = (opportunityId, tagId) => {
    if (!token) {
      Alert.alert('Error', 'No token found');
      return;
    }

    axios.delete(`${ipAdd}:5000/tags/remove/${opportunityId}/${tagId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setTags(prevTags => {
          const updatedTags = { ...prevTags };
          updatedTags[opportunityId] = updatedTags[opportunityId].filter(tag => tag.id !== tagId);
          Alert.alert('Success', 'Tag removed successfully!');
          return updatedTags;
        });
      })
      .catch(error => console.error(error));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      setFilteredTags(availableTags.filter(tag => tag.name.toLowerCase().includes(query.toLowerCase())));
    } else {
      setFilteredTags(availableTags); // Show all if search is cleared
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#fff" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search for tags..."
        placeholderTextColor="#d1e7d5"  // light green shade
        value={searchQuery}
        onChangeText={handleSearch}
      />
    </View>
      {opportunities.map(opportunity => (
        <View key={opportunity.id} style={styles.opportunityCard}>
          {opportunity.image_url && (
            <Image source={{ uri: opportunity.image_url }} style={styles.image} />
          )}
          <Text style={styles.title}>{opportunity.title}</Text>

          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: '#c6f7d4' }]}>
              <Text style={styles.badgeText}>
                {opportunity.opportunity_type === 'OpportunityType.VOLUNTEER' ? 'Volunteer' : 'Job'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#d0f0fd' }]}>
              <Text style={styles.badgeText}>
                {opportunity.status === 'OpportunityStatus.OPEN' ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

          <Text style={styles.label}><Icon name="map-marker" size={16} /> {opportunity.location}</Text>
          <Text style={styles.label}><Icon name="calendar" size={16} /> {new Date(opportunity.start_date).toLocaleDateString()} → {new Date(opportunity.end_date).toLocaleDateString()}</Text>

          <View style={styles.descriptionRow}>
            <Icon name="file-text" size={16} color="#555" style={{ marginRight: 6 }} />
            <Text style={styles.description}>{opportunity.description}</Text>
          </View>

          <Text style={styles.label}><Icon name="envelope" size={14} /> Contact: {opportunity.contact_email}</Text>

          <View style={styles.tagsContainer}>
            {tags[opportunity.id] && tags[opportunity.id].map(tag => (
              <View key={tag.id} style={styles.tag}>
                <Text style={styles.tagText}>{tag.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(opportunity.id, tag.id)} style={styles.removeIcon}>
                  <Icon name="trash" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addTagsContainer}>
            {filteredTags.map(tag => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => handleAssignTag(opportunity.id, tag)}
                style={styles.addTagButton}
              >
                <Icon name="plus-circle" size={20} color="white" />
                <Text style={styles.addTagText}>Add '{tag.name}'</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  opportunityCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  tagsContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    backgroundColor: '#d3ffd8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: '#4CAF50',
    fontWeight: '500',
    marginRight: 5,
  },
  removeIcon: {
    backgroundColor: '#ff4d4d',
    borderRadius: 50,
    padding: 5,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
  },
  addTagText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  badge: {
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2e7d32',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#66bb6a', // Light Green background
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  searchInput: {
    height: 45,
    flex: 1,
    borderColor: '#E8F5E9', // Darker Green Border
    borderWidth: 1.5,
    borderRadius: 15,
    paddingLeft: 12,
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center', // تأكد من محاذاة الأيقونة والنص في المنتصف
    marginBottom: 10,
  },
  icon: {
    marginRight: 6,
  },
  description: {
    fontSize: 14,
    color: '#555',
    flexShrink: 1, // تأكد من أن النص لا يأخذ أكثر من المساحة المتاحة
  },
});

export default ManageTagsScreenOrg;
