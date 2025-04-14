import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// دالة لاسترجاع التوكن
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      console.log('Token:', token);
      return token;
    } else {
      console.log('No token found');
    }
  } catch (error) {
    console.error('Error retrieving token:', error);
  }
};
// دالة لفك التوكن والحصول على الإيميل
export const getEmailFromToken = async () => {
  try {
    const token = await getToken();
    if (token) {
      const decoded = jwtDecode(token); // فك التشفير
      return decoded.email; // تأكد أن الإيميل موجود في الـ payload
    }
  } catch (error) {
    console.error('Error decoding token:', error);
  }
  return null;
};

// دالة لتحديد الهيدر مع التوكن
export const getAuthHeaders = async () => {
  const token = await getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
