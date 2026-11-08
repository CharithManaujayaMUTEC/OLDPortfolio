import { useState } from 'react'
import Art from './Art'
import { DEFAULT_IMAGES } from '../lib/defaultImages'

/**
 * Photo with the site's duotone treatment.
 * Uses the admin-uploaded `src`; if none, a default dance photo; if that fails to load, generated artwork.
 */
export default function Photo({ src, alt = '', pose = 0, flip = false, tone = 'blue', className = '', children }) {
  const [broken, setBroken] = useState(false)
  const fallback = DEFAULT_IMAGES[Math.abs(pose) % DEFAULT_IMAGES.length]
  const url = src || fallback
  const [failedUrl, setFailedUrl] = useState(null)
  const showImg = url && failedUrl !== url && !broken
  return (
    <div className={`photo ${className}`}>
      {showImg ? (
        <div className="duo">
          <img
            src={url}
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            style={flip && !src ? { transform: 'scaleX(-1)' } : undefined}
            onError={() => (src && src !== fallback ? setFailedUrl(url) : setBroken(true))}
          />
        </div>
      ) : (
        <Art pose={pose} flip={flip} tone={tone} label={alt} />
      )}
      {children}
    </div>
  )
}
