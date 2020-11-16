import React, {useState} from 'react'
import {View, StyleSheet, TextInput, TouchableOpacity} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Models from '../models';

/**
 * 
 * @param {{set: Object, exercise: Object, modifySet: Function, setIndex: Number, exerciseIndex: Number, deleteSet: function,machineHistory: Object}} props 
 */
export default function SetCard(props) {
    const [repsLocal, setRepsLocal] = useState(props.set.Reps.toString())
    const [weightLocal, setWeightLocal] = useState(props.set.Weight.toString())
    
    const handleBlur = async () => {
        const newSet = new Models.Set(props.set.ID, props.set.ExerciseID,weightLocal,repsLocal);
        props.modifySet(newSet,props.exerciseIndex,props.setIndex);
    }

    const RightActions = () => {
    
        return (
            
            <TouchableOpacity style={{ backgroundColor: 'red', justifyContent: 'center', paddingHorizontal: 10 }} onPress={() => {props.deleteSet(props.exerciseIndex,props.setIndex)}}>
                <MaterialCommunityIcons name="minus-circle-outline" size={20} color="white" />
            </TouchableOpacity>
            
        )
    }

    return (
        <Swipeable renderRightActions={RightActions}>
            <View style={styles.setCard} >
                <View style={styles.stat}>
                    <TextInput placeholder={props.machineHistory[props.setIndex] ? props.machineHistory[props.setIndex].Reps.toString() : ""} selectTextOnFocus={true} maxLength={3} style={styles.setInput} value={repsLocal} onChangeText={txt => setRepsLocal(txt.replace(/,+|\.+/g,""))} keyboardType='number-pad' onBlur={handleBlur} blurOnSubmit={true} />
                    <MaterialCommunityIcons name="repeat" size={24} color="black" />
                </View>

                <View style={styles.stat}>
                    <TextInput placeholder={props.machineHistory[props.setIndex] ? props.machineHistory[props.setIndex].Weight.toString() : ""} selectTextOnFocus={true} maxLength={3} style={styles.setInput} value={weightLocal} onChangeText={txt => setWeightLocal(txt.replace(/,+|\.+/g,""))} keyboardType='number-pad' onBlur={handleBlur} blurOnSubmit={true}/>
                    <MaterialCommunityIcons name="weight-pound" size={24} color="black" />
                </View>
            </View>
            </Swipeable>
    )
}

const styles = StyleSheet.create({
    stat: {
        flexDirection: "row",
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    setCard: {
        flexDirection: 'row',
        paddingHorizontal: 50,
        marginVertical: 5,
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center"
    },
    setInput: {
        fontSize: 26,
        marginRight: 5,
        backgroundColor: "white",
        borderRadius: 5,
        padding: 5,
        width: 60,
        textAlign: "center"
        
    },
    textBetween: {
        fontSize: 25
    }
})