import React, {useState, useEffect} from 'react'
import {View, Text, TouchableOpacity, FlatList, Modal, TextInput, Alert, StyleSheet, ActivityIndicator} from 'react-native'
import api from "./api"
import { AntDesign } from '@expo/vector-icons'; 
import { Picker } from '@react-native-picker/picker';

/**
 * 
 * @param {{onReturn: function, routineID: Number, machines: Array}} props 
 */
export default function UpsertRoutine(props) {
    const [routineName, setRoutineName] = useState("");
    const [routineExercises, setRoutineExercises] = useState([])
    const [machineBeingPicked, setMachineBeingPicked] = useState(null);
    const [modalVisible, setModalVisible] = useState(false)
    const [keyCount, setKeyCount] = useState(0)
    const [loading,setLoading] = useState(true)

    useEffect( () => {       
        async function setup() {
            if (props.routineID) {
                const routines = await api.routines.getFullByIds([props.routineID]);
                const routine = routines[0]
                setRoutineName(routine.Name);
                setRoutineExercises(routine.Exercises.map( (exs, index) => {
                    return {_id: index+1, MachineID: exs.MachineID, NumberOfSets: exs.Sets.length, GoTime: exs.GoTime, RestTime: exs.RestTime, ID: exs.ID}
                }));
            }
            setLoading(false);
        }
        setup();
    },[])

    const blankExerciseObject = () => {setKeyCount(keyCount+1); return {_id: keyCount, MachineID: '', NumberOfSets: 1, GoTime: 60, RestTime: 30}}

    const showHelp = () => {
        return Alert.alert("Routines",`A Routine acts as a blueprint or template for a Workout. Add exercises and specify how many sets of each, and next time you create a workout you can choose this routine to build it.`)
    }

    const addExercise = () => {
        if (routineExercises.length === 30) return Alert.alert("Error","Cannot add more than 30 exercises to a Routine.")
        const newExs = [...routineExercises, {...blankExerciseObject()}]
        setRoutineExercises(newExs);
    }

    const routineFooter = () => {
        return <TouchableOpacity style={{marginTop: 5,marginBottom: 250, alignItems: "center", padding: 5}} onPress={addExercise}>
                <AntDesign name="pluscircleo" size={24} color="green" />
            </TouchableOpacity>
    }

    
    const updateExerciseMachine = (index,newMachineID) => {
        const exsCopy = [...routineExercises]
        exsCopy[index].MachineID = newMachineID
        setRoutineExercises(exsCopy);
    }

    const updateNumberOfSets = (index, txt) => {
        if (txt === '0' || txt === '') txt = '1'
        const exsCopy = [...routineExercises];
        exsCopy[index].NumberOfSets = txt.replace(/,+|\.+/g,"")
        setRoutineExercises(exsCopy);
    }

    const updateGoTime = (index, txt) => {
        if (txt === '0' || txt === '') txt = '1'
        const exsCopy = [...routineExercises];
        exsCopy[index].GoTime = txt.replace(/,+|\.+/g,"")
        setRoutineExercises(exsCopy);
    }

    const updateRestTime = (index, txt) => {
        if (txt === '0' || txt === '') txt = '1'
        const exsCopy = [...routineExercises];
        exsCopy[index].RestTime = txt.replace(/,+|\.+/g,"")
        setRoutineExercises(exsCopy);
    }
    
    const deleteExs = index => {
        const exsCopy = [...routineExercises]
        exsCopy.splice(index,1);
        setRoutineExercises(exsCopy);
    }

    const renderItem = (item, index) => {
        const machine = props.machines.find( m => m.ID === item.MachineID)
        return (
            <View style={{backgroundColor: "white", marginVertical: 8, padding: 5}}>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 5, borderBottomColor: "lightgray", borderBottomWidth: 1, marginBottom: 10}}>
                    <TextInput selectTextOnFocus style={{padding: 5, fontSize: 20, minWidth: 50, borderRadius: 5, borderColor: "lightgray", borderWidth: 1, textAlign: "center", marginRight: 10 }} value={item.NumberOfSets.toString()} keyboardType="number-pad" onChangeText={(txt) => updateNumberOfSets(index,txt)} />
                    <Text style={{fontSize: 20}}>set{item.NumberOfSets > 1 ? 's': ''} of the</Text>
                    <TouchableOpacity style={{backgroundColor: "white", padding: 10}} onPress={() => {setMachineBeingPicked(index); setModalVisible(true)}}>
                        <Text style={{fontSize: 20, padding: 5, borderColor: "lightgray", borderWidth: 1, borderRadius: 5, color: (machine ? "black" : "lightgray")}}>{machine ? machine.Name : "Choose Machine"}</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={{flexDirection: "row",alignItems: "center"}}>
                    <View style={{flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                        <Text style={{fontSize: 20, marginRight: 10}}>Go Time:</Text>
                        <TextInput selectTextOnFocus style={{padding: 5, fontSize: 20, minWidth: 50, borderRadius: 5, borderColor: "lightgray", borderWidth: 1, textAlign: "center", }} value={item.GoTime.toString()} keyboardType="number-pad" onChangeText={(txt) => updateGoTime(index,txt)} />
                    </View>

                    <View style={{flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
                        <Text style={{fontSize: 20, marginRight: 10}}>Rest Time:</Text>
                        <TextInput selectTextOnFocus style={{padding: 5, fontSize: 20, minWidth: 50, borderRadius: 5, borderColor: "lightgray", borderWidth: 1, textAlign: "center", marginRight: 10 }} value={item.RestTime.toString()} keyboardType="number-pad" onChangeText={(txt) => updateRestTime(index,txt)} />
                    </View>
                </View>

                <TouchableOpacity style={{justifyContent: "center", alignItems: "center", padding: 10, marginTop: 5}} onPress={() => deleteExs(index) }>
                    <AntDesign name="minuscircleo" size={18} color="red" />
                </TouchableOpacity>

            </View>
        )
    }

    const saveRoutine = async () => {
        if (routineName.trim().length === 0) return Alert.alert("Invalid","Enter a routine name.")
        if (routineExercises.length === 0) return Alert.alert("Invalid","Add at least one exercise.")
        const exerciseWithNoMachine = routineExercises.findIndex( e => e.MachineID === '')
        if (exerciseWithNoMachine > -1) return Alert.alert("Invalid",`Exercise #${exerciseWithNoMachine+1} has no chosen machine.`)

        setLoading(true);
        const routineObject = {Name: routineName, Exercises: [...routineExercises], ID: props.routineID}
        if (routineObject.ID) {
            console.log("updating routine",routineObject);
            await api.routines.update(routineObject)
            .catch( e => Alert.alert("Error",e));
        } else {
            console.log("creating routine");
            await api.routines.create(routineObject)
            .catch( e => Alert.alert("Error",e));
        }
        

        setLoading(false);
        props.onReturn();
    }
    

    const machinePickerItems = [<Picker.Item key={'picker_placeholder'} label='Choose Machine...' value=''/>, ...props.machines.map( m => <Picker.Item key={m.ID.toString()} label={m.Name} value={m.ID} />)]

    if (loading) return <View style={{flex: 1, justifyContent: "center", alignContent: "center"}}><ActivityIndicator size="large" /></View>
    return (
        <View style={styles.container}>
            <FlatList 
                data={routineExercises}
                renderItem={( {item, index} ) =>  renderItem(item,index)}
                keyExtractor={item => item._id.toString()}
                ListHeaderComponent={
                <View style={{backgroundColor: "white", flexDirection: 'row', padding: 5}}>
                    <TextInput style={{padding: 5, fontSize: 16, width: "70%", borderRadius: 5, borderColor: "lightgray", borderWidth: 1}} placeholder={"Routine Name"} onChangeText={txt => setRoutineName(txt)} value={routineName} />
                    <TouchableOpacity style={{justifyContent: "center", alignItems: "center", flex: 1, padding: 5}} onPress={showHelp}>
                        <AntDesign name="questioncircleo" size={24} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{justifyContent: "center", alignItems: "center", flex: 1, padding: 5}} onPress={saveRoutine}>
                        <AntDesign name="save" size={24} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{justifyContent: "center", alignItems: "center", flex: 1, padding: 5}} onPress={() => props.onReturn()}>
                        <AntDesign name="left" size={24} color="black" />
                    </TouchableOpacity>
                </View>}
                ListFooterComponent={routineFooter}
                stickyHeaderIndices={[0]}
            />

            <Modal animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)} visible={modalVisible}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                                <Picker 
                                    mode='dropdown'
                                    prompt='Machine'
                                    selectedValue={routineExercises[machineBeingPicked] ? routineExercises[machineBeingPicked].MachineID : ''} 
                                    onValueChange={(itemValue) => updateExerciseMachine(machineBeingPicked,itemValue)} 
                                    style={{width: 200, borderRadius: 20, borderColor: "lightgray", borderWidth: 1}}>
                                    {machinePickerItems}
                                </Picker>
                                <TouchableOpacity style={{padding: 5, marginTop: 10}} onPress={() => {setModalVisible(false); setMachineBeingPicked(null)}}>
                                    <AntDesign name="closecircleo" size={32} color="black" />
                                </TouchableOpacity>
                        </View>
                    </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        margin: 25,
        padding: 20,
        backgroundColor: "white",
        borderRadius: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
      },
      container: {
        flex: 1,
    },
})