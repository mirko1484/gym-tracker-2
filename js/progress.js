// =======================================
// GYM TRACKER
// PROGRESS PAGE
// VERSIONE PULITA
// =======================================



document.addEventListener(
    "DOMContentLoaded",
    async function(){


        const profile =
            await requireAuth(["customer"]);

        if(!profile){

            return;

        }


        console.log(
            "Progress.js caricato"
        );



        if(typeof getHistory !== "function"){


            console.error(
                "getHistory non disponibile"
            );


            return;


        }



        loadGeneralStats();

        loadRecords();

        loadMuscleStats();

        loadVolumeChart();


    }
);






// =======================================
// STATISTICHE GENERALI
// =======================================


function loadGeneralStats(){



    const container =
        document.getElementById(
            "generalStats"
        );



    if(!container){

        return;

    }



    const history =
        getHistory();



    let totalMinutes = 0;

    let totalVolume = 0;




    history.forEach(
        workout => {


            totalMinutes +=
                Number(workout.duration) || 0;



            totalVolume +=
                calculateVolume(
                    workout.exercises
                );


        }
    );





    const average =

        history.length > 0

        ?

        Math.round(
            totalMinutes / history.length
        )

        :

        0;





    container.innerHTML = `



        <div class="statRow">

            <span>
            Allenamenti
            </span>

            <span>
            ${history.length}
            </span>

        </div>




        <div class="statRow">

            <span>
            Minuti totali
            </span>

            <span>
            ${totalMinutes} min
            </span>

        </div>




        <div class="statRow">

            <span>
            Volume totale
            </span>

            <span>
            ${totalVolume} kg
            </span>

        </div>




        <div class="statRow">

            <span>
            Durata media
            </span>

            <span>
            ${average} min
            </span>

        </div>



    `;


}









// =======================================
// RECORD PERSONALI
// =======================================


function loadRecords(){



    const container =
        document.getElementById(
            "records"
        );



    if(!container){

        return;

    }



    const history =
        getHistory();



    let records = {};




    history.forEach(
        workout=>{


            workout.exercises.forEach(
                exercise=>{


                    exercise.sets.forEach(
                        set=>{


                            const weight =
                                Number(set.weight) || 0;



                            if(weight > 0){



                                if(
                                    !records[exercise.title]
                                    ||
                                    weight >
                                    records[exercise.title]
                                ){


                                    records[exercise.title] =
                                        weight;


                                }


                            }


                        }
                    );


                }
            );


        }
    );






    if(
        Object.keys(records).length === 0
    ){


        container.innerHTML =
            "Nessun record disponibile";


        return;

    }






    let html = "";



    Object.keys(records).forEach(
        exercise=>{


            html += `


            <div class="statRow">

                <span>

                ${exercise}

                </span>


                <span>

                ${records[exercise]} kg

                </span>


            </div>


            `;


        }
    );



    container.innerHTML =
        html;


}









// =======================================
// MUSCOLI ALLENATI
// =======================================


function loadMuscleStats(){



    const container =
        document.getElementById(
            "muscleStats"
        );



    if(!container){

        return;

    }




    const history =
        getHistory();



    let muscles = {};





    history.forEach(
        workout=>{


            workout.exercises.forEach(
                exercise=>{


                    const muscle =
                        exercise.muscle ||
                        "Generale";



                    if(!muscles[muscle]){

                        muscles[muscle] = 0;

                    }



                    muscles[muscle]++;


                }
            );


        }
    );







    if(
        Object.keys(muscles).length === 0
    ){


        container.innerHTML =
            "Nessun dato disponibile";


        return;


    }






    let html = "";



    Object.keys(muscles).forEach(
        muscle=>{


            html += `


            <div class="statRow">


                <span>

                💪 ${muscle}

                </span>



                <span>

                ${muscles[muscle]}
                volte

                </span>


            </div>


            `;


        }
    );



    container.innerHTML =
        html;



}









// =======================================
// CALCOLO VOLUME
// =======================================


function calculateVolume(exercises){



    let volume = 0;



    if(!exercises){

        return 0;

    }




    exercises.forEach(
        exercise=>{


            exercise.sets.forEach(
                set=>{


                    volume +=

                    (
                        Number(set.weight)
                        ||
                        0
                    )

                    *

                    (
                        Number(set.reps)
                        ||
                        0
                    );


                }
            );


        }
    );



    return volume;


}









// =======================================
// GRAFICO VOLUME
// =======================================


function loadVolumeChart(){



    const canvas =
        document.getElementById(
            "volumeChart"
        );



    if(!canvas){

        return;

    }



    if(typeof Chart === "undefined"){


        console.error(
            "Chart.js non caricato"
        );


        return;

    }





    const history =
        [...getHistory()].reverse();





    const labels =
        [];



    const values =
        [];





    history.forEach(
        workout=>{


            labels.push(
                workout.date
            );



            values.push(

                calculateVolume(
                    workout.exercises
                )

            );


        }
    );






    new Chart(
        canvas,
        {


            type:"line",



            data:{


                labels,


                datasets:[{


                    label:
                    "Volume kg",



                    data:values,



                    borderColor:
                    "#28a745",



                    backgroundColor:
                    "rgba(40,167,69,0.2)",



                    tension:
                    0.3


                }]


            },



            options:{


                responsive:true,


                plugins:{


                    legend:{


                        labels:{


                            color:"white"


                        }


                    }


                },



                scales:{


                    x:{


                        ticks:{


                            color:"white"


                        }


                    },



                    y:{


                        ticks:{


                            color:"white"


                        }


                    }


                }


            }


        }
    );


}