// =======================================
// GYM TRACKER
// SETTINGS MANAGER
// =======================================



document.addEventListener(
    "DOMContentLoaded",
    async function(){

        const profile =
            await requireAuth(["customer"]);

        if(!profile){

            return;

        }

        loadSettings();

    }
);






// =======================================
// CARICAMENTO IMPOSTAZIONI
// =======================================


function loadSettings(){


    const saved =

        localStorage.getItem(
            CONFIG.STORAGE_KEYS.SETTINGS
        );



    if(!saved){

        return;

    }




    const settings =

        JSON.parse(saved);





    const nameInput =

        document.getElementById(
            "userName"
        );



    const weightInput =

        document.getElementById(
            "userWeight"
        );



    const heightInput =

        document.getElementById(
            "userHeight"
        );



    const goalInput =

        document.getElementById(
            "userGoal"
        );







    if(nameInput){

        nameInput.value =
            settings.name || "";

    }





    if(weightInput){

        weightInput.value =
            settings.weight || "";

    }





    if(heightInput){

        heightInput.value =
            settings.height || "";

    }





    if(goalInput){

        goalInput.value =
            settings.goal || "massa";

    }



}









// =======================================
// SALVATAGGIO IMPOSTAZIONI
// =======================================


function saveSettings(){



    const settings = {


        name:

            document.getElementById(
                "userName"
            ).value,



        weight:

            document.getElementById(
                "userWeight"
            ).value,



        height:

            document.getElementById(
                "userHeight"
            ).value,



        goal:

            document.getElementById(
                "userGoal"
            ).value



    };







    localStorage.setItem(


        CONFIG.STORAGE_KEYS.SETTINGS,


        JSON.stringify(settings)


    );







    alert(

        "Impostazioni salvate ✅"

    );



}









// =======================================
// CANCELLA STORICO
// =======================================


function resetHistory(){



    const confirmDelete =


        confirm(

            "Vuoi davvero cancellare tutti gli allenamenti?"

        );







    if(!confirmDelete){

        return;

    }







    clearHistory();







    alert(

        "Storico cancellato ✅"

    );



}


// =======================================
// ESPORTA BACKUP
// =======================================


function exportBackup(){


    const backup = {

        version: CONFIG.VERSION,

        exportedAt: new Date().toISOString(),

        history:
            JSON.parse(
                localStorage.getItem(
                    CONFIG.STORAGE_KEYS.HISTORY
                ) || "[]"
            ),

        settings:
            JSON.parse(
                localStorage.getItem(
                    CONFIG.STORAGE_KEYS.SETTINGS
                ) || "{}"
            ),

        customWorkouts:
            JSON.parse(
                localStorage.getItem(
                    "customWorkouts"
                ) || "null"
            )

    };


    const blob =
        new Blob(
            [JSON.stringify(backup, null, 2)],
            { type: "application/json" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    const today =
        new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `gym-tracker-backup-${today}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    alert(
        "Backup esportato ✅"
    );


}




// =======================================
// RIPRISTINA BACKUP
// =======================================


function importBackup(event){


    const file =
        event.target.files[0];

    if(!file){

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function(e){


        let backup;

        try{

            backup =
                JSON.parse(e.target.result);

        }
        catch(error){

            alert(
                "File di backup non valido ❌"
            );

            return;

        }


        const confirmRestore =
            confirm(
                "Il ripristino sovrascriverà i dati attuali (storico, schede, impostazioni). Continuare?"
            );

        if(!confirmRestore){

            event.target.value = "";

            return;

        }


        if(Array.isArray(backup.history)){

            localStorage.setItem(
                CONFIG.STORAGE_KEYS.HISTORY,
                JSON.stringify(backup.history)
            );

        }


        if(backup.settings){

            localStorage.setItem(
                CONFIG.STORAGE_KEYS.SETTINGS,
                JSON.stringify(backup.settings)
            );

        }


        if(backup.customWorkouts){

            localStorage.setItem(
                "customWorkouts",
                JSON.stringify(backup.customWorkouts)
            );

        }


        alert(
            "Backup ripristinato ✅ Ricarico la pagina..."
        );

        event.target.value = "";

        window.location.reload();


    };


    reader.readAsText(file);


}



// =======================================
// CAMBIA NUMERO DI GIORNATE SETTIMANALI
// =======================================


function changeDayCount(value){


    const count =
        parseInt(value, 10);

    setDayCount(count);


    // Garantisce che ogni giornata attiva abbia
    // un array (anche vuoto) nei dati salvati,
    // senza mai cancellare giornate già compilate

    const saved =
        localStorage.getItem(
            "customWorkouts"
        );

    const workouts =
        saved ? JSON.parse(saved) : {};

    getActiveDayLetters().forEach(day=>{

        if(!workouts[day]){

            workouts[day] = [];

        }

    });

    localStorage.setItem(
        "customWorkouts",
        JSON.stringify(workouts)
    );


}



// Precompila il selettore con il valore salvato

document.addEventListener(
    "DOMContentLoaded",
    function(){

        const select =
            document.getElementById(
                "dayCountSelect"
            );

        if(select){

            select.value =
                getDayCount();

        }

    }
);
