// =======================================
// GYM TRACKER
// WORKOUT MANAGER
// VERSIONE COMPLETA
// =======================================


let workouts = {

    A: [],
    B: [],
    C: []

};





// =======================================
// MUSCOLI DISPONIBILI
// =======================================


const muscles = [

    "Petto",
    "Dorso",
    "Spalle",
    "Bicipiti",
    "Tricipiti",
    "Gambe",
    "Quadricipiti",
    "Femorali",
    "Glutei",
    "Polpacci",
    "Addome",
    "Core",
    "Cardio",
    "Generale"

];






// =======================================
// AVVIO
// =======================================


document.addEventListener(

    "DOMContentLoaded",

    function(){

        loadWorkouts();

    }

);







// =======================================
// CARICAMENTO SCHEDE
// =======================================


async function loadWorkouts(){


    const saved =
        localStorage.getItem(
            "customWorkouts"
        );



    if(saved){


        workouts =
            JSON.parse(saved);


    }

    else{


        const response =
            await fetch(
                "data/workouts.json"
            );


        workouts =
            await response.json();


    }




    convertOldFormat();



    renderWorkouts();



}







// =======================================
// CONVERSIONE VECCHIO FORMATO
// =======================================


function convertOldFormat(){



    ["A","B","C"].forEach(day=>{


        workouts[day].forEach(exercise=>{


            if(!exercise.sets){

                exercise.sets = 3;

            }


            if(!exercise.reps){

                exercise.reps = 10;

            }


            if(!exercise.rest){

                exercise.rest = 60;

            }


            if(!exercise.muscle){

                exercise.muscle =
                    "Generale";

            }


            if(!exercise.image){

                exercise.image =
                    "img/exercises/default.jpg";

            }


        });


    });



}







// =======================================
// RENDER COMPLETO
// =======================================


function renderWorkouts(){


    renderDay("A");

    renderDay("B");

    renderDay("C");


}








// =======================================
// RENDER GIORNATA
// =======================================


function renderDay(day){



    const container =
        document.getElementById(
            "day" + day + "List"
        );



    if(!container){

        return;

    }





    container.innerHTML = "";





    workouts[day].forEach(

        (exercise,index)=>{


            const box =
                document.createElement(
                    "div"
                );



            box.className =
                "exerciseHistory";




            box.innerHTML = `



            <p>

            <strong>
            ${index + 1}.
            </strong>

            </p>



            <label>
            Nome esercizio
            </label>


            <input

            class="settingsInput"

            value="${exercise.title}"

            onchange="
            updateExercise(
            '${day}',
            ${index},
            'title',
            this.value
            )
            ">



            <label>
            Muscolo
            </label>



            <select

            class="settingsInput"

            onchange="
            updateExercise(
            '${day}',
            ${index},
            'muscle',
            this.value
            )
            ">


            ${createMuscleOptions(
                exercise.muscle
            )}


            </select>





            <label>
            Serie
            </label>



            <select

            class="settingsInput"

            onchange="
            updateExercise(
            '${day}',
            ${index},
            'sets',
            Number(this.value)
            )
            ">


            ${createNumberOptions(
                1,
                10,
                exercise.sets
            )}


            </select>







            <label>
            Ripetizioni
            </label>



            <select

            class="settingsInput"

            onchange="
            updateExercise(
            '${day}',
            ${index},
            'reps',
            Number(this.value)
            )
            ">


            ${createNumberOptions(
                1,
                50,
                exercise.reps
            )}


            </select>







            <label>
            Recupero
            </label>



            <select

            class="settingsInput"

            onchange="
            updateExercise(
            '${day}',
            ${index},
            'rest',
            Number(this.value)
            )
            ">


            ${createRestOptions(
                exercise.rest
            )}


            </select>






            <button

            class="secondaryButton"

            onclick="
            removeExercise(
            '${day}',
            ${index}
            )
            ">


            🗑 Elimina


            </button>


            <hr>


            `;




            container.appendChild(box);



        }


    );



}









// =======================================
// AGGIORNA ESERCIZIO
// =======================================


function updateExercise(

    day,

    index,

    field,

    value

){



    workouts[day][index][field] =
        value;




    autoSave();



}








// =======================================
// AGGIUNGI ESERCIZIO
// =======================================


function addExercise(day){



    workouts[day].push({



        id:
            Date.now(),



        title:
            "Nuovo esercizio",



        muscle:
            "Generale",



        sets:
            3,



        reps:
            10,



        rest:
            60,



        image:
            "img/exercises/default.jpg"



    });




    renderDay(day);



    autoSave();



}









// =======================================
// ELIMINA ESERCIZIO
// =======================================


function removeExercise(

    day,

    index

){



    workouts[day].splice(

        index,

        1

    );



    renderDay(day);



    autoSave();



}









// =======================================
// SALVATAGGIO
// =======================================


function autoSave(){



    localStorage.setItem(

        "customWorkouts",

        JSON.stringify(
            workouts
        )

    );


}







function saveWorkouts(){



    autoSave();



    alert(

        "Schede salvate ✅"

    );
	
	window.location.href =
        "index.html";


}









// =======================================
// MENU MUSCOLI
// =======================================


function createMuscleOptions(selected){



    let html = "";



    muscles.forEach(muscle=>{


        html += `


        <option

        value="${muscle}"

        ${muscle === selected ? "selected" : ""}

        >

        ${muscle}

        </option>


        `;


    });



    return html;


}








// =======================================
// MENU NUMERI
// =======================================


function createNumberOptions(

    min,

    max,

    selected

){



    let html = "";



    for(

        let i=min;

        i<=max;

        i++

    ){


        html += `


        <option

        value="${i}"

        ${i == selected ? "selected" : ""}

        >

        ${i}

        </option>


        `;


    }



    return html;


}








// =======================================
// MENU RECUPERO
// =======================================


function createRestOptions(selected){



    const rests = [

        30,
        45,
        60,
        90,
        120,
        150,
        180

    ];



    let html = "";



    rests.forEach(rest=>{


        html += `


        <option

        value="${rest}"

        ${rest == selected ? "selected" : ""}

        >

        ${rest} sec

        </option>


        `;


    });



    return html;


}