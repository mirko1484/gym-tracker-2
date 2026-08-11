// =======================================
// GYM TRACKER
// SCELTA GIORNATA DA INIZIARE
// =======================================

let loggedInCustomerId = null;


document.addEventListener(
    "DOMContentLoaded",
    async function(){


        const profile =
            await requireAuth(["customer"]);

        if(!profile){

            return;

        }

        loggedInCustomerId =
            profile.id;


        loadWorkoutButtons();


    }
);




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




// =======================================
// AVVIO ALLENAMENTO SCELTO
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
