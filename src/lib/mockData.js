// Default content shown when the backend API is unreachable.
// Same shapes as the Laravel API (/api/v1/*). Anything the API returns overrides this.

const days = (n, h = 18) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(h, 0, 0, 0)
  return d.toISOString()
}

export const mockSite = {
  general: {
    site_name: 'Oshan Liyanage',
    tagline: 'Dance coach · Artist · Movement maker',
    logo: null,
    favicon: null,
    owner_name: 'Oshan Liyanage',
    short_bio:
      'Dance coach and performing artist teaching and performing across Sri Lanka — from Colombo studios to open-air stages in Jaffna, Galle and Kandy.',
    email: 'hello@oshanliyanage.lk',
    phone: '+94 77 123 4567',
    whatsapp: '+94771234567',
    address: 'Colombo, Sri Lanka',
    island_wide_note: 'Classes & workshops island-wide',
    currency_code: 'LKR',
    currency_symbol: 'Rs.',
    socials: { instagram: 'https://instagram.com/', facebook: 'https://facebook.com/', youtube: 'https://youtube.com/', tiktok: 'https://tiktok.com/', twitter: '' },
    seo: { title: 'Oshan Liyanage — Dance Coach & Artist, Sri Lanka', description: 'Book dance classes island-wide, join workshops and get tickets to shows and events with Oshan Liyanage.', og_image: null },
  },
  theme: {
    primary: '#3b7bd9', accent: '#ff5a1f', background: '#0b0c10', surface: '#13151b', text: '#f4f5f7', muted: '#9aa3b2',
    font_display: 'Unbounded', font_body: 'Inter', duotone: true, grain: true, glitch: true, radius: 2,
  },
  nav: {
    items: [
      { label: 'Classes', href: '/classes' }, { label: 'Events', href: '/events' }, { label: 'Gallery', href: '/gallery' },
      { label: 'Journal', href: '/journal' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' },
    ],
    cta_label: 'Book a class',
    cta_href: '/classes',
  },
  hero: {
    title: 'OSHAN', subtitle: 'LIYANAGE', tagline: 'Dance coach · Artist', scroll_text: 'Scroll to move', image: null, video_url: '',
    cta_primary_label: 'Find a class', cta_primary_href: '/classes', cta_secondary_label: 'Upcoming events', cta_secondary_href: '/events',
  },
  manifesto: {
    title: 'Made for those who move.',
    text: 'Oshan guides bodies that run, fall, climb, leap and start again — turning raw movement into confidence, craft and performance, island-wide.',
    link_label: 'Discover', link_href: '/about', image: null,
  },
  stats: {
    show: true,
    items: [
      { value: '12+', label: 'Years teaching' }, { value: '25', label: 'Districts reached' },
      { value: '3,500+', label: 'Students coached' }, { value: '80+', label: 'Stage shows' },
    ],
  },
  styles_section: { eyebrow: '01 — Disciplines', title: 'Find your movement' },
  programme: {
    show: true, eyebrow: '02 — Programme', title: 'ISLANDWIDE\nCLASSES\n2026', link_label: 'See all classes', link_href: '/classes', image: null,
    callouts: [{ label: 'Beginner friendly' }, { label: 'Studio & online' }, { label: 'Pay your way' }],
  },
  events_section: { show: true, eyebrow: '03 — Live', title: 'Upcoming events', link_label: 'All events' },
  banner: { show: true, text: 'NO DESTINATION.\nONLY MOVEMENT.', link_label: 'Watch the film', link_href: '/gallery', images: [] },
  testimonials_section: { show: true, eyebrow: '04 — Voices', title: 'In their words' },
  journal_section: { show: true, eyebrow: '05 — Journal', title: 'Journal', link_label: 'All articles' },
  newsletter: {
    show: true, title: 'Stay in motion', text: 'New classes, workshops and show dates — straight to your inbox. No spam, only movement.',
    button: 'Subscribe', success: 'You are in. Welcome to the movement!',
  },
  about: {
    eyebrow: 'About', title: 'Movement is the language.',
    intro: 'Oshan Liyanage is a dance coach and performing artist from Sri Lanka, teaching hip-hop, contemporary, freestyle and choreography in studios, schools and community halls across the island.',
    body: 'Starting out in street battles and school stages, Oshan built a teaching practice around one idea: everyone can move, and everyone can grow through it.\n\nToday that means weekly classes in multiple districts, intensive workshops, choreography for stage and screen, and live shows that bring students and audiences together.',
    image: null, philosophy_title: 'The approach',
    philosophy: [
      { title: 'Fundamentals first', text: 'Strong foundations, clean technique, safe progression.' },
      { title: 'Your own voice', text: 'Freestyle and musicality so every dancer finds their own movement.' },
      { title: 'Stage ready', text: 'Students perform — in showcases, competitions and community events.' },
    ],
    timeline_title: 'Milestones',
  },
  contact: {
    eyebrow: 'Contact', title: "Let's move together.",
    text: 'Questions about classes, private coaching, choreography or booking Oshan for an event? Send a message and we will reply within 24 hours.',
    hours: 'Mon – Sat · 9:00 AM – 7:00 PM', map_embed: '', success: 'Thank you! Your message has been received — we will be in touch soon.',
  },
  booking: {
    class_success_title: 'You are booked in!', event_success_title: 'Tickets reserved!',
    success_text: 'We have emailed you the details. Keep your booking reference handy.',
    terms_text: 'By booking you agree to our class & event terms. Fees are non-refundable once a class has started.',
    booking_prefix: 'OSH', allow_class_registration: true, allow_event_booking: true, max_tickets_per_booking: 10, receipt_max_mb: 5,
  },
  footer: {
    text: 'Dance coach & artist teaching and performing island-wide in Sri Lanka.',
    copyright: '© {year} Oshan Liyanage. All rights reserved.',
    links: [
      { label: 'Classes', href: '/classes' }, { label: 'Events', href: '/events' },
      { label: 'Track booking', href: '/booking/track' }, { label: 'Contact', href: '/contact' },
    ],
  },
  payments: { checkout_notice: 'Your spot is held for 48 hours until payment is verified.', tax_percent: 0, allow_pay_later: true },
}

export const mockStyles = [
  { id: 1, slug: 'hip-hop', name: 'Hip-Hop', tagline: 'Groove, bounce and attitude', description: 'Foundations, grooves, choreography and cypher confidence.', image: null },
  { id: 2, slug: 'contemporary', name: 'Contemporary', tagline: 'Flow, weight, emotion', description: 'Floor work, release technique and expressive storytelling.', image: null },
  { id: 3, slug: 'freestyle', name: 'Freestyle', tagline: 'Find your own voice', description: 'Musicality, improvisation and battle skills.', image: null },
  { id: 4, slug: 'workshops', name: 'Workshops', tagline: 'Intensives, island-wide', description: 'One-day intensives and masterclasses in your district.', image: null },
]

const desc = '<p>A high-energy, supportive class led by Oshan Liyanage. Expect a structured warm-up, technique drills, choreography and a short freestyle round to close every session.</p>'
const mk = (id, title, style, district, venue, d, t, adm, per, mon, level, age, motto, featured, type = 'physical') => ({
  id, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title, style: { name: style[0], slug: style[1] }, description: desc, motto, level, type,
  age_range: age, district, venue_name: venue, address: `${venue}, ${district}`, map_url: null, schedule_days: d, schedule_time: t,
  fees: { admission: adm, per_class: per, monthly: mon }, capacity: 25, seats_left: 25 - (id * 3) % 11, image: null, gallery: [], video_url: null,
  prerequisites: 'None — just bring water and comfortable clothes.', allow_online_registration: true, is_featured: featured,
})
export const mockClasses = [
  mk(1, 'Hip-Hop Foundations', ['Hip-Hop', 'hip-hop'], 'Colombo', 'Studio Flow, Havelock Town', 'Saturday & Sunday', '9:00 AM – 11:00 AM', 2000, 1500, 6000, 'beginner', '12 – 25 years', 'Build confidence from the ground up.', true),
  mk(2, 'Contemporary Flow', ['Contemporary', 'contemporary'], 'Kandy', 'Hill Capital Arts Centre', 'Wednesday & Friday', '5:30 PM – 7:00 PM', 1500, 1200, 5000, 'intermediate', '14+ years', 'Move with weight, breathe with the music.', true),
  mk(3, 'Freestyle Lab', ['Freestyle', 'freestyle'], 'Galle', 'Galle Fort Studio', 'Thursday', '6:00 PM – 8:00 PM', null, 1800, 6500, 'all_levels', '15+ years', 'Find your own voice.', true),
  mk(4, 'Junior Groove Kids', ['Hip-Hop', 'hip-hop'], 'Gampaha', 'Gampaha Community Hall', 'Sunday', '3:00 PM – 4:30 PM', 1000, 1000, 4000, 'beginner', '5 – 11 years', 'Dance is play.', false),
  mk(5, 'Online Choreography Club', ['Freestyle', 'freestyle'], 'Colombo', 'Live on Zoom', 'Tuesday & Thursday', '8:00 PM – 9:00 PM', null, 1000, 3500, 'all_levels', '13+ years', 'Dance from anywhere in the island.', false, 'online'),
  mk(6, 'Jaffna Dance Camp', ['Workshops', 'workshops'], 'Jaffna', 'Jaffna Cultural Centre', 'Monthly weekend camp', '10:00 AM – 4:00 PM', null, 3500, null, 'all_levels', '12+ years', 'Two days. One big stage.', false),
]

const venue = (name, district, address) => ({ id: name, name, district, address, map_url: null, image: null })
const ev = (id, title, category, startsIn, v, summary, tickets, featured) => ({
  id, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title, category, summary,
  description: `<p>${summary}</p><p>Doors open one hour before the start. Bring your booking reference — a confirmation is emailed to you.</p>`,
  starts_at: days(startsIn), ends_at: days(startsIn, 22), venue: v, location_text: null, poster: null, gallery: [], video_url: null,
  ticket_types: tickets.map((t) => ({ description: null, remaining: null, sold_out: false, ...t })),
  registration_open: startsIn > 0, external_ticket_url: null, is_featured: featured, is_past: startsIn < 0,
})
export const mockEvents = [
  ev(1, 'Move Fast: Annual Showcase', 'Show', 34, venue('BMICH', 'Colombo', 'Bauddhaloka Mawatha, Colombo 07'), 'A night of choreography from Oshan and 120 students from across the island.', [{ name: 'General', price: 2500 }, { name: 'VIP front row', price: 6000, description: 'Front row + meet & greet' }], true),
  ev(2, 'Unknown Lines Masterclass', 'Masterclass', 12, venue('Lionel Wendt Theatre', 'Colombo', '18 Guildford Crescent, Colombo 07'), 'Five hours of choreography, musicality and stage presence.', [{ name: 'Participant', price: 4500 }, { name: 'Observer', price: 1500 }], true),
  ev(3, 'Galle Fort Open-Air Jam', 'Battle', 58, venue('Galle Fort Courtyard', 'Galle', 'Church Street, Galle Fort'), 'Sunset cypher and open battle. Free entry, register to dance.', [{ name: 'Spectator', price: 0 }, { name: 'Battle entry', price: 1000 }], false),
  ev(4, 'Spark Summer Intensive 2025', 'Workshop', -60, venue('Lionel Wendt Theatre', 'Colombo', '18 Guildford Crescent, Colombo 07'), 'Three days of training that closed with a live showcase.', [{ name: 'Pass', price: 8000 }], false),
]

export const mockGallery = [
  ['Showcase 2025', 'Shows'], ['Studio session', 'Classes'], ['Backstage', 'Behind the scenes'], ['Galle jam', 'Shows'], ['Kids class', 'Classes'], ['Choreo reel', 'Shows'],
].map(([title, category], i) => ({ id: i + 1, title, type: 'image', image: null, video_url: null, category }))

export const mockTestimonials = [
  { id: 1, name: 'Nethmi Perera', role: 'Student, Colombo', quote: 'I walked in shy and left every class feeling unstoppable. Oshan makes you believe you can dance.', avatar: null, rating: 5 },
  { id: 2, name: 'Kasun Fernando', role: 'Parent, Gampaha', quote: 'My daughter looks forward to every Sunday. The discipline and joy she has gained is incredible.', avatar: null, rating: 5 },
  { id: 3, name: 'Tharindu Silva', role: 'Event organiser', quote: 'Oshan choreographed our launch and the crowd went wild. Professional, creative and always on time.', avatar: null, rating: 5 },
]

const post = (id, title, category, excerpt, ago) => ({
  id, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), title, category, excerpt, cover: null,
  published_at: days(-ago), body: `<p>${excerpt}</p><p>This is sample content shown while the website cannot reach its server.</p>`,
})
export const mockPosts = [
  post(1, 'Interview: why movement is for everyone', 'Interview', 'Oshan on starting out, teaching island-wide and the mindset behind every class.', 9),
  post(2, '5 warm-ups before any dance class', 'Tutorial', 'Protect your joints and move better with this simple five-step routine.', 18),
  post(3, 'Behind the scenes: Annual Showcase', 'Backstage', 'A look at how 120 dancers, three choreographers and one stage came together.', 27),
]

