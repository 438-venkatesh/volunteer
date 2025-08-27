import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import VerificationScreen from '../screens/VerificationScreen';
// Import all your screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import UserTypeScreen from '../screens/UserTypeScreen';
import VolunteerSignupScreen from '../screens/VolunteerSignupScreen';
import OrganizationSignupScreen from '../screens/OrganizationSignupScreen';
import LoginScreen from '../screens/LoginScreen';
import VolunteerDashboard from '../screens/VolunteerDashboard';
import OrganizationDashboard from '../screens/OrganizationDashboard';
import ProfileScreen from '../screens/ProfileScreen';
import createScreen from '../screens/createScreen';
import ExploreScreen from '../screens/ExploreScreen';
import EventListScreen from '../screens/EventListScreen';
import EventRegisterScreen from '../screens/EventRegistrationScreen';
import ManageVolunteerScreen from '../screens/ManageVolunteerScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
const Stack = createStackNavigator();

const AppNavigator = () => {
  const { userToken, userRole } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Always include all screens in the navigator */}
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="UserType" component={UserTypeScreen} />
            <Stack.Screen name="VolunteerSignup" component={VolunteerSignupScreen} />
            <Stack.Screen name="OrganizationSignup" component={OrganizationSignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="verify" component={VerificationScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="CreateEvent" component={createScreen} />
            <Stack.Screen name="Explore" component={ExploreScreen} />
            <Stack.Screen name="EventList" component={EventListScreen} />
            <Stack.Screen name="EventReg" component={EventRegisterScreen} />
            <Stack.Screen name="Manage" component={ManageVolunteerScreen} />
            <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
        <Stack.Screen name="VolunteerDashboard" component={VolunteerDashboard} />
        <Stack.Screen name="OrganizationDashboard" component={OrganizationDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;