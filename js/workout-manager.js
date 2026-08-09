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


// A chi appartiene la scheda che stiamo modificando
// (il cliente stesso, oppure un cliente scelto dal trainer)
let targetCustomerId = null;
let targetCustomerName = null;

// Ruolo e id di chi sta usando la pagina in questo momento
// (diverso da targetCustomerId quando è un trainer a modificare)
let currentUserRole = null;
let currentUserId = null;

// Numero di giornate della scheda di QUESTO cliente
// (viene da Supabase, non più dal dispositivo locale)
let activeDayCount = 3;





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

    async function(){


        // Chiunque loggato può aprire questa pagina: un cliente
        // per la propria scheda, un trainer/admin per quella
        // di un cliente scelto dalla lista

        const profile =
            await requireAuth();

        if(!profile){

            return;

        }

        currentUserRole =
            profile.role;

        currentUserId =
            profile.id;


        const params =
            new URLSearchParams(window.location.search);

        const customerParam =
            params.get("customer");


        if(profile.role === "customer"){

            // Un cliente modifica sempre e solo la propria scheda

            targetCustomerId = profile.id;

            targetCustomerName = profile.full_name;

        }
        else{

            // Trainer/admin: deve arrivare con un cliente scelto

            if(!customerParam){

                window.location.href =
                    "trainer.html";

                return;

            }

            targetCustomerId = customerParam;

            targetCustomerName =
                params.get("name") || "cliente";

        }


        showClientBanner();

        await loadWorkouts();

        loadExerciseLibrary();

    }

);




// Mostra chi è il cliente quando è il trainer a modificare
// la scheda di qualcun altro

function showClientBanner(){

    if(currentUserRole === "customer"){

        return;

    }

    const banner =
        document.getElementById("clientBanner");

    if(!banner){

        return;

    }

    banner.style.display = "block";
    banner.style.background = "rgba(255,184,0,.15)";
    banner.style.color = "#ffb800";
    banner.style.padding = "12px 14px";
    banner.style.borderRadius = "10px";
    banner.style.marginBottom = "20px";
    banner.style.fontSize = "14px";
    banner.style.textAlign = "center";

    banner.textContent =
        "👤 Stai modificando la scheda di: " +
        targetCustomerName;

}







// =======================================
// CARICAMENTO SCHEDE
// =======================================


async function loadWorkouts(){


    // 1. Numero di giornate di QUESTO cliente (da Supabase)

    const { data: settingsRow } =
        await supabaseClient
            .from("customer_settings")
            .select("day_count")
            .eq("customer_id", targetCustomerId)
            .maybeSingle();

    activeDayCount =
        (settingsRow && settingsRow.day_count) ?
            settingsRow.day_count :
            3;


    const days =
        DAY_LETTERS_POOL.slice(0, activeDayCount);


    // 2. Schede già salvate per questo cliente

    const { data: scheduleRows, error } =
        await supabaseClient
            .from("schedules")
            .select("day_letter, exercises")
            .eq("customer_id", targetCustomerId);


    workouts = {};


    days.forEach(day=>{

        const row =
            (scheduleRows || []).find(r => r.day_letter === day);

        workouts[day] =
            (row && row.exercises) ?
                row.exercises :
                [];

    });


    if(error){

        alert(
            "Errore nel caricamento della scheda. Riprova."
        );

    }




    convertOldFormatForDays(days);


    const dayCountSelect =
        document.getElementById("dayCountSelect");

    if(dayCountSelect){

        dayCountSelect.value =
            activeDayCount;

    }


    renderDaySections();



}







// =======================================
// CONVERSIONE VECCHIO FORMATO
// =======================================


