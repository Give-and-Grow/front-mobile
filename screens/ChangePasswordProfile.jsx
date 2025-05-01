import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ChangePasswordProfile = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleGotologin= () => {
    // Navigate to the next screen (e.g., Login or Registration)
    navigation.navigate('LoginScreen'); // Change 'Login' to your desired screen
  };
  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password should be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'No token found, please log in again');
        return;
      }

      const response = await axios.put('http://192.168.1.107:5000/profile/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Password changed successfully!');
        navigation.navigate('LoginScreen');
      } else {
        Alert.alert('Failed', response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error.response?.data || error);
      Alert.alert('Error', 'Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/animationchangepassword-unscreen.gif')}
        style={styles.topImage}
        resizeMode="contain"
      />
      <Text style={styles.title}>Change Your Password</Text>

      {/* Old Password */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Old Password"
          secureTextEntry={!showOldPassword}
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
        <Icon
            name={showOldPassword ? 'eye' : 'eye-off'}

            size={22}
            color="#14752e"
          />
        </TouchableOpacity>
      </View>

      {/* New Password */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="New Password"
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
        <Icon
           name={showOldPassword ? 'eye' : 'eye-off'}

            size={22}
            color="#14752e"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm New Password */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm New Password"
          secureTextEntry={!showConfirmPassword}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
        <Icon
            name={showOldPassword ? 'eye' : 'eye-off'}

            size={22}
            color="#14752e"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handlePasswordChange}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Changing...' : 'Change Password'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.link}
        onPress={handleGotologin}
      >
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F5E9',
  },
  topImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#66bb6a',
    marginBottom: 30,
    textAlign: 'center',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#14752e',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#66bb6a',
    padding: 10,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#b2dfdb',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: '#14752e',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default ChangePasswordProfile;
