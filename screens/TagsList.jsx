import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native';
import axios from 'axios';

const TagsList = ({ opportunityId }) => { // تأكد من تمرير الـ opportunityId كـ prop
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // استرجاع البيانات من الـ API
    const fetchTags = async () => {
      try {
        // تغيير الـ URL ليأخذ الـ opportunityId
        const response = await axios.get(`http://192.168.1.107:5000/tags/opportunity/${opportunityId}`);
        setTags(response.data);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, [opportunityId]); // التحديث عند تغيير الـ opportunityId

  const renderTagItem = ({ item }) => (
    <TouchableOpacity style={styles.tagItem} onPress={() => handleTagPress(item)}>
      <Text style={styles.tagName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleTagPress = (tag) => {
    setSelectedTag(tag);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTag(null);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tags}
        renderItem={renderTagItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {selectedTag && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tag Details</Text>
              <View style={styles.modelBody}>
                <Text style={styles.modelLabel}>ID:</Text>
                <Text style={styles.modelText}>{selectedTag.id}</Text>
              </View>
              <View style={styles.modelBody}>
                <Text style={styles.modelLabel}>Name:</Text>
                <Text style={styles.modelText}>{selectedTag.name}</Text>
              </View>
              <Button title="Close" onPress={closeModal} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  tagItem: {
    padding: 15,
    backgroundColor: '#4caf50',
    marginBottom: 10,
    borderRadius: 5,
  },
  tagName: {
    color: '#fff',
    fontSize: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modelBody: {
    marginBottom: 10,
    width: '100%',
  },
  modelLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modelText: {
    fontSize: 16,
    color: '#333',
  },
});

export default TagsList;
