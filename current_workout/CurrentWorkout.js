import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, FlatList, Modal, TextInput, TouchableHighlight, Alert} from 'react-native'
import GenericHeader from './../GenericHeader';
import CurrentWorkoutHeader from './CurrentWorkoutHeader';
import api from './../api'
import ExerciseCard from '../ExerciseCard';
import CameraView from '../CameraView';
import AddMachine from '../AddMachine';

export default function CurrentWorkout(props) {
    const [currentWorkout, setCurrentWorkout] = useState(null);
    const [exercises, setExercises] = useState([])
    const [createExsModalVisible,setCreateExsModalVisible] = useState(false);
    const [currentMachine, setCurrentMachine] = useState(null);
    const [newExsGoTime, setNewExsGoTime] = useState("60");
    const [newExsRestTime, setNewExsRestTime] = useState("30");
    const [cameraOpen, setCamperaOpen] = useState(false)
    const [addMachineOpen, setAddMachineOpen] = useState(false)
    const [scannedQRCode, setScannedQRCode] = useState(null)

    useEffect( () => {
        const unfinishedWorkout = props.workouts.find(w => w.Ended === null);
        async function buildCurrentWorkout(unfinishedWorkout) {
            const exercises = await api.getExercises(unfinishedWorkout.ID);
            unfinishedWorkout.exercises = [...exercises];
            setCurrentWorkout(unfinishedWorkout);
        }
        
        if (props.workouts.length > 0 && unfinishedWorkout ) {
            buildCurrentWorkout(unfinishedWorkout);
        }
    });

    const handleCreateNewWorkout = async () => {
        await api.createWorkout();
        await props.refreshData();
    }

    const renderItem = (item) => {
        const machine = props.machines.find( m => m.ID === item.MachineID)
        return <ExerciseCard key={item.ID.toString()} machine={machine} restTime={item.RestTime.toString()} goTime={item.GoTime.toString()} />
    }
    
    const addExercise = async (startAfterSave) => {
        setCreateExsModalVisible(false);
        
        // insert exs in db with associated workout ID
        console.log(currentMachine);
        await api.createExercise(currentWorkout.ID,currentMachine.ID,newExsGoTime,newExsRestTime)

        // refresh this workout
        props.refreshData();
    }

    const handlePickMachine = () => {
        setCreateExsModalVisible(false);
        setCamperaOpen(true);
    }

    const handleBarcodeScanned = async data => {
        // callback from CameraView, data = QRCode scanned
        setCreateExsModalVisible(false);
        setScannedQRCode(data); // async with no callback WHY

        let machine;
        await api.getMachineFromQRCode(data)
        .then(
            (m) => {
                if (m) {
                    machine = m;
                    setCurrentMachine(machine);
                    setCreateExsModalVisible(true);
                    return;
                };
                Alert.alert("No Matches",
                `Create machine from QR code: ${data}?`,
                [
                    {text: "Create...", onPress: () => {setAddMachineOpen(true)}},
                    {text: "Cancel", onPress: () => {setScannedQRCode(null); setCreateExsModalVisible(true);}, style: 'cancel'},
                ]);

            }, 
            (err) => {
                Alert.alert(`There was an error fetching the machine from the QRCode: ${err}`)
            }
        );
    }

    const handleAfterSaveOrCancel = async machineID => {
        if (machineID > 0) {
            setCurrentMachine(await api.getMachineById(machineID));
        };
        setAddMachineOpen(false);
        setCreateExsModalVisible(true);
    }

    if (cameraOpen) {
        return <CameraView closeCameraView={() => {setCamperaOpen(false); setCreateExsModalVisible(true);}} barcodeScanned={handleBarcodeScanned}/>
    }

    if (addMachineOpen) {
        return <AddMachine QRCode={scannedQRCode} afterSaveOrCancel={handleAfterSaveOrCancel}  />
    }

    return (
        <View style={styles.container}>
        <GenericHeader tabHeader={currentWorkout ? `Started ${new Date(currentWorkout.Started).toLocaleString()}` : "No Current Workout"} />
        <View >
                {
                currentWorkout === null
                ? (
                    <TouchableOpacity onPress={handleCreateNewWorkout} style={styles.createNewWorkoutButton}>
                        <Text style={{fontSize: 20}}>Start New Workout</Text>
                    </TouchableOpacity> 
                )
                :
                (
                    <View>
                        <FlatList
                            data={ currentWorkout.exercises }
                            renderItem={( {item} ) =>  renderItem(item)}
                            keyExtractor={item => item.ID.toString()}
                            ListHeaderComponent={() => <CurrentWorkoutHeader addExercise={ () => setCreateExsModalVisible(true)} />}
                            stickyHeaderIndices={[0]}
                        />
                        
                        <Modal animationType="slide" transparent={true} onRequestClose={() => setCreateExsModalVisible(false)} visible={createExsModalVisible}>
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                <TouchableOpacity onPress={handlePickMachine} style={{padding: 10, borderRadius: 10, backgroundColor: "orange", alignItems: "center"}}><Text>Choose Machine</Text></TouchableOpacity>
                                {currentMachine ? <Text>Currently Selected: {currentMachine.Name}</Text> : null}
                                <Text style={styles.inputLabel}>Go Time:</Text>
                                <TextInput style={styles.input} keyboardType='numeric' onChangeText={txt => setNewExsGoTime(txt)} value={newExsGoTime} />
                                <Text style={styles.inputLabel}>Rest Time:</Text>
                                <TextInput style={styles.input} keyboardType='numeric' onChangeText={txt => setNewExsRestTime(txt)} value={newExsRestTime} />
                                
                                <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
                                    <TouchableHighlight
                                        style={{ ...styles.saveButton, backgroundColor: "lightgreen" }}
                                        disabled={ newExsGoTime < 1 || newExsRestTime < 1 || currentMachine === null }
                                        onPress={() => {
                                            addExercise(true)
                                        }}
                                        >
                                        <Text style={styles.textStyle}>Save and Start</Text>
                                    </TouchableHighlight>
                                    <TouchableHighlight
                                        style={{ ...styles.saveButton, backgroundColor: "lightgreen" }}
                                        disabled={newExsGoTime < 1 || newExsRestTime < 1 || currentMachine === null}
                                        onPress={() => {
                                            addExercise(false)
                                        }}
                                        >
                                        <Text style={styles.textStyle}>Save without Starting</Text>
                                    </TouchableHighlight>
                                </View>
                                <View style={{width: "100%", flexDirection: 'row'}}>
                                    <TouchableHighlight
                                        style={{ padding: 5, flex: 1, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginTop: 5, alignItems: 'center', elevation: 2, backgroundColor: 'pink' }}
                                        onPress={() => {
                                            setCreateExsModalVisible(false);
                                        }}
                                        >
                                        <Text>Cancel</Text>
                                    </TouchableHighlight>
                                </View>
                                </View>
                            </View>
                        </Modal>

                        
                    </View>
                    //<Text>Current workout started on {currentWorkout.Started}</Text>
                )
                }
            
            
            </View>
            </View>
        )
}

const styles = StyleSheet.create( {
    saveButton: {
        backgroundColor: "#F194FF",
        flex: 2,
        padding: 5,
        marginLeft: 5,
        marginRight: 5,
        borderRadius: 10,
        elevation: 2,
        alignItems: 'center'
      },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        margin: 25,
        backgroundColor: "white",
        borderRadius: 20,
        paddingTop: 10,
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
        backgroundColor: '#fff',
    },
    createNewWorkoutButton: {
        backgroundColor: 'lightgray',
        borderColor: "black",
        borderRadius: 10,
        padding: 10,
    },
    inputLabel: {
        fontWeight: 'bold',
        marginTop: 10
    },
    input: {
        width: 40,
        borderColor: 'black',
        borderWidth: 1,
        height: 30,
        fontSize: 20,
        textAlign: 'center'
    }
})