// =======================================
// GYM TRACKER
// WORKOUT ENGINE
// VERSIONE DEFINITIVA SCHEDE PERSONALIZZATE
// PARTE 1/3
// =======================================


let currentWorkout = null;

let exercises = [];

let currentExercise = 0;

let workoutData = [];

let startTime = null;

let timerInterval = null;

let workoutVersion = null;





// =======================================
// AVVIO PAGINA
// =======================================


let loggedInCustomerId = null;


document.addEventListener(
    "DOMContentLoaded",
    async function(){


        const profile =
            await requireAuth(["customer"]);

        if(!profile){

            return;

        }

        loggedInCustomerId =
            profile.id;


        initializeWorkout();



        const sessionDone =
            document.getElementById(
                "sessionDone"
            );



        if(sessionDone){


            sessionDone.addEventListener(
                "change",
                function(){


                    if(this.checked){

                        showSummary();

                    }


                }
            );


        }


    }

);








// =======================================
// CARICAMENTO WORKOUT
// =======================================


async function initializeWorkout(){


    currentWorkout =
        localStorage.getItem(
            "currentWorkout"
        );



    if(!currentWorkout){


        alert(
            "Nessuna giornata selezionata"
        );


        location.href =
            "index.html";


        return;

    }





    const title =
        document.getElementById(
            "workoutTitle"
        );



    if(title){

        title.textContent =
            "Giornata "
            +
            (DAY_LETTERS_POOL.indexOf(currentWorkout) + 1);

    }





    try{


        const { data: scheduleRow, error: scheduleError } =
            await supabaseClient
                .from("schedules")
                .select("exercises")
                .eq("customer_id", loggedInCustomerId)
                .eq("day_letter", currentWorkout)
                .maybeSingle();


        if(scheduleError){

            throw scheduleError;

        }


        exercises =
            (scheduleRow && scheduleRow.exercises) ?
                scheduleRow.exercises :
                [];





        if(
            !Array.isArray(exercises)
            ||
            exercises.length === 0
        ){


            throw new Error(
                "Scheda vuota"
            );


        }






        createWorkoutVersion();


        loadSavedWorkout();


        loadExercise();


        startTimer();



    }


    catch(error){


        console.error(
            "Errore caricamento workout:",
            error
        );


        alert(
            "Questa giornata è ancora vuota. Vai su 'Gestisci schede' per aggiungere esercizi."
        );

        window.location.href =
            "workout-manager.html";


    }


}








// =======================================
// VERSIONE SCHEDA
// =======================================


function createWorkoutVersion(){



    workoutVersion =

        JSON.stringify(


            exercises.map(

                exercise => ({


                    title:
                        exercise.title,


                    sets:
                        exercise.sets,


                    reps:
                        exercise.reps,


                    rest:
                        exercise.rest


                })


            )


        );


}









// =======================================
// CREAZIONE DATI SESSIONE
// =======================================


function createWorkoutData(){



    return exercises.map(

        exercise => ({


            title:
                exercise.title,


            muscle:
                exercise.muscle || "Generale",


            completed:
                false,


            sets:
                createEmptySets(

                    exercise.sets,

                    exercise.reps

                )


        })

    );


}








// =======================================
// CREAZIONE SERIE
// =======================================


function createEmptySets(
    number,
    reps
){


    number =
        Number(number) || 3;



    let sets = [];



    for(
        let i = 0;
        i < number;
        i++
    ){


        sets.push({


            weight:
                "",


            reps:
                reps || ""


        });


    }



    return sets;


}








// =======================================
// RECUPERO SESSIONE ATTIVA
// =======================================


function loadSavedWorkout(){


    const saved =
        localStorage.getItem(
            "activeWorkout"
        );



    if(saved){


        try{


            const data =
                JSON.parse(saved);



            if(

                data.day === currentWorkout

                &&

                data.version === workoutVersion

            ){



                currentExercise =
                    Number(
                        data.currentExercise
                    )
                    ||
                    0;



                workoutData =
                    data.workoutData || [];



                return;


            }



        }


        catch(error){


            console.error(
                "Errore recupero sessione",
                error
            );


        }


    }





    workoutData =
        createWorkoutData();


}
// =======================================
// VISUALIZZAZIONE ESERCIZIO
// =======================================


