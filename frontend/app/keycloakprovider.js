import React, { createContext, useEffect, useState, useCallback } from 'react';
import keycloak from './keycloak';

export const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const initKeycloak = async () => {
      try {
        const authenticated = await keycloak.init({
          onLoad: 'check-sso',
          checkLoginIframe: false,
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
        });
        setIsAuthenticated(authenticated);
      } catch (error) {
        console.error('Keycloak initialization error:', error);
      }
    };

    initKeycloak();
    keycloak.onAuthSuccess = () => {
      setIsAuthenticated(true);
    };

    keycloak.onAuthLogout = () => {
      setIsAuthenticated(false);
    };

    return () => {
      keycloak.onAuthSuccess = null;
      keycloak.onAuthLogout = null;
    };
  }, []);

  const login = useCallback(() => {
    if (!isAuthenticated) {
      keycloak.login();
    }
  }, [isAuthenticated]);

  const logout = useCallback(() => {
    keycloak.logout();
  }, []);

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};