import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.jsx'

const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE
const auth0Scope = import.meta.env.VITE_AUTH0_SCOPE

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: auth0Audience || undefined,
        scope: auth0Scope || undefined,
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
) 
