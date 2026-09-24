import kyotoImg from '../assets/destinations/kyoto.jpg'
import amalfiImg from '../assets/destinations/amalfi.jpg'
import banffImg from '../assets/destinations/banff.jpg'
import lisbonImg from '../assets/destinations/lisbon.jpg'

/**
 * Seed trip entities — single shape shared by list, workspace, itinerary, budget.
 * Persisted via localStorage; this module is the initial catalog only.
 */

function activity(id, title, extras = {}) {
  return {
    id,
    title,
    startTime: extras.startTime ?? null,
    endTime: extras.endTime ?? null,
    placeId: extras.placeId ?? null,
    cost: extras.cost ?? 0,
    completed: extras.completed ?? false,
    scheduled: extras.scheduled ?? Boolean(extras.startTime || extras.placeId),
  }
}

function day(id, date, activities) {
  return { id, date, activities }
}

function expense(id, title, amount, category, date) {
  return { id, title, amount, category, date }
}

export const TRIP_FILTERS = [
  { id: 'all', label: 'All Trips' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'ongoing', label: 'Ongoing / Drafts' },
  { id: 'completed', label: 'Completed' },
]

export const SEED_TRIPS = [
  {
    id: 'trip-japan-autumn',
    name: 'Autumn in Japan: Kyoto & Tokyo',
    destination: {
      id: 'kyoto',
      name: 'Kyoto',
      country: 'Japan',
      image: kyotoImg,
    },
    destinations: [
      { name: 'Tokyo', country: 'Japan' },
      { name: 'Kyoto', country: 'Japan' },
      { name: 'Nara', country: 'Japan' },
    ],
    coverImage: kyotoImg,
    startDate: '2024-10-14',
    endDate: '2024-10-26',
    travelers: 2,
    budget: { currency: 'USD', total: 3000 },
    lifecycle: 'upcoming',
    progressMode: 'itinerary',
    collaborators: [
      { id: 'u1', name: 'Ava', initials: 'A', color: '#b90538' },
      { id: 'u2', name: 'Noah', initials: 'N', color: '#00685f' },
      { id: 'u3', name: 'Mia', initials: 'M', color: '#8b5e3c' },
    ],
    primaryAction: 'workspace',
    days: [
      day('d1', '2024-10-14', [
        activity('a1', 'Arrive Narita', { startTime: '10:00', placeId: 'nrt', cost: 40, scheduled: true }),
        activity('a2', 'Hotel check-in Shibuya', { startTime: '14:00', placeId: 'hotel-tyo', cost: 0, scheduled: true }),
        activity('a3', 'Evening ramen walk', { startTime: '19:00', placeId: 'ramen', cost: 35, scheduled: true }),
      ]),
      day('d2', '2024-10-15', [
        activity('a4', 'Meiji Shrine', { startTime: '09:00', placeId: 'meiji', cost: 0, scheduled: true }),
        activity('a5', 'Harajuku browsing', { startTime: '11:30', placeId: 'hara', cost: 50, scheduled: true }),
        activity('a6', 'TeamLab Planets', { startTime: '16:00', placeId: 'teamlab', cost: 40, scheduled: true }),
      ]),
      day('d3', '2024-10-16', [
        activity('a7', 'Shinkansen to Kyoto', { startTime: '08:00', placeId: 'shinkansen', cost: 140, scheduled: true }),
        activity('a8', 'Fushimi Inari', { startTime: '13:00', placeId: 'inari', cost: 0, scheduled: true }),
        activity('a9', 'Gion evening', { startTime: '18:00', placeId: 'gion', cost: 60, scheduled: true }),
      ]),
      day('d4', '2024-10-17', [
        activity('a10', 'Arashiyama bamboo', { startTime: '09:00', placeId: 'arashi', cost: 0, scheduled: true }),
        activity('a11', 'Kinkaku-ji', { startTime: '13:00', placeId: 'kinkaku', cost: 10, scheduled: true }),
        activity('a12', 'Nishiki Market', { startTime: '16:00', placeId: 'nishiki', cost: 45, scheduled: true }),
      ]),
      day('d5', '2024-10-18', [
        activity('a13', 'Day trip to Nara', { startTime: '08:30', placeId: 'nara', cost: 30, scheduled: true }),
        activity('a14', 'Todai-ji', { startTime: '11:00', placeId: 'todai', cost: 8, scheduled: true }),
        activity('a15', 'Deer park lunch', { startTime: '13:00', placeId: 'deer', cost: 25, scheduled: true }),
      ]),
      day('d6', '2024-10-19', [
        activity('a16', 'Tea ceremony', { startTime: '10:00', placeId: 'tea', cost: 55, scheduled: true }),
        activity('a17', 'Philosopher Path', { startTime: '14:00', placeId: 'path', cost: 0, scheduled: true }),
        activity('a18', 'Kaiseki dinner', { startTime: '19:00', placeId: 'kaiseki', cost: 120, scheduled: true }),
      ]),
      day('d7', '2024-10-20', [
        activity('a19', 'Optional temple morning'),
        activity('a20', 'Shopping buffer'),
      ]),
      day('d8', '2024-10-21', [
        activity('a21', 'Return planning buffer'),
        activity('a22', 'Departure buffer'),
      ]),
    ],
    expenses: [
      expense('e1', 'Flights', 1200, 'transport', '2024-09-01'),
      expense('e2', 'Hotels deposit', 800, 'lodging', '2024-09-10'),
      expense('e3', 'Rail pass', 280, 'transport', '2024-09-15'),
      expense('e4', 'Food float', 170, 'food', '2024-10-01'),
    ],
  },
  {
    id: 'trip-amalfi-draft',
    name: 'Amalfi Coast Escape',
    destination: {
      id: 'amalfi-coast',
      name: 'Amalfi Coast',
      country: 'Italy',
      image: amalfiImg,
    },
    destinations: [
      { name: 'Positano', country: 'Italy' },
      { name: 'Amalfi', country: 'Italy' },
      { name: 'Ravello', country: 'Italy' },
    ],
    coverImage: amalfiImg,
    startDate: '2025-06-02',
    endDate: '2025-06-10',
    travelers: 2,
    budget: { currency: 'USD', total: 4200 },
    lifecycle: 'draft',
    progressMode: 'itinerary',
    collaborators: [
      { id: 'u1', name: 'Ava', initials: 'A', color: '#b90538' },
      { id: 'u4', name: 'Leo', initials: 'L', color: '#2563eb' },
    ],
    primaryAction: 'continue',
    days: [
      day('d1', '2025-06-02', [
        activity('b1', 'Fly into Naples', { startTime: '11:00', placeId: 'nap', scheduled: true, cost: 0 }),
        activity('b2', 'Transfer to Positano', { startTime: '15:00', placeId: 'pos', scheduled: true, cost: 90 }),
      ]),
      day('d3', '2025-06-04', [
        activity('b3', 'Boat day TBD'),
        activity('b4', 'Dinner reservation TBD'),
        activity('b5', 'Ravello overlook TBD'),
      ]),
      day('d5', '2025-06-06', [
        activity('b6', 'Beach club shortlist'),
        activity('b7', 'Lemon grove tour TBD'),
      ]),
    ],
    expenses: [
      expense('e1', 'Flight holds', 900, 'transport', '2025-03-01'),
      expense('e2', 'Villa deposit', 1100, 'lodging', '2025-03-12'),
    ],
  },
  {
    id: 'trip-banff-ready',
    name: 'Banff Alpine Weekend',
    destination: {
      id: 'banff',
      name: 'Banff',
      country: 'Canada',
      image: banffImg,
    },
    destinations: [
      { name: 'Banff', country: 'Canada' },
      { name: 'Lake Louise', country: 'Canada' },
    ],
    coverImage: banffImg,
    startDate: '2024-11-08',
    endDate: '2024-11-12',
    travelers: 3,
    budget: { currency: 'USD', total: 2100 },
    lifecycle: 'upcoming',
    progressMode: 'readiness',
    collaborators: [
      { id: 'u2', name: 'Noah', initials: 'N', color: '#00685f' },
      { id: 'u3', name: 'Mia', initials: 'M', color: '#8b5e3c' },
      { id: 'u5', name: 'Sam', initials: 'S', color: '#7c3aed' },
    ],
    primaryAction: 'pack',
    readiness: [
      { id: 'r1', label: 'Park passes', done: true },
      { id: 'r2', label: 'Lodge booked', done: true },
      { id: 'r3', label: 'Layers packed', done: true },
      { id: 'r4', label: 'Traction gear', done: true },
      { id: 'r5', label: 'Trail snacks', done: true },
      { id: 'r6', label: 'Camera batteries', done: true },
      { id: 'r7', label: 'Emergency kit', done: true },
      { id: 'r8', label: 'Weather check day-of', done: true },
      { id: 'r9', label: 'Print itinerary', done: true },
      { id: 'r10', label: 'Car rental pickup notes', done: true },
      { id: 'r11', label: 'Shared drive folder', done: true },
      { id: 'r12', label: 'Insurance card photo', done: true },
      { id: 'r13', label: 'Offline maps', done: true },
      { id: 'r14', label: 'Power bank charged', done: true },
      { id: 'r15', label: 'Trail shoes cleaned', done: true },
      { id: 'r16', label: 'First-aid refill', done: true },
      { id: 'r17', label: 'Cash for tips', done: true },
      { id: 'r18', label: 'Rooming list confirmed', done: true },
      { id: 'r19', label: 'Sunset viewpoint shortlist', done: true },
      { id: 'r20', label: 'Backup rain shell', done: false },
    ],
    days: [
      day('d1', '2024-11-08', [
        activity('c1', 'Arrive Calgary', { startTime: '12:00', placeId: 'yyc', scheduled: true, cost: 0 }),
        activity('c2', 'Drive to Banff', { startTime: '14:00', placeId: 'drive', scheduled: true, cost: 80 }),
      ]),
      day('d2', '2024-11-09', [
        activity('c3', 'Lake Louise morning', { startTime: '08:00', placeId: 'louise', scheduled: true, cost: 20 }),
        activity('c4', 'Moraine Lake viewpoint', { startTime: '13:00', placeId: 'moraine', scheduled: true, cost: 0 }),
      ]),
      day('d3', '2024-11-10', [
        activity('c5', 'Sulphur Mountain', { startTime: '10:00', placeId: 'sulphur', scheduled: true, cost: 45 }),
      ]),
    ],
    expenses: [
      expense('e1', 'Flights', 780, 'transport', '2024-09-20'),
      expense('e2', 'Lodge', 620, 'lodging', '2024-09-22'),
      expense('e3', 'Car', 240, 'transport', '2024-09-25'),
    ],
  },
  {
    id: 'trip-lisbon-done',
    name: 'Lisbon & Sintra Long Weekend',
    destination: {
      id: 'lisbon',
      name: 'Lisbon',
      country: 'Portugal',
      image: lisbonImg,
    },
    destinations: [
      { name: 'Lisbon', country: 'Portugal' },
      { name: 'Sintra', country: 'Portugal' },
      { name: 'Cascais', country: 'Portugal' },
    ],
    coverImage: lisbonImg,
    startDate: '2024-05-03',
    endDate: '2024-05-07',
    travelers: 2,
    budget: { currency: 'USD', total: 1800 },
    lifecycle: 'completed',
    progressMode: 'completed',
    rating: 5,
    memoryCount: 42,
    collaborators: [
      { id: 'u1', name: 'Ava', initials: 'A', color: '#b90538' },
      { id: 'u2', name: 'Noah', initials: 'N', color: '#00685f' },
    ],
    primaryAction: 'memories',
    days: [
      day('d1', '2024-05-03', [
        activity('d1a', 'Alfama walk', {
          startTime: '10:00',
          placeId: 'alfama',
          scheduled: true,
          completed: true,
          cost: 20,
        }),
        activity('d1b', 'Tram 28', {
          startTime: '15:00',
          placeId: 'tram',
          scheduled: true,
          completed: true,
          cost: 8,
        }),
      ]),
      day('d2', '2024-05-04', [
        activity('d2a', 'Sintra palaces', {
          startTime: '09:00',
          placeId: 'sintra',
          scheduled: true,
          completed: true,
          cost: 55,
        }),
      ]),
      day('d3', '2024-05-05', [
        activity('d3a', 'Belém pastries', {
          startTime: '09:30',
          placeId: 'belem',
          scheduled: true,
          completed: true,
          cost: 15,
        }),
        activity('d3b', 'Cascais sunset', {
          startTime: '17:00',
          placeId: 'cascais',
          scheduled: true,
          completed: true,
          cost: 40,
        }),
      ]),
    ],
    expenses: [
      expense('e1', 'Flights', 620, 'transport', '2024-03-01'),
      expense('e2', 'Apartment', 480, 'lodging', '2024-03-05'),
      expense('e3', 'Food & transit', 510, 'food', '2024-05-07'),
      expense('e4', 'Sintra tickets', 110, 'activities', '2024-05-04'),
    ],
  },
]
