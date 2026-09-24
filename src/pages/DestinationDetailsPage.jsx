import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAsyncResource } from '../hooks/useAsyncResource.js'
import { destinationService } from '../services/destinationService.js'
import { usePreferences } from '../store/usePreferences.js'
import { EmptyState } from '../components/common/StatusBlocks.jsx'
import { DestinationSubHeader } from '../components/destination/DestinationSubHeader.jsx'
import { DestinationHero } from '../components/destination/DestinationHero.jsx'
import { DestinationInfo } from '../components/destination/DestinationInfo.jsx'
import { WeatherSummary } from '../components/destination/WeatherSummary.jsx'
import { DestinationTabs } from '../components/destination/DestinationTabs.jsx'
import { PlaceSection } from '../components/destination/PlaceSection.jsx'
import { RestaurantsSection } from '../components/destination/RestaurantsSection.jsx'
import { HotelsSection } from '../components/destination/HotelsSection.jsx'
import { LocationPreview } from '../components/destination/LocationPreview.jsx'
import { ExperienceBanner } from '../components/destination/ExperienceBanner.jsx'

const SECTION_IDS = {
  overview: 'section-overview',
  attractions: 'section-attractions',
  restaurants: 'section-restaurants',
  hotels: 'section-hotels',
  map: 'section-map',
}

export function DestinationDetailsPage() {
  const { destinationId } = useParams()
  const navigate = useNavigate()
  const { temperatureUnit } = usePreferences()
  const [activeTab, setActiveTab] = useState('overview')
  const [placeFilter, setPlaceFilter] = useState('all')
  const [trackedId, setTrackedId] = useState(destinationId)

  if (trackedId !== destinationId) {
    setTrackedId(destinationId)
    setActiveTab('overview')
    setPlaceFilter('all')
  }

  const destination = useAsyncResource(
    (signal) => destinationService.getDestinationById(destinationId, { signal }),
    [destinationId],
  )

  const images = useAsyncResource(
    (signal) => destinationService.getDestinationImages(destinationId, { signal }),
    [destinationId],
    { enabled: destination.status === 'success' },
  )

  const weather = useAsyncResource(
    (signal) => destinationService.getDestinationWeather(destinationId, { signal }),
    [destinationId],
    { enabled: destination.status === 'success' },
  )

  const forecast = useAsyncResource(
    (signal) => destinationService.getDestinationForecast(destinationId, { signal }),
    [destinationId],
    { enabled: destination.status === 'success' },
  )

  const attractions = useAsyncResource(
    (signal) =>
      destinationService.getDestinationAttractions(destinationId, {
        signal,
        filter: placeFilter,
      }),
    [destinationId, placeFilter],
    { enabled: destination.status === 'success' },
  )

  const restaurants = useAsyncResource(
    (signal) =>
      destinationService.getDestinationRestaurants(destinationId, { signal }),
    [destinationId],
    { enabled: destination.status === 'success' },
  )

  const hotels = useAsyncResource(
    (signal) => destinationService.getDestinationHotels(destinationId, { signal }),
    [destinationId],
    { enabled: destination.status === 'success' },
  )

  const location = useAsyncResource(
    (signal) => destinationService.getDestinationLocation(destinationId, { signal }),
    [destinationId],
    { enabled: destination.status === 'success' },
  )

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    const target = document.getElementById(SECTION_IDS[tabId] ?? SECTION_IDS.overview)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (destination.status === 'error' && destination.error?.code === 'NOT_FOUND') {
    return (
      <EmptyState
        title="Destination not found"
        message={`We couldn’t find a destination for “${destinationId}”. Head back to Discover and pick another place.`}
        actionLabel="Back to Discover"
        onAction={() => navigate('/')}
        className="mt-8"
      />
    )
  }

  if (destination.status === 'error') {
    return (
      <EmptyState
        title="Couldn’t load destination"
        message={destination.error?.message || 'Destination information failed to load.'}
        actionLabel="Retry"
        onAction={destination.retry}
        className="mt-8"
      />
    )
  }

  const details = destination.data
  const showOverview = activeTab === 'overview'
  const showAttractions = showOverview || activeTab === 'attractions'
  const showRestaurants = showOverview || activeTab === 'restaurants'
  const showHotels = showOverview || activeTab === 'hotels'
  const showMap = showOverview || activeTab === 'map'

  return (
    <div className="pb-4">
      {destination.status === 'loading' || !details ? (
        <div className="space-y-6">
          <DestinationInfo status="loading" />
          <DestinationHero status="loading" />
        </div>
      ) : (
        <>
          <DestinationSubHeader destination={details} />
          <div className="space-y-6">
            <DestinationHero
              status={images.status}
              data={images.data}
              error={images.error}
              onRetry={images.retry}
              badges={details.badges}
            />
            <DestinationInfo destination={details} status="success" />
          </div>
        </>
      )}

      {destination.status === 'success' ? (
        <>
          <div className="mt-2">
            <WeatherSummary
              weatherStatus={weather.status}
              forecastStatus={forecast.status}
              weather={weather.data}
              forecast={forecast.data}
              weatherError={weather.error}
              forecastError={forecast.error}
              onRetryWeather={weather.retry}
              onRetryForecast={forecast.retry}
              temperatureUnit={temperatureUnit}
            />
          </div>

          <DestinationTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={details.counts}
            activeFilter={placeFilter}
            onFilterChange={setPlaceFilter}
          />

          <div
            id={SECTION_IDS.overview}
            className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12"
          >
            <div className="space-y-10 lg:col-span-8">
              {showAttractions ? (
                <PlaceSection
                  id={SECTION_IDS.attractions}
                  eyebrow="Signature Landmarks"
                  title={`Top Attractions in ${details.name}`}
                  viewAllLabel={`View all ${details.counts.attractions}`}
                  items={attractions.data}
                  status={attractions.status}
                  error={attractions.error}
                  onRetry={attractions.retry}
                  filter={placeFilter}
                />
              ) : null}

              {showRestaurants ? (
                <RestaurantsSection
                  id={SECTION_IDS.restaurants}
                  count={details.counts.restaurants}
                  items={restaurants.data}
                  status={restaurants.status}
                  error={restaurants.error}
                  onRetry={restaurants.retry}
                />
              ) : null}

              {showOverview ? <ExperienceBanner experience={details.experience} /> : null}

              {showHotels ? (
                <HotelsSection
                  id={SECTION_IDS.hotels}
                  count={details.counts.hotels}
                  items={hotels.data}
                  status={hotels.status}
                  error={hotels.error}
                  onRetry={hotels.retry}
                />
              ) : null}
            </div>

            {showMap ? (
              <div className="lg:col-span-4">
                <LocationPreview
                  id={SECTION_IDS.map}
                  status={location.status}
                  data={location.data}
                  error={location.error}
                  onRetry={location.retry}
                  destination={details}
                />
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {destination.status === 'success' ? (
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-[13px] font-semibold tracking-[0.26px] text-rw-accent"
          >
            ← Back to Discover
          </Link>
        </div>
      ) : null}
    </div>
  )
}
