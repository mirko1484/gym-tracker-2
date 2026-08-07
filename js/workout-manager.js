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


// Catalogo esercizi caricato da data/exercise-library.json
let exerciseLibrary = [];

// Giornata attualmente aperta nel modale libreria
let libraryTargetDay = null;





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

        loadExerciseLibrary();

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


            if(!exercise.pattern){

                exercise.pattern =
                    "generale";

            }


            if(!exercise.image){

                exercise.image =
                    "img/patterns/" +
                    exercise.pattern +
                    ".svg";

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



            <div class="exerciseHeaderRow">

                <img
                class="exerciseThumb"
                src="${exercise.image}"
                onerror="this.style.visibility='hidden'"
                alt="">

                <strong>
                ${index + 1}. ${exercise.title}
                </strong>

            </div>


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



        pattern:
            "generale",


        image:
            "img/patterns/generale.svg"



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

// =======================================
// LIBRERIA ESERCIZI
// =======================================


async function loadExerciseLibrary(){

    try{

        const response =
            await fetch(
                "data/exercise-library.json"
            );

        exerciseLibrary =
            await response.json();

    }
    catch(err){

        exerciseLibrary = [];

    }

    populateLibraryMuscleFilter();

}


// Apre il modale della libreria per una specifica giornata
function openLibrary(day){

    libraryTargetDay = day;

    const search =
        document.getElementById(
            "librarySearch"
        );

    if(search){
        search.value = "";
    }

    const muscleFilter =
        document.getElementById(
            "libraryMuscleFilter"
        );

    if(muscleFilter){
        muscleFilter.value = "";
    }

    renderLibraryList();

    const modal =
        document.getElementById(
            "libraryModal"
        );

    if(modal){

        modal.style.display =
            "flex";

    }

}


function closeLibrary(){

    const modal =
        document.getElementById(
            "libraryModal"
        );

    if(modal){

        modal.style.display =
            "none";

    }

    libraryTargetDay = null;

}


// Ridisegna la lista filtrata della libreria
function renderLibraryList(){

    const container =
        document.getElementById(
            "libraryList"
        );

    if(!container){
        return;
    }

    const search =
        document.getElementById(
            "librarySearch"
        );

    const muscleFilter =
        document.getElementById(
            "libraryMuscleFilter"
        );

    const equipmentFilter =
        document.getElementById(
            "libraryEquipmentFilter"
        );

    const query =
        search ?
            search.value.trim().toLowerCase() :
            "";

    const muscle =
        muscleFilter ?
            muscleFilter.value :
            "";

    const equipment =
        equipmentFilter ?
            equipmentFilter.value :
            "";

    const filtered =
        exerciseLibrary.filter(ex=>{

            const matchesQuery =
                !query ||
                ex.title.toLowerCase().includes(query);

            const matchesMuscle =
                !muscle ||
                ex.muscle === muscle;

            const matchesEquipment =
                !equipment ||
                ex.equipment === equipment;

            return matchesQuery && matchesMuscle && matchesEquipment;

        });

    container.innerHTML = "";

    if(filtered.length === 0){

        container.innerHTML =
            `<p class="librarySubtitle">Nessun esercizio trovato</p>`;

        return;

    }

    filtered.forEach((ex, i)=>{

        const originalIndex =
            exerciseLibrary.indexOf(ex);

        const card =
            document.createElement("div");

        card.className =
            "libraryCard";

        card.innerHTML = `

            <img
            class="libraryCardImg"
            src="img/patterns/${ex.pattern}.svg"
            alt="">

            <div class="libraryCardInfo">
                <strong>${ex.title}</strong>
                <span>${ex.muscle} · ${ex.equipment}</span>
            </div>

            <button
            class="libraryAddBtn"
            onclick="addFromLibrary(${originalIndex})">
            ➕
            </button>

        `;

        container.appendChild(card);

    });

}


// Genera dinamicamente le opzioni del filtro muscolo nel modale
function populateLibraryMuscleFilter(){

    const muscleFilter =
        document.getElementById(
            "libraryMuscleFilter"
        );

    if(!muscleFilter){
        return;
    }

    const uniqueMuscles =
        [...new Set(
            exerciseLibrary.map(ex=>ex.muscle)
        )];

    let html =
        `<option value="">Tutti i muscoli</option>`;

    uniqueMuscles.forEach(m=>{

        html +=
            `<option value="${m}">${m}</option>`;

    });

    muscleFilter.innerHTML = html;

}


// Aggiunge un esercizio scelto dalla libreria alla giornata selezionata
function addFromLibrary(libraryIndex){

    if(!libraryTargetDay){
        return;
    }

    const source =
        exerciseLibrary[libraryIndex];

    if(!source){
        return;
    }

    workouts[libraryTargetDay].push({

        id: Date.now(),

        title: source.title,

        muscle: source.muscle,

        sets: source.sets,

        reps: source.reps,

        rest: source.rest,

        pattern: source.pattern,

        image: `img/patterns/${source.pattern}.svg`

    });

    renderDay(libraryTargetDay);

    autoSave();

    closeLibrary();

}
