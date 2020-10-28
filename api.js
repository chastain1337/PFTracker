import * as SQLite from 'expo-sqlite'

function getWorkouts() {
    const db = SQLite.openDatabase('PFTracker');
    return new Promise( (resolve,reject) => {
        db.transaction( tx => {
          tx.executeSql(`select * from Workouts`,[],
          (_,resultSet) => {
            resolve([...resultSet.rows._array]);
          },
          (_,err) => {
            console.error(`A databse error occured while refreshing workouts. ${err}`);
            reject();
          })
        })
      }); 
}

function createWorkout() {
    const db = SQLite.openDatabase('PFTracker');
    
    return new Promise( (resolve,reject) => {db.transaction( tx => {
        tx.executeSql(`insert into Workouts (Started) values (?)`,
        [new Date().toISOString()],
        (_,res) => {
            resolve( res.insertId ) ;
        },
        (tx, err) => {console.error(`Could not create new workout. ${err}`); reject();}
    )})});
}

function getExercises(workoutID = null) {
    const db = SQLite.openDatabase('PFTracker');
    return new Promise( (resolve, reject) => {
        db.transaction( tx => {
            tx.executeSql(
                (workoutID ? `select * from Exercises where WorkoutID = ${workoutID}`: `select * from Exercises`),
                [],
                (tx, results) => (resolve([...results.rows._array])),
                (tx,error) => reject(error)
            );
        })
    })
}

function createExercise(workoutID, machineID, goTime, restTime) {
    const db = SQLite.openDatabase('PFTracker');
    return new Promise( (resolve, reject) => {
        db.transaction(
            tx => {
                tx.executeSql(
                    `insert into Exercises (WorkoutID,MachineID, GoTime, RestTime,DateAdded) values (?,?,?,?,?)`,
                    [workoutID,machineID,goTime,restTime,new Date().toISOString()],
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
                    resolve([...res.rows._array]);
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

async function seedDB() {
    return await new Promise( async (resolve, reject) => {
        await runSQLAsync(  `create table if not exists Machines (ID integer primary key not null, Name text not null, QRCode text not null, DateAdded text not null, DateModified text);
                        create table if not exists Workouts (ID integer primary key not null, Started text not null, Ended text);
                        `).catch( err => console.error(`Error creating first two tables: ${err}`));
        await runSQLAsync(`create table if not exists Exercises (ID integer primary key not null, WorkoutID integer not null, MachineID integer not null, GoTime integer, RestTime integer, DateAdded text not null, DateModified text, FOREIGN KEY(MachineID) REFERENCES Machines(ID), FOREIGN KEY(WorkoutID) REFERENCES Workouts(ID));`).catch( err => console.error(`Error creating exercises table: ${err}`));
        await runSQLAsync(`create table if not exists Sets (ID integer primary key not null, ExerciseID not null, Reps integer, Weight integer, foreign key(ExerciseID) references Exercises(ID));`).catch( err => console.error(`Error creating Sets table: ${err}`));
        const machines = await getMachines().catch( err => {console.error(`Error getting machines: ${err}`)});
        if (machines.length === 0) {
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
    getMachineById
}