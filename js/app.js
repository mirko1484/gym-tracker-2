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

    if(totalElement){

        totalElement.textContent =
            totalWorkouts;

    }

    if(lastElement){

        lastElement.textContent =
            lastWorkout;

    }

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
if("serviceWorker" in navigator){

    navigator.serviceWorker.register(
        "service-worker.js"
    );

}