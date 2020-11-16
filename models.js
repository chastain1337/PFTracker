class Workout {
    /**
     * 
     * @param {Number} _ID 
     * @param {Date.toISOString} _Started 
     * @param {Date.toISOString} _Ended 
     */
    constructor(_ID,_Started,_Ended) {
        this.ID = _ID
        this.Started = _Started
        this.Ended = _Ended
    }
}

class Exercise {
    /**
     * 
     * @param {Number} _ID 
     * @param {Number} _WorkoutID 
     * @param {Number} _MachineID 
     * @param {Number} _GoTime 
     * @param {Number} _RestTime 
     * @param {Array? = []} _Sets 
     */
    constructor(_ID, _WorkoutID,_MachineID,_GoTime,_RestTime,_Sets=[]){
        this.ID = _ID
        this.WorkoutID = _WorkoutID
        this.MachineID = _MachineID
        this.GoTime = _GoTime
        this.RestTime = _RestTime
        this.Sets = _Sets
    }
}

class Set {
    /**
     * 
     * @param {Number} _ExerciseID 
     * @param {Number} _Weight 
     * @param {Number} _Reps 
     */
    constructor(_ID,_ExerciseID,_Weight,_Reps) {
        this.ID = _ID
        this.ExerciseID = _ExerciseID
        this.Weight = _Weight
        this.Reps = _Reps
    }
}

let Models = {}

export default Models = {
    Workout,
    Exercise,
    Set
}