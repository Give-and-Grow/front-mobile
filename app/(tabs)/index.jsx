import React, { useEffect, useRef } from 'react';
import { Alert, Linking } from 'react-native';
import 'react-native-gesture-handler';
import { I18nManager } from 'react-native';
I18nManager.forceRTL(true); // تفعيل دعم اللغة العربية
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import registerNNPushToken from 'native-notify';
import * as Notifications from 'expo-notifications';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


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
import ManageTagsScreenOrg from 'C:/Users/user/Videos/SOFT/front-mobile/screens/ManageTagsScreenOrg.jsx';
import FollowingScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/FollowingScreen.jsx';
import CreatePost from 'C:/Users/user/Videos/SOFT/front-mobile/screens/CreatePost.jsx';
import EditPostScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/EditPostScreen.jsx';
import BottomTabBar from  'C:/Users/user/Videos/SOFT/front-mobile/screens/BottomTabBar.jsx';
import TopTabBar from 'C:/Users/user/Videos/SOFT/front-mobile/screens/TopTabBar.jsx';
import FrindsPost from 'C:/Users/user/Videos/SOFT/front-mobile/screens/FrindsPost.jsx';
import CommentsScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/CommentsScreen.jsx';
import OpportunityFilters from 'C:/Users/user/Videos/SOFT/front-mobile/screens/OpportunityFilters.jsx';
import ScreenLayout from 'C:/Users/user/Videos/SOFT/front-mobile/screens/ScreenLayout.jsx';
import JobOpportunities from 'C:/Users/user/Videos/SOFT/front-mobile/screens/JobOpportunities.jsx';
import VolunterOpprtunities from 'C:/Users/user/Videos/SOFT/front-mobile/screens/VolunterOpprtunities.jsx';
import CFopportunitiesUser from 'C:/Users/user/Videos/SOFT/front-mobile/screens/CFopportunitiesUser.jsx';
import CFSimilarOpportunities from 'C:/Users/user/Videos/SOFT/front-mobile/screens/CFSimilarOpportunities.jsx';
import FollowScreenOrganization from 'C:/Users/user/Videos/SOFT/front-mobile/screens/FollowScreenOrganization.jsx';
import OrganizationFilters from 'C:/Users/user/Videos/SOFT/front-mobile/screens/OrganizationFilters.jsx';
import LayoutWithFiltersOrg from 'C:/Users/user/Videos/SOFT/front-mobile/screens/LayoutWithFiltersOrg.jsx';
import AdminFilters from 'C:/Users/user/Videos/SOFT/front-mobile/screens/AdminFilters.jsx';
import LayoutWithFiltersAdmin from 'C:/Users/user/Videos/SOFT/front-mobile/screens/LayoutWithFiltersAdmin.jsx';
import FilterComponent from 'C:/Users/user/Videos/SOFT/front-mobile/screens/FilterComponent.jsx';
import ApplicationsScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/ApplicationsScreen.jsx';
import EvaluateScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/EvaluateScreen.jsx';
import OrganizationRejectAcceptUser from 'C:/Users/user/Videos/SOFT/front-mobile/screens/OrganizationRejectAcceptUser.jsx';
import AttendanceScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/AttendanceScreen.jsx';
import CertificateScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/CertificateScreen.jsx';
import Notification from 'C:/Users/user/Videos/SOFT/front-mobile/screens/Notification.jsx';
import ChatList from 'C:/Users/user/Videos/SOFT/front-mobile/screens/ChatList.jsx';
import ChatBox from 'C:/Users/user/Videos/SOFT/front-mobile/screens/ChatBox.jsx';
import ChatScreen from 'C:/Users/user/Videos/SOFT/front-mobile/screens/ChatScreen.jsx';
import HonorBoard from 'C:/Users/user/Videos/SOFT/front-mobile/screens/HonorBoard.jsx';
import DashbordData from 'C:/Users/user/Videos/SOFT/front-mobile/screens/DashbordData.jsx';
import AccountsDashboard from 'C:/Users/user/Videos/SOFT/front-mobile/screens/AccountsDashboard.jsx';
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
        <Stack.Screen name="ManageTagsScreenOrg" component={ManageTagsScreenOrg} />
        <Stack.Screen name="FollowingScreen" component={FollowingScreen} />
        <Stack.Screen name="CreatePost" component={CreatePost} />
        <Stack.Screen name="EditPostScreen" component={EditPostScreen} />
        <Stack.Screen name="BottomTabs" component={BottomTabBar} />
        <Stack.Screen name="TobTabs" component={TopTabBar} />
        <Stack.Screen name="FrindsPost" component={FrindsPost} />
        <Stack.Screen name="CommentsScreen" component={CommentsScreen} />
        <Stack.Screen name="OpportunityFilters" component={OpportunityFilters} />
        <Stack.Screen name="ScreenLayout" component={ScreenLayout} />
        <Stack.Screen name="JobOpportunities" component={JobOpportunities} />
        <Stack.Screen name="VolunterOpprtunities" component={VolunterOpprtunities} />
        <Stack.Screen name="CFopportunitiesUser" component={CFopportunitiesUser} />
        <Stack.Screen name="CFSimilarOpportunities" component={CFSimilarOpportunities} />
        <Stack.Screen name="FollowScreenOrganization" component={FollowScreenOrganization} />
        <Stack.Screen name="OrganizationFilters" component={OrganizationFilters} />
        <Stack.Screen name="LayoutWithFiltersOrg" component={LayoutWithFiltersOrg} />
        <Stack.Screen name="AdminFilters" component={AdminFilters} />
        <Stack.Screen name="LayoutWithFiltersAdmin" component={LayoutWithFiltersAdmin} />
        <Stack.Screen name="FilterComponent" component={FilterComponent} />
        <Stack.Screen name="EvaluateScreen" component={EvaluateScreen} />
        <Stack.Screen name="ApplicationsScreen" component={ApplicationsScreen} /> 
        <Stack.Screen name="OrganizationRejectAcceptUser" component={OrganizationRejectAcceptUser} /> 
        <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} /> 
        <Stack.Screen name="CertificateScreen" component={CertificateScreen} /> 
           <Stack.Screen name="Notification" component={Notification} /> 
             <Stack.Screen name="ChatList" component={ChatList} /> 
               <Stack.Screen name="ChatBox" component={ChatBox} /> 
                <Stack.Screen name="HonorBoard" component={HonorBoard} /> 
                <Stack.Screen name="DashbordData" component={DashbordData} /> 
                 <Stack.Screen name="AccountsDashboard" component={AccountsDashboard} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Index;
