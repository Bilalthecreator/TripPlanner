import fushimiImg from '../assets/attractions/fushimi.jpg'
import sentieroImg from '../assets/attractions/sentiero.jpg'
import lakeLouiseImg from '../assets/attractions/lake-louise.jpg'
import santaJustaImg from '../assets/attractions/santa-justa.jpg'

export const ATTRACTIONS = [
  {
    id: 'fushimi-inari',
    name: 'Fushimi Inari Shrines',
    location: 'Kyoto, Kansai',
    duration: '~2.5 hrs',
    category: 'Historical Shrine',
    priceLabel: 'Free Entry',
    priceTone: 'teal',
    image: fushimiImg,
    destinationId: 'kyoto',
  },
  {
    id: 'sentiero-degli-dei',
    name: 'Sentiero degli Dei Trail',
    location: 'Amalfi Coast, Italy',
    duration: '~4.0 hrs',
    category: 'Scenic Hike',
    priceLabel: '$12 Pass',
    priceTone: 'muted',
    image: sentieroImg,
    destinationId: 'amalfi-coast',
  },
  {
    id: 'lake-louise',
    name: 'Lake Louise Shoreline',
    location: 'Banff, Alberta',
    duration: '~3.0 hrs',
    category: 'Alpine Lake',
    priceLabel: '$21 Shuttle',
    priceTone: 'muted',
    image: lakeLouiseImg,
    destinationId: 'banff',
  },
  {
    id: 'santa-justa',
    name: 'Santa Justa Viewpoint',
    location: 'Baixa, Lisbon',
    duration: '~1.0 hrs',
    category: 'Architectural',
    priceLabel: '$5.30 Entry',
    priceTone: 'muted',
    image: santaJustaImg,
    destinationId: 'lisbon',
  },
]
