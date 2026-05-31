import { useState } from 'react'
import { push, badging, haptics, ios, isNative } from '@pwa-kit/sdk'
import type { HealthSample, WorkoutData, SleepSample } from '@pwa-kit/sdk'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

type AppMode = 'native' | 'pwa' | 'browser'

function detectMode(): AppMode {
  if (isNative) return 'native'
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const minimalUi = window.matchMedia('(display-mode: minimal-ui)').matches
  if (standalone || minimalUi) return 'pwa'
  return 'browser'
}

function App() {
  const [count, setCount] = useState(0)
  const [mode] = useState(detectMode)
  const [pushToken, setPushToken] = useState<string | null>(null)
  const [bioResult, setBioResult] = useState<string | null>(null)

  // HealthKit state
  const [hkAvailable, setHkAvailable] = useState<boolean | null>(null)
  const [hkAuthorized, setHkAuthorized] = useState(false)
  const [hkSteps, setHkSteps] = useState<HealthSample[] | null>(null)
  const [hkStepCount, setHkStepCount] = useState<number | null>(null)
  const [hkHeartRate, setHkHeartRate] = useState<HealthSample[] | null>(null)
  const [hkWorkouts, setHkWorkouts] = useState<WorkoutData[] | null>(null)
  const [hkSleep, setHkSleep] = useState<SleepSample[] | null>(null)
  const [hkMessage, setHkMessage] = useState<string | null>(null)

  // ── Native SDK handlers ──────────────────────────────────────────

  const handleSubscribe = async () => {
    try {
      const subscription = await push.subscribe()
      setPushToken(subscription.token)
      await haptics.notification('success')
    } catch (err) {
      console.error('Push subscribe failed:', err)
    }
  }

  const handleSetBadge = async () => {
    try {
      await badging.setAppBadge(count)
      await haptics.impact('medium')
    } catch (err) {
      console.error('Badge set failed:', err)
    }
  }

  const handleClearBadge = async () => {
    try {
      await badging.clearAppBadge()
      await haptics.impact('light')
    } catch (err) {
      console.error('Badge clear failed:', err)
    }
  }

  const handleAuthenticate = async () => {
    try {
      const result = await ios.biometrics.authenticate('Confirm your identity')
      setBioResult(result.success ? '✅ Authenticated' : '❌ Failed')
      await haptics.notification(result.success ? 'success' : 'error')
    } catch (err) {
      setBioResult('❌ Error')
      await haptics.notification('error')
    }
  }

  // ── HealthKit handlers ───────────────────────────────────────────

  const handleHKCheck = async () => {
    try {
      const { available } = await ios.healthKit.isAvailable()
      setHkAvailable(available)
      setHkMessage(available ? '✅ HealthKit available' : '❌ Not available')
      await haptics.impact('light')
    } catch (err) {
      setHkAvailable(false)
      setHkMessage('❌ Error checking availability')
    }
  }

  const handleHKAuthorize = async () => {
    try {
      const auth = await ios.healthKit.requestAuthorization({
        read: ['stepCount', 'heartRate', 'activeEnergyBurned', 'distanceWalkingRunning', 'flightsClimbed'],
        readWorkouts: true,
        readSleep: true,
      })
      setHkAuthorized(auth.success)
      setHkMessage(auth.success ? '✅ HealthKit authorized' : '❌ Authorization denied')
      await haptics.notification(auth.success ? 'success' : 'error')
    } catch (err) {
      setHkMessage('❌ Authorization error')
    }
  }

  const handleHKSteps = async () => {
    try {
      const now = new Date()
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      const samples = await ios.healthKit.querySteps({
        startDate: start.toISOString(),
        endDate: now.toISOString(),
      })
      setHkSteps(samples)
      setHkMessage(`✅ ${samples.length} step samples returned`)
    } catch (err) {
      setHkMessage('❌ Steps query failed')
    }
  }

  const handleHKStepCount = async () => {
    try {
      const now = new Date()
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const { totalSteps } = await ios.healthKit.queryStepCount({
        startDate: start.toISOString(),
        endDate: now.toISOString(),
      })
      setHkStepCount(totalSteps)
      setHkMessage(`✅ Total steps: ${totalSteps.toLocaleString()}`)
    } catch (err) {
      setHkMessage('❌ Step count query failed')
    }
  }

  const handleHKHeartRate = async () => {
    try {
      const now = new Date()
      const start = new Date(now.getTime() - 24 * 60 * 60 * 1000) // last 24h
      const samples = await ios.healthKit.queryHeartRate({
        startDate: start.toISOString(),
        endDate: now.toISOString(),
      })
      setHkHeartRate(samples)
      setHkMessage(`✅ ${samples.length} heart rate samples returned`)
    } catch (err) {
      setHkMessage('❌ Heart rate query failed')
    }
  }

  const handleHKWorkouts = async () => {
    try {
      const now = new Date()
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const workouts = await ios.healthKit.queryWorkouts({
        startDate: start.toISOString(),
        endDate: now.toISOString(),
        limit: 10,
      })
      setHkWorkouts(workouts)
      setHkMessage(`✅ ${workouts.length} workouts returned`)
    } catch (err) {
      setHkMessage('❌ Workouts query failed')
    }
  }

  const handleHKSleep = async () => {
    try {
      const now = new Date()
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const samples = await ios.healthKit.querySleep({
        startDate: start.toISOString(),
        endDate: now.toISOString(),
      })
      setHkSleep(samples)
      setHkMessage(`✅ ${samples.length} sleep samples returned`)
    } catch (err) {
      setHkMessage('❌ Sleep query failed')
    }
  }

  // ── Mode badge ───────────────────────────────────────────────────

  const modeInfo = {
    native: { emoji: '📱', label: 'PWAKit Native', cls: 'native' },
    pwa: { emoji: '📲', label: 'Installed PWA', cls: 'pwa' },
    browser: { emoji: '🌐', label: 'Browser', cls: 'browser' },
  }[mode]

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
          <p><code>@pwa-kit/sdk</code> — push, badging, haptics, biometrics, HealthKit</p>
        </div>

        {/* Mode badge */}
        <div className={`mode-badge ${modeInfo.cls}`}>
          {modeInfo.emoji} {modeInfo.label}
        </div>

        {/* Counter */}
        <button type="button" className="counter" onClick={() => setCount(c => c + 1)}>
          Count is {count}
        </button>

        {/* ── Native SDK Controls ── */}
        {mode === 'native' ? (
          <div className="native-controls">
            <h2>📱 Native SDK</h2>
            <p className="tag native">PWAKit bridge active</p>

            {/* Push & Badging */}
            <div className="section-label">Push Notifications</div>
            <button type="button" onClick={handleSubscribe}>
              {pushToken ? '🔔 Re-subscribe' : '🔕 Subscribe Push'}
            </button>
            {pushToken && <code className="token">{pushToken.slice(0, 40)}…</code>}

            <div className="section-label">Badging</div>
            <div className="button-group">
              <button type="button" onClick={handleSetBadge}>Set Badge ({count})</button>
              <button type="button" onClick={handleClearBadge}>Clear Badge</button>
            </div>

            <div className="section-label">Biometrics</div>
            <div className="button-group">
              <button type="button" onClick={handleAuthenticate}>Face ID / Touch ID</button>
              {bioResult && <span className="bio-result">{bioResult}</span>}
            </div>

            <div className="section-label">Haptics</div>
            <button type="button" onClick={async () => { await haptics.impact('heavy') }}>Heavy Impact</button>
            <button type="button" onClick={async () => { await haptics.selection() }}>Selection</button>

            {/* ── HealthKit ── */}
            <div className="section-label healthkit">💚 HealthKit</div>

            <div className="hk-status">
              <span>Available: <strong>{hkAvailable === null ? '—' : hkAvailable ? '✅' : '❌'}</strong></span>
              <span>Authorized: <strong>{hkAuthorized ? '✅' : '❌'}</strong></span>
            </div>

            <button type="button" onClick={handleHKCheck}>Check Availability</button>
            <button type="button" onClick={handleHKAuthorize}
              disabled={hkAvailable === false}>
              Request Authorization
            </button>
            <button type="button" onClick={handleHKSteps}
              disabled={!hkAuthorized}>
              Query Steps (7d)
            </button>
            <button type="button" onClick={handleHKStepCount}
              disabled={!hkAuthorized}>
              Total Step Count (7d)
            </button>
            <button type="button" onClick={handleHKHeartRate}
              disabled={!hkAuthorized}>
              Heart Rate (24h)
            </button>
            <button type="button" onClick={handleHKWorkouts}
              disabled={!hkAuthorized}>
              Workouts (30d)
            </button>
            <button type="button" onClick={handleHKSleep}
              disabled={!hkAuthorized}>
              Sleep (7d)
            </button>

            {hkMessage && <p className="hk-message">{hkMessage}</p>}

            {/* HealthKit data display */}
            {hkStepCount !== null && (
              <div className="hk-data">
                <strong>Total steps (7d):</strong> {hkStepCount.toLocaleString()}
              </div>
            )}
            {hkSteps && hkSteps.length > 0 && (
              <details className="hk-details">
                <summary>Step samples ({hkSteps.length})</summary>
                {hkSteps.slice(0, 5).map((s, i) => (
                  <div key={i} className="hk-sample">
                    {new Date(s.startDate).toLocaleDateString()}: {s.value} {s.unit}
                  </div>
                ))}
                {hkSteps.length > 5 && <div className="hk-sample muted">…and {hkSteps.length - 5} more</div>}
              </details>
            )}
            {hkHeartRate && hkHeartRate.length > 0 && (
              <details className="hk-details">
                <summary>Heart rate samples ({hkHeartRate.length})</summary>
                {hkHeartRate.slice(0, 5).map((s, i) => (
                  <div key={i} className="hk-sample">
                    {new Date(s.startDate).toLocaleTimeString()}: {s.value} {s.unit}
                  </div>
                ))}
                {hkHeartRate.length > 5 && <div className="hk-sample muted">…and {hkHeartRate.length - 5} more</div>}
              </details>
            )}
            {hkWorkouts && hkWorkouts.length > 0 && (
              <details className="hk-details">
                <summary>Workouts ({hkWorkouts.length})</summary>
                {hkWorkouts.map((w, i) => (
                  <div key={i} className="hk-sample">
                    {w.type}: {Math.round(w.duration / 60)}min
                    {w.calories ? ` | ${w.calories} kcal` : ''}
                    {w.distance ? ` | ${w.distance}m` : ''}
                  </div>
                ))}
              </details>
            )}
            {hkSleep && hkSleep.length > 0 && (
              <details className="hk-details">
                <summary>Sleep samples ({hkSleep.length})</summary>
                {hkSleep.slice(0, 10).map((s, i) => (
                  <div key={i} className="hk-sample">
                    {s.stage}: {new Date(s.startDate).toLocaleDateString()} {new Date(s.startDate).toLocaleTimeString()}
                  </div>
                ))}
                {hkSleep.length > 10 && <div className="hk-sample muted">…and {hkSleep.length - 10} more</div>}
              </details>
            )}
          </div>
        ) : (
          <div className="native-controls unavailable">
            <h2>Native SDK</h2>
            <p className="tag unavailable-tag">❌ Not available</p>
            <p className="hint">
              Run this app inside the{' '}
              <a href="https://github.com/eddmann/pwa-kit" target="_blank">PWAKit iOS app</a>{' '}
              to access native APIs.
            </p>
          </div>
        )}
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <ul>
            <li>
              <a href="https://github.com/eddmann/pwa-kit" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                PWAKit SDK
              </a>
            </li>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" /> Explore Vite
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Native APIs</h2>
          <ul>
            <li><span className="chip">Push</span></li>
            <li><span className="chip">Badging</span></li>
            <li><span className="chip">Haptics</span></li>
            <li><span className="chip">Biometrics</span></li>
            <li><span className="chip">HealthKit</span></li>
            <li><span className="chip">Clipboard</span></li>
            <li><span className="chip">StoreKit</span></li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
