// =======================================
// PANNELLO AMMINISTRAZIONE
// =======================================


document.addEventListener("DOMContentLoaded", async function(){


    const profile =
        await requireAuth(["admin"]);

    if(!profile){

        return;

    }


    loadTrainers();

    loadCustomers();


});




// =======================================
// MESSAGGI DI STATO
// =======================================

function showInviteMessage(text, isError){


    const box =
        document.getElementById("inviteMessage");

    if(!box){
        return;
    }

    box.textContent = text;

    box.style.display = "block";

    box.style.padding = "12px 14px";

    box.style.borderRadius = "10px";

    box.style.marginBottom = "16px";

    box.style.fontSize = "14px";

    box.style.background =
        isError ?
            "rgba(255,68,35,.15)" :
            "rgba(47,217,124,.15)";

    box.style.color =
        isError ? "#ff4423" : "#2fd97c";


}




// =======================================
// INVITA UTENTE
// =======================================

async function handleInvite(){


    const nameInput =
        document.getElementById("inviteName");

    const emailInput =
        document.getElementById("inviteEmail");

    const roleSelect =
        document.getElementById("inviteRole");

    const button =
        document.getElementById("inviteButton");


    const full_name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const role =
        roleSelect.value;


    if(!full_name || !email){

        showInviteMessage(
            "Inserisci nome ed email",
            true
        );

        return;

    }


    button.disabled = true;

    button.textContent = "Invio in corso...";


    const { data, error } =
        await supabaseClient.functions.invoke(
            "quick-function",
            {
                body: {
                    email: email,
                    full_name: full_name,
                    role: role
                }
            }
        );


    button.disabled = false;

    button.textContent = "Invia invito";


    if(error || (data && data.error)){


        let message =
            "Errore durante l'invio dell'invito";


        // Quando la funzione risponde con un errore HTTP
        // (400/401/403/500), il messaggio vero sta dentro
        // error.context (la risposta originale), non in data.

        if(
            error &&
            error.context &&
            typeof error.context.json === "function"
        ){

            try{

                const body =
                    await error.context.json();

                if(body && body.error){

                    message = body.error;

                }

            }
            catch(parseError){

                // risposta non in JSON: teniamo il messaggio generico

            }

        }
        else if(data && data.error){

            message = data.error;

        }
        else if(error && error.message){

            message = error.message;

        }


        showInviteMessage(
            message,
            true
        );

        return;

    }


    showInviteMessage(
        "Invito inviato a " + email + " ✅",
        false
    );

    nameInput.value = "";

    emailInput.value = "";


    loadTrainers();

    loadCustomers();


}




// =======================================
// LISTA TRAINER
// =======================================

async function loadTrainers(){


    const container =
        document.getElementById("trainersList");

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("role", "trainer")
            .order("created_at", { ascending: false });


    if(error){

        container.innerHTML =
            `<p class="librarySubtitle">Errore nel caricamento</p>`;

        return;

    }


    if(!data || data.length === 0){

        container.innerHTML =
            `<p class="librarySubtitle">Nessun trainer ancora invitato</p>`;

        return;

    }


    container.innerHTML = "";


    data.forEach(trainer=>{


        const row =
            document.createElement("div");

        row.className = "libraryCard";

        row.innerHTML = `

        <div class="libraryCardInfo">
            <strong>${trainer.full_name}</strong>
            <span>${trainer.email || ""} ${trainer.is_approved ? "· Attivo" : "· Sospeso"}</span>
        </div>

        <button
        class="secondaryButton"
        style="width:auto;padding:10px 14px;"
        onclick="toggleApproval('${trainer.id}', ${trainer.is_approved})">
        ${trainer.is_approved ? "Sospendi" : "Riattiva"}
        </button>

        `;

        container.appendChild(row);


    });


}




// =======================================
// LISTA CLIENTI
// =======================================

