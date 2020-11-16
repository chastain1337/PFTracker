import * as SQLite from 'expo-sqlite'
import * as FileSystem from 'expo-file-system'

function getWorkouts() {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve,reject) => {
        db.transaction( tx => {
          tx.executeSql(`select * from Workouts`,[],
          (_,resultSet) => {
            if (resultSet.rows._array) {resolve(resultSet.rows._array)} else resolve([]);
          },
          (_,err) => {
            console.error(`A databse error occured while refreshing workouts. ${err}`);
            reject();
          })
        })
      }); 
}

function updateMachine(machine) {
    const db = SQLite.openDatabase('PFTracker.db');
    
    return new Promise( (resolve,reject) => {db.transaction( tx => {
        tx.executeSql(`update Machines set Name = ?, QRCode = ?, WeightIncrement = ? where ID = ?`,
        [machine.Name,machine.QRCode,machine.WeightIncrement,machine.ID],
        (_,res) => {
            resolve() ;
        },
        (tx, err) => reject(`There was an error updating Machine ID ${machine.ID}: ${err}`)
    )})});
}

function createWorkout(started,ended) {
    const db = SQLite.openDatabase('PFTracker.db');
    
    return new Promise( (resolve,reject) => {db.transaction( tx => {
        tx.executeSql(`insert into Workouts (Started,Ended) values (?,?)`,
        [started,ended],
        (_,res) => {
            resolve( res.insertId ) ;
        },
        (tx, err) => {console.error(`Could not create new workout. ${err}`); reject();}
    )})});
}

function getExercisesForRoutine(id) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction( tx => {
            tx.executeSql(
                (`select * from Exercises where RoutineID = ?`),
                [id],
                (tx, results) => (resolve(results.rows._array ? results.rows._array : [])),
                (tx,error) => reject(error)
            );
        })
    })
}

function getExercises(workoutID = null) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction( tx => {
            tx.executeSql(
                (workoutID ? `select * from Exercises where WorkoutID = ${workoutID}`: `select * from Exercises where RoutineID = null`),
                [],
                (tx, results) => (resolve([...results.rows._array])),
                (tx,error) => reject(error)
            );
        })
    })
}

/**
 * 
 * @param {Enum} workoutOrRoutine - Enum: "WORKOUT","ROUTINE"
 * @param {Number} associatedID,
 * @param {Number} machineID 
 * @param {Number} goTime 
 * @param {Number} restTime 
 */
function createExercise(workoutOrRoutine, associatedID, machineID, goTime, restTime) {
    const db = SQLite.openDatabase('PFTracker.db');
    const FKColumnName = workoutOrRoutine === "WORKOUT" ? "WorkoutID" : "RoutineID"
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(
                    `insert into Exercises (${FKColumnName},MachineID, GoTime, RestTime,DateAdded) values (?,?,?,?,?)`,
                    [associatedID,machineID,goTime,restTime,new Date().toISOString()],
                    (tx, results) => resolve(results.insertId),
                    (tx, error) => reject(error)
                )
            }
        )
    })
}

/**
 * 
 * @param {Number} exerciseID
 * @param {Enum} workoutOrRoutine - Enum: "WORKOUT","ROUTINE"
 * @param {Number} associatedID
 * @param {Number} machineID 
 * @param {Number} goTime 
 * @param {Number} restTime 
 */
function updateExercise(exerciseID,workoutOrRoutine, associatedID, machineID, goTime, restTime) {
    const db = SQLite.openDatabase('PFTracker.db');
    const FKColumnName = workoutOrRoutine === "WORKOUT" ? "WorkoutID" : "RoutineID"
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(
                    `update Exercises set ${FKColumnName} = ?, MachineID = ?, GoTime = ?, RestTime = ? , DateModified = ? where ID = ?`,
                    [associatedID,machineID,goTime,restTime,new Date().toISOString(),exerciseID],
                    (tx, results) => resolve(),
                    (tx, error) => reject(error)
                )
            }
        )
    })
}

