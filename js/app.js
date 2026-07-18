// =======================================
// GYM TRACKER
// HOME DASHBOARD
// =======================================

document.addEventListener(
    "DOMContentLoaded",
    function () {


        if(typeof getHistory === "function"){


            loadProfile();

            loadStatistics();

            loadLastWorkout();

            loadAchievements();


        }


        loadWorkoutButtons();


    }
);



// =======================================
// PROFILO
// =======================================

function loadProfile(){

    const saved =
        localStorage.getItem(
            CONFIG.STORAGE_KEYS.SETTINGS
        );

    if(!saved){

        return;

    }

    const settings =
        JSON.parse(saved);

    const welcome =
        document.getElementById(
            "welcomeName"
        );

    const goal =
        document.getElementById(
            "profileGoal"
        );

    if(welcome){

        welcome.textContent =
            "Benvenuto " +
            (settings.name || "Atleta");

    }

    if(goal){

        let goalText = "";

        switch(settings.goal){

            case "massa":
                goalText = "🎯 Massa Muscolare";
                break;

            case "definizione":
                goalText = "🎯 Definizione";
                break;

            case "forza":
                goalText = "🎯 Forza";
                break;

            default:
                goalText = "";
                break;

        }

        if(settings.weight){

            goalText +=
                " • " +
                settings.weight +
                " kg";

        }

        if(settings.height){

            goalText +=
                " • " +
                settings.height +
                " cm";

        }

        goal.textContent =
            goalText;

    }

}




// =======================================
// STATISTICHE HOME
// =======================================

function loadStatistics(){

    const history =
        getHistory();

    const totalWorkouts =
        history.length;

    let totalMinutes = 0;

    history.forEach(function(workout){

        totalMinutes +=
            Number(workout.duration) || 0;

    });

    const totalHours =
        Math.floor(
            totalMinutes / 60
        );

    let averageTime = 0;

    if(totalWorkouts > 0){

        averageTime =
            Math.round(
                totalMinutes /
                totalWorkouts
            );

    }

    let lastWorkout = "--";

    if(history.length > 0){

        lastWorkout =
            history[0].date;

    }

    const totalElement =
        document.getElementById(
            "totalWorkouts"
        );

    const lastElement =
        document.getElementById(
            "lastWorkout"
        );

    const hoursElement =
        document.getElementById(
            "totalHours"
        );

    const averageElement =
        document.getElementById(
            "averageTime"
        );

    if(totalElement){

        totalElement.textContent =
            totalWorkouts;

    }

    if(lastElement){

        lastElement.textContent =
            lastWorkout;

    }

    if(hoursElement){

        hoursElement.textContent =
            totalHours;

    }

    if(averageElement){

        averageElement.textContent =
            averageTime + " min";

    }

}




// =======================================
// AVVIO NUOVO ALLENAMENTO
// =======================================

function startWorkout(day){

    localStorage.setItem(
        "currentWorkout",
        day
    );

    localStorage.removeItem(
        "workoutStartTime"
    );

    localStorage.removeItem(
        "activeWorkout"
    );

    window.location.href =
        "workout.html";

}
// =======================================
// ULTIMO ALLENAMENTO
// =======================================

function loadLastWorkout(){


    const history =
        getHistory();



    const container =
        document.getElementById(
            "lastWorkoutInfo"
        );



    if(!container){

        return;

    }



    if(history.length === 0){


        container.innerHTML =
            "Nessun allenamento registrato";


        return;


    }



    const workout =
        history[0];



    let completed = 0;



    workout.exercises.forEach(

        exercise => {


            if(exercise.completed){

                completed++;

            }


        }

    );




    container.innerHTML = `


        <div class="statRow">

            <span>

                Giorno

            </span>


            <span>

                ${workout.day}

            </span>


        </div>



        <div class="statRow">

            <span>

                Data

            </span>


            <span>

                ${workout.date}

            </span>


        </div>



        <div class="statRow">

            <span>

                Durata

            </span>


            <span>

                ${workout.duration} min

            </span>


        </div>



        <div class="statRow">

            <span>

                Esercizi completati

            </span>


            <span>

                ${completed}

                /

                ${workout.exercises.length}

            </span>


        </div>


    `;


}






// =======================================
// BADGE ATLETA
// =======================================

function loadAchievements(){


    const history =
        getHistory();



    let badge = "";



    if(history.length >= 50){

        badge =
            "👑 Leggenda";

    }

    else if(history.length >= 25){

        badge =
            "🏆 Esperto";

    }

    else if(history.length >= 10){

        badge =
            "🔥 Costante";

    }

    else if(history.length >= 5){

        badge =
            "💪 Motivato";

    }

    else if(history.length >= 1){

        badge =
            "⭐ Primo Allenamento";

    }



    if(badge === ""){

        return;

    }





    const card =
        document.querySelector(
            ".profileCard"
        );



    if(!card){

        return;

    }





    const oldBadge =
        document.querySelector(
            ".badge"
        );



    if(oldBadge){

        oldBadge.remove();

    }





    card.insertAdjacentHTML(

        "beforeend",

        `

        <div class="badge">

            ${badge}

        </div>

        `

    );


}
// =======================================
// CARICA RIASSUNTO SCHEDE HOME
// =======================================


function loadWorkoutButtons(){


    let workouts = null;


    const saved =
        localStorage.getItem(
            "customWorkouts"
        );



    if(saved){


        workouts =
            JSON.parse(saved);


    }
    else{


        fetch(
            "data/workouts.json"
        )
        .then(response => response.json())
        .then(data => {

            updateWorkoutSummary(data);

        });


        return;


    }



    updateWorkoutSummary(workouts);



}





function updateWorkoutSummary(workouts){



    ["A","B","C"].forEach(day => {



        const element =
            document.getElementById(
                "day" + day + "Summary"
            );



        if(!element){

            return;

        }




        const exercises =
            workouts[day] || [];




        if(exercises.length === 0){


            element.textContent =
                "Nessun esercizio";


            return;


        }




        const muscles =
            [
                ...new Set(

                    exercises.map(
                        exercise =>
                        exercise.muscle
                    )

                )

            ];




        element.textContent =
            muscles.join(
                " • "
            );



    });



}
if("serviceWorker" in navigator){

    navigator.serviceWorker.register(
        "service-worker.js"
    );

}