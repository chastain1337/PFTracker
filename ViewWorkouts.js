import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList } from "react-native";
import api from "./api";
import {  PieChart } from 'react-native-chart-kit'
import moment, { duration } from "moment"
import { Entypo,MaterialCommunityIcons } from '@expo/vector-icons'; 

/**
 *
 * @param {{workouts: Array, machines: Array}} props
 */
export default function Workouts(props) {
  const [fullWorkouts, setFullWorkouts] = useState([]);
  const [setupComplete, setSetupComplete] = useState(false);
  const [viewDetails, setViewDetails] = useState([])

  useEffect(() => {
    async function setUpFullWorkouts() {
      const fullWorkouts = await  api.workouts.getFull(props.workouts);
      setFullWorkouts(fullWorkouts);
      setSetupComplete(true);
    }

    setUpFullWorkouts();
  }, [props.workouts]);

  // Will never reference outside array because no more than 30 exercises allowed in Workout
  const colors = ["#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#7FDBFF", "#B10DC9", "#FFDC00", "#001f3f", "#39CCCC", "#01FF70", "#85144b", "#F012BE", "#3D9970", "#111111", "#AAAAAA","#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#7FDBFF", "#B10DC9", "#FFDC00", "#001f3f", "#39CCCC", "#01FF70", "#85144b", "#F012BE", "#3D9970", "#111111", "#AAAAAA"]

  const handleViewDetailsPress = (index) => {
    const viewDetailsCopy = [...viewDetails]

    if (viewDetailsCopy[index] === index) {
      // remove it
      delete viewDetailsCopy[index]
    } else {
      // add it
      viewDetailsCopy[index] = index
    }
    setViewDetails(viewDetailsCopy);
  }

  const renderItem = (item, index) => {
    // Pie chart of exercises, slice size = weight lifted per exs
    const chartConfig = {
      color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    }
    
    
    
    const wh = 100
    
    const pieChartData = item.Exercises.map( (e,i) => {
      const val = e.Sets.reduce( (a,s) => {return a + (s.Weight * s.Reps)},0)
      return {value: val, color: colors[i]}
    });

    const started = moment(item.Started).format('dddd M/D, h:mm A')
    const length = moment.duration(moment(item.Ended).diff(moment(item.Started)))
    return (
      <View>
        <View style={{flexDirection: "row", backgroundColor: "lightblue", borderRadius: 10, marginHorizontal: 20, marginTop: 20, padding: 5}}>
          <PieChart
            data={pieChartData}
            height={wh}
            width={wh}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft={20}
            hasLegend={false}
          />
          <View style={{flex: 1}}>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>{started}</Text>
            <Text>{`${length.hours() > 0 ? `${length.hours()} hour, ` : ""}${length.minutes()} minute workout`}</Text>
            <View style={{ flex: 1, justifyContent: 'flex-end'}}>
              <TouchableOpacity style={{flexDirection: "row", alignSelf: "flex-end", padding: 5}} onPress={() => handleViewDetailsPress(index)}>
                <Text style={{fontSize:  16, color: "black"}}>See Details</Text>
                {viewDetails[index] === index ? <Entypo name="triangle-up" size={24} color="black" /> : <Entypo style={{alignSelf: "center"}} name="triangle-down" size={24} color="black" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {viewDetails[index] === index ?
        renderDetails(item)
        : null}
      </View>
    )
  }

  const renderDetails = (workout,workoutIndex) => {
    return (
    
    <View style={{backgroundColor: "white", marginHorizontal: 30, padding: 10, borderBottomLeftRadius: 10, borderBottomRightRadius: 10}}>
      <FlatList 
        data={workout.Exercises}
        renderItem={ ( {item, index} ) =>  renderExercises(item,index) } 
        keyExtractor={item => item.ID.toString()} 
        numColumns={2}
        horizontal={false}
        style={{flex: 1, alignItems: "center"}}
        />
    </View>
    
    )
  }

  const renderExercises = (exercise, exerciseIndex) => {
    const sets = exercise.Sets.map( s => {
      return (
        <View style={{flexDirection: "row", justifyContent: "center"}} key={s.ID.toString()}>
          
          <View style={{flex: 1, flexDirection: "row", justifyContent: "center"}}>
          <Text style={{alignSelf: "center"}} >{s.Reps}</Text>
          <MaterialCommunityIcons name="repeat" size={24} color="black" />
          </View>

          <View style={{flex: 1, flexDirection: "row", justifyContent: "center"}}>
          <Text style={{alignSelf: "center"}}>{s.Weight}</Text>
          <MaterialCommunityIcons name="weight-pound" size={24} color="black" />
          </View>

        </View>
      )
    })

    return (
      <View style={{borderColor: colors[exerciseIndex], borderWidth: 3, borderRadius: 10, marginBottom: 10, padding: 10, maxWidth: 200, minWidth: 150, marginHorizontal: 10,}}>
        <Text style={{fontSize: 16, fontWeight: "bold", textAlign: "center",}}>{props.machines.find(m => m.ID === exercise.MachineID).Name}</Text>
        {sets}
      </View>
    )
  }



  if (fullWorkouts.length === 0) {
    if (setupComplete) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ fontSize: 16, color: "gray", fontWeight: "bold" }}>
            No workouts yet.
          </Text>
          <Text>Start a new workout from the previous tab.</Text>
        </View>
      );
    } else {
      return (
        <View style={{flex: 1,justifyContent: "center",alignContent: "center",alignItems: "center",}}>
          <ActivityIndicator size="large" />
          <Text>Getting workouts...</Text>
        </View>
      );
    }
  }

  // const totalWeightForWorkout = fullWorkouts.reduce( (a1,w) => {
  //   return a1 + w.Exercises.reduce( (a2,e) => {
  //     return a2 + (e.Sets.reduce( (a3,s) => {
  //       return a3 + (s.Weight * s.Reps)
  //     },0))
  //   },0);
  // },0)

  return (
    <View>
        <FlatList 
          data={fullWorkouts}
          renderItem={ ( {item, index} ) =>  renderItem(item,index) } 
          keyExtractor={item => item.ID.toString()} 
          ListFooterComponent={() => <View style={{paddingBottom: 400}}></View>}/>
        </View>
        
  )
}
