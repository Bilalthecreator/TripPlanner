import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { DestinationDetailsPage } from './pages/DestinationDetailsPage.jsx'
import { TripsPage } from './pages/TripsPage.jsx'
import { CreateTripStub, TripRouteStub } from './pages/TripRouteStub.jsx'
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
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/trips/new" element={<CreateTripStub />} />
              <Route
                path="/trips/:tripId"
                element={<TripRouteStub title="Trip Workspace" />}
              />
              <Route
                path="/trips/:tripId/itinerary"
                element={<TripRouteStub title="Itinerary Builder" />}
              />
              <Route
                path="/trips/:tripId/budget"
                element={<TripRouteStub title="Trip Budget" />}
              />
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
