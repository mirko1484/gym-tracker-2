// =======================================
// GYM TRACKER
// PROGRESS PAGE
// =======================================


let loggedInCustomerId = null;

// Cache in memoria dello storico, caricato una sola volta
let cachedHistory = null;


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


        cachedHistory =
            await fetchHistory();


        loadGeneralStats();

        loadRecords();

        loadMuscleStats();

        populateExerciseProgressSelect();


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
            .order("created_at", { ascending: true });


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
// STATISTICHE GENERALI
// =======================================


function loadGeneralStats(){


    const container =
        document.getElementById(
            "generalStats"
        );

    if(!container){

        return;

    }


    const history =
        cachedHistory || [];


    container.innerHTML = `

        <div class="statRow">
            <span>Allenamenti</span>
            <span>${history.length}</span>
        </div>

    `;


}




// =======================================
// RECORD PERSONALI
// (peso massimo sollevato per ciascun esercizio)
// =======================================


function loadRecords(){


    const container =
        document.getElementById(
            "records"
        );

    if(!container){

        return;

    }


    const history =
        cachedHistory || [];


    let records = {};


    history.forEach(session=>{

        (session.exercises || []).forEach(exercise=>{

            if(exercise.cardio || !exercise.sets){

                return;

            }

            exercise.sets.forEach(set=>{

                const weight =
                    Number(set.weight) || 0;

                if(weight > 0){

                    if(
                        !records[exercise.title] ||
                        weight > records[exercise.title]
                    ){

                        records[exercise.title] =
                            weight;

                    }

                }

            });

        });

    });


    if(Object.keys(records).length === 0){

        container.innerHTML =
            "Nessun record disponibile";

        return;

    }


    let html = "";


    Object.keys(records).forEach(exercise=>{

        html += `

            <div class="statRow">
                <span>${exercise}</span>
                <span>${records[exercise]} kg</span>
            </div>

        `;

    });


    container.innerHTML =
        html;


}




// =======================================
// MUSCOLI ALLENATI
// =======================================


function loadMuscleStats(){


    const container =
        document.getElementById(
            "muscleStats"
        );

    if(!container){

        return;

    }


    const history =
        cachedHistory || [];


    let muscles = {};


    history.forEach(session=>{

        (session.exercises || []).forEach(exercise=>{

            const muscle =
                exercise.muscle || "Generale";

            if(!muscles[muscle]){

                muscles[muscle] = 0;

            }

            muscles[muscle]++;

        });

    });


    if(Object.keys(muscles).length === 0){

        container.innerHTML =
            "Nessun dato disponibile";

        return;

    }


    let html = "";


    Object.keys(muscles).forEach(muscle=>{

        html += `

            <div class="statRow">
                <span>💪 ${muscle}</span>
                <span>${muscles[muscle]} volte</span>
            </div>

        `;

    });


    container.innerHTML =
        html;


}




// =======================================
// PROGRESSI PER ESERCIZIO
// =======================================


function populateExerciseProgressSelect(){


    const select =
        document.getElementById(
            "exerciseProgressSelect"
        );

    if(!select){

        return;

    }


    const history =
        cachedHistory || [];


    const titles =
        new Set();


    history.forEach(session=>{

        (session.exercises || []).forEach(exercise=>{

            const hasWeightData =
                !exercise.cardio &&
                exercise.sets &&
                exercise.sets.some(set => Number(set.weight) > 0);

            const hasCardioData =
                exercise.cardio &&
                Number(exercise.elapsedSeconds) > 0;

            if(hasWeightData || hasCardioData){

                titles.add(exercise.title);

            }

        });

    });


    if(titles.size === 0){

        select.innerHTML =
            `<option value="">Nessun esercizio con pesi registrato</option>`;

        return;

    }


    let html =
        `<option value="">Seleziona un esercizio...</option>`;


    [...titles].sort().forEach(title=>{

        html +=
            `<option value="${title}">${title}</option>`;

    });


    select.innerHTML =
        html;


}


let progressChartInstance = null;


function loadExerciseProgressChart(exerciseTitle){


    const canvas =
        document.getElementById(
            "exerciseProgressChart"
        );

    const emptyMessage =
        document.getElementById(
            "exerciseProgressEmpty"
        );

    if(!canvas){

        return;

    }


    if(progressChartInstance){

        progressChartInstance.destroy();

        progressChartInstance = null;

    }


    if(!exerciseTitle){

        canvas.style.display = "none";

        if(emptyMessage){
            emptyMessage.style.display = "none";
        }

        return;

    }


    const history =
        cachedHistory || [];


    const labels = [];

    const values = [];

    let isCardioExercise = false;


    history.forEach(session=>{

        const exercise =
            (session.exercises || []).find(
                ex => ex.title === exerciseTitle
            );

        if(!exercise){

            return;

        }


        if(exercise.cardio){

            isCardioExercise = true;

            const minutes =
                Math.round((Number(exercise.elapsedSeconds) || 0) / 60);

            if(minutes > 0){

                labels.push(

                    new Date(session.created_at)
                        .toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "2-digit"
                        })

                );

                values.push(minutes);

            }

            return;

        }


        if(!exercise.sets){

            return;

        }


        const maxWeight =
            Math.max(
                0,
                ...exercise.sets.map(set => Number(set.weight) || 0)
            );


        if(maxWeight > 0){

            labels.push(

                new Date(session.created_at)
                    .toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "2-digit"
                    })

            );

            values.push(maxWeight);

        }

    });


    if(values.length === 0){

        canvas.style.display = "none";

        if(emptyMessage){
            emptyMessage.style.display = "block";
        }

        return;

    }


    canvas.style.display = "block";

    if(emptyMessage){
        emptyMessage.style.display = "none";
    }


    if(typeof Chart === "undefined"){

        console.error(
            "Chart.js non caricato"
        );

        return;

    }


    progressChartInstance = new Chart(
        canvas,
        {

            type: "line",

            data: {

                labels,

                datasets: [{

                    label:
                        exerciseTitle +
                        (isCardioExercise ? " (min)" : " (kg)"),

                    data: values,

                    borderColor:
                        "#ffb800",

                    backgroundColor:
                        "rgba(255,184,0,0.15)",

                    tension: 0.3

                }]

            },

            options: {

                responsive: true,

                plugins: {

                    legend: {

                        labels: {

                            color: "white"

                        }

                    }

                },

                scales: {

                    x: {

                        ticks: {

                            color: "white"

                        }

                    },

                    y: {

                        ticks: {

                            color: "white"

                        }

                    }

                }

            }

        }
    );


}