async function loadCustomers(){


    const container =
        document.getElementById("customersList");

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("role", "customer")
            .order("created_at", { ascending: false });


    if(error){

        container.innerHTML =
            `<p class="librarySubtitle">Errore nel caricamento</p>`;

        return;

    }


    if(!data || data.length === 0){

        container.innerHTML =
            `<p class="librarySubtitle">Nessun cliente ancora invitato</p>`;

        return;

    }


    container.innerHTML = "";


    data.forEach(customer=>{


        const row =
            document.createElement("div");

        row.className = "libraryCard";

        row.innerHTML = `

        <div class="libraryCardInfo">
            <strong>${customer.full_name}</strong>
            <span>${customer.email || ""}</span>
        </div>

        `;

        container.appendChild(row);


    });


}




// =======================================
// SOSPENDI / RIATTIVA UN TRAINER
// =======================================

async function toggleApproval(id, currentState){


    const { error } =
        await supabaseClient
            .from("profiles")
            .update({ is_approved: !currentState })
            .eq("id", id);


    if(error){

        alert("Errore durante l'aggiornamento");

        return;

    }


    loadTrainers();


}




// =======================================
// IMPORTA CATALOGO ESERCIZI (WorkoutX)
// =======================================

function showImportMessage(text, isError){

    const box =
        document.getElementById("importMessage");

    if(!box){
        return;
    }

    box.textContent = text;

    box.style.display = "block";
    box.style.padding = "12px 14px";
    box.style.borderRadius = "10px";
    box.style.marginBottom = "16px";
    box.style.fontSize = "14px";
    box.style.whiteSpace = "pre-wrap";
    box.style.wordBreak = "break-word";
    box.style.maxHeight = "300px";
    box.style.overflowY = "auto";

    box.style.background =
        isError ?
            "rgba(255,68,35,.15)" :
            "rgba(47,217,124,.15)";

    box.style.color =
        isError ? "#ff4423" : "#2fd97c";

}


async function handleImportCatalog(){


    const button =
        document.getElementById("importButton");

    button.disabled = true;

    button.textContent = "Importazione in corso... (può richiedere un minuto)";


    const { data: rawData, error } =
        await supabaseClient.functions.invoke(
            "import-exercises",
            { body: {} }
        );


    // Protezione: se per qualche motivo la risposta arriva
    // come testo grezzo invece che oggetto già interpretato,
    // proviamo a interpretarla comunque invece di ignorarla

    let data = rawData;

    if(typeof rawData === "string"){

        try{
            data = JSON.parse(rawData);
        }
        catch(parseError){
            data = rawData;
        }

    }


    button.disabled = false;

    button.textContent = "Importa catalogo da WorkoutX";


    if(error){

        let message =
            "Errore durante l'importazione";

        if(
            error.context &&
            typeof error.context.json === "function"
        ){

            try{

                const body =
                    await error.context.json();

                if(body && body.error){

                    message = body.error;

                }

            }
            catch(parseError){}

        }
        else if(error.message){

            message = error.message;

        }

        showImportMessage(message, true);

        return;

    }


    if(data && data.error){

        let message = data.error;

        if(data.quota_remaining !== undefined && data.quota_remaining !== null){

            message +=
                "\n\nQuota WorkoutX rimanente: " +
                data.quota_remaining;

        }

        if(data.attempts){

            message +=
                "\n\nDettagli tecnici:\n" +
                JSON.stringify(data.attempts, null, 2).slice(0, 1200);

        }

        showImportMessage(message, true);

        return;

    }


    let successMessage =
        "Catalogo importato ✅ " +
        (data.imported || 0) +
        " esercizi disponibili nella libreria.";

    if(data.quota_remaining !== undefined && data.quota_remaining !== null){

        successMessage +=
            "\n\nQuota WorkoutX rimanente: " +
            data.quota_remaining;

    }

    showImportMessage(successMessage, false);


}