function loadExercise(){


    const exercise =
        exercises[currentExercise];



    if(!exercise){

        return;

    }


    const notesField =
        document.getElementById(
            "exerciseNotes"
        );

    if(notesField){

        notesField.value =
            exercise.notes || "";

    }





    const isCardio =
        exercise.muscle === "Cardio";


    if(!workoutData[currentExercise]){


        workoutData[currentExercise] = {


            title:
                exercise.title,


            muscle:
                exercise.muscle || "Generale",


            completed:
                false,


            cardio:
                isCardio,


            duration:
                exercise.duration || 20,


            elapsedSeconds:
                0,


            sets:
                isCardio ?
                    [] :
                    createEmptySets(

                        exercise.sets,

                        exercise.reps

                    )


        };


    }


    pauseCardioTimer();








    const title =
        document.getElementById(
            "exerciseTitle"
        );



    if(title){


        title.textContent =
            exercise.title;


    }








    // ===================================
    // DESCRIZIONE DINAMICA
    // PRENDE I DATI DELLA SCHEDA
    // ===================================


    const description =
        document.getElementById(
            "exerciseDescription"
        );



    if(description){


        if(isCardio){

            description.textContent =
                "Durata consigliata: " +
                (exercise.duration || 20) +
                " minuti";

        }
        else{

            description.textContent =


                exercise.sets

                +

                " serie x "

                +

                exercise.reps

                +

                " ripetizioni"

                +


                (

                    exercise.rest

                    ?

                    " • Recupero "

                    +

                    exercise.rest

                    +

                    " sec"

                    :

                    ""

                );

        }


    }








    const muscle =
        document.getElementById(
            "exerciseMuscle"
        );



    if(muscle){


        muscle.textContent =


            "🏋 "

            +

            (

                exercise.muscle

                ||

                "Generale"

            );


    }








    const image =
        document.getElementById(
            "exerciseImage"
        );



    if(image){



        if(exercise.image){


            image.style.display =
                "block";



            image.src =
                exercise.image;



            image.onerror =
                function(){


                    this.style.display =
                        "none";


                };


        }

        else{


            image.style.display =
                "none";


        }


    }









    const counter =
        document.getElementById(
            "exerciseCounter"
        );



    if(counter){


        counter.textContent =


            "Esercizio "

            +

            (

                currentExercise + 1

            )

            +

            " di "

            +

            exercises.length;



    }









    const progress =
        document.getElementById(
            "progress"
        );



    if(progress){



        progress.style.width =


            (

                (

                    currentExercise + 1

                )

                /

                exercises.length

                *

                100

            )

            +

            "%";


    }








    const checkbox =
        document.getElementById(
            "exerciseDone"
        );



    if(checkbox){


        checkbox.checked =

            workoutData[currentExercise]
            .completed;


    }






    const setsSection =
        document.getElementById(
            "setsSection"
        );

    const cardioSection =
        document.getElementById(
            "cardioSection"
        );

    if(setsSection && cardioSection){

        setsSection.style.display =
            isCardio ? "none" : "block";

        cardioSection.style.display =
            isCardio ? "block" : "none";

    }


    if(isCardio){

        renderCardioTimer();

    }
    else{

        createSetsTable();

    }


}











// =======================================
// CREAZIONE TABELLA SERIE
// =======================================


function createSetsTable(){



    const container =
        document.getElementById(
            "setsContainer"
        );



    if(!container){

        return;

    }





    container.innerHTML = "";





    const sets =

        workoutData[currentExercise]
        .sets;






    sets.forEach(

        (set,index)=>{


            const row =
                document.createElement(
                    "tr"
                );



            row.innerHTML = `


            <td>

                ${index + 1}

            </td>



            <td>


                <input

                type="number"

                class="weightInput"

                data-index="${index}"

                value="${set.weight}"

                placeholder="kg">


            </td>



            <td>


                <input

                type="number"

                class="repsInput"

                data-index="${index}"

                value="${set.reps}"

                placeholder="rep">


            </td>


            `;



            container.appendChild(row);



        }


    );





    addInputListeners();


}











// =======================================
// SALVATAGGIO INPUT
// =======================================


function addInputListeners(){



    document
    .querySelectorAll(
        ".weightInput"
    )
    .forEach(

        input=>{


            input.oninput = function(){



                const index =
                    this.dataset.index;



                workoutData[currentExercise]
                .sets[index]
                .weight =

                    this.value;



                saveProgress();



            };


        }

    );







    document
    .querySelectorAll(
        ".repsInput"
    )
    .forEach(

        input=>{


            input.oninput = function(){



                const index =
                    this.dataset.index;



                workoutData[currentExercise]
                .sets[index]
                .reps =

                    this.value;



                saveProgress();



            };


        }

    );


}










// =======================================
// CHECK ESERCIZIO COMPLETATO
// =======================================


document.addEventListener(

    "change",

    function(e){



        if(

            e.target.id ===
            "exerciseDone"

        ){



            workoutData[currentExercise]
            .completed =

                e.target.checked;



            saveProgress();



        }



    }

);








