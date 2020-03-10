/* 
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

    /* 
    Déclarations
    */  
        const localSt = 'qsekjh';
        const mainNav = document.querySelector('header nav');
        const apiUrl = 'http://localhost:8898';
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
        const favoriteList = document.querySelector('#favorite ul');
        const loading = document.querySelector('#loading');

        // https://vsrequest.video/request.php?key=oh61giHx16GXKSIz&secret_key=h9oe5ezesk0c0f9zk143zpkd7tba63&video_id=348&tmdb=1&ip=77.204.106.81
    //

    /* 
    Fonctions
    */
        const checkUserToken = token => {
            return new Promise( ( resolve, reject ) => {
                fetch( `${apiUrl}/api/me/${token}` )
                .then( apiResponse => {
                    return apiResponse.json()
                })
                .then(data => resolve(data))
                .catch( apiError => reject(apiError))
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
                if(searchData.value.length > 0){
                    loading.classList.add('open'); 
                    setTimeout(() => { fetchFunction(searchData.value) }, 600);
                }
                else{
                    displayError(searchData, 'Minimum 1 caractère');
                }
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
                if( endpoint === 'login' ){
                    // Add user ID in LocalStorage
                    localStorage.setItem(localSt, jsonData.data.identity._id);

                    checkUserToken(jsonData.data.identity._id)
                    .then( apiResponse => {
                        registerForm.classList.add('hidden');
                        loginForm.classList.add('hidden');
                        displayNav(apiResponse.data.user.pseudo)
                        searchForm.classList.add('open');
                        if( apiResponse.data.favorite.length > 0 ){
                            displayFavorite(apiResponse.data.favorite)
                        }
                    })
                    .catch( err => {
                        console.log(err)
                    } )
                }
                else if( endpoint === 'favorite' ){
                    console.log(jsonData)
                    checkUserToken(localStorage.getItem(localSt))
                    .then( apiResponse => {
                        displayFavorite(apiResponse.data.favorite)
                    } )
                }
            })
            .catch( apiError => {
                console.error(apiError);
            });
        }

        const deleteFetch = id => {
            console.log(id)
            fetch( `${apiUrl}/api/favorite/${id}`, {
                method: 'DELETE'
            })
            .then( apiResponse => {
                console.log(apiResponse)
            })
            .catch( apiError => {
                console.log(apiError)
            })
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
                let cover = collection[i].poster_path !== null ? 'https://image.tmdb.org/t/p/w500/' + collection[i].poster_path : './img/blankCover.jpg'
                movieList.innerHTML += `
                    <article>
                        <figure>
                            <img src="${cover}" alt="${collection[i].original_title}">
                            <figcaption movie-id="${collection[i].id}">${collection[i].original_title}</figcaption>
                        </figure>
                    </article>
                `;
            };

            getPopinLink( document.querySelectorAll('figcaption') );
            closeLoading();
            
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
            let productions = '';
            for( let item of data.production_companies ){ productions += `<span>${item.name}</span>` }

            if( localStorage.getItem(localSt) !== null ){
                let cover = data.poster_path !== null ? 'https://image.tmdb.org/t/p/w500/' + data.poster_path : './img/blankCover.jpg'
                moviePopin.innerHTML = `
                    <div>
                        <img src="${cover }" alt="${data.original_title}">
                    </div>

                    <div>
                        <h2>${data.original_title} <b>${productions}</b></h2>
                        <p id="movieTagline">${data.overview}</p>
                        <p id="movieVote"><b>${data.vote_average}/10</b> <span>for ${data.vote_count} votes</span></p>
                        <button><i class="fas fa-ticket-alt"></i> <span>Get the stream</span></button>
                        <button id="favoriteButton"><i class="fas fa-bookmark"></i></button>
                        <button id="closeButton"><i class="fas fa-times"></i></button>
                    </div>
                `;
                addFavorite(document.querySelector('#favoriteButton'), data)
            }
            else{
                moviePopin.innerHTML = `
                    <div>
                        <img src="https://image.tmdb.org/t/p/w500/${data.poster_path}" alt="${data.original_title}">
                    </div>

                    <div>
                        <h2>${data.original_title}</h2>
                        <p>${data.overview}</p>
                        <button><i class="fas fa-ticket-alt"></i> <span>Voir le film</span></button>
                        <button id="closeButton"><i class="fas fa-times"></i></button>
                    </div>
                `;
            }

            moviePopin.parentElement.classList.add('open');
            closePopin( document.querySelector('#closeButton') )
            
        };

        const closePopin = button => {
            button.addEventListener('click', () => {
                button.parentElement.parentElement.parentElement.classList.remove('open');
            })
        }

        const displayNav = pseudo => {
            mainNav.innerHTML = `
                <p>Hello ${pseudo}</p>
                <button id="logoutBtn"><i class="fas fa-sign-out-alt"></i></button>
            `;

            mainNav.classList.remove('hidden')

            document.querySelector('#logoutBtn').addEventListener('click', () => {
                // Delete LocalStorage
                localStorage.removeItem(localSt);
                mainNav.innerHTML= '';
                favoriteList.innerHTML= '';
                registerForm.classList.remove('hidden');
                loginForm.classList.remove('hidden');
                favoriteList.classList.remove('open');
                favorite.classList.remove('open');
                searchForm.classList.remove('open');
            })
        }

        const addFavorite = (tag, data) => {
            tag.addEventListener('click', () => {
                postFetch('favorite', { 
                    author: localStorage.getItem(localSt),
                    id: data.id,
                    title: data.original_title
                })
            })
        }

        const displayFavorite = data => {
            favoriteList.innerHTML = '';
            for(let item of data){
                favoriteList.innerHTML += `
                    <li>
                        <button class="eraseFavorite" movie-id="${item.id}"><i class="fas fa-eraser"></i></button>
                        <span  movie-id="${item.id}">${item.title}</span>
                    </li>
                `;
            };
            document.querySelector('#favorite').classList.add('open');
            getPopinLink( document.querySelectorAll('#favorite li span') );
            deleteFavorite(document.querySelectorAll('.eraseFavorite'))
        }

        const deleteFavorite = favorites => {
            for( let item of favorites ){
                item.addEventListener('click', () => {
                    deleteFetch(item.getAttribute('movie-id'))
                })
            }
        }

        const closeLoading = () => {
            loading.classList.add('close');
            setTimeout(() => { 
                loading.classList.remove('open');
                loading.classList.remove('close');
            }, 600);
        }
    //

    /* 
    Lancer IHM
    */
        if( localStorage.getItem(localSt) !== null ){
            
            checkUserToken(localStorage.getItem(localSt))
            .then( apiResponse => {
                if( apiResponse.data.favorite.length > 0 ){
                    displayFavorite(apiResponse.data.favorite)
                }

                registerForm.classList.add('hidden');
                loginForm.classList.add('hidden');
                searchForm.classList.add('open');
                displayNav(apiResponse.data.user.pseudo)
                getFormSumbit();
            })
            .catch( err => {
                console.log(err)
                getFormSumbit();
            } )
        }
        else{
            getFormSumbit();
        }

        // https://vsrequest.video/request.php?key=oh61giHx16GXKSIz&secret_key=h9oe5ezesk0c0f9zk143zpkd7tba63&video_id=*VIDEO_ID*&tmdb=*TMDB*&tv=*TV*&s=*SEASON_NUMBER*&ip=*VISITOR_IP* http://127.0.0.1:8080

        fetch('https://vsrequest.video/request.php?key=oh61giHx16GXKSIz&secret_key=h9oe5ezesk0c0f9zk143zpkd7tba63&video_id=348&tmdb=1&ip=77.204.106.82')
        .then( spiderVideoResponse => {
            console.log(spiderVideoResponse)
        })
        .catch( spiderVideoError => {
            console.log(spiderVideoError)
        })
        
    //
});