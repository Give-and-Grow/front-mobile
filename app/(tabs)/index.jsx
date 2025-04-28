import React, { useEffect, useRef } from 'react';
import { Alert, Linking } from 'react-native';
import 'react-native-gesture-handler';
import { I18nManager } from 'react-native';
I18nManager.forceRTL(true); // تفعيل دعم اللغة العربية
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import registerNNPushToken from 'native-notify';
import * as Notifications from 'expo-notifications';



import WelcomeScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/Welcome.jsx';
import LoginScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/LoginScreen.jsx';
import SinupScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/SinupScreen.jsx';
import homepage from 'C:/Users/user/Videos/SOFT/front-mobile/screens/homepage.jsx';
import ResetPasswordScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/ResetPasswordScreen.jsx';
import ProfileScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/ProfileScreen.jsx';
import ChangePasswordProfile from 'C:/Users/user/Videos/SOFT/front-mobile/screens/ChangePasswordProfile.jsx';
import singuporganization from 'C:/Users/user/Videos/SOFT/front-mobile/screens/singuporganization.jsx';
import SelectUserType from 'C:/Users/user/Videos/SOFT/front-mobile/screens/SelectUserType.jsx';
import SignupFlow from 'C:/Users/user/Videos/SOFT/front-mobile/screens/SignupFlow.jsx';
const Stack = createStackNavigator();

const Index = () => {
  const navigationRef = useRef();



  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="welcome">
        <Stack.Screen name="welcome" component={WelcomeScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SinupScreen" component={SinupScreen} />
        <Stack.Screen name="homepage" component={homepage} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="ChangePasswordProfile" component={ChangePasswordProfile} />
        <Stack.Screen name="singuporganization" component={singuporganization} />
        <Stack.Screen name="SelectUserType" component={SelectUserType} />
        <Stack.Screen name="SignupFlow" component={SignupFlow} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Index;
