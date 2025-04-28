import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window'); // to make the image responsive

const SelectUserType = ({ onSelect }) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/Roleuser.png')} // Adjust the path if necessary
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.title}>Who Are You?</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => onSelect('volunteer')}>
          <Text style={styles.buttonText}>I'm a Volunteer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => onSelect('organization')}>
          <Text style={styles.buttonText}>I'm an Organization</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectUserType;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: width * 0.4,
    height: width * 0.4,
    maxWidth: 300,
    borderRadius: 15,
    borderWidth: 5,
    borderColor: '#66bb6a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#66bb6a',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '80%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'white',
    borderColor: '#66bb6a',
    borderWidth: 2,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 20,
    width: 250,
    alignItems: 'center',
    shadowColor: '#66bb6a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5, // for Android shadow
  },
  buttonText: {
    color: '#14752e',
    fontSize: 16,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});
