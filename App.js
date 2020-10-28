import 'react-native-gesture-handler';
import Constants from 'expo-constants';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import CurrentWorkout from "./current_workout/CurrentWorkout"
import Workouts from "./Workouts"
import { FontAwesome5, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import {View} from "react-native"
import * as SQLite from 'expo-sqlite'
import api from './api'
import Settings from './Settings';

const db = SQLite.openDatabase('PFTracker');
const Tab = createBottomTabNavigator();

export default function App() {
  const [workouts,setWorkouts] = useState([])
  const [machines,setMachines] = useState([])

  React.useEffect( () => {
      const setup = async () => {
        await api.seedDB();
        setMachines(await api.getMachines());
        refreshData();
      }
      
      setup();
      
  },[]);
    

    const refreshData = async () => {
     const workouts = await api.getWorkouts().catch( e => console.log(e));
     const machines = await api.getMachines()
     
     setMachines(machines);
     setWorkouts(workouts);
    }

  return (
    <View style={{flex: 1, marginTop: Constants.statusBarHeight}}>
    <NavigationContainer>
      
      <Tab.Navigator
      screenOptions={
        ( {route} ) => ({
          tabBarIcon: ({focused, color, size}) => {
            if (route.name === 'Current Workout') {
              return <MaterialCommunityIcons name="dumbbell" size={size} color={color}/>
            } else if (route.name === 'Workouts') {
              return <FontAwesome5 name="dumbbell" size={size} color={color}/>
            } else if (route.name === 'Track') {
              return <Entypo name="line-graph" size={size} color={color} />
            }
            return <MaterialCommunityIcons name="settings" size={size} color={color} />

          }
        })
      }>
        
        <Tab.Screen name="Current Workout" db={db}
        children={ () => <CurrentWorkout workouts={workouts} refreshData={refreshData} machines={machines} />}
        />

        <Tab.Screen name="Workouts"
        children={ () => <Workouts workouts={workouts} />}  />

        <Tab.Screen name="Track"
          children = { () => <Workouts workouts={workouts} />}
         />

        <Tab.Screen name="Settings"
        component={Settings}
         />

      </Tab.Navigator>
      
    </NavigationContainer>
    </View>
  );
}

//options={{headerTitle: () => <Header headerDisplay="PFTracker" />}