// =======================================
// SALVATAGGIO SESSIONE
// =======================================


function saveProgress(){



    localStorage.setItem(


        "activeWorkout",


        JSON.stringify({



            day:

                currentWorkout,



            version:

                workoutVersion,



            currentExercise:

                currentExercise,



            workoutData:

                workoutData



        })


    );


}









// =======================================
// NAVIGAZIONE ESERCIZI
// =======================================


function nextExercise(){



    if(

        currentExercise <

        exercises.length - 1

    ){



        currentExercise++;



        saveProgress();



        loadExercise();



    }


}






function previousExercise(){



    if(

        currentExercise > 0

    ){



        currentExercise--;



        saveProgress();



        loadExercise();



    }


}
// =======================================
// TIMER ALLENAMENTO
// =======================================


function startTimer(){


    const saved =

        localStorage.getItem(
            "workoutStartTime"
        );



    if(saved){


        startTime =
            Number(saved);


    }

    else{


        startTime =
            Date.now();



        localStorage.setItem(

            "workoutStartTime",

            startTime

        );


    }





    updateTimer();





    if(timerInterval){


        clearInterval(
            timerInterval
        );


    }




    timerInterval =

        setInterval(

            updateTimer,

            1000

        );


}









function updateTimer(){



    if(!startTime){

        return;

    }





    const seconds =

        Math.floor(

            (

                Date.now()

                -

                startTime

            )

            /

            1000

        );





    const hours =

        Math.floor(
            seconds / 3600
        );





    const minutes =

        Math.floor(

            (

                seconds % 3600

            )

            /

            60

        );





    const sec =

        seconds % 60;





    const timer =

        document.getElementById(
            "workoutTimer"
        );





    if(timer){



        timer.textContent =


            String(hours)
            .padStart(2,"0")

            +

            ":"

            +

            String(minutes)
            .padStart(2,"0")

            +

            ":"

            +

            String(sec)
            .padStart(2,"0");


    }



}











// =======================================
// DURATA IN MINUTI
// =======================================


function getWorkoutDuration(){



    if(!startTime){

        return 0;

    }




    return Math.floor(

        (

            Date.now()

            -

            startTime

        )

        /

        60000

    );


}










function getTimerText(){



    if(!startTime){

        return "00:00:00";

    }





    const seconds =

        Math.floor(

            (

                Date.now()

                -

                startTime

            )

            /

            1000

        );





    const h =

        Math.floor(
            seconds / 3600
        );





    const m =

        Math.floor(

            (

                seconds % 3600

            )

            /

            60

        );





    const s =

        seconds % 60;





    return


        String(h)
        .padStart(2,"0")

        +

        ":"

        +

        String(m)
        .padStart(2,"0")

        +

        ":"

        +

        String(s)
        .padStart(2,"0");


}











// =======================================
// RIEPILOGO ALLENAMENTO
// =======================================


function showSummary(){



    let completed = 0;

    let volume = 0;





    workoutData.forEach(

        exercise=>{



            if(exercise.completed){


                completed++;


            }






            exercise.sets.forEach(

                set=>{



                    const weight =

                        Number(
                            set.weight
                        )
                        ||
                        0;




                    const reps =

                        Number(
                            set.reps
                        )
                        ||
                        0;




                    volume +=

                        weight * reps;



                }


            );



        }


    );







    const duration =
        document.getElementById(
            "summaryDuration"
        );



    const exercisesText =
        document.getElementById(
            "summaryExercises"
        );



    const volumeText =
        document.getElementById(
            "summaryVolume"
        );







    if(duration){


        duration.textContent =


            "⏱ Durata: "

            +

            getTimerText();


    }







    if(exercisesText){


        exercisesText.textContent =


            "💪 Esercizi completati: "

            +

            completed

            +

            " / "

            +

            exercises.length;


    }







    if(volumeText){


        volumeText.textContent =


            "🏋 Volume totale: "

            +

            volume

            +

            " kg";


    }







    const modal =

        document.getElementById(
            "summaryModal"
        );



    if(modal){


        modal.style.display =
            "flex";


    }


}











// =======================================
// CHIUDI RIEPILOGO
// =======================================


function closeSummary(){



    const modal =

        document.getElementById(
            "summaryModal"
        );



    if(modal){


        modal.style.display =
            "none";


    }


}











// =======================================
// CONFERMA FINE
// =======================================


function confirmFinish(){


    finishWorkout();


}











// =======================================
// SALVATAGGIO STORICO
// =======================================


