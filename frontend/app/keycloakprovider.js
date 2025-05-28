import React, { createContext, useEffect, useState } from 'react';
import keycloak from './keycloak';


export const KeycloakContext = createContext();

export const KeycloakProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
      setIsAuthenticated(authenticated);
    });
  }, []);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <KeycloakContext.Provider value={keycloak}>
      {children}
    </KeycloakContext.Provider>
  );
};
