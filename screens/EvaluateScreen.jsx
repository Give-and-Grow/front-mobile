import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ipAdd from '../scripts/helpers/ipAddress';

const EvaluateScreen = ({ route, navigation }) => {
  const { participantId } = route.params;
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState('');
  const [loadingToken, setLoadingToken] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          Alert.alert('Error', 'Please log in first.');
          navigation.goBack();
          return;
        }
        setToken(storedToken);
      } catch (error) {
        Alert.alert('Error', 'Failed to load user data.');
        navigation.goBack();
      } finally {
        setLoadingToken(false);
      }
    };
    loadToken();
  }, [navigation]);

  const handleRating = (value) => setRating(value);

  const submitEvaluation = async () => {
    if (rating < 1 || rating > 5) {
      Alert.alert('Invalid Rating', 'Please select a rating between 1 and 5.');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'User data not loaded yet.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        `${ipAdd}:5000/user-participation/evaluate`,
        {
          participant_id: participantId,
          rating,
          feedback,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Thank you!', 'Your evaluation was submitted successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Evaluation Error:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        Alert.alert('Unauthorized', 'Session expired or invalid token.');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingToken) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Volunteer Opportunity Evaluation</Text>

      <Text style={styles.label}>Your Rating</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((val) => (
          <TouchableOpacity key={val} onPress={() => handleRating(val)} activeOpacity={0.7}>
            <Icon
              name={val <= rating ? 'star' : 'star-outline'}
              size={36}
              color="#4caf50"
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Your Feedback</Text>
      <TextInput
        style={styles.textArea}
        multiline
        numberOfLines={5}
        placeholder="Write your feedback about this volunteer opportunity..."
        placeholderTextColor="#999"
        value={feedback}
        onChangeText={setFeedback}
        editable={!submitting}
      />

      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.buttonDisabled]}
        onPress={submitEvaluation}
        disabled={submitting}
      >
        <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Evaluation'}</Text>
        <Icon name="check-circle-outline" size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={28} color="#4caf50" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 28,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    color: '#388e3c',
    marginBottom: 8,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  star: {
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    color: '#333',
    borderColor: '#a5d6a7',
    borderWidth: 1,
    textAlignVertical: 'top',
    marginBottom: 32,
    elevation: 2, // subtle shadow on Android
  },
  submitButton: {
    backgroundColor: '#4caf50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 3,
    shadowColor: '#388e3c',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    gap: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 18,
    color: '#4caf50',
    fontWeight: '600',
  },
});

export default EvaluateScreen;
