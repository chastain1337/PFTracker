import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native'

export default function CurrentWorkoutHeader(props) {
    return (
        <View style={styles.header}>
            <TouchableOpacity
            style={styles.button}
            onPress={ () => props.addExercise()}>
                <Text style={{color: 'black'}}>Add Exercise</Text>
            </TouchableOpacity>

            <TouchableOpacity
            style={styles.button}
            onPress={() => {}}
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
            justifyContent: 'center'
        },
        button: {
            margin: 2,
            flex: 2,
            alignItems: 'center',
            paddingTop: 10,
            paddingBottom: 10,
            backgroundColor: "lightblue",
            shadowRadius: 1,
            borderRadius: 10
        }
    }
)