function finishWorkout(){



    const session = {



        id:

            Date.now(),





        day:

            currentWorkout,





        date:

            new Date()
            .toLocaleDateString(
                "it-IT"
            ),





        time:

            new Date()
            .toLocaleTimeString(
                "it-IT"
            ),





        duration:

            getWorkoutDuration(),





        completed:

            true,





        exercises:

            workoutData



    };









    if(
        typeof addWorkout === "function"
    ){


        addWorkout(
            session
        );


    }

    else{


        console.error(

            "addWorkout non disponibile"

        );


    }








    localStorage.removeItem(
        "activeWorkout"
    );





    localStorage.removeItem(
        "workoutStartTime"
    );





    localStorage.removeItem(
        "currentWorkout"
    );






    clearInterval(
        timerInterval
    );







    alert(

        "Allenamento salvato! 💪"

    );







    location.href =
        "index.html";



}


// =======================================
// TIMER CARDIO (per esercizio)
// =======================================


let cardioInterval = null;


function renderCardioTimer(){


    const data =
        workoutData[currentExercise];

    if(!data){

        return;

    }


    const target =
        document.getElementById(
            "cardioTimerTarget"
        );

    if(target){

        target.textContent =
            "Obiettivo: " +
            (data.duration || 20) +
            " min";

    }


    updateCardioDisplay();


    const btn =
        document.getElementById(
            "cardioStartPauseBtn"
        );

    if(btn){

        btn.innerHTML =
            cardioInterval ?
                "⏸️ Pausa" :
                "▶️ Avvia";

    }


}


function updateCardioDisplay(){


    const data =
        workoutData[currentExercise];

    if(!data){

        return;

    }


    const display =
        document.getElementById(
            "cardioTimerDisplay"
        );

    if(!display){

        return;

    }


    const totalSeconds =
        data.elapsedSeconds || 0;

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    display.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");


    // Se si raggiunge o supera l'obiettivo, segna
    // automaticamente l'esercizio come completato

    const targetSeconds =
        (data.duration || 20) * 60;

    if(
        totalSeconds >= targetSeconds &&
        !data.completed
    ){

        data.completed = true;

        const checkbox =
            document.getElementById(
                "exerciseDone"
            );

        if(checkbox){

            checkbox.checked = true;

        }

    }


}


function toggleCardioTimer(){


    if(cardioInterval){

        pauseCardioTimer();

    }
    else{

        startCardioTimer();

    }


}


function startCardioTimer(){


    const data =
        workoutData[currentExercise];

    if(!data){

        return;

    }


    if(cardioInterval){

        return;

    }


    cardioInterval =
        setInterval(
            function(){

                data.elapsedSeconds =
                    (data.elapsedSeconds || 0) + 1;

                updateCardioDisplay();

                saveProgress();

            },
            1000
        );


    const btn =
        document.getElementById(
            "cardioStartPauseBtn"
        );

    if(btn){

        btn.innerHTML =
            "⏸️ Pausa";

    }


}


function pauseCardioTimer(){


    if(cardioInterval){

        clearInterval(cardioInterval);

        cardioInterval = null;

    }


    const btn =
        document.getElementById(
            "cardioStartPauseBtn"
        );

    if(btn){

        btn.innerHTML =
            "▶️ Avvia";

    }


}


function resetCardioTimer(){


    pauseCardioTimer();


    const data =
        workoutData[currentExercise];

    if(data){

        data.elapsedSeconds = 0;

        data.completed = false;

    }


    const checkbox =
        document.getElementById(
            "exerciseDone"
        );

    if(checkbox){

        checkbox.checked = false;

    }


    updateCardioDisplay();

    saveProgress();


}



// =======================================
// IMMAGINE A SCHERMO INTERO
// (funzioni condivise showImageFullscreen/closeImageFullscreen in storage.js)
// =======================================

function openImageFullscreen(){

    const sourceImage =
        document.getElementById(
            "exerciseImage"
        );

    if(!sourceImage || !sourceImage.src){

        return;

    }

    showImageFullscreen(sourceImage.src);

}



// =======================================
// NOTE PERSONALI SULL'ESERCIZIO
// =======================================

async function saveExerciseNotes(){


    const notesField =
        document.getElementById(
            "exerciseNotes"
        );

    if(
        !notesField ||
        !exercises[currentExercise]
    ){

        return;

    }


    const newValue =
        notesField.value;


    // Non salvare se non è cambiato nulla

    if(
        (exercises[currentExercise].notes || "") ===
        newValue
    ){

        return;

    }


    exercises[currentExercise].notes =
        newValue;


    const { error } =
        await supabaseClient
            .from("schedules")
            .update({ exercises: exercises })
            .eq("customer_id", loggedInCustomerId)
            .eq("day_letter", currentWorkout);


    if(error){

        console.error(
            "Errore salvataggio nota:",
            error
        );

    }


}
