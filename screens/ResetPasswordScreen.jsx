import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ipAdd from '../scripts/helpers/ipAddress';
const ResetPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

 const handleRequestCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      const response = await fetch(`${ipAdd}:5000/auth/reset-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Alert.alert('Success', 'Verification code sent to email');
        setStep(2);
      } else {
        Alert.alert('Error', data.msg || 'Failed to send code');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Server connection failed');
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${ipAdd}:5000/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Alert.alert('Success', 'Password reset successfully');
        navigation.navigate('LoginScreen');
      } else {
        Alert.alert('Error', data.msg || 'Failed to reset password');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Server connection failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/restPasssword.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />

        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, step >= 1 && styles.activeStep]} />
          <View style={[styles.progressStep, step >= 2 && styles.activeStep]} />
        </View>

        {step === 1 ? (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={24} color="#388e3c" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your Email"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleRequestCode}>
              <Text style={styles.buttonText}>Send Code</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Enter Code & New Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="code" size={24} color="#388e3c" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Verification Code"
                placeholderTextColor="#aaa"
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.passwordContainer}>
              <Ionicons name="lock-closed" size={24} color="#388e3c" style={styles.icon} />
              <TextInput
                style={styles.passwordInput}
                placeholder="New Password"
                placeholderTextColor="#aaa"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={23}
                  color="#388e3c"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
              <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
 
  headerImage: {
    width: 200,
    height: 200,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 20,
    color: '#66bb6a',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderColor: '#1B5E20',
    borderWidth: 2,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    paddingLeft: 15,
    paddingRight: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },

  progressContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    alignSelf: 'center',
  },
  progressStep: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c8e6c9',
    marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: '#66bb6a',
  },
  passwordContainer: {
    width: '100%',
    height: 50,
    borderColor: '#1B5E20',
    borderWidth: 2,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeIcon: {
    paddingLeft: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F5E9',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20, // Optional, to ensure the content is well spaced on smaller screens
  },
  button: {
    width: '100%', // تأكد من أن الزر يشغل كامل العرض
    maxWidth: 350, // يمكنك تحديد حد أقصى للعرض
    backgroundColor: '#66bb6a',
    paddingVertical: 20,  // زيادة المسافة الرأسية داخل الزر
    paddingHorizontal: 40,  // زيادة المسافة الأفقية داخل الزر
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
    height: 60,  // زيادة ارتفاع الزر
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ResetPasswordScreen;
