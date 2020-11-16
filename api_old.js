import * as SQLite from 'expo-sqlite'

function getWorkouts() {
    const db = SQLite.openDatabase('PFTracker');
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
    const db = SQLite.openDatabase('PFTracker');
    
    return new Promise( (resolve,reject) => {db.transaction( tx => {
        tx.executeSql(`update Machines set Name = ?, QRCode = ? where ID = ?`,
        [machine.Name,machine.QRCode,machine.ID],
        (_,res) => {
            resolve() ;
        },
        (tx, err) => reject(`There was an error updating Machine ID ${machine.ID}: ${err}`)
    )})});
}

function createWorkout(started,ended) {
    const db = SQLite.openDatabase('PFTracker');
    
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
    const db = SQLite.openDatabase('PFTracker');
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
    const db = SQLite.openDatabase('PFTracker');
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
    const db = SQLite.openDatabase('PFTracker');
    const FKColumnName = workoutOrRoutine === "WORKOUT" ? "WorkoutID" : "RoutineID"
    console.log(FKColumnName,associatedID,machineID,goTime,restTime,new Date().toISOString())
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

function getMachineFromQRCode(qrCode) {
    const db = SQLite.openDatabase('PFTracker');
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
    const db = SQLite.openDatabase('PFTracker');
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
    const db = SQLite.openDatabase('PFTracker');
    return new Promise( (resolve, rej) => {
        db.transaction(
            tx => {
                tx.executeSql(`select * from Machines`,
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

function addMachine(QRCode, Name) {
    const db = SQLite.openDatabase('PFTracker');
    return new Promise( async (resolve, reject) => {
        const machineExists = await getMachineFromQRCode(QRCode);
        if (machineExists) reject(`Machine already exists: ${machineExists.Name}, ID: ${machineExists.ID}`);
        db.transaction( tx => {
            tx.executeSql(`insert into Machines (QRCode, Name, DateAdded) values (?, ?, ?)`
            ,[QRCode, Name, new Date().toISOString()]
            , (tx, response) => {resolve(response.insertId);}
            , (tx, error) => reject(error)
            );
        });
    });
       
    
}

function evaluateSql(sql) {
    //you'll only mess up  your own db
    const db = SQLite.openDatabase('PFTracker');
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
    const db = SQLite.openDatabase('PFTracker');
    return new Promise( (resolve, reject) => {
        db.transaction( tx => {
            tx.executeSql(sql,args,(tx,results) => resolve(results),(tx,error) => reject(error));
        })
    } )
}

function createSet(exerciseID,reps,weight) {
    const db = SQLite.openDatabase('PFTracker');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(`insert into Sets (ExerciseID, Reps, Weight) values (?,?,?)`,
                [exerciseID,reps,weight],
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
    const db = SQLite.openDatabase('PFTracker');
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
    const db = SQLite.openDatabase('PFTracker');
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

function updateSet(newSet) {
    const db = SQLite.openDatabase('PFTracker');
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
    const db = SQLite.openDatabase('PFTracker');
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
    const db = SQLite.openDatabase('PFTracker');
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

async function resetDB() {
    return await new Promise( async (resolve, reject) => {
        await runSQLAsync(`drop table if exists Sets;`).catch(err => console.error(err))
        await runSQLAsync("drop table if exists Exercises;").catch(err => console.error(err))
        await runSQLAsync("drop table if exists Machines;").catch(err => console.error(err))
        await runSQLAsync("drop table if exists Routines;").catch(err => console.error(err))
        await runSQLAsync("drop table if exists Workouts").catch(err => console.error(err))
        resolve();

    })
}

async function seedDB() {
    return await new Promise( async (resolve, reject) => {
        await runSQLAsync(`create table if not exists Machines (ID integer primary key not null, Name text not null, QRCode text not null, DateAdded text not null, DateModified text);`).catch( err => console.error(`Error creating machines table.`,err));
        await runSQLAsync("create table if not exists Workouts (ID integer primary key not null, Started text not null, Ended text);").catch( err => console.error(`Error creating Workouts`,err));
        await runSQLAsync(`create table if not exists Routines (ID integer primary key not null, Name text not null, DateCreated text not null, DateModified text);`).catch( err => console.error(`Error creating Sets table`,err));
        await runSQLAsync(`create table if not exists Exercises (ID integer primary key not null, WorkoutID integer, RoutineID integer, MachineID integer not null, GoTime integer, RestTime integer, DateAdded text not null, DateModified text, FOREIGN KEY(MachineID) REFERENCES Machines(ID) ON DELETE CASCADE, FOREIGN KEY(WorkoutID) REFERENCES Workouts(ID) ON DELETE CASCADE, FOREIGN KEY(RoutineID) REFERENCES Routines(ID) ON DELETE CASCADE);`).catch( err => console.error(`Error creating exercises table:`,err));
        await runSQLAsync(`create table if not exists Sets (ID integer primary key not null, ExerciseID not null, Reps integer, Weight integer, foreign key(ExerciseID) references Exercises(ID) ON DELETE CASCADE);`).catch( err => console.error(`Error creating Sets table:`,err));
        const machines = await getMachines().catch( err => {console.error(`Error getting machines:`,err)});
        if (machines.length !== 5) {
            await runSQLAsync(`
            insert into Machines (Name, QRCode, DateAdded) values 
            ('Back Grinder','BACKGRINDER',?), 
            ('Ab Ripper','ABRIPPER',?),
            ('Leg Macerator','LEGMACERATOR',?),
            ('Bicep Curler','BICEPCURLER',?),
            ('Chest Destroyer','CHESTDESTROYER',?);`,
            [new Date().toISOString(),new Date().toISOString(),new Date().toISOString(),new Date().toISOString(),new Date().toISOString()])
            .catch( err => console.error(`Error seeding machines: ${err}`));
        }
        resolve();   
    })
    
}

function deleteMachine(id) {
    const db = SQLite.openDatabase('PFTracker');
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
    const db = SQLite.openDatabase('PFTracker');
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
function getFullRoutines(routineIDs) {
    const db = SQLite.openDatabase('PFTracker');
    let routines = []
    return new Promise( async (resolve, reject) => {
        for (routineID of routineIDs) {
            const routine = await getRoutine(routineID);
            const exercises = await getExercisesForRoutine(routineID);
            for (exercise of exercises) {
                exercise.Sets = await getSetsForExercise(exercise.ID);
            }
            routine.Exercises = exercises;
            routines.push(routine);
        }
        resolve(routines);
    });
}

/**
 * 
 * @param {{Name: String, Exercises: [{NumberOfSets: Number, MachineID: Number, RestTime: Number, GoTime: Number}]}} routineObject 
 */
function createRoutine(routineObject) {
    const db = SQLite.openDatabase('PFTracker');
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

let api = {}

export default api = {
    getWorkouts,
    createWorkout,
    createExercise,
    getMachines,
    seedDB,
    evaluateSql,
    getExercises,
    getMachineFromQRCode,
    addMachine,
    getMachineById,
    getSetsForExercise,
    createSet,
    updateSet,
    resetDB,
    deleteExercise,
    deleteSet,
    updateWorkout,
    updateMachine,
    deleteMachine,
    buildWorkouts,
    getRoutine,
    getFullRoutines,
    createRoutine
}