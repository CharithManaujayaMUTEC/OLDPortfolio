import { useId } from 'react'

// Limb coordinates in a 200x300 viewBox: [head, neck, hip, [arm1], [arm2], [leg1], [leg2]]
const POSES = [
  { head: [112, 40], torso: [[106, 62], [96, 150]], limbs: [[[106, 70], [150, 50], [186, 24]], [[106, 70], [62, 62], [24, 36]], [[96, 150], [140, 186], [176, 232]], [[96, 150], [56, 192], [18, 172]]] },
  { head: [100, 44], torso: [[100, 66], [100, 156]], limbs: [[[100, 74], [60, 112], [40, 152]], [[100, 74], [140, 100], [166, 68]], [[100, 156], [86, 216], [80, 286]], [[100, 156], [120, 216], [132, 286]]] },
  { head: [66, 92], torso: [[80, 108], [112, 172]], limbs: [[[80, 114], [40, 152], [24, 202]], [[80, 114], [132, 122], [168, 162]], [[112, 172], [152, 202], [122, 262]], [[112, 172], [82, 226], [40, 272]]] },
  { head: [100, 40], torso: [[100, 62], [100, 150]], limbs: [[[100, 70], [66, 40], [44, 6]], [[100, 70], [136, 40], [156, 6]], [[100, 150], [70, 210], [50, 282]], [[100, 150], [136, 196], [168, 160]]] },
  { head: [56, 76], torso: [[70, 92], [120, 152]], limbs: [[[72, 96], [106, 60], [152, 40]], [[72, 96], [40, 132], [20, 172]], [[120, 152], [160, 202], [186, 266]], [[120, 152], [110, 216], [70, 272]]] },
]

const pts = (a) => a.join(' ')

function Figure({ pose, stroke }) {
  const p = POSES[pose % POSES.length]
  return (
    <g stroke={stroke} fill={stroke} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={p.head[0]} cy={p.head[1]} r="15" stroke="none" />
      <polyline points={pts(p.torso.flat())} strokeWidth="30" fill="none" />
      {p.limbs.map((l, i) => (
        <polyline key={i} points={pts(l.flat())} strokeWidth="15" fill="none" />
      ))}
    </g>
  )
}

/** On-brand placeholder artwork: blue duotone field + motion-blurred dancer silhouette. */
export default function Art({ pose = 0, label, className = '', flip = false, tone = 'blue' }) {
  const id = useId().replace(/:/g, '')
  const warm = tone === 'warm'
  return (
    <div className={`art ${className}`} aria-label={label} role={label ? 'img' : undefined}>
      <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={`bg${id}`} cx="50%" cy="38%" r="75%">
            <stop offset="0%" stopColor={warm ? '#ffb27a' : '#9cc4f5'} />
            <stop offset="45%" stopColor={warm ? '#e0551c' : 'var(--primary)'} />
            <stop offset="100%" stopColor={warm ? '#3a1408' : '#0f2547'} />
          </radialGradient>
          <filter id={`blur${id}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2" /></filter>
          <filter id={`soft${id}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1" /></filter>
          <filter id={`noise${id}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={pose + 3} />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 0" />
          </filter>
          <clipPath id={`s1${id}`}><rect x="0" y="70" width="300" height="26" /></clipPath>
          <clipPath id={`s2${id}`}><rect x="0" y="150" width="300" height="18" /></clipPath>
          <clipPath id={`s3${id}`}><rect x="0" y="212" width="300" height="30" /></clipPath>
        </defs>
        <rect x="-3000" y="-3000" width="6300" height="6300" fill={`url(#bg${id})`} />
        <rect x="-1500" y="-1500" width="3300" height="3300" filter={`url(#noise${id})`} opacity=".3" />
        <g className="art-fig" transform={`translate(${flip ? 245 : 55} 10) scale(${flip ? -0.95 : 0.95} 0.95)`}>
          <g filter={`url(#blur${id})`} opacity=".75" transform="translate(-14 4)"><Figure pose={pose} stroke={warm ? '#3b7bd9' : '#ff7a3d'} /></g>
          <g filter={`url(#blur${id})`} opacity=".55" transform="translate(18 -2)"><Figure pose={pose} stroke={warm ? '#ffd1b0' : '#0b1b36'} /></g>
          <g filter={`url(#soft${id})`}><Figure pose={pose} stroke="#070810" /></g>
          <g className="glitch-a" clipPath={`url(#s1${id})`}><g transform="translate(5 0)"><Figure pose={pose} stroke="#6aa8ff" /></g></g>
          <g className="glitch-b" clipPath={`url(#s2${id})`}><g transform="translate(-6 0)"><Figure pose={pose} stroke="#ff5a1f" /></g></g>
          <g className="glitch-a" clipPath={`url(#s3${id})`}><g transform="translate(4 0)"><Figure pose={pose} stroke="#c9deff" /></g></g>
        </g>
        
      </svg>
    </div>
  )
}
