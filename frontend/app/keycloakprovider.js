import React, { createContext, useEffect, useState, useCallback } from 'react';
import keycloak from './lib/keycloak';
import axios from 'axios';
import { url } from "@/app/utils";
import { useRouter } from 'next/navigation';

export const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  useEffect(() => {
  const initKeycloak = async () => {
    try {
      const authenticated = await keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        promiseType: "native",
        silentCheckSsoRedirectUri: `${window.location.origin}/check/silent-check-sso.html`
      });
      setIsAuthenticated(authenticated);
      if (keycloak.token) {
        axios.post(`${url}/users/token`, {token: keycloak.token}).then((response) => console.info(response.status)).catch((err) => console.error(err))
        
      }
    } catch (error) {
      console.error('Keycloak initialization error:', error);
    } finally {
      setLoading(false);
    }
  };
  initKeycloak();
}, []);

  const login = useCallback((options) => {
    if (!isAuthenticated) {
      keycloak.login(options);
    }
  }, [isAuthenticated]);

  const logout = useCallback((options) => {
    if (isAuthenticated){
      keycloak.logout(options);

    }
  }, [isAuthenticated]);

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        isAuthenticated,
        login,
        logout,
        loading
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};