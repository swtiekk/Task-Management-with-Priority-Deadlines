import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Folder, Clock, User } from 'lucide-react-native';

import HomeScreen from '../screens/home/HomeScreen';
import ProjectListScreen from '../screens/projects/ProjectListScreen';
import ProjectDetailScreen from '../screens/projects/ProjectDetailScreen';
import OverdueTasksScreen from '../screens/overdue/OverdueTasksScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { Project } from '../types';

export type ProjectStackParamList = {
  ProjectList: undefined;
  ProjectDetail: { id: number, name: string };
};

const ProjectStack = createNativeStackNavigator<ProjectStackParamList>();

const ProjectStackNavigator = () => (
  <ProjectStack.Navigator id="ProjectStack" screenOptions={{ headerShown: false }}>
    <ProjectStack.Screen name="ProjectList" component={ProjectListScreen} />
    <ProjectStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
  </ProjectStack.Navigator>
);

export type AppTabsParamList = {
  HomeTab: undefined;
  ProjectsTab: undefined;
  OverdueTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export const AppTabs = () => {
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { color: '#0097A7', fontWeight: 'bold' },
        tabBarActiveTintColor: '#0097A7',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Overview',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectStackNavigator}
        options={{
          title: 'Projects',
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => <Folder color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="OverdueTab"
        component={OverdueTasksScreen}
        options={{
          title: 'Overdue',
          tabBarLabel: 'Overdue',
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};
