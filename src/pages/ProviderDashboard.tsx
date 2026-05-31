import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { insforge } from '../shared/api/insforgeClient'

interface Patient {
  id: string
  patient_code: string
  name: string
  age: number
  sex: string
  diagnosis: string
  color: string
  created_at: string
}

interface Checkpoint {
  id: string
  patient_id: string
  checkpoint_type: string
  labs_score: number
  steps_score: number
  diet_score: number
  oral_score: number
  lab_note: string
  steps_note: string
  diet_note: string
  oral_note: string
}

interface Invitation {
  id: string
  email: string
  status: 'invited' | 'registered'
  created_at: string
  registered_at: string | null
}

export function ProviderDashboard() {
  const { user, signOut } = useAuth()

  const [patients, setPatients] = useState<Patient[]>([])
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [inviteStatus, setInviteStatus] = useState<{ success: boolean; message: string } | null>(null)
  
  const [activeTab, setActiveTab] = useState<'patients' | 'invitations'>('patients')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [seedingData, setSeedingData] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  async function loadDashboardData() {
    if (!user) return
    setLoading(true)
    try {
      // 1. Fetch invitations
      const { data: invites } = await insforge.database
        .from('invitations')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })

      setInvitations(invites || [])

      // 2. Fetch patients
      const { data: pts } = await insforge.database
        .from('patients')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })

      setPatients(pts || [])

      // 3. Fetch checkpoints
      if (pts && pts.length > 0) {
        const ptIds = pts.map(p => p.id)
        const { data: ckpts } = await insforge.database
          .from('checkpoints')
          .select('*')
          .in('patient_id', ptIds)
        
        setCheckpoints(ckpts || [])
      } else {
        setCheckpoints([])
      }
    } catch (err) {
      console.error('Error loading provider dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim() || !user) return

    setSendingInvite(true)
    setInviteStatus(null)

    try {
      // Check if already invited or registered
      const { data: existing } = await insforge.database
        .from('invitations')
        .select('*')
        .eq('email', inviteEmail.trim())
        .single()

      if (existing) {
        setInviteStatus({
          success: false,
          message: `An invitation has already been sent to ${inviteEmail}. Status: ${existing.status}`
        })
        setSendingInvite(false)
        return
      }

      // 1. Insert invitation row
      const { data: inserted, error: insertError } = await insforge.database
        .from('invitations')
        .insert([{
          email: inviteEmail.trim().toLowerCase(),
          provider_id: user.id,
          status: 'invited'
        }])
        .select()

      if (insertError || !inserted || inserted.length === 0) {
        throw new Error(insertError?.message || 'Database insert failed')
      }

      const invite = inserted[0] as Invitation
      const inviteLink = `${window.location.origin}/#/auth?token=${invite.id}&email=${encodeURIComponent(invite.email)}`

      // 2. Send email via InsForge
      const emailContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 20px auto; padding: 24px; border: 1px solid #e5e4e7; border-radius: 16px; background-color: #ffffff;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <span style="font-size: 28px;">💚</span>
            <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #08060d;">HealthTrack System</h2>
          </div>
          <h3 style="margin-top: 0; color: #08060d; font-size: 18px;">Account Setup Invitation</h3>
          <p style="color: #6b6375; line-height: 1.5; font-size: 14px;">Your healthcare provider has invited you to set up your HealthTrack client account. Setting up your account will allow you to sync steps, heart rate metrics, and manage your food log directly with your care team.</p>
          <div style="margin: 32px 0 24px; text-align: center;">
            <a href="${inviteLink}" style="background-color: #22c55e; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(34,197,94,0.25);">Accept Invitation & Sign Up</a>
          </div>
          <p style="color: #6b6375; font-size: 11px; margin-top: 24px; border-top: 1px solid #e5e4e7; padding-top: 16px;">If you did not expect this invitation, please ignore this email. Link expires shortly. Link: <br/><a href="${inviteLink}" style="color: #22c55e; word-break: break-all;">${inviteLink}</a></p>
        </div>
      `

      const { error: emailError } = await insforge.emails.send({
        to: invite.email,
        subject: 'Set up your HealthTrack client account',
        html: emailContent
      })

      if (emailError) {
        throw new Error(emailError.message)
      }

      setInviteStatus({
        success: true,
        message: `Invitation successfully sent to ${invite.email}!`
      })
      setInviteEmail('')
      loadDashboardData()
    } catch (err: any) {
      setInviteStatus({
        success: false,
        message: err.message || 'Failed to send invitation. Please try again.'
      })
    } finally {
      setSendingInvite(false)
    }
  }

  async function handleResendInvite(invite: Invitation) {
    try {
      const inviteLink = `${window.location.origin}/#/auth?token=${invite.id}&email=${encodeURIComponent(invite.email)}`
      const emailContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 20px auto; padding: 24px; border: 1px solid #e5e4e7; border-radius: 16px; background-color: #ffffff;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
            <span style="font-size: 28px;">💚</span>
            <h2 style="margin: 0; font-size: 20px; font-weight: 600; color: #08060d;">HealthTrack System</h2>
          </div>
          <h3 style="margin-top: 0; color: #08060d; font-size: 18px;">Reminder: Complete Account Setup</h3>
          <p style="color: #6b6375; line-height: 1.5; font-size: 14px;">Here is a quick reminder from your care provider to complete your HealthTrack registration. Tap below to finish setting up your account:</p>
          <div style="margin: 32px 0 24px; text-align: center;">
            <a href="${inviteLink}" style="background-color: #22c55e; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(34,197,94,0.25);">Accept Invitation & Sign Up</a>
          </div>
          <p style="color: #6b6375; font-size: 11px; margin-top: 24px; border-top: 1px solid #e5e4e7; padding-top: 16px;">Link: <br/><a href="${inviteLink}" style="color: #22c55e; word-break: break-all;">${inviteLink}</a></p>
        </div>
      `

      const { error } = await insforge.emails.send({
        to: invite.email,
        subject: 'Reminder: Complete your HealthTrack setup',
        html: emailContent
      })

      if (error) throw error
      alert(`Reminder email resent to ${invite.email}`)
    } catch (err: any) {
      alert('Failed to resend invitation: ' + err.message)
    }
  }

  async function handleDeleteInvite(inviteId: string) {
    if (!confirm('Are you sure you want to cancel and delete this invitation?')) return
    try {
      await insforge.database
        .from('invitations')
        .delete()
        .eq('id', inviteId)
      
      loadDashboardData()
    } catch (err: any) {
      alert('Failed to delete invitation: ' + err.message)
    }
  }

  async function seedMockData() {
    if (!user) return
    setSeedingData(true)
    try {
      // 1. Mock Patient Profiles
      const mockPatients = [
        {
          id: '3d5b7468-1502-401c-8486-13a8a8163f91',
          provider_id: user.id,
          patient_code: 'PT-001',
          name: 'Maria Santos',
          age: 52,
          sex: 'F',
          diagnosis: 'Type 2 Diabetes, Hypertension',
          color: '#FF6B6B'
        },
        {
          id: '7c6d5d7c-8e4a-4a6f-a8eb-ec0164b73cb3',
          provider_id: user.id,
          patient_code: 'PT-002',
          name: 'James Liu',
          age: 44,
          sex: 'M',
          diagnosis: 'Hyperlipidemia, Pre-diabetes',
          color: '#007AFF'
        },
        {
          id: '1b8f56ef-23a8-4221-bf9f-26b6f7ad0231',
          provider_id: user.id,
          patient_code: 'PT-003',
          name: 'Aisha Johnson',
          age: 38,
          sex: 'F',
          diagnosis: 'Obesity, Elevated CRP',
          color: '#34C759'
        }
      ]

      await insforge.database.from('patients').upsert(mockPatients)

      // 2. Mock Patient Checkpoints (scores)
      const mockCheckpoints = [
        {
          patient_id: '3d5b7468-1502-401c-8486-13a8a8163f91',
          checkpoint_type: '6mo',
          labs_score: 74,
          steps_score: 76,
          diet_score: 75,
          oral_score: 85,
          lab_note: 'HbA1c 6.3%, LDL 108',
          steps_note: '~7,600 steps/day',
          diet_note: 'Meal prepping, low-glycemic',
          oral_note: 'Daily brushing & flossing'
        },
        {
          patient_id: '7c6d5d7c-8e4a-4a6f-a8eb-ec0164b73cb3',
          checkpoint_type: '6mo',
          labs_score: 72,
          steps_score: 80,
          diet_score: 79,
          oral_score: 80,
          lab_note: 'HbA1c 5.7%, LDL 115',
          steps_note: '~8,000 steps/day',
          diet_note: 'Mediterranean-style diet',
          oral_note: 'Brushes 2×/day, flosses 5×/wk'
        },
        {
          patient_id: '1b8f56ef-23a8-4221-bf9f-26b6f7ad0231',
          checkpoint_type: '6mo',
          labs_score: 82,
          steps_score: 88,
          diet_score: 85,
          oral_score: 78,
          lab_note: 'CRP 1.4, LDL 109',
          steps_note: '~8,800 steps/day',
          diet_note: 'Whole foods, limited processed',
          oral_note: 'Brushes 2×/day, improving floss'
        }
      ]

      await insforge.database.from('checkpoints').upsert(mockCheckpoints)

      alert('Mock clinical data seeded successfully!')
      loadDashboardData()
    } catch (err: any) {
      console.error(err)
      alert('Failed to seed mock data: ' + err.message)
    } finally {
      setSeedingData(false)
    }
  }

  const registeredCount = invitations.filter(i => i.status === 'registered').length
  const pendingCount = invitations.filter(i => i.status === 'invited').length

  return (
    <div className="min-h-screen bg-[var(--color-background-app)] flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-[var(--color-border-app)] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">💚</span>
          <div>
            <h1 className="text-lg font-bold text-[#08060d] m-0 leading-tight">HealthTrack</h1>
            <p className="text-xs text-[var(--color-text-light)] m-0">Provider Portal • Community Care Network</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-text-app)] hidden sm:inline">
            Logged in: <strong className="text-[#08060d]">{user?.email}</strong>
          </span>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-xs font-semibold text-red-500 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 rounded-xl cursor-pointer active:scale-95 transition-all"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Welcome Section with mock data option */}
        <div className="rounded-2xl bg-gradient-to-r from-green-500 to-green-600 p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold m-0 text-white">Welcome back, Dr. Caregiver!</h2>
            <p className="text-sm text-white/80 m-0 mt-1">Manage clinical client invitations, review compliance scores, and check HealthKit progress.</p>
          </div>
          <button
            onClick={seedMockData}
            disabled={seedingData}
            className="px-5 py-2.5 text-xs font-bold bg-white text-green-600 rounded-xl shadow-lg border-none hover:bg-green-50 cursor-pointer active:scale-95 transition-all disabled:opacity-50"
          >
            {seedingData ? 'Seeding...' : '🧪 Seed Mock Clinical Data'}
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[var(--color-border-app)] p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center text-2xl font-bold">👥</div>
            <div>
              <div className="text-2xl font-bold text-[#08060d]">{patients.length}</div>
              <div className="text-xs text-[var(--color-text-light)]">Total Patients</div>
            </div>
          </div>
          <div className="bg-white border border-[var(--color-border-app)] p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl font-bold">✉️</div>
            <div>
              <div className="text-2xl font-bold text-[#08060d]">{pendingCount}</div>
              <div className="text-xs text-[var(--color-text-light)]">Pending Invites</div>
            </div>
          </div>
          <div className="bg-white border border-[var(--color-border-app)] p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-2xl font-bold">✅</div>
            <div>
              <div className="text-2xl font-bold text-[#08060d]">{registeredCount}</div>
              <div className="text-xs text-[var(--color-text-light)]">Registered Clients</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invitation Form Panel */}
          <div className="bg-white border border-[var(--color-border-app)] p-6 rounded-2xl shadow-sm h-fit space-y-4">
            <h3 className="text-base font-bold text-[#08060d] m-0">Invite New Patient</h3>
            <p className="text-xs text-[var(--color-text-light)] leading-relaxed">
              Enter the patient's email to send them a secure signup link. Clients will be prompted to create an account, which automatically connects to your provider dashboard.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-11 px-4 text-sm bg-transparent text-[var(--color-text-app)] border border-[var(--color-border-app)] rounded-xl outline-none focus:border-green-500/50 transition-colors"
                />
              </div>

              {inviteStatus && (
                <p className={`text-xs m-0 font-medium ${inviteStatus.success ? 'text-green-500' : 'text-red-500'}`}>
                  {inviteStatus.message}
                </p>
              )}

              <button
                type="submit"
                disabled={sendingInvite || !inviteEmail}
                className="w-full h-11 rounded-xl bg-green-500 text-white text-sm font-semibold border-none cursor-pointer active:scale-[0.98] disabled:opacity-35 transition-all flex items-center justify-center gap-2"
              >
                {sendingInvite ? 'Sending...' : '📨 Send Invitation Link'}
              </button>
            </form>
          </div>

          {/* Listings Panel */}
          <div className="lg:col-span-2 bg-white border border-[var(--color-border-app)] rounded-2xl shadow-sm flex flex-col min-h-[400px]">
            {/* Tabs */}
            <div className="flex border-b border-[var(--color-border-app)]">
              <button
                onClick={() => { setActiveTab('patients'); setSelectedPatient(null) }}
                className={`flex-1 py-4 text-sm font-semibold border-none cursor-pointer transition-all ${
                  activeTab === 'patients'
                    ? 'text-green-500 border-b-2 border-green-500'
                    : 'text-[var(--color-text-light)] bg-gray-500/2'
                }`}
              >
                👥 Active Patients ({patients.length})
              </button>
              <button
                onClick={() => { setActiveTab('invitations'); setSelectedPatient(null) }}
                className={`flex-1 py-4 text-sm font-semibold border-none cursor-pointer transition-all ${
                  activeTab === 'invitations'
                    ? 'text-green-500 border-b-2 border-green-500'
                    : 'text-[var(--color-text-light)] bg-gray-500/2'
                }`}
              >
                ✉️ Pending Invites ({pendingCount})
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
              {loading ? (
                <div className="h-full flex items-center justify-center py-12">
                  <p className="text-sm text-[var(--color-text-light)] animate-pulse">Loading data...</p>
                </div>
              ) : activeTab === 'patients' ? (
                /* PATIENTS TAB */
                selectedPatient ? (
                  /* SELECTED PATIENT DETAILS */
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-green-500 bg-green-500/8 border border-green-500/10 rounded-lg cursor-pointer hover:bg-green-500/12 transition-all mb-2"
                    >
                      ← Back to Patient List
                    </button>
                    
                    <div className="flex items-center gap-3 border-b border-[var(--color-border-app)] pb-4">
                      <div className="w-12 h-12 rounded-full text-white font-bold flex items-center justify-center text-lg" style={{ backgroundColor: selectedPatient.color }}>
                        {selectedPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#08060d] m-0">{selectedPatient.name}</h4>
                        <p className="text-xs text-[var(--color-text-light)] m-0">Code: {selectedPatient.patient_code} • Dx: {selectedPatient.diagnosis}</p>
                      </div>
                    </div>

                    <h5 className="text-xs font-bold text-[#08060d] uppercase tracking-wider m-0 mt-4">Clinical Checkpoint Data (6-Month)</h5>
                    
                    {checkpoints.filter(c => c.patient_id === selectedPatient.id).length > 0 ? (
                      checkpoints
                        .filter(c => c.patient_id === selectedPatient.id)
                        .map(ckpt => {
                          const avgScore = Math.round((ckpt.labs_score * 0.35) + (ckpt.steps_score * 0.25) + (ckpt.diet_score * 0.25) + (ckpt.oral_score * 0.15))
                          return (
                            <div key={ckpt.id} className="space-y-4 mt-2">
                              {/* Overall Score */}
                              <div className="bg-green-500/8 border border-green-500/15 rounded-xl p-4 flex justify-between items-center">
                                <div>
                                  <span className="text-xs text-[var(--color-text-light)] block">Wellness Compliance Score</span>
                                  <span className="text-sm font-bold text-[var(--color-text-h)]">6-Month Checkpoint</span>
                                </div>
                                <div className="text-3xl font-extrabold text-green-600">{avgScore}%</div>
                              </div>

                              {/* Breakdown grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="border border-[var(--color-border-app)] p-3.5 rounded-xl bg-gray-500/2 space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="font-bold text-[#08060d]">🔬 Lab Results (35%)</span>
                                    <span className="font-bold text-blue-500">{ckpt.labs_score}%</span>
                                  </div>
                                  <p className="text-xs text-[var(--color-text-light)] italic">{ckpt.lab_note || 'No notes'}</p>
                                </div>

                                <div className="border border-[var(--color-border-app)] p-3.5 rounded-xl bg-gray-500/2 space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="font-bold text-[#08060d]">👣 Daily Steps (25%)</span>
                                    <span className="font-bold text-green-500">{ckpt.steps_score}%</span>
                                  </div>
                                  <p className="text-xs text-[var(--color-text-light)] italic">{ckpt.steps_note || 'No notes'}</p>
                                </div>

                                <div className="border border-[var(--color-border-app)] p-3.5 rounded-xl bg-gray-500/2 space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="font-bold text-[#08060d]">🥗 Diet & Nutrition (25%)</span>
                                    <span className="font-bold text-purple-500">{ckpt.diet_score}%</span>
                                  </div>
                                  <p className="text-xs text-[var(--color-text-light)] italic">{ckpt.diet_note || 'No notes'}</p>
                                </div>

                                <div className="border border-[var(--color-border-app)] p-3.5 rounded-xl bg-gray-500/2 space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="font-bold text-[#08060d]">🦷 Oral Hygiene (15%)</span>
                                    <span className="font-bold text-orange-500">{ckpt.oral_score}%</span>
                                  </div>
                                  <p className="text-xs text-[var(--color-text-light)] italic">{ckpt.oral_note || 'No notes'}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })
                    ) : (
                      <p className="text-xs text-[var(--color-text-light)] py-4">No checkpoint compliance data recorded yet. Client needs to sync metrics.</p>
                    )}
                  </div>
                ) : (
                  /* PATIENT LIST VIEW */
                  patients.length > 0 ? (
                    <div className="space-y-2">
                      {patients.map(p => {
                        const ptCkpts = checkpoints.filter(c => c.patient_id === p.id)
                        let scoreText = '—'
                        if (ptCkpts.length > 0) {
                          const ckpt = ptCkpts[0]
                          scoreText = Math.round((ckpt.labs_score * 0.35) + (ckpt.steps_score * 0.25) + (ckpt.diet_score * 0.25) + (ckpt.oral_score * 0.15)) + '%'
                        }
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPatient(p)}
                            className="flex items-center justify-between p-3.5 border border-[var(--color-border-app)] rounded-xl hover:bg-gray-500/4 cursor-pointer transition-all active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm" style={{ backgroundColor: p.color }}>
                                {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#08060d] m-0">{p.name}</h4>
                                <p className="text-xs text-[var(--color-text-light)] m-0">{p.diagnosis}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-xs text-[var(--color-text-light)]">6-Mo Score</div>
                                <div className="text-sm font-bold text-green-500">{scoreText}</div>
                              </div>
                              <span className="text-[var(--color-text-light)]">❯</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-2">
                      <p className="text-sm text-[var(--color-text-light)]">No registered patients found.</p>
                      <p className="text-xs text-[var(--color-text-light)]">Click "Seed Mock Clinical Data" above or invite clients to get started.</p>
                    </div>
                  )
                )
              ) : (
                /* INVITATIONS TAB */
                invitations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-border-app)] text-[var(--color-text-light)] text-xs uppercase tracking-wider">
                          <th className="pb-3 font-semibold">Email</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">Sent Date</th>
                          <th className="pb-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations.map(inv => (
                          <tr key={inv.id} className="border-b border-[var(--color-border-app)] last:border-none">
                            <td className="py-3.5 font-medium text-[#08060d]">{inv.email}</td>
                            <td className="py-3.5">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                                inv.status === 'registered'
                                  ? 'bg-green-500/10 text-green-500 border border-green-500/15'
                                  : 'bg-blue-500/10 text-blue-500 border border-blue-500/15'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="py-3.5 text-xs text-[var(--color-text-light)]">
                              {new Date(inv.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 text-right space-x-2">
                              {inv.status === 'invited' && (
                                <>
                                  <button
                                    onClick={() => handleResendInvite(inv)}
                                    className="px-2.5 py-1 text-xs text-blue-500 bg-blue-500/8 hover:bg-blue-500/12 rounded-lg border border-blue-500/10 cursor-pointer transition-all"
                                  >
                                    Resend
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInvite(inv.id)}
                                    className="px-2.5 py-1 text-xs text-red-500 bg-red-500/8 hover:bg-red-500/12 rounded-lg border border-red-500/10 cursor-pointer transition-all"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {inv.status === 'registered' && (
                                <span className="text-xs text-[var(--color-text-light)] italic">Signed up ✓</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-[var(--color-text-light)]">No invitations sent yet.</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
