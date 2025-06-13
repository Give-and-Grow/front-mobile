import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle, XCircle } from "lucide-react-native";

const InviteFrame = ({ onYes, onNo }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Would you like to invite people?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.yesButton]} onPress={onYes}>
          <CheckCircle color="white" size={24} />
          <Text style={styles.buttonTextWhite}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.noButton]} onPress={onNo}>
          <XCircle color="#14532d" size={24} />
          <Text style={styles.buttonTextGreen}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 320, // smaller width
    marginTop: 10,
    marginHorizontal: 16,
    padding: 20,
    backgroundColor: '#E8F5E9', // very light green
    borderColor: '#a7f3d0', // light green border
    borderWidth: 1,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#166534', // dark green
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  yesButton: {
    backgroundColor: '#a5d6a7', // light green
  },
  noButton: {
    backgroundColor: '#a5d6a7', // softer green background
  },
  buttonTextWhite: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
    marginTop: 4,
  },
  buttonTextGreen: {
    color: '#14532d', // dark green
    fontWeight: '500',
    fontSize: 16,
    marginTop: 4,
  },
});

export default InviteFrame;