function getMachineFromQRCode(qrCode) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, rej) => {
        db.transaction(
            tx => {
                tx.executeSql(`select * from Machines where QRCode = ?`,
                [qrCode],
                (tx, res) => {
                    if (res.rows._array.length > 0) {
                        resolve(res.rows._array[0]);
                    } else {
                        resolve(null)
                    }
                    
                },
                (tx, err) => {
                    rej(`Error fetching machines: ${err}`);
                });
            }
        )
    })
}
function getMachineById(id) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, rej) => {
        db.transaction(
            tx => {
                tx.executeSql(`select * from Machines where ID = ?`,
                [id],
                (tx, res) => {
                    if (res.rows._array.length > 0) resolve(res.rows._array[0])
                    resolve(null);
                },
                (tx, err) => {
                    rej(`Error fetching machines: ${err}`);
                });
            }
        )
    })
}
function getMachines() {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, rej) => {
        db.transaction(
            tx => {
                tx.executeSql("select * from Machines",
                [],
                (tx, res) => {
                    if (res.rows._array) {resolve(res.rows._array)} else {resolve([])}
                },
                (tx, err) => {
                    console.error(`Error fetching machines: ${err}`);
                    rej();
                });
            }
        )
    })
}

function addMachine(QRCode, Name, WeightIncrement) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( async (resolve, reject) => {
        const machineExists = await getMachineFromQRCode(QRCode);
        if (machineExists) reject(`Machine already exists: ${machineExists.Name}, ID: ${machineExists.ID}`);
        db.transaction( tx => {
            tx.executeSql(`insert into Machines (QRCode, Name, WeightIncrement, DateAdded) values (?, ?, ?, ?)`
            ,[QRCode, Name, WeightIncrement, new Date().toISOString()]
            , (tx, response) => {resolve(response.insertId);}
            , (tx, error) => reject(error)
            );
        });
    });
       
    
}

function evaluateSql(sql) {
    //you'll only mess up  your own db
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (res, rej) => {
        db.transaction( tx => {
            tx.executeSql(sql,[],
                (tx, results) => {
                    res(results);
                },
                (tx, error) => {rej(error);})
        })
    })
}

function runSQLAsync(sql,args = []) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction( tx => {
                tx.executeSql(
                    sql,
                    args,
                    (tx,results) => {
                        console.log("successfully ran:",sql)
                        resolve(results);
                    },
                    (tx,error) => {
                        reject(error)
                    }
                );
            }
        )
    } )
}

function createSet(exerciseID,reps,weight) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`insert into Sets (ExerciseID, Reps, Weight, DateCreated) values (?,?,?,?)`,
                [exerciseID,reps,weight, new Date().toISOString()],
                (tx, res) => {
                    resolve(res.insertId);
                },
                (tx, err) => {
                    reject("Error creating new set for exercise ID " + exerciseID.toString());
                });
            }
        )
    })
}

function getSetsForExercise(exerciseID) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`select * from Sets where ExerciseID = ?`,
                [exerciseID],
                (tx, res) => {
                    resolve(res.rows._array ? [...res.rows._array] : []);
                },
                (tx, err) => {
                    console.error(`Error fetching sets for exercise ${exerciseID}: ${err}`);
                    reject();
                });
            }
        )
    })
}

function deleteExercise(exerciseID) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`delete from Exercises where ID = ?`,
                [exerciseID],
                (tx, res) => {
                    resolve();
                },
                (tx, err) => {
                    reject(`Error deleting Exercise ID ${exerciseID}: ${err}`);
                });
            }
        )
    })
}

/**
 * Delete an all exercises by either their associated WorkoutID or RoutineID
 * @param {String} IDType - ENUM: "WORKOUT","ROUTINE"
 * @param {Number} ID 
 */
function deleteExercisesByAssociatedID(IDType,ID) {
    const db = SQLite.openDatabase('PFTracker.db');
    const FKColumnName = IDType === "WORKOUT" ? "WorkoutID" : "RoutineID"
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`delete from Exercises where ${FKColumnName} = ?`,
                [ID],
                (tx, res) => {
                    resolve();
                },
                (tx, err) => {
                    reject(`Error deleting Exercises associated with ${FKColumnName} ${ID}: ${err}`);
                });
            }
        )
    })
}

/**
 * 
 * @param {{ID: Number, ExerciseID: Number, Reps: Number, Weight: Number}} newSet 
 */
function updateSet(newSet) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`update Sets set Weight = ?, Reps = ?, ExerciseID = ? where ID = ?`,
                [newSet.Weight, newSet.Reps, newSet.ExerciseID, newSet.ID],
                (tx, res) => {
                    resolve();
                },
                (tx, err) => {
                    reject(`Error updating sets for ID ${newSet.ID}: ${err}`);
                });
            }
        )
    })
}

