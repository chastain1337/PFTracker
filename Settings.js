import React, {useState} from 'react';
import {Text, View, TextInput, TouchableOpacity, StyleSheet, Alert} from 'react-native'
import AddMachine from './AddMachine';
import api from "./api"
export default function Settings() {
    const [sql,setSQL] = useState("");
    const [showAddMachine,setShowAddMachine] = useState(false);

    const handleRunSQL = async () => {
        api.evaluateSql(sql)
        .then( (results) => {
            alert("success, results in console")
            console.log(results);
        },
        (err) => {alert(`Could run not SQL: ${err}`)})
    }

    const handleAfterAddMachineSaveOrCancel = (machineWasSaved) => {
        setShowAddMachine(false);
        console.log(machineWasSaved);
        if (machineWasSaved > 0) {
            Alert.alert(`Machine was successfully saved under ID ${machineWasSaved}`);
        }
    }

    if (showAddMachine) return <AddMachine QRCode={null} afterSaveOrCancel={handleAfterAddMachineSaveOrCancel}/>

    return(
        <View>
            <Text>Settings (Admin)</Text>

            <View style={{borderColor: 'black', borderWidth: 1, marginTop: 10, padding: 2}}>
            <TextInput style={{ height: 40, borderColor: 'gray', borderWidth: 1 }} onChangeText={txt => setSQL(txt)} value={sql} />
            <TouchableOpacity style={styles.button} disabled={sql.trim().length === 0} onPress={handleRunSQL}>
                <Text>Run SQL</Text>
            </TouchableOpacity>
            </View>

            <View>
                <TouchableOpacity style={styles.bigButton} onPress={() => setShowAddMachine(true)}>
                    <Text style={{fontSize: 16}}>Add Machine</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create( {
    button: {
        backgroundColor: "lightblue",
        borderRadius: 5,
    },
    bigButton: {marginTop: 20, backgroundColor: "#fff", padding: 10, elevation: 5},
})