function convertOldFormatForDays(days){



    days.forEach(day=>{


        workouts[day].forEach(exercise=>{


            const isCardio =
                exercise.muscle === "Cardio";


            if(isCardio){

                if(!exercise.duration){

                    exercise.duration = 20;

                }

            }
            else{

                if(!exercise.sets){

                    exercise.sets = 3;

                }


                if(!exercise.reps){

                    exercise.reps = 10;

                }


                if(!exercise.rest){

                    exercise.rest = 60;

                }

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

// Giornata attualmente in modifica (si compila una alla volta)
let currentEditingDay = null;


function renderDaySections(){


    const tabContainer =
        document.getElementById(
            "dayTabRow"
        );

    const editorContainer =
        document.getElementById(
            "dayEditor"
        );

    if(!tabContainer || !editorContainer){

        return;

    }

    const days =
        DAY_LETTERS_POOL.slice(0, activeDayCount);

    if(
        !currentEditingDay ||
        !days.includes(currentEditingDay)
    ){

        currentEditingDay =
            days[0];

    }


    // --- TAB ---

    let tabHtml = "";

    days.forEach((day, index)=>{

        const colorClass =
            getDayColorClass(index);

        const activeClass =
            day === currentEditingDay ?
                "dayTabActive " + colorClass :
                "";

        tabHtml += `

        <button
        class="dayTabBtn ${activeClass}"
        onclick="selectEditingDay('${day}')">
        ${getDayIcon(index)} ${index + 1}
        </button>

        `;

    });

    tabContainer.innerHTML = tabHtml;


    renderDayEditor();


}


// Mostra la scheda della sola giornata selezionata
function renderDayEditor(){


    const editorContainer =
        document.getElementById(
            "dayEditor"
        );

    if(!editorContainer){

        return;

    }

    const days =
        DAY_LETTERS_POOL.slice(0, activeDayCount);

    const index =
        days.indexOf(currentEditingDay);

    const colorClass =
        getDayColorClass(index);

    const icon =
        getDayIcon(index);

    const exerciseCount =
        (workouts[currentEditingDay] || []).length;

    editorContainer.innerHTML = `

    <section class="statsCard">

    <h2>
    ${icon} Giornata ${index + 1}
    </h2>

    <p class="librarySubtitle" style="text-align:left;padding:0 0 12px;">
    ${exerciseCount === 0 ? "Nessun esercizio ancora" : exerciseCount + " esercizi in scheda"}
    </p>

    <div id="day${currentEditingDay}List"></div>

    <div class="dayActionsRow">

    <button
    class="dayButton ${colorClass}"
    onclick="addExercise('${currentEditingDay}')">
    ➕ Manuale
    </button>

    <button
    class="dayButton ${colorClass}"
    onclick="openLibrary('${currentEditingDay}')">
    📚 Libreria
    </button>

    </div>

    </section>

    `;

    renderDay(currentEditingDay);


}


// Cambia la giornata attualmente in modifica
function selectEditingDay(day){

    currentEditingDay = day;

    renderDaySections();

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
            );
            renderDayEditor();
            ">


            ${createMuscleOptions(
                exercise.muscle
            )}


            </select>





${exercise.muscle === "Cardio" ? `

            <label>
            Durata (minuti)
            </label>

            <select

            class="settingsInput"

            onchange="
            updateExercise(
            '${day}',
            ${index},
            'duration',
            Number(this.value)
            )
            ">

            ${createDurationOptions(
                exercise.duration || 20
            )}

            </select>

            ` : `

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
                exercise.sets || 3
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
                exercise.reps || 10
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
                exercise.rest || 60
            )}


            </select>

            `}






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


    // Quando il muscolo cambia da/a Cardio,
    // pulisce i campi non più pertinenti

    if(field === "muscle"){

        const exercise =
            workouts[day][index];

        if(value === "Cardio"){

            delete exercise.sets;
            delete exercise.reps;
            delete exercise.rest;

            if(!exercise.duration){

                exercise.duration = 20;

            }

        }
        else{

            delete exercise.duration;

            if(!exercise.sets){
                exercise.sets = 3;
            }

            if(!exercise.reps){
                exercise.reps = 10;
            }

            if(!exercise.rest){
                exercise.rest = 60;
            }

        }

    }




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




    renderDayEditor();



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



    renderDayEditor();



    autoSave();



}









// =======================================
// SALVATAGGIO
// =======================================


// =======================================
// CAMBIA NUMERO DI GIORNATE
// =======================================


async function changeTargetDayCount(value){


    const newCount =
        parseInt(value, 10);


    // Garantisce che ogni nuova giornata abbia un array,
    // senza mai cancellare giornate già compilate

    DAY_LETTERS_POOL.slice(0, newCount).forEach(day=>{

        if(!workouts[day]){

            workouts[day] = [];

        }

    });


    activeDayCount = newCount;


    const { error } =
        await supabaseClient
            .from("customer_settings")
            .upsert(
                {
                    customer_id: targetCustomerId,
                    day_count: newCount
                },
                { onConflict: "customer_id" }
            );


    if(error){

        alert(
            "Errore nel salvataggio del numero di giornate: " +
            error.message
        );

        return;

    }


    renderDaySections();


}




async function autoSave(){


    const days =
        DAY_LETTERS_POOL.slice(0, activeDayCount);


    const rows =
        days.map(day => ({

            customer_id: targetCustomerId,

            day_letter: day,

            exercises: workouts[day] || [],

            updated_by: currentUserId

        }));


    const { error } =
        await supabaseClient
            .from("schedules")
            .upsert(rows, { onConflict: "customer_id,day_letter" });


    if(error){

        console.error(
            "Errore salvataggio:",
            error
        );

        return { success: false, message: error.message };

    }


    return { success: true };


}







async function saveWorkouts(){



    const result =
        await autoSave();


    if(!result.success){

        alert(
            "Errore nel salvataggio: " +
            result.message
        );

        return;

    }


    alert(

        "Schede salvate ✅"

    );

    window.location.href =
        currentUserRole === "customer" ?
            "index.html" :
            "trainer.html";


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
// MENU DURATA (ESERCIZI CARDIO)
// =======================================


function createDurationOptions(selected){


    const durations = [
        5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75, 90
    ];


    let html = "";


    durations.forEach(minutes=>{

        html += `

        <option
        value="${minutes}"
        ${minutes == selected ? "selected" : ""}
        >
        ${minutes} min
        </option>

        `;

    });


    return html;


}

// =======================================
// LIBRERIA ESERCIZI
// =======================================


// "local" = icone offline (sempre disponibili)
// "online" = foto/GIF reali dal catalogo importato nel nostro database
let libraryMode = "local";

// Cache in memoria della libreria online (caricata una sola volta)
let onlineLibrary = null;

// Traduzione dei nomi muscolo (WorkoutX, Title Case) -> italiano (solo etichetta)
const ONLINE_MUSCLE_LABELS = {

    "Back": "Schiena",
    "Cardio": "Cardio",
    "Chest": "Petto",
    "Lower Arms": "Avambracci",
    "Lower Legs": "Polpacci",
    "Neck": "Collo",
    "Shoulders": "Spalle",
    "Upper Arms": "Braccia",
    "Upper Legs": "Gambe",
    "Waist": "Addome"

};

// Mappatura attrezzatura (WorkoutX) -> le nostre 3 categorie
function mapOnlineEquipment(equipment){

    if(!equipment){

        return "";

    }

    const eq = equipment.toLowerCase();

    if(
        eq.includes("body weight") ||
        eq.includes("body only") ||
        eq.includes("assisted")
    ){

        return "Corpo libero";

    }

    if(
        eq.includes("cable") ||
        eq.includes("machine") ||
        eq.includes("leverage") ||
        eq.includes("smith")
    ){

        return "Macchine/Cavi";

    }

    if(
        eq.includes("dumbbell") ||
        eq.includes("barbell") ||
        eq.includes("kettlebell") ||
        eq.includes("band") ||
        eq.includes("ball") ||
        eq.includes("bar") ||
        eq.includes("rope")
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


// Carica (una sola volta) la libreria online con foto/GIF reali,
// dal catalogo già importato nella nostra tabella Supabase
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

        const { data, error } =
            await supabaseClient
                .from("exercise_catalog")
                .select("id, name, body_part, target_muscle, equipment, gif_url")
                .order("name", { ascending: true });

        if(error){

            throw error;

        }

        onlineLibrary =
            (data || [])
                .map(ex=>{

                    return {

                        id: ex.id,

                        title: ex.name,

                        muscle: ex.body_part || "",

                        equipment:
                            mapOnlineEquipment(ex.equipment),

                        image: ex.gif_url || ""

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

        const muscleLabel =
            ONLINE_MUSCLE_LABELS[source.muscle] ||
            source.muscle ||
            "Generale";

        const isCardio =
            muscleLabel === "Cardio";

        workouts[libraryTargetDay].push({

            id: Date.now(),

            title: source.title,

            muscle: muscleLabel,

            sets: isCardio ? undefined : 3,

            reps: isCardio ? undefined : 12,

            rest: isCardio ? undefined : 60,

            duration: isCardio ? 20 : undefined,

            pattern: "generale",

            image: source.image

        });

    }
    else{

        const isCardio =
            source.muscle === "Cardio";

        workouts[libraryTargetDay].push({

            id: Date.now(),

            title: source.title,

            muscle: source.muscle,

            sets: isCardio ? undefined : (source.sets || 3),

            reps: isCardio ? undefined : (source.reps || 10),

            rest: isCardio ? undefined : (source.rest || 60),

            duration: isCardio ? (source.duration || 20) : undefined,

            pattern: source.pattern,

            image: `img/patterns/${source.pattern}.svg`

        });

    }

    renderDayEditor();

    autoSave();

    closeLibrary();

}
