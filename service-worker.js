const CACHE_NAME = "gym-tracker-v1";


const FILES = [

    "./",
    "./index.html",
    "./workout.html",
    "./workout-manager.html",

    "./css/style.css",

    "./js/config.js",
    "./js/storage.js",
    "./js/app.js",
    "./js/workout.js",
    "./js/workout-manager.js",

    "./data/workouts.json"

];





self.addEventListener(
    "install",
    event => {


        event.waitUntil(

            caches.open(CACHE_NAME)

            .then(cache => {

                return cache.addAll(FILES);

            })

        );


    }
);







self.addEventListener(
    "fetch",
    event => {


        event.respondWith(

            caches.match(event.request)

            .then(response => {


                return response ||

                fetch(event.request);


            })

        );


    }
);