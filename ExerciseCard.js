import React from 'react'
import {View, Text, StyleSheet} from 'react-native'
import { Entypo, FontAwesome5 } from '@expo/vector-icons';

export default function ExerciseCard(props) {
    return (
        <View style={{flexDirection: "row", padding: 10}}>
                <View style={styles.machineNameContainer}>
                    <Text style={styles.machineName}>{props.machine.Name}</Text>
                </View>
                <View style={styles.timeContainer}>
                    <FontAwesome5 name="fire-alt" size={20} color="darkred"></FontAwesome5><Text style={styles.time}>{props.goTime}</Text>
                </View>
                <View style={styles.timeContainer}>
                    <Entypo name="water" size={20} color="lightblue" /><Text style={styles.time}>{props.restTime}</Text>
                </View>
            </View>
    )
}

const styles = StyleSheet.create({
    timeContainer: {
        flex: 2,
        width: "15%",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        // borderWidth: 1,
        // borderColor: "black"
    },
    machineNameContainer: {
        width: "70%",
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