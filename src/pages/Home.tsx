import { usePwaMode } from '../hooks/usePwaMode'
import { ModeBadge } from '../components/ModeBadge'
import { HealthKitDashboard } from '../components/health/HealthKitDashboard'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import './Home.css'

export function Home() {
  const mode = usePwaMode()
  const isNative = mode === 'native'

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>

        <div>
          <h1>PWA + Native SDK</h1>
          <p><code>@pwa-kit/sdk</code> — Full HealthKit API integration</p>
        </div>

        <ModeBadge mode={mode} />

        {isNative ? <HealthKitDashboard /> : (
          <div className="hk-unavailable">
            <p>HealthKit requires the</p>
            <a href="https://github.com/eddmann/pwa-kit" target="_blank">PWAKit iOS app</a>
            <p>to access native APIs.</p>
          </div>
        )}
      </section>

      <div className="ticks" />

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon" />
          </svg>
          <h2>Documentation</h2>
          <ul>
            <li>
              <a href="https://github.com/eddmann/pwa-kit" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon" />
                </svg>
                PWAKit SDK
              </a>
            </li>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" /> Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon" />
          </svg>
          <h2>Available APIs</h2>
          <ul>
            <li><span className="chip">Push</span></li>
            <li><span className="chip">Badging</span></li>
            <li><span className="chip">Haptics</span></li>
            <li><span className="chip">Biometrics</span></li>
            <li><span className="chip chip-active">HealthKit</span></li>
            <li><span className="chip">Clipboard</span></li>
            <li><span className="chip">StoreKit</span></li>
          </ul>
        </div>
      </section>

      <div className="ticks" />
      <section id="spacer" />
    </>
  )
}