function updateWorkout(workout) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`update Workouts set Started = ?, Ended = ? where ID = ?`,
                [workout.Started, workout.Ended, workout.ID],
                (tx, res) => {
                    resolve();
                },
                (tx, err) => {
                    reject(`Error updating Workout ID ${workout.ID}: ${err}`);
                });
            }
        )
    })
}

function deleteSet(setID) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`delete from Sets where ID = ?`,
                [setID],
                (tx, res) => {
                    resolve();
                },
                (tx, err) => {
                    reject(`Error deleting set ID ${setID}: ${err}`);
                });
            }
        )
    })
}

function getTableNames() {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`select name from sqlite_master`,
                [],
                (tx, res) => {
                    resolve(res.rows._array);
                },
                (tx, err) => {
                    reject(`Error deleting set ID ${setID}: ${err}`);
                });
            }
        )
    })
}

async function validateDB(fullReset = false) {
    return new Promise( async (resolve, reject) => {
        const {uri} = await FileSystem.getInfoAsync(
            `${FileSystem.documentDirectory}SQLite/${"PFTracker.db"}`
          );
        
        
        const tableNames = await getTableNames();

        // if there is no DB file or full reset = true, reset the DB
        if (tableNames.length === 1 || fullReset) {
            if (uri) {await FileSystem.deleteAsync(uri)}
            await enableFKs();    
            await runSQLAsync(`create table if not exists Machines (ID integer primary key not null, Name text not null, QRCode text not null, WeightIncrement integer not null, DateAdded text not null, DateModified text);`).catch( err => console.error(`Error creating machines table.`,err));
            await runSQLAsync("create table if not exists Workouts (ID integer primary key not null, Started text not null, Ended text);").catch( err => console.error(`Error creating Workouts`,err));
            await runSQLAsync(`create table if not exists Routines (ID integer primary key not null, Name text not null, DateCreated text not null, DateModified text);`).catch( err => console.error(`Error creating Sets table`,err));
            await runSQLAsync(`create table if not exists Exercises (ID integer primary key not null, WorkoutID integer, RoutineID integer, MachineID integer not null, GoTime integer, RestTime integer, DateAdded text not null, DateModified text, FOREIGN KEY(MachineID) REFERENCES Machines(ID) ON DELETE CASCADE, FOREIGN KEY(WorkoutID) REFERENCES Workouts(ID) ON DELETE CASCADE, FOREIGN KEY(RoutineID) REFERENCES Routines(ID) ON DELETE CASCADE);`).catch( err => console.error(`Error creating exercises table:`,err));
            await runSQLAsync(`create table if not exists Sets (ID integer primary key not null, ExerciseID integer not null, Reps integer, Weight integer, DateCreated text not null, FOREIGN KEY(ExerciseID) REFERENCES Exercises(ID) ON DELETE CASCADE);`).catch( err => console.error(`Error creating Sets table:`,err));
        }
        resolve();
    });
}

async function enableFKs() {
    return new Promise( (resolve,reject) => {
        const db = SQLite.openDatabase('PFTracker.db');
    db._db.exec(
        [{ sql: 'PRAGMA foreign_keys = ON;', args: [] }],
        false,
        () => {console.log('Foreign keys turned on'); resolve()},
      );
    })
}

function seedDB() {
    // only data no creates
    return new Promise( async (resolve, reject) => {

        const machines = await getMachines();
        if (machines.length !== 5) {
            await runSQLAsync(`
            insert into Machines (Name, QRCode, WeightIncrement, DateAdded) values 
            ('Back Grinder','BACKGRINDER',15,?), 
            ('Ab Ripper','ABRIPPER',5,?),
            ('Leg Macerator','LEGMACERATOR',10,?),
            ('Bicep Curler','BICEPCURLER',15,?),
            ('Chest Destroyer','CHESTDESTROYER',5,?);`,
            [new Date().toISOString(),new Date().toISOString(),new Date().toISOString(),new Date().toISOString(),new Date().toISOString()])
            .catch( err => console.error(`Error seeding machines: ${err}`));
        }
        resolve();   
    })
    
}

function deleteMachine(id) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`delete from Machines where ID = ?`,
                [id],
                (tx, res) => {
                    resolve();
                },
                (tx, err) => {
                    reject(`Error deleting Machine ID ${id}: ${err}`);
                });
            }
        )
    })
}

