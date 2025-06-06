import Keycloak from 'keycloak-js'

const keycloak = new Keycloak({
    url: "https://localhost/auth",
    realm: "my-realm",
    clientId: "my-app"
})
export default keycloak