import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ipAdd from '../scripts/helpers/ipAddress';

const CreateJobOpportunity = () => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [skills, setSkills] = useState('');
    const [requiredPoints, setRequiredPoints] = useState('');
    const navigation = useNavigation();

    const handleSubmit = async () => {
        const formData = {
            title,
            description,
            location,
            start_date: startDate.trim(),
            end_date: endDate.trim(),
            status: 'open',
            contact_email: contactEmail.trim(),
            opportunity_type: 'job',
            skills: [1], // This should be adjusted to actual skills, e.g., from a list
            required_points: parseInt(requiredPoints.trim()),
        };

        const token = await getToken();
        if (!token) {
            Alert.alert('Error', 'You must be logged in to create a job opportunity.');
            return;
        }

        try {
            const response = await axios.post(`${ipAdd}:5000/opportunities/create`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            Alert.alert('Success', 'Job opportunity created successfully!');
            navigation.navigate('homepage');

        } catch (error) {
            console.error(error.response);
            Alert.alert('Error', 'Failed to create job opportunity!');
        }
    };

    const getToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            return token || null;
        } catch (e) {
            console.error('Failed to retrieve token', e);
            return null;
        }
    };

    const renderStepIndicator = () => {
        return (
            <View style={styles.stepIndicator}>
                {['Step 1', 'Step 2', 'Step 3'].map((stepLabel, index) => (
                    <View
                        key={index}
                        style={[styles.stepCircle, step === index + 1 ? styles.activeStep : styles.inactiveStep]}
                    >
                        <Text style={styles.stepText}>{index + 1}</Text>
                    </View>
                ))}
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
        source={require('../assets/images/joboppertinitues.png')} // تأكد من وضع الصورة في مجلد مناسب داخل مشروعك
        style={styles.banner}
        resizeMode="contain"
    />
            <Text style={styles.heading}>Create Job Opportunity</Text>

            {renderStepIndicator()}

            {/* Step 1 */}
            {step === 1 && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Title"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Location"
                        value={location}
                        onChangeText={setLocation}
                    />
                    <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Step 2 */}
            {step === 2 && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Start Date (YYYY-MM-DD)"
                        value={startDate}
                        onChangeText={setStartDate}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="End Date (YYYY-MM-DD)"
                        value={endDate}
                        onChangeText={setEndDate}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Contact Email"
                        value={contactEmail}
                        onChangeText={setContactEmail}
                    />
                    <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Step 3 */}
            {step === 3 && (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Skills (comma separated)"
                        value={skills}
                        onChangeText={setSkills}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Required Points"
                        value={requiredPoints}
                        onChangeText={setRequiredPoints}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#E8F5E9',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#66bb6a',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 50,
        borderColor: '#66bb6a',
        borderWidth: 2,
        marginBottom: 15,
        paddingLeft: 10,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    stepCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5,
    },
    activeStep: {
        backgroundColor: '#66bb6a',
    },
    inactiveStep: {
        backgroundColor: '#ccc',
    },
    stepText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#66bb6a',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    banner: {
        width: '100%',
        height: 180,
        marginBottom: 20,
        borderRadius: 15,
    },
    
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CreateJobOpportunity;
