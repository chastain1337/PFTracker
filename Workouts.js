import React from 'react';
import {View, Text} from 'react-native';
import GenericHeader from './GenericHeader';

export default function Workouts() {
        
    return (
        <>
        <GenericHeader tabHeader="View Workouts" />
        <View>
            <Text>View workouts here.</Text>
        </View>
        </>
    )
}