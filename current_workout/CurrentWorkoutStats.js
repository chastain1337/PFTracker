import React, {useState, useEffect} from "react"
import {View, Text, StyleSheet, Platform} from 'react-native'

/**
 * 
 * @param {{workout: Object}} props 
 */
export default function CurrentWorkoutStats(props) {

    const totalExercises = props.workout.Exercises.length
    const totalSets = props.workout.Exercises.reduce( (a,e) => {return (a + e.Sets.length)},0)
    const totalWeightLifted = props.workout.Exercises.reduce( (a,e) => {
            return a + e.Sets.reduce( (a2,s) => {
                return a2 + (s.Weight * s.Reps)
            },0)
        },0)

    const avgSetsPerExs = Math.ceil(totalSets / totalExercises)
    const avgGoTime = Math.round((props.workout.Exercises.reduce( (a,e) => {return a + Number(e.GoTime)},0)) / totalExercises)
    const avgRestTime = Math.round((props.workout.Exercises.reduce( (a,e) => {return a + Number(e.RestTime)},0)) / totalExercises)

    if (props.workout.Exercises.length === 0) return <Text style={styles.noExs}>No exercises yet.</Text>
    return (

        
        <View style={styles.container}>
            <View style={styles.col}>
                <Text style={styles.header}>Total...</Text>
                
                    <View style={styles.stat}>
                        <View style={styles.statLeft}>
                            <Text>Exercises</Text>
                        </View>
                        <View style={styles.statRight}>
                            <Text>{totalExercises}</Text>
                            </View>
                    </View>
                    <View style={styles.stat}>
                        <View style={styles.statLeft}>
                            <Text>Sets</Text>
                        </View>
                        <View style={styles.statRight}>
                            <Text>{totalSets}</Text>
                            </View>
                    </View>
                    <View style={styles.stat}>
                        <View style={styles.statLeft}>
                            <Text>Weight</Text>
                        </View>
                        <View style={styles.statRight}>
                            <Text>{totalWeightLifted}</Text>
                            </View>
                    </View>
                
            </View>
            <View style={{...styles.col, borderLeftColor: "gray", borderLeftWidth: 1}}>
                <Text style={styles.header}>Average...</Text>
                
                <View style={styles.stat}>
                    <View style={styles.statLeft}>
                        <Text>Sets</Text>
                    </View>
                    <View style={styles.statRight}>
                        <Text>{avgSetsPerExs}</Text>
                        </View>
                </View>
                <View style={styles.stat}>
                    <View style={styles.statLeft}>
                        <Text>"Go" Time</Text>
                    </View>
                    <View style={styles.statRight}>
                        <Text>{avgGoTime}</Text>
                        </View>
                </View>
                <View style={styles.stat}>
                    <View style={styles.statLeft}>
                        <Text>Rest Time</Text>
                    </View>
                    <View style={styles.statRight}>
                        <Text>{avgRestTime}</Text>
                        </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create( {
    container: {
        flexDirection: 'row',
        height: Platform.OS === 'ios' ? 190 : 450,
        backgroundColor: "#F3F3F3",
        borderRadius: 10,
        marginHorizontal: 5,
        marginBottom: 5,
        paddingVertical: 10
    },
    header: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign:"center",
    },
    col: {
        flex: 1
    },
    statLeft: {flex: 2, borderRightColor: "gray", borderRightWidth: 1, alignItems: "flex-end", paddingRight: 8},
    statRight: {flex: 2, alignItems: "flex-start",paddingLeft: 9},
    stat: {flexDirection: "row", justifyContent: "center", marginVertical: 3},
    noExs: {color: "gray", fontSize: 16, textAlign: "center", marginTop: 50}
})