import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import SignupScreen from './SinupScreen';
import Signuporganization from './singuporganization';
import SelectUserType from './SelectUserType';
import ipAdd from '../scripts/helpers/ipAddress';
const SignupFlow = () => {
  const [userType, setUserType] = useState(null);

  const handleUserTypeSelect = (type) => {
    setUserType(type);
  };

  return (
    <View style={styles.container}>
      {!userType && <SelectUserType onSelect={handleUserTypeSelect} />}
      {userType === 'volunteer' && <SignupScreen role="USER" />}
      {userType === 'organization' && <Signuporganization role="organization" />}
    </View>
  );
};

export default SignupFlow;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
