const allSets =  [{
      "DateCreated": "2020-11-06T20:00:43.656Z",
      "ExerciseID": 3,
      "Reps": 40,
      "Weight": 40,
    },
     {
      "DateCreated": "2020-11-06T20:00:45.823Z",
      "ExerciseID": 3,
      "Reps": 30,
      "Weight": 30,
    },
     {
      "DateCreated": "2020-11-06T20:00:46.557Z",
      "ExerciseID": 3,
      "Reps": 20,
      "Weight": 20,
    },
     {
      "DateCreated": "2020-11-06T20:00:47.825Z",
      "ExerciseID": 3,
      "Reps": 10,
      "Weight": 10,
    },
     {
      "DateCreated": "2020-11-06T20:00:48.463Z",
      "ExerciseID": 3,
      "Reps": 5,
      "Weight": 5,
    },
     {
      "DateCreated": "2020-11-06T19:23:10.642Z",
      "ExerciseID": 2,
      "Reps": 20,
      "Weight": 20,
    },
     {
      "DateCreated": "2020-11-06T19:23:10.649Z",
      "ExerciseID": 2,
      "Reps": 10,
      "Weight": 10,
    },
     {
      "DateCreated": "2020-11-06T19:23:10.663Z",
      "ExerciseID": 2,
      "Reps": 5,
      "Weight": 5,
    }]

    let currentExerciseID, setNumberForThisExercise
    let setHistory = []

    allSets.forEach( set => {
        if (set.ExerciseID != currentExerciseID) {
            // if ids don't match, we know it is the first set
            setNumberForThisExercise = 0
            currentExerciseID = set.ExerciseID
        } else {
            // if they do match, it is the next set for this exercise
            setNumberForThisExercise++
        }

        if (setHistory[setNumberForThisExercise]) return // we already have a more recent 1st set, 2nd set, etc...
        setHistory[setNumberForThisExercise] = {...set}
    })

console.log(setHistory)