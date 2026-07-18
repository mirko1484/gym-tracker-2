// =======================================
// GYM TRACKER
// SETTINGS MANAGER
// =======================================



document.addEventListener(
    "DOMContentLoaded",
    function(){

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