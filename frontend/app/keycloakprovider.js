import React, { createContext, useEffect, useState, useCallback } from 'react';
import keycloak from './lib/keycloak';

export const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
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
    } finally {
      setLoading(false);
    }
  };

  initKeycloak();
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
        logout,
        loading
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
};