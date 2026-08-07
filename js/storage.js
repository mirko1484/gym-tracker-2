// =======================================
// STORAGE MANAGER
// =======================================


// =======================================
// RECUPERA CRONOLOGIA
// =======================================

function getHistory() {


    const data =

        localStorage.getItem(
            CONFIG.STORAGE_KEYS.HISTORY
        );



    if(!data){


        return [];


    }



    try{


        const history =
            JSON.parse(data);



        if(Array.isArray(history)){


            return history;


        }


        return [];



    }
    catch(error){


        console.error(
            "Errore lettura storico:",
            error
        );


        return [];


    }



}






// =======================================
// SALVA CRONOLOGIA
// =======================================

function saveHistory(history){



    localStorage.setItem(


        CONFIG.STORAGE_KEYS.HISTORY,


        JSON.stringify(
            history
        )


    );


}







// =======================================
// AGGIUNGI ALLENAMENTO
// =======================================

function addWorkout(workout){



    const history =
        getHistory();




    history.unshift(
        workout
    );




    saveHistory(
        history
    );



}







// =======================================
// ELIMINA ALLENAMENTO
// =======================================

function deleteWorkout(id){



    const history =
        getHistory();




    const updated =

        history.filter(

            workout =>

                Number(workout.id)
                !==
                Number(id)

        );




    saveHistory(
        updated
    );



}








// =======================================
// CANCELLA TUTTO LO STORICO
// =======================================

function clearHistory(){



    localStorage.removeItem(

        CONFIG.STORAGE_KEYS.HISTORY

    );


}



// =======================================
// GESTIONE NUMERO GIORNATE SETTIMANALI
// =======================================


// Lettere disponibili per le giornate, in ordine
const DAY_LETTERS_POOL =
    ["A", "B", "C", "D", "E", "F"];


function getDayCount(){


    const saved =
        localStorage.getItem(
            "gymTracker_dayCount"
        );

    const count =
        saved ? parseInt(saved, 10) : 3;

    if(
        isNaN(count) ||
        count < 1 ||
        count > 6
    ){

        return 3;

    }

    return count;


}


function setDayCount(count){


    localStorage.setItem(
        "gymTracker_dayCount",
        count
    );


}


// Restituisce le lettere delle giornate attive, es. ["A","B","C"]
function getActiveDayLetters(){


    const count =
        getDayCount();

    return DAY_LETTERS_POOL.slice(
        0,
        count
    );


}


// Icone ed etichette colore associate a ciascuna giornata
const DAY_ICONS =
    ["🔥", "💪", "⚡", "🌟", "🚀", "🎯"];

const DAY_COLOR_CLASSES =
    ["dayA", "dayB", "dayC", "dayD", "dayE", "dayF"];


function getDayIcon(index){

    return DAY_ICONS[index % DAY_ICONS.length];

}


function getDayColorClass(index){

    return DAY_COLOR_CLASSES[index % DAY_COLOR_CLASSES.length];

}
