import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabBar from './BottomTabBar';
import LayoutWithFiltersAdmin from './LayoutWithFiltersAdmin';
const API_BASE = `${ipAdd}:5000/admin/discount-codes`;
import ipAdd from "../scripts/helpers/ipAddress";
export default function DiscountCodeManager() {
  const [discounts, setDiscounts] = useState([]);
  const [form, setForm] = useState({
    store_name: '',
    code: '',
    points_required: '',
  });
  const [editingId, setEditingId] = useState(null);

  // دالة للحصول على الترويسة بالتوكين
  const getHeaders = async () => {
    const savedToken = await AsyncStorage.getItem("userToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${savedToken}`,
    };
  };

  // تحميل البيانات من الخادم
  const loadDiscounts = async () => {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/get`, { headers });
    const data = await res.json();
    setDiscounts(data);
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const handleImageUpload = async () => {
  launchImageLibrary({ mediaType: 'photo' }, async (response) => {
    if (response.didCancel || response.errorCode) {
      Alert.alert("Upload canceled or failed");
      return;
    }

    const file = response.assets[0];
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type,
      name: file.fileName,
    });
    formData.append("upload_preset", "my_unsigned_preset");
    formData.append("cloud_name", "dhrugparh");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dhrugparh/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setForm((prev) => ({ ...prev, code: data.secure_url }));
    } catch (err) {
      Alert.alert("Upload failed", err.message);
      console.error("Upload failed", err);
    }
  });
};


  // إنشاء أو تعديل الخصم
  const handleSubmit = async () => {
    const headers = await getHeaders();
    const url = editingId ? `${API_BASE}/${editingId}` : `${API_BASE}/create`;
    const method = editingId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers,
      body: JSON.stringify(form),
    });

    setForm({ store_name: '', code: '', points_required: '' });
    setEditingId(null);
    loadDiscounts();
  };

  // حذف خصم
  const handleDelete = async (id) => {
    const headers = await getHeaders();
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers,
    });
    loadDiscounts();
  };

  // بدء تعديل خصم
  const startEdit = (item) => {
    setForm({
      store_name: item.store_name,
      code: item.code,
      points_required: item.points_required,
    });
    setEditingId(item.id);
  };
const handleFilterSelect = (selectedFilter) => {
    setFilter(selectedFilter);
    // ممكن هنا تحدث الـfetchOpportunities أو تقوم بأي تعامل مع الفلتر الجديد
  };
  const [filter, setFilter] = useState('manage_orgs');
  const handleProfilePress = () => {
    navigation.navigate('DiscountCodeManager');
  };
   const [activeTab, setActiveTab] = useState('Discount');
  return (
    <View style={styles.container}>
         <LayoutWithFiltersAdmin onFilterSelect={handleFilterSelect} initialFilter="manage_orgs">
      <Text style={styles.title}>{editingId ? "Edit Discount" : "Create Discount"}</Text>

      <View style={styles.inputGroup}>
        <Icon name="shopping-bag" size={20} />
        <TextInput
          placeholder="Store Name"
          value={form.store_name}
          onChangeText={(text) => setForm({ ...form, store_name: text })}
          style={styles.input}
        />
      </View>

   <TouchableOpacity style={styles.uploadBtn} onPress={handleImageUpload}>
  <Icon name="upload" size={20} color="#fff" style={{ marginRight: 8 }} />
  <Text style={styles.uploadBtnText}>Upload Code Image</Text>
</TouchableOpacity>


      {form.code ? (
        <Image source={{ uri: form.code }} style={styles.previewImage} />
      ) : null}

      <View style={styles.inputGroup}>
        <Icon name="hashtag" size={20} />
        <TextInput
          placeholder="Points Required"
          keyboardType="numeric"
          value={form.points_required}
          onChangeText={(text) => setForm({ ...form, points_required: text })}
          style={styles.input}
        />
      </View>

     <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
  <Text style={styles.submitButtonText}>
    {editingId ? "Update" : "Create"}
  </Text>
</TouchableOpacity>


      <Text style={styles.sectionTitle}>All Discounts</Text>

      <FlatList
        data={discounts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text><Icon name="shopping-bag" /> Store: {item.store_name}</Text>
            <Image source={{ uri: item.code }} style={styles.codeImage} />
            <Text><Icon name="hashtag" /> Points: {item.points_required}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => startEdit(item)} style={styles.editBtn}>
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
  title: {
    fontSize: 22, // أصغر
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 18, // أقل
    textShadowColor: '#A5D6A7',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18, // أصغر
    fontWeight: 'bold',
    color: '#388E3C',
    marginVertical: 12, // أقل
    borderBottomWidth: 1,
    borderBottomColor: '#A5D6A7',
    paddingBottom: 4,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8, // أقل
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: '#00000033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16, // أصغر
    color: '#2E7D32',
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 180, // أخف
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#81C784',
    resizeMode: 'cover',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    shadowColor: '#00000044',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  codeImage: {
    width: '100%',
    height: 350,
    borderRadius: 10,
    marginVertical: 10,
    resizeMode: 'cover',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  editBtn: {
    backgroundColor: '#43A047',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteBtn: {
    backgroundColor: '#C62828',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#43A047',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: 'center',
    marginVertical: 10,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  submitButton: {
    backgroundColor: '#43A047',
    paddingVertical: 9,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

