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