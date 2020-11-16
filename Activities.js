import React, {useState, useEffect} from 'react';
import ViewRoutines from "./ViewRoutines"
import ViewWorkouts from "./ViewWorkouts"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();
/**
 * 
 * @param {{workouts: Object, machines: Object}} props 
 */
export default function Activities(props) {
    
    return (
      <Tab.Navigator>
        <Tab.Screen name="Workouts" children={() => <ViewWorkouts workouts={props.workouts} machines={props.machines} />} />
        <Tab.Screen name="Routines" children={() => <ViewRoutines machines={props.machines} />} />
    </Tab.Navigator>
    )
}