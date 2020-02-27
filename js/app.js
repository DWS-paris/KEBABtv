/* 
Attendre le chargement du DOM
*/
document.addEventListener('DOMContentLoaded', () => {

    /* 
    Déclarations
    */
        const searchForm = document.querySelector('header form');
        const searchLabel = document.querySelector('header form span');
        const searchData = document.querySelector('[name="searchData"]');
        const themoviedbUrl = 'https://api.themoviedb.org/3/search/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&query=';
        const movieList = document.querySelector('#movieList');
        const moviePopin = document.querySelector('#moviePopin article');
    //

    /* 
    Fonctions
    */
        const getSearchSumbit = () => {
            searchForm.addEventListener('submit', event => {
                // Stop event propagation
                event.preventDefault();

                // Check form data
                searchData.value.length > 0 
                ? getMovieList(searchData.value) 
                : displayError(searchData, 'Minimum 1 caractère');
            });
        };

        const displayError = (tag, msg) => {
            searchLabel.textContent = msg;
            tag.addEventListener('focus', () => searchLabel.textContent = '');
        };

        const getMovieList = (keywords, index = 1) => {
            fetch( themoviedbUrl + keywords + '&page=' + index )
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => displayMovieList(jsonData.results))
            .catch( err => console.error(err) );
        };

        const getMovieDetails = id => {
            fetch( `https://api.themoviedb.org/3/movie/${id}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f` )
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => displayPopin(jsonData))
            .catch( err => console.error(err) );
        }

        const displayMovieList = collection => {
            searchData.value = '';
            movieList.innerHTML = '';

            console.log(collection)
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
                    getMovieDetails( link.getAttribute('movie-id') );
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
        getSearchSumbit();
    //
});