/**
 * 
 * @param {Array or Object {ID: Number, Started: ISOString, Ended: ISOString}} workoutObjects 
 */
function buildWorkouts(workoutObjects) {
    return new Promise(async (resolve, reject) => {
        let objectFlag = false
        let workouts = workoutObjects;
    
        if (!Array.isArray(workoutObjects)) {
            objectFlag = true;
            workouts = [workoutObjects]
        }
        
        for (let workout of workouts) {
            const exercises = await getExercises(workout.ID);
            for (let exs of exercises) {
                const sets = await getSetsForExercise(exs.ID);
                exs.Sets = sets;
            }
            workout.Exercises = exercises;
        }
        
        if (objectFlag) {
            resolve( workouts[0])
        } else {
            resolve( workouts);
        }
    });
}

function getRoutine(routineID) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`select * from Routines where ID = ?`,
                [routineID],
                (tx, res) => {
                    resolve(res.rows._array && res.rows._array.length > 0 ? res.rows._array[0] : null);
                },
                (tx, err) => {
                    reject(`Error selecting Routine ID ${routineID}: ${err}`);
                });
            }
        )
    })
}

/**
 * 
 * @param {Number[]} routineIDs 
 */
function getFullRoutinesByIds(routineIDs) {
    let routines = []
    return new Promise( async (resolve, reject) => {
        for (let routineID of routineIDs) {
            const routine = await getRoutine(routineID);
            console.log(routine);
            const exercises = await getExercisesForRoutine(routineID);
            for (let exercise of exercises) {
                exercise.Sets = await getSetsForExercise(exercise.ID);
            }
            routine.Exercises = exercises;
            routines.push(routine);
        }
        resolve(routines);
    });
}

function getFullRoutines() {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`select * from Routines`,
                [],
                async (tx, res) => {
                    if (!res.rows._array) resolve([])
                    const routines = res.rows._array
                    for (let routine of routines) {
                        const exercises = await getExercisesForRoutine(routine.ID);
                        for (let exs of exercises) {
                            exs.NumberOfSets = await getSetsForExercise(exs.ID).length
                        }
                        routine.Exercises = exercises
                    }
                    resolve(routines);
                },
                (tx, err) => {
                    reject(`${err}`);
                });
            }
        )
    })
}

/**
 * 
 * @param {{Name: String, Exercises: [{NumberOfSets: Number, MachineID: Number, RestTime: Number, GoTime: Number}]}} routineObject 
 */
function createRoutine(routineObject) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise(  (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`insert into Routines (Name, DateCreated) VALUES (?,?)`,
                [routineObject.Name,new Date().toISOString()],
                async (tx, res) => {
                    const newID = res.insertId
                    console.log("created routine ", newID)
                    for (let exercise of routineObject.Exercises) {
                        console.log("creating exercise ", exercise);
                        const newExsID = await createExercise("ROUTINE",newID,exercise.MachineID,exercise.GoTime,exercise.RestTime);
                        console.log("created exercise ",newExsID);
                        for (let i = 0; i < exercise.NumberOfSets; i++) {
                            createSet(newExsID,0,0);
                        }
                    }                    
                    resolve();
                },
                (tx, err) => {
                    reject(`Error creating routine: ${err}`);
                });
            }
        )
        
    })
}

/**
 * 
 * @param {{ID: Number, Name: String, Exercises: [{ID: Number, NumberOfSets: Number, MachineID: Number, RestTime: Number, GoTime: Number}]}} routineObject 
 */
function updateRoutine(routineObject) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise(  (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`update Routines set Name = ?, DateModified = ? where ID = ?`,
                [routineObject.Name,new Date().toISOString(),routineObject.ID],
                async (tx, res) => {
                    // delete all exercises associated with this routine, will also delete sets associated with those exercises
                    await deleteExercisesByAssociatedID("ROUTINE",routineObject.ID)

                    for (let exercise of routineObject.Exercises) {
                        const newExsID = await createExercise("ROUTINE",routineObject.ID,exercise.MachineID,exercise.GoTime,exercise.RestTime)
                        for (let i = 0; i < exercise.NumberOfSets; i++) {
                            await createSet(newExsID,0,0);
                        }
                    }                  
                    

                    resolve();
                },
                (tx, err) => {
                    reject(`Error updating routine: ${err}`);
                });
            }
        )
        
    })
}

