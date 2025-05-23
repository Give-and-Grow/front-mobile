import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Alert,
    ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // لاستعمال AsyncStorage
import Ionicons from 'react-native-vector-icons/Ionicons';
import ipAdd from '../scripts/helpers/ipAddress';

const images = [
    require('../assets/images/volunter1.jpg'),
    require('../assets/images/volunter2.jpg'),
    require('../assets/images/volunter3.webp'),
    require('../assets/images/volunter5.webp'),
];

const LoginScreen = ({ navigation }) => {
    const [usernameFocused, setUsernameFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [imageIndex, setImageIndex] = useState(0);
    const fadeAnim = new Animated.Value(1);

    useEffect(() => {
        const interval = setInterval(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [fadeAnim]);

    const handleLogin = async () => {
        try {
            console.log('Sending login request with:', { username, password });
    
            const response = await axios.post(`${ipAdd}:5000/auth/login`, {
                username,
                password,
            });
    
            console.log('Server response:', response.data);
    
            if (response.status === 200) {
                // Store the token and role in AsyncStorage
                await AsyncStorage.setItem('userToken', response.data.token);
                await AsyncStorage.setItem('userRole', response.data.role);  // Store the role
    
                Alert.alert('Success', 'Login successful!');
    
                // Check user role and navigate accordingly
                const userRole = response.data.role;
                if (userRole === 'ADMIN') {
                    // If the role is admin, navigate to AdminDashboardScreen
                    navigation.navigate('AdminDashboardScreen');
                } else {
                    // Otherwise, navigate to homepage
                    navigation.navigate('homepage');
                }
            } else {
                Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Failed to connect to the server';
            Alert.alert('Error', message);
        }
    };
    

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <View style={styles.imageContainer}>
                <Animated.Image source={images[imageIndex]} style={styles.image} />
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.title}>
                    Join Us {'\n'} be the change you want {'\n'} to see in the world
                </Text>

                <View style={styles.inputContainer}>
    <Ionicons name="person" size={22} color="#14752e" style={styles.inputIcon} />
    <TextInput
        style={[styles.inputField, usernameFocused && styles.focusedInput]}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        onFocus={() => setUsernameFocused(true)}
        onBlur={() => setUsernameFocused(false)}
        autoCapitalize="none"
    />
</View>

<View style={styles.inputContainer}>
    <Ionicons name="lock-closed" size={22} color="#14752e" style={styles.inputIcon} />
    <TextInput
        style={[styles.inputField, passwordFocused && styles.focusedInput]}
        placeholder="Password"
        secureTextEntry={!showPassword}
        value={password}
        onChangeText={setPassword}
        onFocus={() => setPasswordFocused(true)}
        onBlur={() => setPasswordFocused(false)}
    />
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Ionicons
            name={showPassword ? 'eye' : 'eye-off'}
            size={23}
            color="#14752e"
            style={styles.eyeIcon}
        />
    </TouchableOpacity>
</View>




                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => navigation.navigate('SignupFlow')}>
                        <Text style={[styles.footerText, styles.footerLink]}>
                            Don't have an account? Sign Up
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ResetPasswordScreen')}>
                        <Text style={[styles.footerText, styles.footerLink]}>
                            Forget Password
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
       
    </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 50,
    },
    imageContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: '90%',
        height: 300,
        borderRadius: 70,
        borderWidth: 7,
        borderColor: '#66bb6a',
    },
    formContainer: {
        width: '80%',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginBottom: 20,
        color: '#66bb6a',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#14752e',
        marginBottom: 15,
    },
    focusedInput: {
        borderColor: '#388e3c',
    },
    button: {
        backgroundColor: '#66bb6a',
        padding: 10,
        borderRadius: 20,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        color: '#14752e',
        fontSize: 14,
        marginBottom: 5,
        fontStyle: 'italic',
    },
    footerLink: {
        borderBottomWidth: 1,
        borderBottomColor: '#4cd971',
    },
    passwordContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#14752e',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    eyeIcon: {
        marginLeft: 10,
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#14752e',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    inputIcon: {
        marginRight: 10,
    },
    inputField: {
        flex: 1,
        paddingVertical: 10,
    },
    
});

export default LoginScreen;
