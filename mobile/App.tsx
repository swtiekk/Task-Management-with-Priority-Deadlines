import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { MaterialIcons } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProjectsScreen from './src/screens/ProjectsScreen';
import ProjectDetailScreen from './src/screens/ProjectDetailScreen';
import OverdueScreen from './src/screens/OverdueScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import Chatbot from './src/components/Chatbot';
import api from './src/api/axios';
import { clearSession } from './src/api/auth';
import { colors } from './src/theme';

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  EmailVerification: { email: string };
  MainTabs: undefined;
  ProjectDetail: { id: number };
};

export type TabParamList = {
  Home: undefined;
  Projects: undefined;
  Overdue: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textHint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderSoft,
          height: 62,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof MaterialIcons.glyphMap> = {
            Home: 'home',
            Projects: 'folder',
            Overdue: 'schedule',
            Profile: 'person',
          };
          return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Overdue" component={OverdueScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Conditional Chatbot component
function AuthenticatedChatbot({ routeName }: { routeName: string | undefined }) {
  const unauthScreens = ['Login', 'SignUp', 'EmailVerification'];
  if (!routeName || unauthScreens.includes(routeName)) return null;
  return <Chatbot />;
}

// Wrapper that includes both tabs and chatbot
function MainTabsWithChatbot() {
  const routeName = useNavigationState(
    (state) => state?.routes[state.index]?.name
  );

  return (
    <>
      <MainTabs />
      <AuthenticatedChatbot routeName={routeName} />
    </>
  );
}

function AppNavigator({ userToken }: { userToken: string | null }) {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={userToken ? 'MainTabs' : 'Login'}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="MainTabs" component={MainTabsWithChatbot} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `JWT ${token}`;
        try {
          await api.get('/v1/auth/users/me/');
          setUserToken(token);
        } catch {
          await clearSession();
          setUserToken(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <AppNavigator userToken={userToken} />
        <StatusBar style="auto" />
      </NavigationContainer>
    </View>
  );
}