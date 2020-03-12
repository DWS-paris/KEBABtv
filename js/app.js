/* 
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

    /* 
    Déclarations
    */  
        const localSt = 'qsekjh';
        const mainNav = document.querySelector('header nav');
        const apiUrl = 'https://api.dwsapp.io';
        const registerForm = document.querySelector('#registerForm');
        const userEmail = document.querySelector('[name="userEmail"]');
        const userPassword = document.querySelector('[name="userPassword"]');
        const userPseudo = document.querySelector('[name="userPseudo"]');

        const chatForm = document.querySelector('#chatboxe form');
        const chatMessage = document.querySelector('#chatMessage');

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

        /* 
        PouchDB
        */
            const localDB = new PouchDB('chat_room');
            const remoteDB = new PouchDB('https://couch.dwsapp.io/chat_room/');

            localDB.replicate.to(remoteDB);
            localDB.replicate.from(remoteDB);
        //
    //

    /* 
    Fonctions
    */
        const checkUserToken = (step = 'favorite') => {
            new FETCHrequest(
                `${apiUrl}/api/me/${localStorage.getItem(localSt)}`,
                'GET'
            )
            .fetch()
            .then( fetchData => {
                // Check step
                if( step === 'favorite' ){ // Add favorite
                    // Display favorites
                    displayFavorite(fetchData.data.favorite)
                }
                else if( step === 'checkuser' ){ // First check
                    console.log(fetchData)
                    // Hide register and loggin form
                    registerForm.classList.add('hidden');
                    loginForm.classList.add('hidden');
                    searchForm.classList.add('open');

                    // Display nav
                    displayNav(fetchData.data.user.pseudo);

                    // Display favorites
                    displayFavorite(fetchData.data.favorite)

                    // Get form submit event
                    getFormSumbit();
                }
            })
            .catch( fetchError => {
                console.log(fetchError)
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

                if(formError === 0){
                    new FETCHrequest(`${apiUrl}/api/register`, 'POST', { 
                        email: userEmail.value, 
                        password: userPassword.value, 
                        pseudo: userPseudo.value 
                    })
                    .fetch()
                    .then( fetchData => {
                        console.log(fetchData)
                    })
                    .catch( fetchError => {
                        console.log(fetchError)
                    })
                }
                else{
                    console.log('form not ok')
                }
            });

            // Get loginForm submit
            loginForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                // Check form data
                let formError = 0;

                if(loginEmail.value.length < 5) { formError++ };
                if(loginPassword.value.length < 5) { formError++ };

                if(formError === 0){
                    new FETCHrequest(`${apiUrl}/api/login`, 'POST', { 
                        email: loginEmail.value, 
                        password: loginPassword.value
                    })
                    .fetch()
                    .then( fetchData => {
                        localStorage.setItem(localSt, fetchData.data.identity._id)
                        checkUserToken('checkuser')
                    })
                    .catch( fetchError => {
                        console.log(fetchError)
                    })
                }
                else{
                    console.log('form not ok')
                }
            });

            // Get searchForm submit
            searchForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                // Check form data
                if(searchData.value.length > 0){
                    new FETCHrequest(`${themoviedbUrl}${searchData.value}&page=1`, 'GET')
                    .fetch()
                    .then( fetchData => {
                        displayMovieList(fetchData.results)
                    })
                    .catch( fetchError => {
                        console.log(fetchError)
                    })
                }
                else{
                    console.log('form not ok')
                }
            });

            // Get chatForm submit
            chatForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                // Check form data
                if(chatMessage.value.length > 0){
                    localDB.put({
                        _id:chatId(),
                        author: localStorage.getItem(localSt),
                        pseudo: localStorage.getItem('user-pseudo'),
                        messagee: chatMessage.value
                    })
                    .then( pouchData => {
                        console.log(pouchData)
                    })
                    .catch( pouchError => {
                        console.log(pouchError)
                    })
                }
            });
        };

        const chatId =  () => {
            // Math.random should be unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 9 characters
            // after the decimal.
            return Math.random().toString(36).substr(2, 9);
        };

        const displayError = (tag, msg) => {
            searchLabel.textContent = msg;
            tag.addEventListener('focus', () => searchLabel.textContent = '');
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
                    new FETCHrequest(`https://api.themoviedb.org/3/movie/${link.getAttribute('movie-id')}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f`, 'GET')
                    .fetch()
                    .then( fetchData => {
                        console.log(fetchData)
                        displayPopin(fetchData)
                    })
                    .catch( fetchError => {
                        console.log(fetchError)
                    })
                    
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
                new FETCHrequest(`${apiUrl}/api/favorite`, 'POST', { 
                    author: localStorage.getItem(localSt),
                    id: data.id,
                    title: data.original_title
                })
                .fetch()
                .then( fetchData => {
                    checkUserToken('favorite')
                })
                .catch( fetchError => {
                    console.log(fetchError)
                })
            })
        }

        const displayFavorite = data => {
            favoriteList.innerHTML = '';
            for(let item of data){
                favoriteList.innerHTML += `
                    <li>
                        <button class="eraseFavorite" movie-id="${item._id}"><i class="fas fa-eraser"></i></button>
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
                    new FETCHrequest( `${apiUrl}/api/favorite/${item.getAttribute('movie-id')}`, 'DELETE' )
                    .fetch()
                    .then( fetchData => checkUserToken('favorite'))
                    .catch( fetchError => {
                        console.log(fetchError)
                    })
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
        /* 
        Start interface by checkingg if user token is prersent
        */
        if( localStorage.getItem(localSt) !== null ){
            console.log(localStorage.getItem(localSt))
            // Get user onnfoprmations
            checkUserToken('checkuser');


            /* checkUserToken(localStorage.getItem(localSt))
            .then( apiResponse => {
                
                // Display favorites
                if( apiResponse.data.favorite.length > 0 ){
                    displayFavorite(apiResponse.data.favorite)
                }

                // Save usr pseudo
                localStorage.setItem('user-pseudo', apiResponse.data.user.pseudo)

                // Hide register and loggin form
                registerForm.classList.add('hidden');
                loginForm.classList.add('hidden');
                searchForm.classList.add('open');

                // Display nav
                displayNav(apiResponse.data.user.pseudo);

                // Get form submit event
                getFormSumbit();
            })
            .catch( err => {
                // Get form submit event
                getFormSumbit();
            }); */
        }
        else{
            getFormSumbit();
        };
    //
});