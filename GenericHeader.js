import React from 'react'
import {StyleSheet, View, Text} from 'react-native'

/**
 * 
 * @param {{tabHeader: string}} props 
 */
export default function GenericHeader(props) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{props.tabHeader}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "black",
        width: "100%",
        padding: 5
    },
    text: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold"
    }
})