document.addEventListener('DOMContentLoaded', () => {

    const searchForm = document.querySelector('.form-search');
    const searchData = document.querySelector('[name="searchData"]');
    const themoviedbUrl = 'https://api.themoviedb.org/3/search/movie?api_key=6fd32a8aef5f85cabc50cbec6a47f92f&query=';
    const movieList = document.querySelector('#movieList');
    const moviePopin = document.querySelector('#moviePopin article');

    const registerEmail = document.querySelector('#registerEmail');
    const registerPw = document.querySelector('#registerPw');
    const registerPseudo = document.querySelector('#registerPseudo');

    const getSearchSumbit = () => {
        searchForm.addEventListener('submit', event => {
            event.preventDefault();
            searchData.value.length > 0
                ? fetchFunction(searchData.value)
                : displayError(searchData, 'Minimum 1 caractère');
        });
    };

    const displayError = (tag, msg) => {
        console.log('champs non valide');
    };

    const fetchFunction = (keywords, index = 1) => {
        let fetchUrl = null;
        typeof keywords === 'number'
            ? fetchUrl = `https://api.themoviedb.org/3/movie/${keywords}?api_key=6fd32a8aef5f85cabc50cbec6a47f92f`
            : fetchUrl = themoviedbUrl + keywords + '&page=' + index;
        fetch( fetchUrl )
            .then( response => response.ok ? response.json() : 'Response not OK' )
            .then( jsonData => {
                typeof keywords === 'number'
                    ? displayPopin(jsonData)
                    : displayMovieList(jsonData.results)
            })
            .catch( err => console.error(err) );
    };

    const displayMovieList = collection => {
        searchData.value = '';
        movieList.innerHTML = '';
        console.log(collection);
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
        }
        getPopinLink( document.querySelectorAll('figcaption') );
    };

    const getPopinLink = linkCollection => {
        for( let link of linkCollection ){
            link.addEventListener('click', () => {
                // +var = parseInt(var) || parseFloat(var)
                fetchFunction( +link.getAttribute('movie-id') );
            });
        }
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
    };

    const register = e => {
        e.preventDefault();
        const data = {
            email: document.querySelector('#registerEmail').value,
            password: document.querySelector('#registerPw').value,
            pseudo: document.querySelector('#registerPseudo').value
        };
        console.log(data);
        fetch( 'https://api.dwsapp.io/api/register', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {'Content-Type': 'application/json'}
        }).then( apiResponse => {
            console.log(apiResponse);
                if( apiResponse.ok ){
                    console.log('A');
                    return apiResponse.json();
                }
                else{
                    console.log('B');
                    console.error(apiResponse.statusText);
                }
            })
            .then( jsonData => {
                console.log('D');
                console.log(jsonData);
            })
            .catch( apiError => {
                console.log('E');
                console.error(apiError);
            });
    };

    document.querySelector('.form-register').addEventListener('submit', register);


    getSearchSumbit();
});