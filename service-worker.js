const CACHE_NAME = "gym-tracker-v6";


const FILES = [

    "./",
    "./login.html",
    "./dashboard.html",
    "./admin.html",
    "./index.html",
    "./workout.html",
    "./workout-manager.html",
    "./history.html",
    "./progress.html",
    "./settings.html",

    "./css/style.css",

    "./js/config.js",
    "./js/storage.js",
    "./js/supabase-config.js",
    "./js/auth.js",
    "./js/app.js",
    "./js/workout.js",
    "./js/workout-manager.js",
    "./js/history.js",
    "./js/progress.js",
    "./js/settings.js",

    "./manifest.json",
    "./img/icon-192.png",
    "./img/icon-512.png",

    "./data/workouts.json",
    "./data/exercise-library.json",

    "./img/patterns/generale.svg",
    "./img/patterns/press-orizzontale.svg",
    "./img/patterns/press-verticale.svg",
    "./img/patterns/trazione-verticale.svg",
    "./img/patterns/trazione-orizzontale.svg",
    "./img/patterns/curl-braccia.svg",
    "./img/patterns/estensione-tricipiti.svg",
    "./img/patterns/squat.svg",
    "./img/patterns/affondo.svg",
    "./img/patterns/hip-hinge.svg",
    "./img/patterns/polpacci.svg",
    "./img/patterns/core-plank.svg",
    "./img/patterns/core-crunch.svg",
    "./img/patterns/core-twist.svg",
    "./img/patterns/cardio.svg"

];




// =======================================
// INSTALL: mette in cache tutti i file dell'app
// =======================================

self.addEventListener(
    "install",
    event => {

        self.skipWaiting();

        event.waitUntil(

            caches.open(CACHE_NAME)

            .then(cache => {

                return cache.addAll(FILES);

            })

        );

    }
);




// =======================================
// ACTIVATE: elimina le cache delle versioni precedenti
// =======================================

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys().then(cacheNames => {

                return Promise.all(

                    cacheNames

                    .filter(name => name !== CACHE_NAME)

                    .map(name => caches.delete(name))

                );

            })

            .then(() => self.clients.claim())

        );

    }
);




// =======================================
// FETCH: cache-first, con fallback di rete
// e salvataggio automatico dei nuovi file richiesti
// =======================================

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(event.request)

            .then(cachedResponse => {

                if(cachedResponse){

                    return cachedResponse;

                }

                return fetch(event.request)

                    .then(networkResponse => {

                        if(
                            networkResponse &&
                            networkResponse.status === 200 &&
                            event.request.method === "GET"
                        ){

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)

                                .then(cache => {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                });

                        }

                        return networkResponse;

                    })

                    .catch(() => cachedResponse);

            })

        );

    }
);
