/* 
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

    /* 
    Déclarations
    */
        const apiUrl = 'https://api.dwsapp.io';
        const registerForm = document.querySelector('#registerForm');
        const userEmail = document.querySelector('[name="userEmail"]');
        const userPassword = document.querySelector('[name="userPassword"]');
        const userPseudo = document.querySelector('[name="userPseudo"]');

        const loginForm = document.querySelector('#loginForm');
        const loginEmail = document.querySelector('[name="loginEmail"]');
        const loginPassword = document.querySelector('[name="loginPassword"]');

        const searchForm = document.querySelector('#searchForm');
        const searchLabel = document.querySelector('#searchForm span');
        const searchData = document.querySelector('[name="searchData"]');
        const themoviedbUrl = 'https://api.themoviedb.org/3/search/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&query=';
        const movieList = document.querySelector('#movieList');
        const moviePopin = document.querySelector('#moviePopin article');
    //

    /* 
    Fonctions
    */
        const checkUserToken = () => {
            fetch( `${apiUrl}/api/me` )
            .then( apiResponse => {
                return apiResponse.json()
            })
            .then(data => console.log(data))
            .catch( apiError => {
                console.log(apiError)
            })
        }
        const getFormSumbit = () => {
            // Get registerForm submit
            registerForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                // Check form data
                let formError = 0;

                if(userEmail.value.length < 5) { formError++ };
                if(userPassword.value.length < 5) { formError++ };
                if(userPseudo.value.length < 2) { formError++ };

                formError === 0
                ? postFetch('register', { 
                    email: userEmail.value, 
                    password: userPassword.value, 
                    pseudo: userPseudo.value 
                })
                : console.log('form not ok');
            });

            // Get loginForm submit
            loginForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                // Check form data
                let formError = 0;

                if(loginEmail.value.length < 5) { formError++ };
                if(loginPassword.value.length < 5) { formError++ };

                formError === 0
                ? postFetch('login', { 
                    email: loginEmail.value, 
                    password: loginPassword.value
                })
                : console.log('form not ok');
            });

            // Get searchForm submit
            searchForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                // Check form data
                searchData.value.length > 0 
                ? fetchFunction(searchData.value) 
                : displayError(searchData, 'Minimum 1 caractère');
            });
        };

        const postFetch = (endpoint, data) => {
            // Send POST Fetch
            fetch( `${apiUrl}/api/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then( apiResponse => {
                // Vérifier le status de la requête
                if( apiResponse.ok ){
                    // Extraire les données JSON de la réponse
                    return apiResponse.json();
                }
                else{
                    console.error(apiResponse.statusText);
                };
            })
            .then( jsonData => {
                console.log(jsonData);
            })
            .catch( apiError => {
                console.error(apiError);
            });
        }

        const displayError = (tag, msg) => {
            searchLabel.textContent = msg;
            tag.addEventListener('focus', () => searchLabel.textContent = '');
        };

        const fetchFunction = (keywords, index = 1) => {
            
            let fetchUrl = null;

            typeof keywords === 'number' 
            ? fetchUrl = `https://api.themoviedb.org/3/movie/${keywords}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f`
            : fetchUrl = themoviedbUrl + keywords + '&page=' + index


            fetch( fetchUrl )
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                typeof keywords === 'number' 
                ? displayPopin(jsonData)
                : displayMovieList(jsonData.results);
            })
            .catch( err => console.error(err) );
        };

        const displayMovieList = collection => {
            searchData.value = '';
            movieList.innerHTML = '';

            for( let i = 0; i < collection.length; i++ ){
                movieList.innerHTML += `
                    <article>
                        <figure>
                            <img src="https://image.tmdb.org/t/p/w500/${collection[i].poster_path}" alt="${collection[i].original_title}">
                            <figcaption movie-id="${collection[i].id}">
                                ${collection[i].original_title} (voir plus...)
                            </figcaption>
                        </figure>
                        <div class="overview">
                            <div>
                                <p>${collection[i].overview}</p>
                                <button>Voir le film</button>
                            </div>
                        </div>
                    </article>
                `;
            };

            getPopinLink( document.querySelectorAll('figcaption') );
        };

        const getPopinLink = linkCollection => {
            for( let link of linkCollection ){
                link.addEventListener('click', () => {
                    // +var = parseInt(var) || parseFloat(var)
                    fetchFunction( +link.getAttribute('movie-id') );
                });
            };
        };

        const displayPopin = data => {
            console.log(data);
            moviePopin.innerHTML = `
                <div>
                    <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${data.original_title}">
                </div>

                <div>
                    <h2>${data.original_title}</h2>
                    <p>${data.overview}</p>
                    <button>Voir en streaming</button>
                    <button id="closeButton">Close</button>
                </div>
            `;

            moviePopin.parentElement.classList.add('open');
            closePopin( document.querySelector('#closeButton') )
        };

        const closePopin = button => {
            button.addEventListener('click', () => {
                button.parentElement.parentElement.parentElement.classList.add('close');
                setTimeout( () => {
                    button.parentElement.parentElement.parentElement.classList.remove('open');
                    button.parentElement.parentElement.parentElement.classList.remove('close');
                }, 300 )
            })
        }
    //

    /* 
    Lancer IHM
    */
        getFormSumbit();
    //
});