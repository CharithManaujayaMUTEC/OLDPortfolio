import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Classes, { ClassDetail } from './pages/Classes'
import Events, { EventDetail } from './pages/Events'
import { About, Contact, Gallery, Journal, NotFound, PostDetail, TrackBooking } from './pages/Misc'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="classes" element={<Classes />} />
        <Route path="classes/:slug" element={<ClassDetail />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:slug" element={<EventDetail />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="journal" element={<Journal />} />
        <Route path="journal/:slug" element={<PostDetail />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="booking/track" element={<TrackBooking />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}