export const mockFaqs = [
  { id: 1, question: 'Do I need experience?', answer: 'No. Beginner classes start with fundamentals and every level is welcome.' },
  { id: 2, question: 'Can I try a class first?', answer: 'Yes — pay the per-class fee for a single session before committing to a month.' },
  { id: 3, question: 'Do you teach outside Colombo?', answer: 'Yes. Classes and workshops run island-wide; check the district filter on the Classes page.' },
  { id: 4, question: 'What is the refund policy?', answer: 'Fees are non-refundable once a class has started. Event tickets can be transferred to a friend.' },
]

export const mockAchievements = [
  { id: 1, year: '2013', title: 'First street-dance crew', description: 'Founded a crew that battled across the island.' },
  { id: 2, year: '2016', title: 'Opened first weekly class', description: 'Started teaching in Colombo with 12 students.' },
  { id: 3, year: '2019', title: 'Island-wide programme', description: 'Expanded classes to 10+ districts.' },
  { id: 4, year: '2023', title: 'Sold-out annual showcase', description: '1,200 seats filled at the BMICH.' },
]

export const mockPaymentMethods = [
  {
    id: 1, slug: 'bank-transfer', name: 'Bank transfer', type: 'bank_transfer', description: 'Transfer and upload your receipt',
    instructions: '<p>Use your booking reference as the payment reference, then upload the slip on the booking page.</p>',
    fee_percent: 0, requires_receipt: true, bank: { bank_name: 'Commercial Bank', account_name: 'O. Liyanage', account_number: '8001234567', branch: 'Colombo 07' },
  },
  { id: 2, slug: 'pay-at-venue', name: 'Cash at the studio', type: 'cash', description: 'Pay when you arrive', instructions: '<p>Pay at the first session or at the event door.</p>', fee_percent: 0, requires_receipt: false, bank: null },
]

