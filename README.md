# ReWear — Hyperlocal Circular Occasionwear Fashion Platform

> **“Wear the moment. Not the price tag.”**

ReWear is an India-focused, hyperlocal circular-fashion marketplace where users can rent, buy, and share designer occasionwear already available nearby in their neighbourhood (weddings, college farewells, interviews, galas, and photoshoots).

---

## 🌟 Core Differentiators & Product Principles

1. **Recommendation vs. Eligibility Separation**:
   - **Recommendation Engine**: Answers *"Is this outfit relevant to this user?"* (occasion match, seam ease, style aesthetic, distance, budget).
   - **Trust & Eligibility Engine**: Answers *"Can this high-value transaction proceed safely under platform policy?"*
   - **Positive Action-Oriented Language Only**: Never shows "Low trust score" or "Untrustworthy". Uses empowering prompts like:
     - *"Additional verification required"*
     - *"Verify your identity to request this high-value rental"*
     - *"This item includes enhanced protection for both you and the owner"*

2. **Segregated Escrow Security Deposits**:
   - Refundable deposits are **never** platform revenue and **never** seller revenue.
   - Held in a segregated escrow liability account and released immediately upon post-wear return inspection.

3. **Dual QR & OTP Handover**:
   - Verified in-person handovers require matching 6-digit OTPs and QR passes.
   - Both parties review a photographic condition checklist (front, hem, zipper).

4. **Digital Clothing Passport**:
   - Every circulating garment has an immutable lifecycle history tracking wear counts (e.g. 27 → 28), sanitization records, repair logs, and CO₂/water environmental savings.

5. **Privacy-First AI Fit Preview & Virtual Try-On**:
   - **Clothed Photo Upload & Presets**: Upload your own clothed full-body photo or test with instant demo model profiles.
   - **Real Seam Ease Calculation**: `garment_measurement - user_measurement` across bust, waist, and hip.
   - **Dynamic Fit Modes**: Automatically classifies into `SNUG`, `REGULAR`, `RELAXED`, `OVERSIZED`, or `NOT_RECOMMENDED`.
   - **Size-Aware Visual Drape Simulation**: Interactive canvas rendering reflecting true silhouette volume, tension lines for snug fits, fluid drape folds for relaxed cuts, and negative-ease warnings.
   - **Fit Confidence Scoring**: Explains ease math (e.g. +1.0" ease = optimal drape, 96% confidence).
   - **Strict Privacy & Deletion Rights**: Explicit informed consent checkbox and one-click instant photo and simulation purge controls.
   - **Prominent Disclaimer**: Clear *"Actual fit may vary"* advisory regarding tailoring margins and fabric drape.
   - **AI Fit Studio**: Dedicated studio accessible directly from the top navigation bar (`/tryon`) or from any outfit's detail page.

---

## 🚀 Hackathon 16-Step Guided Demo Flow

The application comes with an interactive, floating **Hackathon Demo Guide** bar that lets judges step through all 16 milestones with a single click:

1. **Login as Ananya**: Student in Chennai (T. Nagar) needing an outfit for her College Farewell.
2. **Start AI Style Match**: Open the 7-step wizard from the hero banner.
3. **Configure Preferences**: Select College Farewell, Saturday event, Size M, Glam aesthetic, ₹1,000 budget, Chennai.
4. **96% Best Match Hero Card**: Review top algorithm pick — *Black & Gold Embroidered Gown* with 96% match.
5. **Product Details & Passport**: Inspect 27 past wears, 1 repair, ₹1,000 refundable deposit, 2.1 km away.
6. **AI Fit Preview**: Compare Size M (+1.0" ease) vs Size L (+4.0" ease); view virtual try-on drape simulation.
7. **Reserve via Hyperlocal Pickup**: Select free In-Person Pickup at the local T. Nagar hub.
8. **Transparent Escrow Breakdown**: Clear itemization: Rental ₹699, Refundable Deposit ₹1,000, Total ₹1,827.
9. **Generate Pickup QR & OTP**: View booking pass with 6-digit OTP (`482910`) and QR code.
10. **Handover & Condition Evidence**: Wardrobe owner verifies QR scan and captures condition checklist.
11. **Active Rental & Return Pass**: Ananya initiates garment return with post-farewell condition photos.
12. **Seller Return Inspection**: Wardrobe owner compares handover vs return photos and approves *Full Refund*.
13. **Deposit Refund Initiated**: Platform issues instant ₹1,000 deposit refund to Ananya's UPI handle.
14. **Clothing Passport Update**: Gown lifecycle wear count increments from **27 → 28**, logging +14.8 kg CO₂ saved.
15. **High-Value Lehenga (Step 15)**: Examine ₹35,000 *Designer Ivory Lehenga* with positive verification prompts.
16. **Seller & Admin Governance Console**: Explore B2B Studio dashboard, deposit escrow liability tracking, and Admin policy rules.

---

## 👥 Seeded Demo Personas

Switch personas instantly using the top navigation user pill:

| Name | Role | Email | Scenario |
|---|---|---|---|
| **Ananya Sharma** | `CUSTOMER` | `ananya@rewear.in` | College student, Chennai, farewell outfit seeker (82% profile) |
| **Kavita Sundaram** | `B2C_SELLER` | `kavita@rewear.in` | Verified wardrobe owner in Alwarpet (38 completed rentals) |
| **Vastra Studio Boutique** | `B2B_SELLER` | `contact@vastrastudio.in` | High-value couture bridal atelier in Nungambakkam |
| **Platform Admin** | `ADMIN` | `admin@rewear.in` | Trust, escrow liability & policy arbitrator |

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend**: Node.js, Express, TypeScript (`server.ts` full-stack runner with Vite middleware).
- **Architecture**: Domain-native REST APIs, Segregated Escrow Deposit State Machine, Rule-based Recommendation Engine with explainable match reasons, Seam Ease Fit Calculator.

---

## 📡 REST API Specifications

### Identity & Profile
- `POST /api/auth/login` — Demo persona authentication
- `GET /api/auth/me` — Current user profile & measurements
- `PATCH /api/auth/profile` — Update measurements and verification status

### Circular Catalog & AI Matching
- `GET /api/products` — Filter by category, occasion, size, budget, city, locality
- `GET /api/products/:id` — Detail view with Digital Passport care events
- `POST /api/products` — List new pre-loved piece with AI auto-suggestions
- `POST /api/products/:id/retire` — Retire piece under circular policy
- `POST /api/products/:id/fit-check` — Seam ease calculation against user measurements
- `POST /api/recommendations/match` — Algorithmic occasion & fit ranking with explainable bullets

### Orders & Escrow Handover
- `GET /api/orders` — Role-filtered booking history
- `POST /api/orders` — Reserve outfit with held escrow deposit
- `POST /api/orders/:id/handover` — Verify QR / OTP & condition photo checklist
- `POST /api/orders/:id/return` — Customer return dispatch with photos
- `POST /api/orders/:id/inspect` — Seller inspection (Full refund, deduction, or dispute)

### Deposits & Governance
- `GET /api/deposits` — Segregated escrow liability vault
- `GET /api/disputes` — Active arbitration cases
- `POST /api/disputes/:id/resolve` — Admin resolution
- `GET /api/seller/dashboard` — Net revenue (minus commission) & escrow liability
- `GET /api/admin/dashboard` — Platform GMV, policies, and immutable audit logs
- `PUT /api/admin/policy` — Live policy parameter reconfiguration
- `POST /api/demo/reset` — Reset to fresh initial seed state
