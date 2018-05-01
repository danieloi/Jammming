
// let accessToken = `BQAbMqrxFCD_9URKwYPWoTK_OsCd9Cm_Rlzsnk-R4bet-OAhftH4aUOHCvQBZLiVuBSKMVNmaRHt6dwTQTl3wHEPej3KlV79IaYHRCQPh7MGEqoZB_wDaTrSvDoTM9oLZX2fS3rS1B0jOtMb3VcB7vnlqAW1JdOYGf0FYm6c4fA`;
let accessToken;
const REDIRECT_URI = "http://localhost:3000/";
const CLIENT_ID = "01c9fbd67bb94cc29eefcf622a5f8aea";

let Spotify = {

    pullAccessToken() {
        //method is verbose for the sake of debugging
        let prefix = 'access_token=';
        let prefixLength = prefix.length;
        let token = window.location.href.match(/access_token=([^&]*)/);
        if(token) {
            token = token[0].slice(prefixLength); //indexed at 0 because match returns an array NOT a string!!!
        }
        console.log(`Attempted to pull token from url. \nHere's token: ${token}\n`);
        return token;
    },

    pullExpiration() {
         //method is verbose for the sake of debugging
        let prefix = 'expires_in=';
        let prefixLength = prefix.length;
        // let expiration = Number(window.location.href.match(/expires_in=([^&]*)/));
        let expiration = window.location.href.match(/expires_in=([^&]*)/);
        if(expiration) {
            expiration = expiration[0].slice(prefixLength);  //indexed at 0 because match returns an array NOT a string!!!
        }
        console.log(`Attempted to pull expiration from url. \nHere's the expiration: ${expiration}\n`);
        return expiration;
        // return 3600;
    },

    getAccessToken() {
        
        let expiresIn;
        if (accessToken) {
            console.log(`The access token was initially available\nHere it is: ${accessToken}\n`);
            return accessToken;

        } else if (window.location.href.includes('access_token=') && window.location.href.includes('expires_in=')){
            accessToken = this.pullAccessToken();
            expiresIn = this.pullExpiration();
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            console.log(`The url was just cleared \n`);
            console.log(`Here's the access token: ${accessToken} \n`);
            return;
        } else {
            window.location = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&scope=playlist-modify-public&redirect_uri=${REDIRECT_URI}`;
            return;
        }
    },

    search(term) {

        this.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            // console.log(jsonResponse);
            if (jsonResponse.tracks) {
                return jsonResponse.tracks.items.map(track => ({                   
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri 
                }));
            } else return [];
            
        });
    },
    
    getUserID() {
        let headers = { Authorization: `Bearer ${accessToken}` };
        return fetch('https://api.spotify.com/v1/me', {
                    headers: headers
                }).then(response => {
                    return response.json();
                }).then(jsonResponse => {
                    return jsonResponse.id;
                });
    },

    getPlaylistID(name, userId) {
        let headers = { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };
        let body = {
            name: name
        };
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            headers: headers,
            method: `POST`,
            body: JSON.stringify(body)
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            return jsonResponse.id;
        });
    },

    addTracks(uris, userID, playlistID) {
        let headers = { 
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        };

        let body = {
            uris: uris
        };
        // Remember for post requests the data in the body has to be stringified!!!
        
        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
            headers: headers,
            method: 'POST',
            body: JSON.stringify(body)
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {
            return jsonResponse.id;
        });
    },

    savePlaylist(name, uris) {
        if(!name && !uris) {
            return;
        }
        // let userID, playlistID;
        this.getUserID().then((id) => {
            let userID = id;
            console.log(`Here's the user ID: ${userID}\n`);
            this.getPlaylistID(name, userID).then((id) => {
                let playlistID = id;
                console.log(`Here's the playlist ID from create : ${playlistID}\n`);
                this.addTracks(uris, userID, playlistID).then(() => {
                    console.log(`Here's the playlist ID after tracks were added: ${playlistID}`);
                });
            });
        });
       
        
        ;
        
        
        
        
    }
};

export default Spotify;

