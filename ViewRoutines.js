import React, {useState, useEffect} from 'react';
import {View, Text,ActivityIndicator, TouchableOpacity, StyleSheet, FlatList, TouchableWithoutFeedback} from 'react-native';
import UpsertRoutine from './UpsertRoutine';
import api from "./api"
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

/**
 * 
 * @param {{machines: Array}} props 
 */
export default function ViewRoutines(props) {
    
    const [createRoutine, setCreateRoutine] = useState(false);
    const [ready, setReady] = useState(false)
    const [routines, setRoutines] = useState([])
    const [routineInEdit, setRoutineInEdit] = useState(null)

    useEffect( () => {
        async function setup() {
            const _routines = await api.routines.getFull();
            setRoutines(_routines);
            setReady(true);
        }
        setup()
    },[])

    const returnFromCreatedRoutine = async () => {
        setReady(false);
        setRoutineInEdit(null);
        setCreateRoutine(false);
        const _routines = await api.routines.getFull();
        setRoutines(_routines);
        setReady(true);
    }

    const deleteRoutine = index => {
        api.routines.delete(routines[index].ID);

        const routinesCopy = [...routines]
        routinesCopy.splice(index,1)
        setRoutines(routinesCopy);
    }

        
    if (!ready) {return (<View style={{flex: 1, justifyContent: "center", alignContent: "center"}}><ActivityIndicator size="large" /></View>)}

    if (createRoutine) { return (<UpsertRoutine onReturn={returnFromCreatedRoutine} machines={props.machines} routineID={routineInEdit} />)}
    
    if (routines.length === 0) {return (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Text style={{fontSize: 16, color: "gray"}}>No routines yet.</Text>
        <TouchableOpacity style={{backgroundColor: "white", marginTop: 10, borderRadius: 10, padding: 15}} onPress={() => setCreateRoutine(true)} ><Text style={{fontSize: 20}}>Create a Routine</Text></TouchableOpacity>
      </View>
    )}

    const RightActions = (index) => { return (    
        <TouchableOpacity style={{ backgroundColor: 'red', justifyContent: 'center', paddingHorizontal: 10, marginVertical: 5,  }} onPress={() => deleteRoutine(index)}>
            <MaterialCommunityIcons name="minus-circle-outline" size={26} color="white" />
        </TouchableOpacity>
    )}

    const handlePress = (index) => {
        setRoutineInEdit(routines[index].ID);
        setCreateRoutine(true)
    }

    const footer = () => {
        return (
                <TouchableOpacity style={{alignSelf: "center", margin: 10, padding: 10}} onPress={() => setCreateRoutine(true)}>
                    <AntDesign name="plus" size={30} color="green" />
                </TouchableOpacity>
            )
    }

    const renderItem = (routine,index) => {
        return (
        <Swipeable renderRightActions={() => RightActions(index)}>
            <TouchableWithoutFeedback onPress={() => handlePress(index)}>
                <View style={{paddingVertical: 10, marginVertical: 5, backgroundColor: "white",}}>
                    <View style={{flexDirection: "row", alignItems: "center"}}>
                        <AntDesign name="filetext1" size={20} color="black" style={{marginHorizontal: 10}} />
                        <View>
                            <Text style={{fontSize: 20}}>{routine.Name}</Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Swipeable>)
    }

    return (
        <FlatList
            data={routines}
            renderItem={( {item, index} ) =>  renderItem(item,index)}
            ListFooterComponent={footer}
            keyExtractor={item=>item.ID.toString()}
        />
    )


}

const styles = StyleSheet.create({
    
})