export const BUYERS = [
  {
    id: 'b1',
    name: 'Greenway Recycling Hub',
    type: 'Recycling Centre',
    icon: 'recycle',
    category: 'plastic',
    color: 'from-emerald-400 to-teal-500',
    address: '12 Bukit Timah Road, Singapore',
    distance: 1.2,
    rating: 4.8,
    price: 0.18,
    hours: '8 AM - 7 PM',
    badge: 'Verified',
  },
  {
    id: 'b2',
    name: 'Atelier Upcycle Studio',
    type: 'Fashion Upcycler',
    icon: 'sparkles',
    category: 'textile',
    color: 'from-pink-400 to-rose-500',
    address: '88 Tiong Bahru Rd, Singapore',
    distance: 2.4,
    rating: 4.9,
    price: 0.85,
    hours: '10 AM - 8 PM',
    badge: 'Premium',
  },
  {
    id: 'b3',
    name: 'Metro Metal Yard',
    type: 'Metal Scrap Yard',
    icon: 'cog',
    category: 'metal',
    color: 'from-slate-400 to-blue-500',
    address: '34 Kallang Way, Singapore',
    distance: 3.1,
    rating: 4.6,
    price: 0.52,
    hours: '7 AM - 5 PM',
    badge: 'Industrial',
  },
  {
    id: 'b4',
    name: 'Crystal Glass Co.',
    type: 'Municipal Facility',
    icon: 'gem',
    category: 'glass',
    color: 'from-cyan-400 to-blue-400',
    address: '5 Bedok North Ave 1, Singapore',
    distance: 4.2,
    rating: 4.5,
    price: 0.06,
    hours: '8 AM - 6 PM',
    badge: 'Verified',
  },
  {
    id: 'b5',
    name: 'EcoPaper Mill',
    type: 'Paper Mill',
    icon: 'leaf',
    category: 'paper',
    color: 'from-amber-300 to-orange-400',
    address: '7 Jurong Industrial Rd, Singapore',
    distance: 5.8,
    rating: 4.7,
    price: 0.10,
    hours: '8 AM - 5 PM',
    badge: 'Verified',
  },
  {
    id: 'b6',
    name: 'Pacific Circular Hub',
    type: 'Multi-Material Centre',
    icon: 'globe',
    category: 'multi',
    color: 'from-emerald-400 to-sky-500',
    address: 'Marina Bay Eco Park, Singapore',
    distance: 6.1,
    rating: 5.0,
    price: 0.45,
    hours: '24/7 Drop-off',
    badge: 'Premium',
  },
]

export const getBuyersForCategory = (category) => {
  const matched = BUYERS.filter((b) => b.category === category)
  const multi = BUYERS.filter((b) => b.category === 'multi')
  return [...matched, ...multi]
}

export const getDestinationMeta = (category) => {
  const map = {
    plastic: { icon: 'recycle', label: 'Recycling Centre', color: 'from-emerald-400 to-teal-500' },
    textile: { icon: 'sparkles', label: 'Fashion Upcycler', color: 'from-pink-400 to-rose-500' },
    metal: { icon: 'cog', label: 'Metal Scrap Yard', color: 'from-slate-400 to-blue-500' },
    glass: { icon: 'gem', label: 'Municipal Facility', color: 'from-cyan-400 to-blue-400' },
    paper: { icon: 'leaf', label: 'Paper Mill', color: 'from-amber-300 to-orange-400' },
  }
  return map[category] || map.plastic
}
