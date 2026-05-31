# HealthTrack — iPhone App Launch Plan
**Community Care Health Network · Non-Developer Guide**

---

## Which path is right for you?

| | Path A: PWA (Recommended) | Path B: TestFlight |
|---|---|---|
| **Time to launch** | Today | 2–4 weeks |
| **Cost** | Free | $99/year |
| **Technical skill** | None | Hire a freelancer (~$200–500 one-time) |
| **Apple Developer account** | Not needed | Required |
| **Works on iPhone** | ✅ Yes | ✅ Yes |
| **Push notifications** | ❌ No | ✅ Yes |
| **App icon on home screen** | ✅ Yes | ✅ Yes |
| **Offline access** | Partial | Full |
| **Best for** | Starting now, small team | Scaling up later |

**Start with Path A. Upgrade to Path B if you need push notifications or offline access.**

---

## Path A: Progressive Web App (PWA) — Launch Today, Free

Your `patient_dashboard_mobile.html` file already has all the iPhone settings built in. You just need to host it online.

### Step 1 — Host the file on Netlify (free, 5 minutes)

1. Go to **netlify.com** and create a free account (use your nonprofit email)
2. On the Netlify dashboard, click **"Add new site" → "Deploy manually"**
3. Drag and drop your `patient_dashboard_mobile.html` file onto the upload area
4. Netlify gives you a URL like: `https://healthtrack-cchn.netlify.app`
5. Optional: click **"Domain settings"** to set a custom name (e.g., `healthtrack-cchn.netlify.app`)

**That's it. Your app is live.**

### Step 2 — Rename the file before uploading

Netlify serves `index.html` as the root page. Rename your file:

```
patient_dashboard_mobile.html  →  index.html
```

Then drag the renamed file to Netlify.

### Step 3 — Send this to your providers

Send your staff this message:

> **Adding HealthTrack to your iPhone:**
> 1. Open Safari on your iPhone (must be Safari, not Chrome)
> 2. Go to: `https://[your-netlify-url].netlify.app`
> 3. Tap the Share button (box with arrow at the bottom of Safari)
> 4. Tap **"Add to Home Screen"**
> 5. Tap **"Add"** — the HealthTrack icon appears on your home screen
> 6. Open it like any app

### Step 4 — Add a proper app icon (optional but recommended)

Create a 512×512 pixel PNG logo for your nonprofit and add these lines inside the `<head>` of your HTML file:

```html
<link rel="apple-touch-icon" sizes="180x180" href="icon.png">
<link rel="apple-touch-icon" sizes="152x152" href="icon.png">
```

Upload the icon file alongside `index.html` on Netlify.

### Step 5 — Password protect it (important for HIPAA awareness)

Since this contains patient data, add basic access control. Options:

- **Netlify Password Protection** (free on paid plans, $19/month): In Netlify → Site settings → Access control → Password protection. Set one shared password for your team.
- **Simple login screen**: Ask me to add a staff PIN login screen to the HTML — I can build that for you.

> ⚠️ **HIPAA Note:** For real patient data (not sample data), you'll need to ensure the hosting is HIPAA-compliant. Netlify's free/pro tiers are **not** HIPAA-certified. For actual PHI, use **AWS Amplify**, **Azure Static Web Apps**, or **Google Firebase Hosting** with a signed BAA. Ask me to help set that up when you're ready.

---

## Path B: TestFlight Distribution (When You're Ready to Scale)

TestFlight lets you distribute a proper native iPhone app to up to 10,000 internal users without going through the App Store.

### What you'll need

- **Apple Developer account** — $99/year at developer.apple.com
  - Nonprofits: Apple does not currently offer fee waivers for the Developer Program (unlike the App Store fee for nonprofits), but the $99 covers unlimited apps and up to 10,000 TestFlight testers.
- **A freelance iOS developer** — 4–8 hours of work at $50–100/hour
  - Find one on: Upwork, Toptal, or ask a local university's CS department
  - What to tell them: *"I have a mobile-optimized HTML file. I need you to wrap it in a WKWebView iOS app using Capacitor or Swift, sign it with our Apple Developer account, and submit it to TestFlight."*

### The developer will do these steps

1. **Install Capacitor** (free framework that wraps HTML apps as native iOS)
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios
   npx cap init HealthTrack com.cchn.healthtrack
   npx cap add ios
   npx cap open ios
   ```
2. Drop your `index.html` into the Capacitor `www/` folder
3. Open the project in **Xcode** on a Mac
4. Connect your Apple Developer account in Xcode → Signing & Capabilities
5. Archive the app and upload to **App Store Connect**
6. In App Store Connect, create a **TestFlight** build and add testers by email

### Timeline for Path B

| Week | Task |
|------|------|
| Week 1 | Sign up for Apple Developer account, hire developer |
| Week 2 | Developer wraps app, sets up signing |
| Week 3 | Submit to TestFlight, invite 5 pilot testers |
| Week 4 | Collect feedback, fix issues, roll out to full team |

---

## Recommended Sequence

```
TODAY          MONTH 1        MONTH 3        MONTH 6
  │               │               │               │
  ▼               ▼               ▼               ▼
Launch PWA    Add PIN login   Upgrade to      Add push
on Netlify    + HIPAA host    TestFlight      notifications
(free, now)   (if needed)     (if scaling)    + offline mode
```

---

## What to ask me to build next

- **Staff PIN login screen** — password-protect the app before sharing
- **Patient data entry forms** — let providers log step counts, diet, and oral hygiene scores directly in the app
- **Export to PDF** — generate a printable patient progress report
- **HIPAA-compliant hosting setup** — configure AWS or Firebase for real patient data
- **Push notification setup** (Path B only) — remind providers to log data weekly

---

*Plan prepared for Community Care Health Network · May 2026*
