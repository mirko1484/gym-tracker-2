// =======================================
// GYM TRACKER
// SETTINGS MANAGER
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

        loadSettings(profile);

    }
);




// =======================================
// CARICAMENTO IMPOSTAZIONI (da Supabase)
// =======================================


async function loadSettings(profile){


    const nameInput =
        document.getElementById("userName");

    const weightInput =
        document.getElementById("userWeight");

    const heightInput =
        document.getElementById("userHeight");

    const goalInput =
        document.getElementById("userGoal");

    const avatarPreview =
        document.getElementById("avatarPreview");


    if(nameInput){

        nameInput.value =
            profile.full_name || "";

    }


    if(avatarPreview && profile.avatar_url){

        avatarPreview.innerHTML =
            `<img src="${profile.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;

    }


    const { data: customerSettings } =
        await supabaseClient
            .from("customer_settings")
            .select("weight, height, goal")
            .eq("customer_id", loggedInCustomerId)
            .maybeSingle();


    if(customerSettings){

        if(weightInput){

            weightInput.value =
                customerSettings.weight || "";

        }

        if(heightInput){

            heightInput.value =
                customerSettings.height || "";

        }

        if(goalInput && customerSettings.goal){

            goalInput.value =
                customerSettings.goal;

        }

    }


}




// =======================================
// SALVATAGGIO IMPOSTAZIONI (su Supabase)
// =======================================


async function saveSettings(){


    const fullName =
        document.getElementById("userName").value.trim();

    const weight =
        document.getElementById("userWeight").value;

    const height =
        document.getElementById("userHeight").value;

    const goal =
        document.getElementById("userGoal").value;


    const { error: profileError } =
        await supabaseClient
            .from("profiles")
            .update({ full_name: fullName || "Atleta" })
            .eq("id", loggedInCustomerId);


    const { error: settingsError } =
        await supabaseClient
            .from("customer_settings")
            .upsert(
                {
                    customer_id: loggedInCustomerId,
                    weight: weight ? Number(weight) : null,
                    height: height ? Number(height) : null,
                    goal: goal
                },
                { onConflict: "customer_id" }
            );


    if(profileError || settingsError){

        alert(
            "Errore durante il salvataggio. Riprova."
        );

        return;

    }


    alert(

        "Impostazioni salvate ✅"

    );


}




// =======================================
// FOTO PROFILO
// =======================================


async function handleAvatarUpload(event){


    const file =
        event.target.files[0];

    if(!file){

        return;

    }


    const status =
        document.getElementById(
            "avatarUploadStatus"
        );

    if(status){

        status.style.display = "block";
        status.textContent = "Caricamento in corso...";
        status.style.color = "#8b8d92";

    }


    try{

        const resizedBlob =
            await resizeImageFile(file, 400, 400, 0.85);


        const filePath =
            loggedInCustomerId + "/avatar.jpg";


        const { error: uploadError } =
            await supabaseClient.storage
                .from("avatars")
                .upload(
                    filePath,
                    resizedBlob,
                    {
                        upsert: true,
                        contentType: "image/jpeg"
                    }
                );


        if(uploadError){

            throw uploadError;

        }


        const { data: urlData } =
            supabaseClient.storage
                .from("avatars")
                .getPublicUrl(filePath);

        // Aggiunge un parametro casuale per evitare che il browser
        // mostri ancora la vecchia foto in cache dopo la sostituzione

        const freshUrl =
            urlData.publicUrl + "?t=" + Date.now();


        const { error: profileError } =
            await supabaseClient
                .from("profiles")
                .update({ avatar_url: freshUrl })
                .eq("id", loggedInCustomerId);


        if(profileError){

            throw profileError;

        }


        const avatarPreview =
            document.getElementById(
                "avatarPreview"
            );

        if(avatarPreview){

            avatarPreview.innerHTML =
                `<img src="${freshUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;

        }


        if(status){

            status.textContent = "Foto aggiornata ✅";
            status.style.color = "#2fd97c";

        }


    }
    catch(err){

        if(status){

            status.textContent =
                "Errore nel caricamento della foto";

            status.style.color = "#ff4423";

        }

    }


}




// Ridimensiona l'immagine sul dispositivo prima di caricarla
// (le foto degli smartphone sono spesso enormi, non serve
// caricarle a piena risoluzione per un'icona profilo)

function resizeImageFile(file, maxWidth, maxHeight, quality){


    return new Promise((resolve, reject)=>{


        const reader =
            new FileReader();


        reader.onload = function(e){


            const img =
                new Image();


            img.onload = function(){


                let width = img.width;

                let height = img.height;


                if(width > height){

                    if(width > maxWidth){

                        height =
                            height * (maxWidth / width);

                        width = maxWidth;

                    }

                }
                else{

                    if(height > maxHeight){

                        width =
                            width * (maxHeight / height);

                        height = maxHeight;

                    }

                }


                const canvas =
                    document.createElement("canvas");

                canvas.width = width;

                canvas.height = height;


                canvas.getContext("2d")
                    .drawImage(img, 0, 0, width, height);


                canvas.toBlob(

                    blob=>{

                        if(blob){

                            resolve(blob);

                        }
                        else{

                            reject(
                                new Error("Impossibile elaborare l'immagine")
                            );

                        }

                    },
                    "image/jpeg",
                    quality

                );


            };


            img.onerror =
                () => reject(new Error("Immagine non valida"));


            img.src =
                e.target.result;


        };


        reader.onerror =
            () => reject(new Error("Impossibile leggere il file"));


        reader.readAsDataURL(file);


    });


}




// =======================================
// CANCELLA STORICO (da Supabase)
// =======================================


async function resetHistory(){


    const confirmDelete =
        confirm(
            "Vuoi davvero cancellare tutti gli allenamenti? L'operazione non è reversibile."
        );

    if(!confirmDelete){

        return;

    }


    const { error } =
        await supabaseClient
            .from("history")
            .delete()
            .eq("customer_id", loggedInCustomerId);


    if(error){

        alert(
            "Errore durante la cancellazione. Riprova."
        );

        return;

    }


    alert(
        "Storico cancellato ✅"
    );


}
