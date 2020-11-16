import React, {useEffect, useState, useRef} from 'react'
import {View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, FlatList, TouchableWithoutFeedback, KeyboardAvoidingView} from 'react-native'
import GenericHeader from '../GenericHeader'
import { Foundation, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons'; 
import api from "../api"
import Swipeable from 'react-native-gesture-handler/Swipeable';
import AddMachine from './AddMachine';

/**
 * 
 * @param {{onPickMachine: function, onReturn: function, allowAdd: boolean, allowEdit: boolean}} props 
 */
export default function ViewMachines(props) {
    const [machines, setMachines] = useState([])
    const [machineInEdit, setMachineInEdit] = useState(null)
    const [newMachineName, setNewMachineName] = useState("");
    const [newMachineQR, setNewMachineQR] = useState("");
    const [newWeightIncrement, setNewWeightIncrement] = useState("");
    const [addMachine, setAddMachine] = useState(false);

    useEffect( () => {
        getMachines()    ;
    },[])

    const getMachines = async () => {
        const machines = await api.machines.get().catch(e => Alert.alert(e));
        setMachines(machines);
    }

    const editMachine = index => {
        const machine = {...machines[index]}
        setNewMachineName(machine.Name)
        setNewMachineQR(machine.QRCode);
        setNewWeightIncrement(machine.WeightIncrement.toString());
        row[index].close();
        setMachineInEdit(index);
    }

    const saveMachineEdit = index => {

        if (!newMachineName || !newMachineQR || !newWeightIncrement || newMachineName.trim().length === 0 || newMachineQR.trim().length === 0) return Alert.alert("Neither Name or QRCode can be blank.")
        
        setMachineInEdit(index);
        const machine = {...machines[index]}
        machine.Name = newMachineName
        machine.QRCode = newMachineQR
        machine.WeightIncrement = newWeightIncrement
        api.machines.update(machine);

        const machinesCopy = [...machines]
        machinesCopy[index] = machine;
        setMachines(machinesCopy);

        setMachineInEdit(null)
    }

    const deleteMachine = index => {
        Alert.alert("Delete Machine?", `Are you sure you want to delete "${machines[index].Name}"? This will delete all exercises on this machine. It cannot be undone.`,
        [
            {text: "Yes, Delete",style: "destructive", onPress: () => confirmDeleteMachine(index)},
            {text: "Cancel", style: 'cancel'}
        ]);
    }

    const confirmDeleteMachine = async index => {
        await api.machines.delete(machines[index].ID);
        getMachines();
    }

    const showEditTools = (index) => {
        if (props.allowEdit) return (<View style={{flexDirection: "row"}}>
        
            <TouchableOpacity style={{marginVertical: 5, backgroundColor: "dodgerblue", justifyContent: 'center', paddingHorizontal: 15}} onPress={() => editMachine(index)}>
                <Foundation name="pencil" size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity style={{marginVertical: 5, backgroundColor: "red", justifyContent: 'center', paddingHorizontal: 15}} onPress={() => deleteMachine(index)}>
                <Foundation name="trash" size={24} color="white" />
            </TouchableOpacity>

        </View>)
    }

    const handlePress = idx => {
        if (props.onPickMachine) {
            const machine = {...machines[idx]}
            props.onPickMachine(machine);
        }
    }


    let row = []
    let prevOpenedRow;

    const closeRow = index => {
        if (prevOpenedRow && prevOpenedRow !== row[index]) {
            prevOpenedRow.close();
        }
        prevOpenedRow = row[index];
    }

    const renderItem = (item,index) => {
        return (
            <View>
                <Swipeable renderRightActions={() => showEditTools(index)} ref={ref => row[index] = ref} onSwipeableOpen={() => closeRow(index)}>
                    <TouchableWithoutFeedback onPress={() => handlePress(index)}>
                        <View style={{paddingVertical: 10, marginTop: 5, backgroundColor: "white", marginBottom: machineInEdit === index ? 0 : 5 }}>
                            <View style={{flexDirection: "row", alignItems: "center"}}>
                                <Foundation name="burst" size={40} color="black" style={{marginHorizontal: 10}} />
                                <View>
                                    <Text style={{fontSize: 24}}>{item.Name}</Text>
                                    <Text style={{fontSize: 12, color: "gray"}}>{item.QRCode}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Swipeable>
            {machineInEdit === index 
            ? (
                <View style={{marginHorizontal: 10, paddingBottom: 10, paddingHorizontal: 20, borderBottomRightRadius: 30, borderBottomLeftRadius: 30, marginBottom: 5, backgroundColor: "white", }}>
                    <TextInput returnKeyLabel="Save" onSubmitEditing={() => saveMachineEdit(index)} selectTextOnFocus placeholder="New Machine Name" style={styles.input} value={newMachineName} onChangeText={txt => setNewMachineName(txt)} />
                    <TextInput returnKeyLabel="Save" onSubmitEditing={() => saveMachineEdit(index)} selectTextOnFocus placeholder="New Machine QR Code" style={styles.input} value={newMachineQR} onChangeText={txt => setNewMachineQR(txt)} />
                    <TextInput returnKeyLabel="Save" keyboardType={"number-pad"} onSubmitEditing={() => saveMachineEdit(index)} selectTextOnFocus placeholder="New Machine Weight Increment" style={styles.input} value={newWeightIncrement} onChangeText={txt => setNewWeightIncrement(txt.replace(/,+|\.+/g,""))} />
                    <View style={{flexDirection: "row", alignItems: "center", width: '30%', alignSelf: "flex-end"}}>
                        <TouchableOpacity disabled={!newMachineName || !newMachineQR || newMachineName.trim().length === 0 || newMachineQR.trim().length === 0} style={{flex: 1, alignItems: "center", padding: 5}} onPress={() => saveMachineEdit(index)}>
                            <MaterialCommunityIcons name="content-save-edit" size={30} color={!newMachineName || !newMachineQR || newMachineName.trim().length === 0 || newMachineQR.trim().length === 0 ? "lightgray" : "green"} />
                        </TouchableOpacity>
                        <TouchableOpacity style={{flex: 1, alignItems: "center", padding: 5}} onPress={()=>setMachineInEdit(null)}>
                            <MaterialCommunityIcons name="cancel" size={30} color="red" />
                        </TouchableOpacity>
                    </View>
                </View>
            )
            : null
            }
            
            </View>
        )
    }
    
    const header = () => {
        return (<View style={{flexDirection: "row", padding: 10, backgroundColor: "lightblue"}}>
                {props.allowAdd ? <TouchableOpacity style={styles.header} onPress={() => setAddMachine(true)} >
                    <AntDesign name="plus" size={24} color="black" />
                </TouchableOpacity>: null}
                <TouchableOpacity style={styles.header} onPress={props.onReturn}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
            </View>)
    }

    if (addMachine) return (
        <AddMachine afterSaveOrCancel={() => {getMachines(); setAddMachine(false);}} />
    )

    return (
        <View>
            <GenericHeader tabHeader="View Machines" />
            <FlatList 
                data={machines}
                renderItem={ ( {item, index} ) =>  renderItem(item,index) } 
                keyExtractor={item => item.ID.toString()} 
                ListHeaderComponent={header}
                stickyHeaderIndices={[0]}
                ListFooterComponent={() => <View style={{paddingBottom: 400}}></View>}/>
                
        </View>
    )
}

const styles = StyleSheet.create( {
    header: {flex: 1, alignItems: "center", padding: 5, marginVertical: 5, marginHorizontal: 10, backgroundColor: "white"},
    input: {
        padding: 10,
        marginVertical: 5,
        borderColor: "lightgray",
        borderWidth: 1,
        borderRadius: 3,
        fontSize: 16,
        backgroundColor: "white"}
    
})