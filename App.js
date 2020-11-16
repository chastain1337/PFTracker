import Constants from 'expo-constants';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import CurrentWorkout from "./current_workout/CurrentWorkout"
import Activities from "./Activities"
import { FontAwesome5, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import {View, ActivityIndicator} from "react-native"
import api from './api'
import Settings from './Settings';
import UpsertRoutine from './UpsertRoutine';

const Tab = createBottomTabNavigator();

export default function App() {
  const [workouts,setWorkouts] = useState([])
  const [machines,setMachines] = useState([])
  const [setupComplete,setSetupComplete] = useState(false)

  React.useEffect( () => {
      const setup = async () => {
        await api.validateDB()
        await api.seedDB();
        const machines = await api.machines.get();
        setMachines(machines);
        await refreshWorkouts();
        setSetupComplete(true);
      }
      setSetupComplete(false);
      setup();
      
  },[]);

  const refreshWorkouts = async () => {
    const newWorkouts = await api.workouts.get().catch( e => console.log(e));
    setWorkouts(newWorkouts);

  }

  if (!setupComplete || !machines || !workouts) {
    return <View style={{flex: 1, justifyContent: "center", alignContent: "center"}}><ActivityIndicator size="large" /></View>
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
            } else if (route.name === 'Activities') {
              return <FontAwesome5 name="dumbbell" size={size} color={color}/>
            } else if (route.name === 'Track') {
              return <Entypo name="line-graph" size={size} color={color} />
            }
            return <MaterialCommunityIcons name="settings" size={size} color={color} />

          }
        })
      }>
        
        <Tab.Screen name="Current Workout"
        children={ () => <CurrentWorkout workouts={workouts} machines={machines} refreshWorkouts={refreshWorkouts}/>}
        />

        <Tab.Screen name="Activities"
        children={ () => <Activities workouts={workouts} machines={machines}/>}  />

        <Tab.Screen name="Track"
          children = { () => <Activities workouts={workouts}  machines={machines}/>}
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