export const mockHome = {
  styles: mockStyles,
  featured_classes: mockClasses.slice(0, 4),
  upcoming_events: mockEvents.filter((e) => !e.is_past),
  testimonials: mockTestimonials,
  gallery: mockGallery,
  posts: mockPosts,
}

// ---------------------------------------------------------------- family events (invite-only ticketing)
export const mockTicketDesign = {
  bg_color: '#0b0c10', card_color: '#13151b', text_color: '#f4f5f7', muted_color: '#9aa3b2', accent_color: '#ff5a1f', primary_color: '#3b7bd9',
  font_display: 'Unbounded', font_body: 'Inter', radius: 14, header_text: 'ADMIT ONE',
  footer_text: 'Please show this QR code at the entrance. One scan per person.',
  terms_text: 'This ticket is non-transferable and valid for one entry. Doors open 30 minutes before the start.',
  banner_image: null, logo: null, show_student: true, show_relationship: true, show_venue: true, duotone: true, qr_fg: '#0b0c10', qr_bg: '#ffffff',
}
export const mockFamilyPage = {
  request_title: 'Get your invitation',
  request_text: 'Enter the mobile number registered with your dance class. We will send your personal ticket link by SMS / WhatsApp.',
  request_sent: 'If that number is registered with a class, your personal link is on its way by SMS / WhatsApp.',
  invite_intro: 'Add each family member who is coming. Every person gets their own ticket with a QR code.',
  success_text: 'Your tickets are ready! We also sent the link to your mobile.',
  closed_text: 'Ticket registration is closed for this event.',
  pending_text: 'Your tickets are waiting for approval. We will message you once they are confirmed.',
}
const mockFamilyEvent = {
  id: 1, slug: 'family-showcase', title: 'Annual Family Showcase', summary: 'An evening for our dance family: students, parents and loved ones.',
  description: '<p>Our students take the stage and their families cheer them on. This is a closed event for class students and their relatives.</p><p>Every student can register tickets for their family: mother, father, brothers, sisters, grandparents and close friends.</p>',
  starts_at: days(30), ends_at: days(30, 21), venue: { name: 'Lionel Wendt Theatre', address: '18 Guildford Crescent, Colombo 07', map_url: null },
  cover: null, status: 'open', registration_open: true, allow_self_request: true, registration_closes_at: null, seats_left: null,
}
const mockRelationships = [
  ['student', 'Student (myself)'], ['mother', 'Mother'], ['father', 'Father'], ['sister', 'Sister'], ['brother', 'Brother'],
  ['grandmother', 'Grandmother'], ['grandfather', 'Grandfather'], ['aunt', 'Aunt'], ['uncle', 'Uncle'], ['guardian', 'Guardian'],
  ['friend', 'Friend'], ['other', 'Other (add a remark)'],
].map(([value, label]) => ({ value, label }))
export const mockDemoTicket = {
  code: 'DEMO', display_code: 'DEMO-SAMPLE-TICKET', holder_name: 'Sample Guest', relationship: 'mother', relationship_label: 'Mother', remark: null,
  status: 'issued', checked_in_at: null, qr_value: 'https://example.com/t/DEMO', event: mockFamilyEvent, student_name: 'Sample Student',
  design: mockTicketDesign, demo: true,
}
const mockDemoInvitation = {
  token: 'demo', event: mockFamilyEvent, student: { name: 'Sample Student', first_name: 'Sample' }, mobile_hint: '+9477 *** 567',
  allowance: 4, used: 1, remaining: 3, can_register: true, requires_approval: false,
  tickets: [{ ...mockDemoTicket, holder_name: 'Sample Student', relationship: 'student', relationship_label: 'Student (myself)' }],
  relationships: mockRelationships, page: mockFamilyPage, design: mockTicketDesign, demo: true,
}

// path -> mock payload (matches the `data` field of the API response)
export const mockFor = (path) => {
  const clean = path.split('?')[0].replace(/^\//, '')
  const [root, slug] = clean.split('/')
  switch (root) {
    case 'family-events': return slug ? (slug === mockFamilyEvent.slug ? mockFamilyEvent : null) : [mockFamilyEvent]
    case 'tickets': return slug && slug.toLowerCase() === 'demo' ? mockDemoTicket : null // real tickets are never faked
    case 'invitations': return slug && slug.toLowerCase() === 'demo' ? mockDemoInvitation : null
    case 'site': return mockSite
    case 'home': return mockHome
    case 'styles': return mockStyles
    case 'classes': return slug ? mockClasses.find((c) => c.slug === slug) : mockClasses
    case 'events': return slug ? mockEvents.find((e) => e.slug === slug) : mockEvents
    case 'gallery': return mockGallery
    case 'testimonials': return mockTestimonials
    case 'posts': return slug ? mockPosts.find((p) => p.slug === slug) : mockPosts
    case 'faqs': return mockFaqs
    case 'achievements': return mockAchievements
    case 'payment-methods': return mockPaymentMethods
    default: return null
  }
}
