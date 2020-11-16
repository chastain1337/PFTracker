import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text, TextInput} from 'react-native'

/**
 * 
 * @param {{endWorkout: function, addExercise: function, intensityIncrease: Number, setIntensityIncrease: Function}} props 
 */
export default function CurrentWorkoutHeader(props) {
    return (
        <View style={styles.header}>
            <TouchableOpacity
            style={styles.button}
            onPress={ () => props.addExercise()}>
                <Text style={{color: 'black'}}>Add Exercise</Text>
            </TouchableOpacity>
            
            <View style={{marginHorizontal: 15, flexDirection: 'row'}}>
                <Text style={styles.intensityText}>+</Text>
                <TextInput 
                    selectTextOnFocus={true} 
                    maxLength={2} 
                    style={styles.setInput} 
                    value={`${props.intensityIncrease}`} 
                    onChangeText={txt => props.setIntensityIncrease(txt.replace(/,+|\.+/g,"").length === 0 ? 0 : txt.replace(/,+|\.+/g,""))} 
                    keyboardType='number-pad' 
                />
                <Text style={styles.intensityText}>%</Text>
            </View>

            <TouchableOpacity
            style={styles.button}
            onPress={props.endWorkout}
            >
                <Text style={{color: 'black'}}>End Workout</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create(
    {
        header: {
            backgroundColor: 'white',
            padding: 5,
            flexDirection: 'row',
            justifyContent: 'center',
        },
        button: {
            marginVertical: 2,
            flex: 1,
            alignItems: 'center',
            paddingTop: 10,
            paddingBottom: 10,
            backgroundColor: "lightblue",
            shadowRadius: 1,
            borderRadius: 10
        },
        setInput: {
            fontSize: 26,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "lightgray",
            borderRadius: 5,
            padding: 5,
            textAlign: "center",
            width: 50
        },
        intensityText: {
            fontSize: 24,
            alignSelf: "center"
        }
    }
)