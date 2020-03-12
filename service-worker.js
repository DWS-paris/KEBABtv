/*
Gestion du cache
*/
    const staticAssets = [
        './',
        './img/loading.gif',
        './img/blankCover.jpg',
        './css/style.css',
        './js/app.js',
        './js/fetch.class.js',
        './js/pouchdb.min.js',
        './favicon.ico',
        './index.html',
        './fallback/no-movie.json'
    ];
//


/*
Gestion des événements
*/
    // Installation du service worker
    self.addEventListener('install', async event => {
        // Création d'un cache pour les données statiques
        const staticCache = await caches.open('static-assets');
        // Ajout des données statiques dans le cache 
        staticCache.addAll(staticAssets);
    })

    // Récupérer les données depuis le Service Worker
    self.addEventListener('fetch', event => {
        // Récupération des données de la requête
        const request = event.request;

        // Récupération de l'URL de la requête
        const url = new URL(request.url);

        // Gestion des stratégies de cache
        if( url.origin === location.origin ){
            // Récuperer les données depuis le cache
            event.respondWith( cacheFirst(request) );

        } else{
            // Récupérer les données depuis une API
            event.respondWith( networkFrist(request) );
        };
    });
//

/*
Définition des stratégies
*/
    const cacheFirst = async (request) => {
        // Vérifier la présence de données dans le cache
        const cachedResponse = await caches.match(request);

        // Renvoyer le résultat : données du cache ou depuis le server
        return cachedResponse || fetch(request);
    };

    const networkFrist = async (request) => {
        // Création d'un cache pour les données dynamiques
        const dynamicCache = await caches.open('dynamic-assets');

        // Récupération des données depuis une API
        try {
            // Ajout des données dans le cache dynamique en mode connecté
            const response = await fetch(request);
            dynamicCache.put( request, response.clone() );

            // Revoyer les données dans le vue
            return response;

        } catch (error) {
            // Récupérer les données du cache en mode hors-connexion
            const cachedResponse = await dynamicCache.match(request);

            // Renvoyer les données du cache ou les données du fallback
            return cachedResponse || await caches.match('./fallback/no-movie.json');
        };
    };
//