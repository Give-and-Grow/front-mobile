import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image ,ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ipAdd from '../scripts/helpers/ipAddress';
const SinupScreen = ({ role }) => {
  const [username, setUsername] = useState('');
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState(''); // Format: YYYY-MM-DD
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();

  const handleNext = async () => {
    if (!firstName || !lastName || !birthday || !gender || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const [year, month, day] = birthday.split('-'); // Assuming birthday is in 'YYYY-MM-DD' format.

    try {
      const response = await fetch(`${ipAdd}:5000/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          last_name: lastName,
          email,
          password,
          day,
          month,
          year,
          gender,
          phone_number: phone,
          role: role,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        Alert.alert('Success', data.msg);
        setUsername(data.username);
        setStep(2);
      } else {
        Alert.alert('Error', data.msg || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const handleVerification = async () => {
    if (!verificationCode || !email) {
      Alert.alert('Error', 'Please enter the verification code and your email');
      return;
    }
  
    try {
      const response = await fetch(`${ipAdd}:5000/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,            // Include email in the request body
          code: verificationCode,
        }),
      });
  
      const data = await response.json();
  
      if (response.status === 200) {
        Alert.alert('Success', 'Account verified successfully!');
        setStep(3);
      } else {
        Alert.alert('Verification Failed', data.msg || 'Invalid code');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };
  
  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    try {
      const response = await fetch(`${ipAdd}:5000/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Alert.alert('Success', data.msg || 'Verification code resent');
      } else {
        Alert.alert('Error', data.msg || 'Failed to resend code');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const finishSignup = () => {
   
    setStep(4);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>
      
      <Image source={require('../assets/images/Signup.gif')} style={styles.headerImage} resizeMode="contain" />

      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, step >= 1 && styles.activeStep]} />
        <View style={[styles.progressStep, step >= 2 && styles.activeStep]} />
        <View style={[styles.progressStep, step >= 3 && styles.activeStep]} />
        <View style={[styles.progressStep, step >= 4 && styles.activeStep]} />
      </View>

      
      {step === 1 && (
        <>
          <Text style={styles.title}>Create Account</Text>
          
          {/* First Name Field with Icon */}
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#388e3c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          
          {/* Last Name Field with Icon */}
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#388e3c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Birthday Field with Icon */}
          <View style={styles.inputContainer}>
            <Ionicons name="calendar" size={20} color="#388e3c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Birthday (YYYY-MM-DD)"
              value={birthday}
              onChangeText={setBirthday}
            />
          </View>

          {/* Gender Buttons with Icon */}
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'Male' && styles.selectedGender]}
              onPress={() => setGender('Male')}
            >
              <Ionicons name="male" size={20} color="#fff" />
              <Text style={styles.buttonText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'Female' && styles.selectedGender]}
              onPress={() => setGender('Female')}
            >
              <Ionicons name="female" size={20} color="#fff" />
              <Text style={styles.buttonText}>Female</Text>
            </TouchableOpacity>
          </View>

          {/* Email Field with Icon */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color="#388e3c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          {/* Password Field with Icon */}
          <View style={styles.passwordContainer}>
            <Ionicons name="lock-closed" size={20} color="#388e3c" style={styles.icon} />
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={23} color="#388e3c" />
            </TouchableOpacity>
          </View>

          {/* Phone Number Field with Icon */}
          <View style={styles.inputContainer}>
            <Ionicons name="call" size={20} color="#388e3c" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      )}

{step === 2 && (
  <>
    <Text style={styles.title}>Enter Verification Code</Text>
    <TextInput
      style={[styles.inputverfication, { marginTop: 20 }]}  // إضافة marginTop لضبط المسافة
      placeholder="Verification Code"
      value={verificationCode}
      onChangeText={setVerificationCode}
      keyboardType="numeric"
    />
    <TouchableOpacity style={styles.button} onPress={handleVerification}>
      <Text style={styles.buttonText}>Verify & Continue</Text>
    </TouchableOpacity>

    {/* Resend Code Option */}
    <TextInput
      style={[styles.inputverfication, { marginTop: 20 }]} // تعديل الحقل الذي لإعادة إرسال الكود
      placeholder="Enter your email to resend code"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
    />
    <TouchableOpacity style={styles.button} onPress={handleResend}>
      <Text style={styles.buttonText}>Resend Code</Text>
    </TouchableOpacity>
  </>
)}

      {step === 3 && (
        <>
          <Text style={styles.title}>Finish Sign Up</Text>
        
          <TouchableOpacity style={styles.button} onPress={finishSignup}>
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 4 && (
        <>
          <Text style={styles.welcomeTitle}>Welcome, {firstName}!</Text>
          <Text style={styles.welcomeTitle}>Your username is {username}</Text>
          <Text style={styles.welcomeSubtitle}>We're happy to have you 🎉</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
     </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#E8F5E9',
  },
  headerImage: {
    width: 200,
    height: 200,
    marginBottom: 5, 
    marginTop: -30,  
  },
  title: {
    fontSize: 24, fontWeight: 'bold', fontStyle: 'italic', marginBottom: 20, color: '#66bb6a',
  },
  input: {
    width: '100%', height: 50, borderColor: '#1B5E20', borderWidth: 2, borderRadius: 25, paddingLeft: 15,
    marginBottom: 15, fontSize: 16, backgroundColor: '#FFFFFF', elevation: 3,
  },
  button: {
    width: '100%', backgroundColor: '#66bb6a', paddingVertical: 15, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', elevation: 4,
  },
  buttonText: {
    fontSize: 16, color: '#fff', fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row', marginBottom: 30, alignSelf: 'center',
  },
  progressStep: {
    width: 40, height: 8, borderRadius: 4, backgroundColor: '#c8e6c9', marginHorizontal: 5,
  },
  activeStep: {
    backgroundColor: '#66bb6a',
  },
  genderContainer: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, width: '100%',
  },
  genderButton: {
    flex: 1, backgroundColor: '#c8e6c9', paddingVertical: 15, borderRadius: 25,
    justifyContent: 'center', alignItems: 'center', marginHorizontal: 5,
  },
  selectedGender: {
    backgroundColor: '#66bb6a',
  },
  welcomeTitle: {
    fontSize: 24, fontWeight: 'bold', color: '#66bb6a', marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16, color: '#388e3c', marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#1B5E20',
    borderWidth: 2,
    borderRadius: 25,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
    elevation: 3,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    color: '#000',
  },
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#E8F5E9',
  },
  headerImage: {
    width: 200,
    height: 200,
    marginBottom: 5, 
    marginTop: -30,  
  },
  title: {
    fontSize: 24, fontWeight: 'bold', fontStyle: 'italic', marginBottom: 20, color: '#66bb6a',
  },
  inputContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%', 
    height: 50, 
    borderColor: '#1B5E20', 
    borderWidth: 2, 
    borderRadius: 25, 
    paddingLeft: 15,
    marginBottom: 15, 
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1, 
    fontSize: 16, 
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#1B5E20',
    borderWidth: 2,
    borderRadius: 25,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
    elevation: 3,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    color: '#000',
  },
  button: {
    width: '100%', 
    backgroundColor: '#388e3c', 
    paddingVertical: 15, 
    borderRadius: 25,
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 4,
  },
  buttonText: {
    fontSize: 16, 
    color: '#fff', 
    fontWeight: 'bold',
    
  },
  genderContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20, 
    width: '100%',
   
  },
  genderButton: {
    flex: 1, 
    backgroundColor: '#c8e6c9', 
    paddingVertical: 8, 
    borderRadius: 70,
    justifyContent: 'center', 
    alignItems: 'center', 
    marginHorizontal: 5,
  },
  selectedGender: {
    backgroundColor: '#388e3c',
  },
  inputverfication: {
    width: '100%',
    height: 50,
    borderColor: '#1B5E20',
    borderWidth: 2,
    borderRadius: 25,
    paddingLeft: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  }
  
  
});

export default SinupScreen;
