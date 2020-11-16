import React, {useEffect, useState, useRef} from 'react'
import {View, Text, TouchableOpacity, StyleSheet, TextInput, Alert} from 'react-native'
import GenericHeader from '../GenericHeader'
import { Ionicons } from '@expo/vector-icons'; 
import CameraView from '../CameraView';
import api from "../api"

/**
 * 
 * @param {{QRCode: string, afterSaveOrCancel(newMachineID: number): function}} props 
 */
export default function AddMachine(props) {
    const [QRCodeLocal, setQRCodeLocal] = useState(null)
    const [machineName, setMachineName] = useState(null)
    const [machineWeightIncrement, setMachineWeightIncrement] = useState(null)
    const [showCamera, setShowCamera] = useState(false)
    const [saveButtonDisabled, setSaveButtonDisabled] = useState(true)

    const didMountRef = useRef(false);

    useEffect( () => {
        if (didMountRef.current) {
            setSaveButtonDisabled(!QRCodeLocal || !machineName || QRCodeLocal.trim().length === 0 || machineName.trim().length === 0)
        } else {
            didMountRef.current = true;
            setQRCodeLocal(props.QRCode);
        }
    })

    const handleCancel = () => {
        props.afterSaveOrCancel(-1);
    }
    
    const handleAddMachine = () => {
        api.machines.create(QRCodeLocal,machineName,machineWeightIncrement)
        .then( (id) => {console.log("Finished saving machine.",id); props.afterSaveOrCancel(id)} )
        .catch( (err) => {console.log(err); Alert.alert(`Machine could not be saved. ${err}`)})
    }

    if (showCamera) return <CameraView barcodeScanned={code => setQRCodeLocal(code)} closeCameraView={() => setShowCamera(false)} />

    return (
        <View>
            <GenericHeader tabHeader={"Add Machine"} />
            <View style={styles.inputLabel}><Text style={{color: "gray",}}>QRCode</Text></View>
            
            <View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center',backgroundColor: '#fff',}}>
                <TextInput style={{flex: 1,padding:10,backgroundColor: '#fff', fontSize: 16, color: "#000"}} placeholder={"QRCode"} value={QRCodeLocal} onChangeText={ txt => setQRCodeLocal(txt)} />
                <TouchableOpacity style={{padding: 10}} onPress={() => setShowCamera(true)}>
                    <Ionicons name="ios-camera" size={30} color="black" />
                </TouchableOpacity>
            </View>

            <View style={styles.inputLabel}><Text style={{color: "gray",}}>Name</Text></View>
            <TextInput style={styles.input} value={machineName} onChangeText={ txt => setMachineName(txt)} />

            <View style={styles.inputLabel}><Text style={{color: "gray",}}>Weight Increment</Text></View>
            <TextInput style={styles.input} value={machineWeightIncrement} onChangeText={ txt => setMachineWeightIncrement(txt.replace(/,+|\.+/g,""))} keyboardType="number-pad" />

            <View style={{flexDirection: "row", alignItems: "center"}}>
                <TouchableOpacity style={saveButtonDisabled ? {...styles.button, backgroundColor: "lightgray"} : {...styles.button, backgroundColor: "lightblue"}} onPress={handleAddMachine} disabled={saveButtonDisabled}><Text style={saveButtonDisabled ? {color: "gray"} : {color: "black"}}>Save</Text></TouchableOpacity>
                <TouchableOpacity style={{...styles.button, backgroundColor: "pink"}} onPress={handleCancel}><Text>Cancel</Text></TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create( {
    input: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: "#fff",
    },
    inputLabel: {
        marginTop: 15,
        paddingHorizontal: 5,
        backgroundColor: "#fff",
        alignSelf: "flex-start",
        marginLeft: 5
    },
    button: {
        flex: 2,
        padding: 10,
        margin: 10,
        borderRadius: 10,
        alignItems: "center"
    }
})