function deleteRoutine(ID) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`delete from Routines where ID = ?`,
                [ID],
                (tx, res) => {
                    resolve();
                },
                (tx, err) => {
                    reject(`Error deleting Routine ID ${ID}: ${err}`);
                });
            }
        )
    })
}

function createWorkoutFromRoutine(routineID) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( async (resolve, reject) => {
        const fullRoutineArray = await getFullRoutinesByIds([routineID]);
        const fullRoutine = fullRoutineArray[0];
        console.log("full routine:",fullRoutine)
        
        // Create workout
        const workoutID = await createWorkout(new Date().toISOString(),null);

        // Create exercises and sets
        for (let exs of fullRoutine.Exercises) {
            const exsID = await createExercise("WORKOUT",workoutID,exs.MachineID,exs.GoTime,exs.RestTime);
            for (let set of exs.Sets) {
                await createSet(exsID,set.Reps,set.Weight);
            }
        }

        resolve(workoutID);
    })
}

function getSetsForMachineID(id) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`
                    select s.Weight, s.Reps, s.DateCreated, e.ID as ExerciseID from Sets s 
                    join Exercises e on e.ID = s.ExerciseID 
                    where e.MachineID = ? and e.WorkoutID not null
                    order by e.DateAdded DESC, s.DateCreated ASC`,
                [id],
                (tx, res) => {
                    if (res.rows._array.length > 0) resolve(res.rows._array)
                    resolve([]);
                },
                (tx, err) => {
                    reject(`Error getting sets for MachineID ${id}: ${err}`);
                });
            }
        )
    })
}

function getWorkoutById(workoutID) {
    const db = SQLite.openDatabase('PFTracker.db');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`select * from Workouts where ID = ?`,
                [workoutID],
                (tx, res) => {
                    if (res.rows._array.length > 0) resolve(res.rows._array[0])
                    resolve(null);
                },
                (tx, err) => {
                    reject(`Error getting Workout ID ${workoutID}: ${err}`);
                });
            }
        )
    })
}

/**
 * Get history for machines such that, "Your last 1st/2nd/3rd set on this machine was __ reps with __ lbs."
 * @param {Number} machineID 
 * @returns {[{DateCreated: Date, ExercideID: Number, Reps: Number, Weight: Number}]} - Index + 1 = set number (1st set, 2nd set, etc...)
 */
function getMachineHistory(machineID) {
    return new Promise( async (resolve, reject) => {
        let setHistory=[] // 0 index = most recent 1st set, 1 index = most recent 2nd set, etc... for this machine
        
        const allSets = await getSetsForMachineID(machineID) // this method depends on how these sets are ordered, by Exercise.CreateDate ASC (new to old) then Set.CreateDate (old to new or 1st set to last set)
        if (allSets.length === 0) resolve( setHistory)
        
        //let setsDividedByNumber = setHistory.map(a=>[]) // 0 index = all 1st sets, 1 index = all 2nd sets, etc.
        let currentExerciseID, setNumberForThisExercise

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
        
        resolve( setHistory)
    })
}

let api = {}

export default api = {
    machines: {
        create: addMachine,
        get: getMachines,
        getHistory: getMachineHistory,
        getBy: {
            id: getMachineById,
            qr: getMachineFromQRCode
        },
        update: updateMachine,
        delete: deleteMachine,
    },
    routines: {
        create: createRoutine,
        getBy: {
            id: getRoutine
        },
        getFullByIds: getFullRoutinesByIds,
        getFull: getFullRoutines,
        update: updateRoutine,
        delete: deleteRoutine
    },
    workouts: {
        create: createWorkout,
        createFromRoutine: createWorkoutFromRoutine,
        get: getWorkouts,
        getFull: buildWorkouts,
        getBy: {
            id: getWorkoutById
        },
        update: updateWorkout
    },
    exercises: {
        create: createExercise,
        get: getExercises,
        getBy: {
            id: getExercises
        },
        update: updateExercise,
        delete: deleteExercise,
        deleteBy: {
            associatedID: deleteExercisesByAssociatedID
        }
    },
    sets: {
        create: createSet,
        getBy: {
            exercise: getSetsForExercise,
            machineID: getSetsForMachineID
        },
        update: updateSet,
        delete: deleteSet,
    },
    seedDB,
    evaluateSql,
    validateDB,
    buildWorkouts,
}