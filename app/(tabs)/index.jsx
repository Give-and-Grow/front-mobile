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
import OpportunityList from 'C:/Users/user/Videos/SOFT/front-mobile/screens/OpportunityList.jsx';
import ProfileOrganizationScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/ProfileOrganizationScreen.jsx';
import CreatevolunterOpportunity from 'C:/Users/user/Videos/SOFT/front-mobile/screens/CreatevolunterOpportunity.jsx';
import CreateJobOpportunity from 'C:/Users/user/Videos/SOFT/front-mobile/screens/CreateJobOpportunity.jsx';
import nearby_opportunitiesUser from 'C:/Users/user/Videos/SOFT/front-mobile/screens/nearby_opportunitiesUser.jsx'
import OpportunityStatusPage from 'C:/Users/user/Videos/SOFT/front-mobile/screens/OpportunityStatusPage.jsx'
import CreateTagAssigner from 'C:/Users/user/Videos/SOFT/front-mobile/screens/CreateTagAssigner.jsx';
import TagsList from 'C:/Users/user/Videos/SOFT/front-mobile/screens/CreateTagAssigner.jsx';
import AdminDashboardScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/AdminDashboardScreen.jsx';
import adminfeaturerejectapprove from 'C:/Users/user/Videos/SOFT/front-mobile/screens/adminfeaturerejectapprove.jsx';
import adminfeatchallorganizationandDelete from 'C:/Users/user/Videos/SOFT/front-mobile/screens/adminfeatchallorganizationandDelete.jsx';
import AdminProfile from 'C:/Users/user/Videos/SOFT/front-mobile/screens/AdminProfile.jsx'; 
import SkillsList from 'C:/Users/user/Videos/SOFT/front-mobile/screens/SkillsList.jsx'; 
import AllOppertinitesUser from 'C:/Users/user/Videos/SOFT/front-mobile/screens/AllOppertinitesUser.jsx'; 
import RateParticipantsScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/RateParticipantsScreen.jsx'; 
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
        <Stack.Screen name="ProfileOrganizationScreen" component={ProfileOrganizationScreen} />
        <Stack.Screen name="OpportunityList" component={OpportunityList} />
        <Stack.Screen name="CreatevolunterOpportunity" component={CreatevolunterOpportunity} />
        <Stack.Screen name="CreateJobOpportunity" component={CreateJobOpportunity} />
        <Stack.Screen name="nearby_opportunitiesUser" component={nearby_opportunitiesUser} />
        <Stack.Screen name="OpportunityStatusPage" component={OpportunityStatusPage} />
        <Stack.Screen name="CreateTagAssigner" component={CreateTagAssigner} />
        <Stack.Screen name="TagsList" component={TagsList} />
        <Stack.Screen name="AdminDashboardScreen" component={AdminDashboardScreen} />
        <Stack.Screen name="adminfeaturerejectapprove" component={adminfeaturerejectapprove} />
        <Stack.Screen name="AdminProfile" component={AdminProfile} />
        <Stack.Screen name="adminfeatchallorganizationandDelete" component={adminfeatchallorganizationandDelete} />
        <Stack.Screen name="SkillsList" component={SkillsList} />
        <Stack.Screen name="AllOppertinitesUser" component={AllOppertinitesUser} />
        <Stack.Screen name="RateParticipantsScreen" component={RateParticipantsScreen} />
     
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Index;
