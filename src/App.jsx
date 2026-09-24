import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { DestinationDetailsPage } from './pages/DestinationDetailsPage.jsx'
import { TripsPage } from './pages/TripsPage.jsx'
import {
  CreateTripPage,
  TripWorkspacePage,
} from './pages/TripWorkspacePage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { StubPage } from './pages/placeholders.jsx'
import { SavedPlacesProvider } from './store/SavedPlacesContext.jsx'
import { PreferencesProvider } from './store/PreferencesContext.jsx'
import { TripsProvider } from './store/TripsContext.jsx'

export default function App() {
  return (
    <PreferencesProvider>
      <SavedPlacesProvider>
        <TripsProvider>
          <BrowserRouter>
            <AppShell>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/destinations/:destinationId"
                  element={<DestinationDetailsPage />}
                />
                <Route path="/trips" element={<TripsPage />} />
                <Route path="/trips/new" element={<CreateTripPage />} />
                <Route
                  path="/trips/:tripId"
                  element={<TripWorkspacePage mode="workspace" />}
                />
                <Route
                  path="/trips/:tripId/itinerary"
                  element={<TripWorkspacePage mode="workspace" />}
                />
                <Route
                  path="/trips/:tripId/budget"
                  element={<StubPage title="Trip Budget" />}
                />
                <Route
                  path="/workspace"
                  element={<StubPage title="Trip Workspace" />}
                />
                <Route path="/budget" element={<StubPage title="Budget" />} />
                <Route
                  path="/saved"
                  element={<StubPage title="Saved Places" />}
                />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </BrowserRouter>
        </TripsProvider>
      </SavedPlacesProvider>
    </PreferencesProvider>
  )
}
