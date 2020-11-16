import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';

export default function Footer() {
    return (
        <View style={styles.footer}>
            <TouchableOpacity
            style={styles.button}
            onPress={() => RootNavigation.navigate('PFTracker')}>
                <Text>Current Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={styles.button}
            onPress={() => RootNavigation.navigate('CreateWorkout')}
            >
                <Text>New Workout</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create(
    {
        footer: {
            width: '100%',
            height: 80,
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
        },
        button: {
            padding: 20
        }
    }
)