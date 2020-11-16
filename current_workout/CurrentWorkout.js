import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, FlatList, Modal, TextInput, TouchableHighlight, Alert, Keyboard,TouchableWithoutFeedback, Platform} from 'react-native'
import GenericHeader from './../GenericHeader';
import CurrentWorkoutHeader from './CurrentWorkoutHeader';
import { Ionicons } from '@expo/vector-icons'; 
import api from './../api'
import ExerciseCard from './ExerciseCard';
import CameraView from '../CameraView';
import AddMachine from '../machines/AddMachine';
import CurrentWorkoutStats from './CurrentWorkoutStats';
import Models from "../models"
import ViewMachines from '../machines/ViewMachines';
import { Picker } from '@react-native-picker/picker';
import moment from "moment";

/**
 * 
 * @param {{workouts: array[{}], machines: array[{}], refreshWorkouts: function}} props 
 */
export default function CurrentWorkout(props) {
    const [currentWorkout, setCurrentWorkout] = useState(null);
    const [createExsModalVisible,setCreateExsModalVisible] = useState(false);
    const [currentMachine, setCurrentMachine] = useState(null);
    const [newExsGoTime, setNewExsGoTime] = useState("60");
    const [newExsRestTime, setNewExsRestTime] = useState("30");
    const [cameraOpen, setCamperaOpen] = useState(false)
    const [addMachineOpen, setAddMachineOpen] = useState(false)
    const [scannedQRCode, setScannedQRCode] = useState(null)
    const [pickMachineList, setPickMachineList] = useState(false);
    const [routines,setRoutines] = useState([])
    const [selectedRoutineValue,setSelectedRoutineValue] = useState('');
    const [intensityIncrease, setIntensityIncrease] = useState(0);

    useEffect( () => {
        console.log("moutned currentworkout")
        const unfinishedWorkout = props.workouts.find(w => !w.Ended);
        
        if (props.workouts.length > 0 && unfinishedWorkout ) {
            console.log("unfinished workout found, building")
            buildWorkout(unfinishedWorkout)
        } else {
            console.log("no unfinished workout found")
            setupNoCurrentWorkout();
            setCurrentWorkout(null);
        }

    },[props.workouts]);

    const setupNoCurrentWorkout = async () => {
        setRoutines(await api.routines.getFull())
        
    }

    const buildWorkout = async (workout) => {
        setCurrentWorkout(await api.workouts.getFull(workout));
    }

    const endWorkout = () => {
        const buttons = [
            {text: "Yes, End", onPress: () => endWorkoutConfirmed()},
            {text: "Cancel",style: 'cancel'}
        ]
        return Alert.alert("End Workout?","You will not be able to modify this workout once ended.",buttons)
    }

    const endWorkoutConfirmed = async () => {
        await api.workouts.update({ID: currentWorkout.ID, Started: currentWorkout.Started, Ended: new Date().toISOString()})
        .catch(e => Alert.alert("Error",e))
        props.refreshWorkouts();
    }

    const handleCreateNewWorkout = async () => {
        let workoutID
        if (selectedRoutineValue != '') {
            workoutID = await api.workouts.createFromRoutine(selectedRoutineValue);
        } else {
            workoutID = await api.workouts.create(new Date().toISOString())
        }

        const workoutObject = await api.workouts.getBy.id(workoutID);

        buildWorkout(workoutObject);
    }

    const renderItem = (item,index) => {
        const machine = props.machines.find( m => m.ID === item.MachineID)
        return <ExerciseCard 
            key={item.ID.toString()} 
            machine={machine} 
            exercise={{...item}} 
            addSet={addSet} 
            modifySet={modifySet} 
            exerciseIndex={index}
            deleteExercise={deleteExercise}
            deleteSet={deleteSet}/>
    }
    
    const addExercise = async (startAfterSave) => {
        setCreateExsModalVisible(false);
        
        // new exercise object
        const newExercise = new Models.Exercise(0,currentWorkout.ID,currentMachine.ID,newExsGoTime,newExsRestTime,[])
        
        // insert exs in db with associated workout ID
        newExercise.ID = await api.exercises.create("WORKOUT",newExercise.WorkoutID,newExercise.MachineID,newExercise.GoTime,newExercise.RestTime)

        // add local version to avoid rebuilding current workout every single time
        const currentWorkoutCopy = {...currentWorkout}
        const newExercises = [...currentWorkoutCopy.Exercises, newExercise]
        currentWorkoutCopy.Exercises = newExercises;
        setCurrentWorkout(currentWorkoutCopy)

        // ID, ExerciseID, Reps, Weight
    }

    const addSet = async (exerciseID) => {
        const exerciseIndex = currentWorkout.Exercises.findIndex( e => e.ID === exerciseID);
        const newSet = new Models.Set(0,exerciseID,"","")
        newSet.ID = await api.sets.create(exerciseID,0,0)

        // weight and reps are blank for loca and 0 for db (blank for local so that we can see placeholder)
        
        // Add local version
        const currentWorkoutCopy = {...currentWorkout}
        const newSets = [...currentWorkoutCopy.Exercises[exerciseIndex].Sets, newSet]
        currentWorkoutCopy.Exercises[exerciseIndex].Sets = newSets
        setCurrentWorkout(currentWorkoutCopy);
    }

    const modifySet = async (newSet, exerciseIndex, setIndex) => {
        // update the set in DB, can be async
        api.sets.update(newSet).catch(e => Alert.alert(e))

        // Update the set locally        
        const currentWorkoutCopy = {...currentWorkout}
        currentWorkoutCopy.Exercises[exerciseIndex].Sets[setIndex] = newSet
        setCurrentWorkout(currentWorkoutCopy);
    }

    const handlePickMachineCamera = () => {
        setCreateExsModalVisible(false);
        setCamperaOpen(true);
    }

    const handleBarcodeScanned = async data => {
        // callback from CameraView, data = QRCode scanned
        setCreateExsModalVisible(false);
        setScannedQRCode(data); // async with no callback WHY

        let machine;
        await api.machines.getBy.qr(data)
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
            setCurrentMachine(await api.machines.getBy.id(machineID));
        };
        setAddMachineOpen(false);
        setCreateExsModalVisible(true);
    }

    const deleteExercise = exsIndex => {
        const buttons = [
            {text: "Yes, Delete",style: 'destructive', onPress: () => deleteExerciseConfirmed(exsIndex)},
            {text: "Cancel",style: 'cancel'}
        ]
        return Alert.alert("Delete Exercise?","This will delete all sets. It cannot be undone.",buttons)
    }

    const deleteExerciseConfirmed = async (exerciseIndex) => {
        api.exercises.delete(currentWorkout.Exercises[exerciseIndex].ID)

        // update local state
        const workoutCopy = {...currentWorkout}
        const newExs = [...workoutCopy.Exercises]
        newExs.splice(exerciseIndex,1);
        workoutCopy.Exercises = newExs
        setCurrentWorkout(workoutCopy);
    }

    const deleteSet = async (exerciseIndex, setIndex) => {
        api.sets.delete(currentWorkout.Exercises[exerciseIndex].Sets[setIndex].ID)

        // update local state
        const workoutCopy = {...currentWorkout}
        const setsCopy = [...currentWorkout.Exercises[exerciseIndex].Sets]
        setsCopy.splice(setIndex,1);
        workoutCopy.Exercises[exerciseIndex].Sets = setsCopy
        setCurrentWorkout(workoutCopy);
    }

    const handleAddExerciseClick = () => {
        if (currentWorkout.Exercises.length === 30) return Alert.alert("Error","Cannot add more than 30 exercises to a Workout.")
        setCreateExsModalVisible(true);
    }


    if (cameraOpen) {
        return <CameraView closeCameraView={() => {setCamperaOpen(false); setCreateExsModalVisible(true);}} barcodeScanned={handleBarcodeScanned}/>
    }

    if (addMachineOpen) {
        return <AddMachine QRCode={scannedQRCode} afterSaveOrCancel={handleAfterSaveOrCancel}  />
    }

    if (pickMachineList) {
        return <ViewMachines onPickMachine={(machine) => {setCurrentMachine(machine); setPickMachineList(false);}} onReturn={() => setPickMachineList(false)} />
    }

    if (currentWorkout === null) {
        setupNoCurrentWorkout(); // refresh routines
        const pickerItems = [<Picker.Item key={'picker_placeholder'} label='Optional routine...' value=''/>, routines.map( r => <Picker.Item key={r.ID.toString()} label={r.Name} value={r.ID} />)]
        return (
            <View style={{flex: 1,alignItems: "center", justifyContent: "center", alignContent: "center"}}>
                <Text style={{color: "gray",fontSize: 20}}>No current workout.</Text>
                
                <View style={{padding: 10, borderRadius: 10, marginTop: 30, borderColor: "lightgray", borderWidth: 1}}>
                <Picker 
                        mode='dialog'
                        prompt='Routines'
                        selectedValue={selectedRoutineValue} 
                        onValueChange={(itemValue) => setSelectedRoutineValue(itemValue)} 
                        style={{width: 300, borderRadius: 20, borderColor: "lightgray", borderWidth: 1}}>
                        {pickerItems}
                    </Picker>
                <TouchableOpacity onPress={handleCreateNewWorkout} style={styles.createNewWorkoutButton}>
                        <Text style={{fontSize: 16}}>Start New Workout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <GenericHeader tabHeader={`Started ${moment(currentWorkout.Started).format('MM/DD/YY, h:mm:ss A')}`} />
                
                <FlatList
                    data={ currentWorkout.Exercises }
                    renderItem={( {item, index} ) =>  renderItem(item,index)}
                    keyExtractor={item => item.ID.toString()}
                    ListHeaderComponent={<CurrentWorkoutHeader addExercise={handleAddExerciseClick} endWorkout={endWorkout} intensityIncrease={intensityIncrease} setIntensityIncrease={setIntensityIncrease}/>}
                    ListFooterComponent={() => <CurrentWorkoutStats workout={currentWorkout}/>}
                    stickyHeaderIndices={[0]}
                />
            
            
        
                <Modal animationType="slide" transparent={true} onRequestClose={() => setCreateExsModalVisible(false)} visible={createExsModalVisible}>
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                    <Text style={{fontWeight: 'bold'}}>Choose Machine:</Text>
                                    
                                    <View style={{flexDirection: "row", marginTop: 10, width: '50%'}}>
                                        <TouchableOpacity onPress={handlePickMachineCamera} style={styles.pickMachineButton}>
                                            <Ionicons name="ios-camera" size={24} color="black" />
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => setPickMachineList(true)} style={styles.pickMachineButton}>
                                        <Ionicons name="ios-list" size={24} color="black" />
                                        </TouchableOpacity>
                                    </View>
                                    {currentMachine ? <Text>Currently Selected: {currentMachine.Name}</Text> : null}
                                    
                                    <View style={{flexDirection: "row", marginTop: 10, width: '70%'}}>
                                        <Text style={{flex: 1, textAlign: "center"}}>
                                            Go Time:
                                        </Text>

                                        <Text style={{flex: 1, textAlign: "center"}}>
                                            Rest Time:
                                        </Text>
                                    </View>
                                    <View style={{flexDirection: "row", width: '70%'}}>
                                        <TextInput selectTextOnFocus style={styles.input} keyboardType='number-pad' onChangeText={txt => setNewExsGoTime(txt.replace(/,+|\.+/g,""))} value={newExsGoTime} />
                                        <TextInput selectTextOnFocus style={styles.input} keyboardType='number-pad' onChangeText={txt => setNewExsRestTime(txt.replace(/,+|\.+/g,""))} value={newExsRestTime} />
                                    </View>
                                                            
                                    <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
                                        <TouchableOpacity
                                            style={{ ...styles.saveButton, backgroundColor: "lightgreen" }}
                                            disabled={ newExsGoTime < 1 || newExsRestTime < 1 || currentMachine === null }
                                            onPress={() => {
                                                addExercise(true)
                                            }}
                                            >
                                            <Text style={styles.textStyle}>Save and Start</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ ...styles.saveButton, backgroundColor: "lightgreen" }}
                                            disabled={newExsGoTime < 1 || newExsRestTime < 1 || currentMachine === null}
                                            onPress={() => {
                                                addExercise(false)
                                            }}
                                            >
                                            <Text style={styles.textStyle}>Save without Starting</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <View style={{width: "100%", flexDirection: 'row'}}>
                                        <TouchableOpacity
                                            style={{ paddingVertical: 10, paddingHorizontal: 5, flex: 1, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginTop: 5, alignItems: 'center', elevation: 2, backgroundColor: 'pink' }}
                                            onPress={() => {
                                                setCreateExsModalVisible(false);
                                            }}
                                            >
                                            <Text>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            
        </View>
        )
}

const styles = StyleSheet.create( {
    saveButton: {
        backgroundColor: "#F194FF",
        flex: 2,
        paddingHorizontal: 5,
        paddingVertical: 15,
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
        margin: 10,
        elevation: 2
    },
    inputLabel: {
        fontWeight: 'bold',
        marginTop: 10
    },
    input: {
        flex: 1,
        justifyContent: "center",
        width: 40,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        fontSize: 20,
        textAlign: 'center',
        marginHorizontal: 15
    },
    pickMachineButton:  {flex: 1, padding: 10, borderRadius: 10, backgroundColor: "lightgray", alignItems: "center", marginHorizontal: 10}
})