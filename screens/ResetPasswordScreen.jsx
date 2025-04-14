import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';

const ResetPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

 const handleRequestCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.107:5000/auth/reset-password-request', {
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
      const response = await fetch('http://192.168.1.107:5000/auth/reset-password', {
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
          <TextInput
            style={styles.input}
            placeholder="Enter your Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.button} onPress={handleRequestCode}>
            <Text style={styles.buttonText}>Send Code</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter Code & New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Verification Code"
            placeholderTextColor="#aaa"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#aaa"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
            <Text style={styles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      )}
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
  input: {
    width: '100%',
    height: 50,
    borderColor: '#1B5E20',
    borderWidth: 2,
    borderRadius: 25,
    paddingLeft: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  button: {
    width: '100%',
    backgroundColor: '#66bb6a',
    paddingVertical: 15,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
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
});

export default ResetPasswordScreen;
