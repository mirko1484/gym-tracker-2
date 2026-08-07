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


        // Primo utilizzo: nessuna scheda precompilata,
        // l'utente parte da schede vuote da compilare

        workouts = {};


    }


    // Garantisce che ogni giornata attiva abbia un array

    getActiveDayLetters().forEach(day=>{

        if(!workouts[day]){

            workouts[day] = [];

        }

    });




    convertOldFormat();



    renderDaySections();



}







// =======================================
// CONVERSIONE VECCHIO FORMATO
// =======================================


function convertOldFormat(){



    getActiveDayLetters().forEach(day=>{


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


// Costruisce dinamicamente le sezioni delle giornate attive
// (in base al numero scelto nelle Impostazioni)

function renderDaySections(){


    const container =
        document.getElementById(
            "daysContainer"
        );

    if(!container){

        return;

    }

    const days =
        getActiveDayLetters();

    let html = "";

    days.forEach((day, index)=>{

        const colorClass =
            getDayColorClass(index);

        const icon =
            getDayIcon(index);

        html += `

        <section class="statsCard">

        <h2>
        ${icon} Giornata ${day}
        </h2>

        <div id="day${day}List"></div>

        <div class="dayActionsRow">

        <button
        class="dayButton ${colorClass}"
        onclick="addExercise('${day}')">
        ➕ Manuale
        </button>

        <button
        class="dayButton ${colorClass}"
        onclick="openLibrary('${day}')">
        📚 Libreria
        </button>

        </div>

        </section>

        `;

    });

    container.innerHTML = html;


    days.forEach(day=>{

        renderDay(day);

    });


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


// "local" = icone offline (sempre disponibili)
// "online" = foto reali da free-exercise-db (richiede internet)
let libraryMode = "local";

// Cache in memoria della libreria online (caricata una sola volta)
let onlineLibrary = null;

const ONLINE_LIBRARY_URL =
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

const ONLINE_IMAGE_BASE =
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

// Traduzione dei nomi muscolo inglesi -> italiano (solo per l'etichetta)
const ONLINE_MUSCLE_LABELS = {

    "abdominals": "Addominali",
    "abductors": "Abduttori",
    "adductors": "Adduttori",
    "biceps": "Bicipiti",
    "calves": "Polpacci",
    "chest": "Petto",
    "forearms": "Avambracci",
    "glutes": "Glutei",
    "hamstrings": "Femorali",
    "lats": "Dorso (Lat)",
    "lower back": "Lombari",
    "middle back": "Dorso",
    "neck": "Collo",
    "quadriceps": "Quadricipiti",
    "shoulders": "Spalle",
    "traps": "Trapezio",
    "triceps": "Tricipiti"

};

// Mappatura attrezzatura del dataset online -> le nostre 3 categorie
function mapOnlineEquipment(equipment){

    if(equipment === "body only"){

        return "Corpo libero";

    }

    if(
        equipment === "cable" ||
        equipment === "machine"
    ){

        return "Macchine/Cavi";

    }

    if(
        equipment === "dumbbell" ||
        equipment === "barbell" ||
        equipment === "kettlebells" ||
        equipment === "bands" ||
        equipment === "exercise ball" ||
        equipment === "medicine ball" ||
        equipment === "e-z curl bar"
    ){

        return "Pesi liberi";

    }

    return "";

}


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


// Carica (una sola volta) la libreria online con foto reali
async function loadOnlineLibrary(){

    if(onlineLibrary){

        return onlineLibrary;

    }

    const container =
        document.getElementById(
            "libraryList"
        );

    if(container){

        container.innerHTML =
            `<p class="librarySubtitle">Caricamento libreria online...</p>`;

    }

    try{

        const response =
            await fetch(ONLINE_LIBRARY_URL);

        const data =
            await response.json();

        onlineLibrary =
            data.map(ex=>{

                return {

                    id: ex.id,

                    title: ex.name,

                    muscle:
                        ex.primaryMuscles &&
                        ex.primaryMuscles[0] ?
                            ex.primaryMuscles[0] :
                            "",

                    equipment:
                        mapOnlineEquipment(ex.equipment),

                    image:
                        ex.images &&
                        ex.images[0] ?
                            ONLINE_IMAGE_BASE + ex.images[0] :
                            ""

                };

            })
            .filter(ex => ex.image);

    }
    catch(err){

        onlineLibrary = [];

        if(container){

            container.innerHTML =
                `<p class="librarySubtitle">Impossibile caricare la libreria online. Controlla la connessione.</p>`;

        }

    }

    return onlineLibrary;

}


// Cambia tra libreria locale (icone) e online (foto reali)
async function switchLibraryMode(mode){

    libraryMode = mode;

    const localTab =
        document.getElementById(
            "libraryTabLocal"
        );

    const onlineTab =
        document.getElementById(
            "libraryTabOnline"
        );

    if(localTab && onlineTab){

        localTab.classList.toggle(
            "libraryTabActive",
            mode === "local"
        );

        onlineTab.classList.toggle(
            "libraryTabActive",
            mode === "online"
        );

    }

    const equipmentFilter =
        document.getElementById(
            "libraryEquipmentFilter"
        );

    if(equipmentFilter){

        equipmentFilter.style.display =
            "block";

    }

    if(mode === "online"){

        await loadOnlineLibrary();

    }

    populateLibraryMuscleFilter();

    renderLibraryList();

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

    switchLibraryMode("local");

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


// Ridisegna la lista filtrata della libreria (locale o online)
function renderLibraryList(){

    const container =
        document.getElementById(
            "libraryList"
        );

    if(!container){
        return;
    }

    const sourceList =
        libraryMode === "online" ?
            (onlineLibrary || []) :
            exerciseLibrary;

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
        sourceList.filter(ex=>{

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

        })
        .slice(0, 120);

    container.innerHTML = "";

    if(libraryMode === "online" && !onlineLibrary){

        return;

    }

    if(filtered.length === 0){

        container.innerHTML =
            `<p class="librarySubtitle">Nessun esercizio trovato</p>`;

        return;

    }

    filtered.forEach(ex=>{

        const sourceIndex =
            sourceList.indexOf(ex);

        const muscleLabel =
            libraryMode === "online" ?
                (ONLINE_MUSCLE_LABELS[ex.muscle] || ex.muscle) :
                ex.muscle;

        const imgSrc =
            libraryMode === "online" ?
                ex.image :
                `img/patterns/${ex.pattern}.svg`;

        const card =
            document.createElement("div");

        card.className =
            "libraryCard";

        card.innerHTML = `

            <img
            class="libraryCardImg ${libraryMode === "online" ? "libraryCardImgPhoto" : ""}"
            src="${imgSrc}"
            loading="lazy"
            onerror="this.style.visibility='hidden'"
            alt="">

            <div class="libraryCardInfo">
                <strong>${ex.title}</strong>
                <span>${muscleLabel}${ex.equipment ? " · " + ex.equipment : ""}</span>
            </div>

            <button
            class="libraryAddBtn"
            onclick="addFromLibrary(${sourceIndex})">
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

    const sourceList =
        libraryMode === "online" ?
            (onlineLibrary || []) :
            exerciseLibrary;

    const uniqueMuscles =
        [...new Set(
            sourceList.map(ex=>ex.muscle)
        )]
        .filter(m => m);

    let html =
        `<option value="">Tutti i muscoli</option>`;

    uniqueMuscles.forEach(m=>{

        const label =
            libraryMode === "online" ?
                (ONLINE_MUSCLE_LABELS[m] || m) :
                m;

        html +=
            `<option value="${m}">${label}</option>`;

    });

    muscleFilter.innerHTML = html;

}


// Aggiunge un esercizio scelto dalla libreria (locale o online)
// alla giornata selezionata
function addFromLibrary(sourceIndex){

    if(!libraryTargetDay){
        return;
    }

    const sourceList =
        libraryMode === "online" ?
            (onlineLibrary || []) :
            exerciseLibrary;

    const source =
        sourceList[sourceIndex];

    if(!source){
        return;
    }

    if(libraryMode === "online"){

        workouts[libraryTargetDay].push({

            id: Date.now(),

            title: source.title,

            muscle:
                ONLINE_MUSCLE_LABELS[source.muscle] ||
                source.muscle ||
                "Generale",

            sets: 3,

            reps: 12,

            rest: 60,

            pattern: "generale",

            image: source.image

        });

    }
    else{

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

    }

    renderDay(libraryTargetDay);

    autoSave();

    closeLibrary();

}
