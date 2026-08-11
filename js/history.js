// =======================================
// GYM TRACKER
// HISTORY PAGE
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


        loadHistory();


    }
);




// =======================================
// CARICA STORICO (da Supabase)
// =======================================


async function loadHistory(){


    const container =
        document.getElementById(
            "historyContainer"
        );

    const count =
        document.getElementById(
            "historyCount"
        );

    if(!container){

        return;

    }


    const { data: history, error } =
        await supabaseClient
            .from("history")
            .select("*")
            .eq("customer_id", loggedInCustomerId)
            .order("created_at", { ascending: false });


    if(error){

        container.innerHTML =
            `<p class="librarySubtitle">Errore nel caricamento dello storico.</p>`;

        return;

    }


    if(count){

        count.textContent =
            history.length;

    }


    container.innerHTML = "";


    if(history.length === 0){

        container.innerHTML = `

            <section class="statsCard">

                <h2>
                    Nessun allenamento salvato
                </h2>

                <p>
                    Completa il tuo primo allenamento
                    per iniziare lo storico.
                </p>

            </section>

        `;

        return;

    }


    history.forEach(session=>{


        const card =
            document.createElement("section");

        card.className =
            "statsCard";


        const sessionDate =
            new Date(session.created_at);

        const dateLabel =
            sessionDate.toLocaleDateString("it-IT");

        const timeLabel =
            sessionDate.toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit"
            });

        const durationMinutes =
            Math.round((session.duration_seconds || 0) / 60);

        const dayNumber =
            DAY_LETTERS_POOL.indexOf(session.day_letter) + 1;


        card.innerHTML = `

            <h2>
                💪 Giornata ${dayNumber}
            </h2>

            <div class="statRow">
                <span>📅 Data</span>
                <span>${dateLabel}</span>
            </div>

            <div class="statRow">
                <span>⏰ Ora</span>
                <span>${timeLabel}</span>
            </div>

            <div class="statRow">
                <span>⏱ Durata</span>
                <span>${durationMinutes} min</span>
            </div>

            <hr>

            <h3>
                Esercizi
            </h3>

            ${createExerciseList(session.exercises || [])}

        `;


        container.appendChild(card);


    });


}




// =======================================
// CREA LISTA ESERCIZI
// =======================================


function createExerciseList(exercises){


    let html = "";


    exercises.forEach(exercise=>{


        html += `

            <div class="exerciseHistory">

                <span class="historyMuscle">
                    🏋 ${exercise.muscle || "Generale"}
                </span>

                <h3>
                    ${exercise.title}
                </h3>

        `;


        if(exercise.cardio){

            const minutes =
                Math.round((exercise.elapsedSeconds || 0) / 60);

            html += `

                <p>
                Durata: <strong>${minutes} min</strong>
                ${exercise.completed ? "✅" : ""}
                </p>

            `;

        }
        else if(exercise.sets){

            exercise.sets.forEach((set, index)=>{

                if(set.weight || set.reps){

                    html += `

                        <p>
                        Serie ${index + 1}:
                        <strong>${set.weight || 0} kg</strong>
                        x
                        <strong>${set.reps || 0}</strong>
                        </p>

                    `;

                }

            });

        }


        html += `

            </div>

            <hr>

        `;


    });


    return html;


}
