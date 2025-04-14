import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    // Navigate to the next screen (e.g., Login or Registration)
    navigation.navigate('LoginScreen'); // Change 'Login' to your desired screen
  };

  return (
    <View style={styles.container}>
      {/* Add an icon or image here to represent the theme */}
      <Image source={require('../assets/images/volunteering.png')} style={styles.icon} />
      
      <Text style={styles.title}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.volunteerText}> GIVE & GROW </Text>
      </Text>

      <Text style={styles.description}>
        Volunteering is the gateway to personal growth and making a difference.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 3, // Corrected: Set a value here
    borderColor: '#66bb6a',
    flex: 1,
    backgroundColor: '#E8F5E9', // Soft light green background for a fresh feel
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 50, // Extra padding to move content down

  },
  icon: {
    width: 150,
    height: 150,
    marginBottom: 30,
    borderRadius: 80,
    borderWidth: 3, // Corrected: Set a value here
    borderColor: '#66bb6a',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 40, // Improved line height for readability
  },
  welcomeText: {
    color: '#388e3c', // Dark green color for "Welcome to"
    fontStyle: 'italic',
  },
  volunteerText: {
    color: '#66bb6a', // Lighter green for "Volunteer & Growth"
    fontStyle: 'italic',
  },
  description: {
    fontSize: 16, // Slightly larger for better readability
    color: '#388e3c', // Dark green for the description
    textAlign: 'center',
    marginBottom: 40, // More space below for better balance
    lineHeight: 28, // Slightly increased line height for better readability
    letterSpacing: 1, // Added letter spacing for better text flow
    paddingHorizontal: 30, // More padding to avoid text being too close to the edges
    paddingVertical: 15, // Vertical padding for more breathing room
    backgroundColor: '#eaf7ea', // Light green background to emphasize the text
    borderRadius: 10, // Rounded corners for a soft and modern look
    shadowColor: '#000', // Shadow color for depth
    shadowOffset: { width: 0, height: 2 }, // Slight shadow offset
    shadowOpacity: 0.1, // Subtle shadow effect
    shadowRadius: 5, // Soft shadow edges
    elevation: 2, // Android shadow effect
  },
  button: {
    backgroundColor: '#66bb6a', // Lighter green background for the button
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50, // Rounded button for a modern look
    elevation: 5, // Slight shadow effect for depth
  },
  buttonText: {
    color: '#fff', // White text for the button
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
