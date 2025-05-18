import Keycloak from "keycloak-js"
const keycloak = new Keycloak({
    url: "http://localhost:8080/realms/myrealm",
    realm: "BAWrealm",
    clientId: "nextjs-client"

})
export default keycloak
