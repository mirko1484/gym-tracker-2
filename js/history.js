// =======================================
// GYM TRACKER
// HISTORY PAGE
// =======================================



document.addEventListener(
    "DOMContentLoaded",
    function(){


        loadHistory();


    }
);







// =======================================
// CARICA STORICO
// =======================================


function loadHistory(){



    if(typeof getHistory !== "function"){

        console.error(
            "getHistory non disponibile"
        );

        return;

    }




    const history =
        getHistory();





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








    history.forEach(

        session => {



            const card =
                document.createElement(
                    "section"
                );




            card.className =
                "statsCard";







            card.innerHTML = `



                <h2>

                    💪 Giornata ${session.day}

                </h2>





                <div class="statRow">


                    <span>

                        📅 Data

                    </span>


                    <span>

                        ${session.date}

                    </span>


                </div>





                <div class="statRow">


                    <span>

                        ⏰ Ora

                    </span>


                    <span>

                        ${session.time}

                    </span>


                </div>





                <div class="statRow">


                    <span>

                        ⏱ Durata

                    </span>


                    <span>

                        ${session.duration || 0}
                        min

                    </span>


                </div>





                <div class="statRow">


                    <span>

                        🏋 Volume

                    </span>


                    <span>

                        ${calculateVolume(session.exercises)}
                        kg

                    </span>


                </div>





                <hr>




                <h3>

                    Esercizi

                </h3>





                ${createExerciseList(
                    session.exercises
                )}



            `;






            container.appendChild(card);



        }

    );



}









// =======================================
// CREA LISTA ESERCIZI
// =======================================


function createExerciseList(exercises){



    let html = "";





    exercises.forEach(

        exercise => {




            html += `



            <div class="exerciseHistory">





                <span class="historyMuscle">


                    🏋 
                    ${exercise.muscle || "Generale"}


                </span>





                <h3>


                    ${exercise.title}


                </h3>







            `;








            exercise.sets.forEach(

                (set,index)=>{






                    if(
                        set.weight ||
                        set.reps
                    ){



                        html += `



                        <p>


                        Serie ${index + 1}:

                        <strong>

                        ${set.weight || 0}
                        kg

                        </strong>


                        x


                        <strong>

                        ${set.reps || 0}

                        </strong>


                        </p>



                        `;



                    }




                }

            );






            html += `


            </div>



            <hr>



            `;





        }

    );






    return html;



}









// =======================================
// CALCOLO VOLUME TOTALE
// =======================================


function calculateVolume(exercises){



    let volume = 0;






    exercises.forEach(

        exercise => {



            exercise.sets.forEach(

                set => {





                    const weight =
                        Number(set.weight) || 0;




                    const reps =
                        Number(set.reps) || 0;






                    volume +=
                        weight * reps;




                }

            );



        }

    );






    return volume;



}