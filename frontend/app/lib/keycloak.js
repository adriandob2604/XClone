import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
<<<<<<< HEAD
    url: "http://localhost:8080",
=======
    url: "https://localhost/auth",
>>>>>>> 1eba963 (restoring repo)
    realm: "my-realm",
    clientId: "my-app"
})
export default keycloak