import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import L from 'leaflet'
import 'antd/dist/reset.css'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.jsx'

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
