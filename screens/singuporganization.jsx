import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Imageorg from '../assets/images/organSingup.png'; // تأكد أن الصورة متوافقة مع React Native أو استخدم رابط URL
import ipAdd from '../scripts/helpers/ipAddress';
import Ionicons from 'react-native-vector-icons/Ionicons'; // تأكد من تثبيت هذه المكتبة
const singuporganization = ({ role }) => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [organizationName, setOrganizationName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const handleNext = async () => {
    if (!organizationName || !description || !email || !password || !phone) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const response = await fetch(`${ipAdd}:5000/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: organizationName,
          description,
          email,
          password,
          phone_number: phone,
          role: role,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        Alert.alert('Success', data.msg);
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
      Alert.alert('Error', 'Please enter your email and verification code');
      return;
    }

    try {
      const response = await fetch(`${ipAdd}:5000/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          code: verificationCode,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Alert.alert('Success', 'Account verified successfully!');
        setStep(3);
      } else {
        Alert.alert('Error', data.msg || 'Invalid code');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  const finishSignup = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email again to finish');
      return;
    }
    setStep(4);
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

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('Response is not JSON');
      }

      if (response.status === 200) {
        Alert.alert('Success', data.msg || 'Verification code resent');
      } else {
        Alert.alert('Error', data.msg || 'Failed to resend code');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to connect to server');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={Imageorg} style={styles.headerImage} />

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((item) => (
          <View
            key={item}
            style={[styles.progressStep, step >= item && styles.activeStep]}
          />
        ))}
      </View>

      {step === 1 && (
        <>
         <Text style={styles.title}>Create Organization Account</Text>

<View style={styles.inputContainer}>
  <Ionicons name="business-outline" size={20} color="#388e3c" style={styles.icon} />
  <TextInput placeholder="Organization Name" value={organizationName} onChangeText={setOrganizationName} style={styles.inputField} />
</View>

<View style={styles.inputContainer}>
  <Ionicons name="document-text-outline" size={20} color="#388e3c" style={styles.icon} />
  <TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.inputField} />
</View>

<View style={styles.inputContainer}>
  <Ionicons name="mail-outline" size={20} color="#388e3c" style={styles.icon} />
  <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.inputField} keyboardType="email-address" />
</View>

<View style={styles.inputContainer}>
  <Ionicons name="lock-closed-outline" size={20} color="#388e3c" style={styles.icon} />
  <TextInput
    placeholder="Password"
    value={password}
    onChangeText={setPassword}
    style={[styles.inputField, { flex: 1 }]}
    secureTextEntry={!showPassword}
  />
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
    <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#388e3c" />
  </TouchableOpacity>
</View>

<View style={styles.inputContainer}>
  <Ionicons name="call-outline" size={20} color="#388e3c" style={styles.icon} />
  <TextInput placeholder="Phone Number" value={phone} onChangeText={setPhone} style={styles.inputField} keyboardType="phone-pad" />
</View>

<TouchableOpacity style={styles.button} onPress={handleNext}>
  <Text style={styles.buttonText}>Next</Text>
</TouchableOpacity>

        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Enter Verification Code</Text>
          <View style={styles.inputIconContainer}>
  <Ionicons name="key-outline" size={20} color="#388e3c" style={styles.icon} />
  <TextInput
    placeholder="Verification Code"
    value={verificationCode}
    onChangeText={setVerificationCode}
    style={styles.inputWithIcon}
    keyboardType="number-pad"
  />
</View>

<TouchableOpacity style={styles.button} onPress={handleVerification}>
  <Text style={styles.buttonText}>Verify & Continue</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => setShowResendForm(!showResendForm)} style={styles.resendLinkContainer}>
  <Ionicons name="refresh-circle-outline" size={20} color="#388e3c" style={styles.icon} />
  <Text style={styles.resendLink}>Resend Code</Text>
</TouchableOpacity>


          {showResendForm && (
  <View style={{ width: '100%', alignItems: 'center' }}>
    <TextInput
      placeholder="Enter your email"
      value={email}
      onChangeText={setEmail}
      style={styles.input}
    />
    <TouchableOpacity style={styles.button} onPress={handleResend}>
      <Text style={styles.buttonText}>Resend Code</Text>
    </TouchableOpacity>
  </View>
)}

        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.title}>Finish Sign Up</Text>
          <TextInput placeholder="Confirm Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
          <TouchableOpacity style={styles.button} onPress={finishSignup}>
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 4 && (
        <>
          <Text style={styles.welcomeTitle}>Welcome, {organizationName}!</Text>
          <Text style={styles.welcomeSubtitle}>Your account is now set up!</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginScreen')}>
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

export default singuporganization;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    minHeight: '100%',
  },
  headerImage: {
    width:170,
    height: 170,
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  progressStep: {
    width: 40,
    height: 8,
    backgroundColor: '#c8e6c9',
    borderRadius: 4,
  },
  activeStep: {
    backgroundColor: '#388e3c',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderColor: '#66bb6a',
    borderWidth: 2,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#388e3c',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    width: '70%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    
  },
  resendLink: {
    color: '#388e3c',
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#4caf50',
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderColor: '#66bb6a',
    borderWidth: 2,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 0,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderColor: '#66bb6a',
    borderWidth: 2,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
  },
  inputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderColor: '#66bb6a',
    borderWidth: 2,
    paddingHorizontal: 15,
    marginBottom: 15,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
  },
  resendLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  
});
