// =======================================
// GYM TRACKER
// HOME DASHBOARD
// =======================================

let loggedInCustomerId = null;

// Cache in memoria dello storico, caricato una sola volta
let cachedHistory = [];


document.addEventListener(
    "DOMContentLoaded",
    async function () {


        const profile =
            await requireAuth(["customer"]);

        if(!profile){

            return;

        }

        loggedInCustomerId =
            profile.id;


        cachedHistory =
            await fetchHistory();


        loadProfile(profile);

        loadStatistics();

        loadLastWorkout();

        loadAchievements();


        loadWorkoutButtons();


    }
);




// =======================================
// CARICA STORICO DA SUPABASE (una volta sola)
// =======================================

async function fetchHistory(){


    const { data, error } =
        await supabaseClient
            .from("history")
            .select("*")
            .eq("customer_id", loggedInCustomerId)
            .order("created_at", { ascending: false });


    if(error){

        console.error(
            "Errore caricamento storico:",
            error
        );

        return [];

    }


    return data || [];


}




// =======================================
// PROFILO
// =======================================

function loadProfile(profile){


    const welcome =
        document.getElementById(
            "welcomeName"
        );

    const goalElement =
        document.getElementById(
            "profileGoal"
        );

    const avatar =
        document.querySelector(
            ".profileAvatar"
        );


    if(welcome){

        welcome.textContent =
            "Benvenuto " +
            (profile.full_name || "Atleta");

    }


    if(avatar && profile.avatar_url){

        avatar.innerHTML =
            `<img src="${profile.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;

    }


    if(goalElement){

        // Obiettivo/peso/altezza vivono in customer_settings:
        // li recuperiamo qui, senza bloccare il resto della pagina

        supabaseClient
            .from("customer_settings")
            .select("weight, height, goal")
            .eq("customer_id", loggedInCustomerId)
            .maybeSingle()
            .then(({ data: settings })=>{

                if(!settings){

                    return;

                }

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
                        " • " + settings.weight + " kg";

                }

                if(settings.height){

                    goalText +=
                        " • " + settings.height + " cm";

                }

                goalElement.textContent =
                    goalText;

            });

    }

}




// =======================================
// STATISTICHE
// =======================================

function loadStatistics(){


    const history =
        cachedHistory;

    const totalWorkouts =
        history.length;

    let totalSeconds = 0;

    history.forEach(function(workout){

        totalSeconds +=
            Number(workout.duration_seconds) || 0;

    });

    const totalMinutes =
        Math.floor(totalSeconds / 60);

    const totalHours =
        Math.floor(totalMinutes / 60);

    let averageTime = 0;

    if(totalWorkouts > 0){

        averageTime =
            Math.round(
                totalMinutes / totalWorkouts
            );

    }

    let lastWorkout = "--";

    if(history.length > 0){

        lastWorkout =
            new Date(history[0].created_at)
                .toLocaleDateString("it-IT");

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
        cachedHistory;



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



    (workout.exercises || []).forEach(

        exercise => {


            if(exercise.completed){

                completed++;

            }


        }

    );


    const dayNumber =
        DAY_LETTERS_POOL.indexOf(workout.day_letter) + 1;

    const dateLabel =
        new Date(workout.created_at)
            .toLocaleDateString("it-IT");

    const durationMinutes =
        Math.round((workout.duration_seconds || 0) / 60);




    container.innerHTML = `


        <div class="statRow">

            <span>

                Giorno

            </span>


            <span>

                ${dayNumber}

            </span>


        </div>



        <div class="statRow">

            <span>

                Data

            </span>


            <span>

                ${dateLabel}

            </span>


        </div>



        <div class="statRow">

            <span>

                Durata

            </span>


            <span>

                ${durationMinutes} min

            </span>


        </div>



        <div class="statRow">

            <span>

                Esercizi completati

            </span>


            <span>

                ${completed}

                /

                ${(workout.exercises || []).length}

            </span>


        </div>


    `;


}




// =======================================
// BADGE ATLETA
// =======================================

function loadAchievements(){


    const history =
        cachedHistory;



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


async function loadWorkoutButtons(){


    const { data: settingsRow } =
        await supabaseClient
            .from("customer_settings")
            .select("day_count")
            .eq("customer_id", loggedInCustomerId)
            .maybeSingle();

    const dayCount =
        (settingsRow && settingsRow.day_count) ?
            settingsRow.day_count :
            3;

    const days =
        DAY_LETTERS_POOL.slice(0, dayCount);


    const { data: scheduleRows } =
        await supabaseClient
            .from("schedules")
            .select("day_letter, exercises")
            .eq("customer_id", loggedInCustomerId);


    const workouts = {};

    days.forEach(day=>{

        const row =
            (scheduleRows || []).find(r => r.day_letter === day);

        workouts[day] =
            (row && row.exercises) ?
                row.exercises :
                [];

    });


    renderWorkoutButtons(workouts, days);


}




function renderWorkoutButtons(workouts, days){


    const container =
        document.getElementById(
            "workoutButtonsContainer"
        );

    if(!container){

        return;

    }

    let html = "";

    days.forEach((day, index)=>{


        const exercises =
            workouts[day] || [];

        const summary =
            exercises.length === 0 ?
                "Nessun esercizio" :
                [...new Set(
                    exercises.map(ex => ex.muscle)
                )].join(" • ");


        html += `

        <button
        class="dayButton ${getDayColorClass(index)}"
        onclick="startWorkout('${day}')">

        ${getDayIcon(index)} Giornata ${index + 1}

        <small>
        ${summary}
        </small>

        </button>

        `;


    });


    container.innerHTML = html;


}
if("serviceWorker" in navigator){

    navigator.serviceWorker.register(
        "service-worker.js"
    );

}