class FETCHrequest {

    constructor(url, requestType, data = null) {
        this.url = url;
        this.requestType = requestType;
        this.data = data;

        // Définition du header de la requête
        this.requestHeader = {
            method: requestType,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Ajouter les données dans les requêtes POST et PUT
        if( this.requestType === 'POST' || this.requestType === 'PUT'){
            this.requestHeader.body = JSON.stringify(data);
        };
    }

    
    fetch(){
        return new Promise( (resolve, reject) => {
            console.log(this.url)
            fetch( this.url, this.requestHeader )
            .then( apiResponse => {
                // Vérifier le status de la requête
                if( apiResponse.ok ){
                    // Extraire les données JSON de la réponse
                    return apiResponse.json();
                }
                else{
                    return reject(apiResponse);
                };
            })
            .then( jsonData => resolve(jsonData))
            .catch( apiError => reject(apiError));
        })
    }
}