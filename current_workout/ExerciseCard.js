import React, {useEffect, useState} from 'react'
import {View, Text, StyleSheet, FlatList, TouchableOpacity} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import SetCard from './SetCard';
import api from "../api"

/**
 * 
 * @param {{machine: Object, exercise: Object, addSet: Function, modifySet: Function,exerciseIndex: Number, deleteExercise: function, deleteSet: function}} props 
 */
export default function ExerciseCard(props) {

    const [machineHistory,setMachineHistory] = useState([])
    useEffect( () => {
        updateMachineHistory();
    },[])

    const updateMachineHistory = async () => {
        const _machineHistory = await api.machines.getHistory(props.exercise.MachineID);
        console.log(_machineHistory);
        setMachineHistory(_machineHistory)

    }
    const addSet = async () => {
        // Pass the set up to CurrentWorkout
        props.addSet(props.exercise.ID);
        // Manually add the set to avoid another api call
    }

    const renderItem = (item,index) => {
        return <SetCard 
                    set={{...item}} 
                    exercise={props.exercise} 
                    modifySet={props.modifySet} 
                    setIndex={index} 
                    exerciseIndex={props.exerciseIndex} 
                    deleteSet={props.deleteSet}
                    machineHistory={machineHistory}
                />
    }

    const RightActions = () => {
    
    return (
        
        <TouchableOpacity style={{ backgroundColor: 'red', justifyContent: 'center', paddingHorizontal: 10 }} onPress={() => {props.deleteExercise(props.exerciseIndex)}}>
            <MaterialCommunityIcons name="minus-circle-outline" size={26} color="white" />
        </TouchableOpacity>
        
    )
    }

    return (
        <View style={styles.card} >
            <Swipeable renderRightActions={RightActions}>
            <View style={{flexDirection: "row", padding: 10, borderBottomWidth: 1, borderBottomColor: 'gray', backgroundColor: "#E9F1F8"}}>
                <View style={styles.machineNameContainer}>
                    <Text style={styles.machineName}>{props.machine.Name}</Text>
                </View>
                <View style={styles.timeContainer}>
                    <MaterialCommunityIcons name="moon-full" size={24} color="darkgreen" /><Text style={styles.time}>{props.exercise.GoTime}</Text>
                </View>
                <View style={styles.timeContainer}>
                <MaterialCommunityIcons name="moon-full" size={24} color="darkred" /><Text style={styles.time}>{props.exercise.RestTime}</Text>
                </View>
            </View>
            </Swipeable>
            <FlatList style={styles.sets}
                data={ props.exercise.Sets }
                renderItem={( {item, index} ) =>  renderItem(item,index)}
                keyExtractor={item => item.ID.toString()}
            />
            <TouchableOpacity style={{alignItems: "center", paddingVertical: 5}} onPress={addSet}>
                <Ionicons name="ios-add-circle-outline" size={30} color="green" />
            </TouchableOpacity>
        </View>

    )
}

const styles = StyleSheet.create({
    sets: {
        marginBottom: 5
    },
    card: {
        padding: 3,
        borderRadius: 10,
        borderColor: "lightgray",
        borderWidth: 1,
        marginHorizontal: 5,
        marginVertical: 5,
        backgroundColor: "#E9F1F8",
    },
    timeContainer: {
        flex: 2,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        // borderWidth: 1,
        // borderColor: "black"
    },
    machineNameContainer: {
        width: "63%",
        // borderWidth: 1,
        // borderColor: "black"
    },
    time: {
        fontSize: 16,
        marginLeft: 2,
        color: "gray",
        fontWeight: "bold"
        
    },
    machineName: {
        fontSize: 20,
        fontWeight: "bold"
    }
})