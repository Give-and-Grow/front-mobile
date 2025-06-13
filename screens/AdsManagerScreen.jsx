import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BottomTabBar from './BottomTabBar';
import LayoutWithFiltersAdmin from './LayoutWithFiltersAdmin';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { FaCheck, FaTimes } from 'react-icons/fa'; // فقط للويب، غير مستخدم هنا
import { Ionicons } from '@expo/vector-icons';
import ipAdd from '../scripts/helpers/ipAddress';
export default function AdsManagerScreen() {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({
    store_name: '',
    image_url: '',
    description: '',
    website_url: '',
    is_active: true,
  });
   const [activeTab, setActiveTab] = useState('AdsManagerScreen');
  const [editingAdId, setEditingAdId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleProfilePress = () => {
    navigation.navigate('AdsManagerScreen');
  };
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');
    try {
      const res = await fetch(`${ipAdd}:5000/admin/firebase-ads/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAds(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch ads');
    }
    setLoading(false);
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: result.uri,
        name: 'upload.jpg',
        type: 'image/jpeg',
      });
      formData.append('upload_preset', 'my_unsigned_preset');

      try {
        const res = await fetch(
          'https://api.cloudinary.com/v1_1/dhrugparh/image/upload',
          {
            method: 'POST',
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) {
          setForm((prev) => ({ ...prev, image_url: data.secure_url }));
        } else {
          Alert.alert('Error', 'Image upload failed');
        }
      } catch {
        Alert.alert('Error', 'Failed to upload image');
      }
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('userToken');

    const url = editingAdId
      ? `${ipAdd}:5000/admin/firebase-ads/${editingAdId}`
      : `${ipAdd}:5000/admin/firebase-ads/create`;

    const method = editingAdId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setForm({
          store_name: '',
          image_url: '',
          description: '',
          website_url: '',
          is_active: true,
        });
        setEditingAdId(null);
        fetchAds();
      } else {
        Alert.alert('Error', data.message || 'Submission failed');
      }
    } catch {
      Alert.alert('Error', 'Failed to submit form');
    }

    setLoading(false);
  };

  const handleDelete = async (adId) => {
    const token = await AsyncStorage.getItem('userToken');
    Alert.alert('Delete', 'Are you sure you want to delete this ad?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const res = await fetch(
              `${ipAdd}:5000/admin/firebase-ads/${adId}`,
              {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const data = await res.json();
            if (res.ok) {
              setMessage(data.message);
              fetchAds();
            } else {
              Alert.alert('Error', data.message || 'Delete failed');
            }
          } catch {
            Alert.alert('Error', 'Failed to delete ad');
          }
          setLoading(false);
        },
      },
    ]);
  };

  const handleEdit = (ad) => {
    setEditingAdId(ad.id);
    setForm({
      store_name: ad.store_name,
      image_url: ad.image_url,
      description: ad.description || '',
      website_url: ad.website_url || '',
      is_active: ad.is_active,
    });
  };
  
const [filter, setFilter] = useState('manage_ads');
const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  return (
     <View style={styles.container1}>
          <LayoutWithFiltersAdmin onFilterSelect={handleFilterSelect} initialFilter="manage_ads">
    <ScrollView style={styles.container}>
      
      <Text style={styles.title}>Admin Advertisements</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TextInput
        placeholder="Store Name"
        value={form.store_name}
        onChangeText={(text) => handleChange('store_name', text)}
        style={styles.input}
      />

      <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
        <Ionicons name="cloud-upload" size={24} color="white" />
        <Text style={styles.uploadText}>Upload Image</Text>
      </TouchableOpacity>

      {form.image_url ? (
        <Image
          source={{ uri: form.image_url }}
          style={styles.imagePreview}
          resizeMode="contain"
        />
      ) : null}

      <TextInput
        placeholder="Description"
        value={form.description}
        onChangeText={(text) => handleChange('description', text)}
        style={styles.input}
      />

      <TextInput
        placeholder="Website URL"
        value={form.website_url}
        onChangeText={(text) => handleChange('website_url', text)}
        style={styles.input}
      />

      <View style={styles.switchContainer}>
        <Text>Status: {form.is_active ? 'Active' : 'Inactive'}</Text>
        <TouchableOpacity
          onPress={() =>
            setForm((prev) => ({ ...prev, is_active: !prev.is_active }))
          }
          style={[
            styles.statusButton,
            { backgroundColor: form.is_active ? '#4caf50' : '#aaa' },
          ]}
        >
          <Text style={{ color: 'white' }}>
            {form.is_active ? 'Enabled' : 'Disabled'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {editingAdId ? 'Update Ad' : 'Create Ad'}
          </Text>
        </TouchableOpacity>

        {editingAdId && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setEditingAdId(null);
              setForm({
                store_name: '',
                image_url: '',
                description: '',
                website_url: '',
                is_active: true,
              });
              setMessage('');
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && <ActivityIndicator size="large" color="#4caf50" />}

      {ads.map((ad) => (
        <View
          key={ad.id}
          style={[
            styles.adCard,
            { backgroundColor: ad.is_active ? '#fff' : '#eee' },
          ]}
        >
          <Image source={{ uri: ad.image_url }} style={styles.adImage} />
          <Text style={styles.adTitle}>{ad.store_name}</Text>
          <Text>{ad.description}</Text>
          <Text style={styles.adUrl}>{ad.website_url}</Text>
          <Text>Status: {ad.is_active ? 'Active' : 'Inactive'}</Text>
          <View style={styles.adActions}>
  <TouchableOpacity
    onPress={() => handleEdit(ad)}
    style={{ flexDirection: 'row', alignItems: 'center' }}
  >
    <Icon name="edit" size={20} color="#4caf50" />
    <Text style={{ color: '#4caf50', marginLeft: 6 }}>Edit</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() => handleDelete(ad.id)}
    style={{ flexDirection: 'row', alignItems: 'center' }}
  >
    <Icon name="delete" size={20} color="#f44336" />
    <Text style={{ color: '#f44336', marginLeft: 6 }}>Delete</Text>
  </TouchableOpacity>
</View>
 
     
        </View>
      ))}
      
    </ScrollView>
     <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleProfilePress={handleProfilePress}
      />
     </LayoutWithFiltersAdmin>
       </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingTop: 20, // أصغر
  },
container1: {
  flex: 1,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingTop: 20, // أصغر
  
}

,
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#2e7d32',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#d6d6d6',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  uploadText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: '600',
    fontSize: 17,
  },
  imagePreview: {
    width: '100%',
    height: 300, // الطول الجديد المقترح
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  statusButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#e0f2f1',
    elevation: 2,
    shadowColor: '#00796b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 18,
  },
  submitButton: {
    backgroundColor: '#388e3c',
    padding: 14,
    borderRadius: 14,
    flex: 1,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#e53935',
    padding: 14,
    borderRadius: 14,
    flex: 1,
    alignItems: 'center',
    marginLeft: 12,
    elevation: 3,
    shadowColor: '#e53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  message: {
    marginVertical: 12,
    color: '#43a047',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  adCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  adImage: {
    width: '100%',
    height: 300,
    borderRadius: 14,
    marginBottom: 12,
  },
  adTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2e7d32',
  },
  adUrl: {
    color: '#1e88e5',
    marginBottom: 8,
    fontSize: 15,
  },
  adActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  

});

