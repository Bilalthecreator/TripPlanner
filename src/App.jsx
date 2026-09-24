import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { DestinationDetailsPage } from './pages/DestinationDetailsPage.jsx'
import { StubPage } from './pages/placeholders.jsx'
import { SavedPlacesProvider } from './store/SavedPlacesContext.jsx'
import { ThemeProvider } from './store/ThemeContext.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <SavedPlacesProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/destinations/:destinationId"
                element={<DestinationDetailsPage />}
              />
              <Route path="/trips" element={<StubPage title="Trips" />} />
              <Route
                path="/workspace"
                element={<StubPage title="Trip Workspace" />}
              />
              <Route path="/budget" element={<StubPage title="Budget" />} />
              <Route path="/saved" element={<StubPage title="Saved Places" />} />
              <Route path="/settings" element={<StubPage title="Settings" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </SavedPlacesProvider>
    </ThemeProvider>
  )
}
