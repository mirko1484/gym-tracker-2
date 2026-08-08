// =======================================
// AUTENTICAZIONE — GYM TRACKER PRO
// =======================================


// =======================================
// LOGIN
// =======================================

async function loginUser(email, password){


    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });


    if(error){

        return {
            success: false,
            message: "Email o password non corrette"
        };

    }


    const profile =
        await fetchOwnProfile();


    if(!profile){

        return {
            success: false,
            message: "Account senza profilo associato. Contatta un amministratore."
        };

    }


    if(
        profile.role !== "customer" &&
        !profile.is_approved
    ){

        await supabaseClient.auth.signOut();

        return {
            success: false,
            message: "Il tuo account è in attesa di approvazione da parte di un amministratore."
        };

    }


    return {
        success: true,
        profile: profile
    };


}




// =======================================
// LOGOUT
// =======================================

async function logoutUser(){

    await supabaseClient.auth.signOut();

    window.location.href = "login.html";

}




// =======================================
// RECUPERA IL PROFILO DELL'UTENTE LOGGATO
// =======================================

async function fetchOwnProfile(){


    const { data: { user } } =
        await supabaseClient.auth.getUser();


    if(!user){

        return null;

    }


    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


    if(error){

        return null;

    }


    return data;


}




// =======================================
// PROTEZIONE PAGINA
// Da chiamare in cima a ogni pagina che richiede login.
// allowedRoles: array di ruoli ammessi, es. ["admin"],
// o omesso per accettare qualunque ruolo autenticato.
// =======================================

async function requireAuth(allowedRoles){


    const { data: { session } } =
        await supabaseClient.auth.getSession();


    if(!session){

        window.location.href = "login.html";

        return null;

    }


    const profile =
        await fetchOwnProfile();


    if(!profile){

        await supabaseClient.auth.signOut();

        window.location.href = "login.html";

        return null;

    }


    if(
        profile.role !== "customer" &&
        !profile.is_approved
    ){

        await supabaseClient.auth.signOut();

        window.location.href =
            "login.html?pending=1";

        return null;

    }


    if(
        allowedRoles &&
        !allowedRoles.includes(profile.role)
    ){

        // Ruolo non ammesso su questa pagina:
        // rimanda ciascuno alla propria area

        window.location.href =
            "dashboard.html";

        return null;

    }


    return profile;


}
