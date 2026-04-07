# Orbit AI - Payment System Setup Guide

## Environment Variables Required

### Backend (Railway)

You need to set these environment variables in your Railway dashboard:

```bash
# Database
MONGO_URI=mongodb+srv://rajanahuja2006_db_us:rajan124421@cluster0.ruz5hph.mongodb.net/?appName=Cluster0

# Authentication
JWT_SECRET=orbitSuperSecretKey123

# Stripe Payment
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLIC_KEY=pk_live_YOUR_STRIPE_PUBLIC_KEY_HERE

# Node Environment
NODE_ENV=production

# Frontend URL (for redirect after payment)
FRONTEND_URL=https://orbitaifrontend-phi.vercel.app
```

### Frontend (.env)

Create a `.env` file in `orbit-frontend-premium/`:

```bash
VITE_API_URL=https://rajan5656-production.up.railway.app/api
VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_STRIPE_PUBLIC_KEY_HERE
```

## Stripe Setup Steps

1. **Get Your Stripe Keys:**
   - Go to https://dashboard.stripe.com
   - Sign in or create an account
   - Navigate to Developers > API keys
   - Copy your Secret Key (starts with `sk_live_`)
   - Copy your Publishable Key (starts with `pk_live_`)

2. **Set Environment Variables on Railway:**
   ```bash
   railway variables set STRIPE_SECRET_KEY "sk_live_xxxxxxxxxxxx"
   railway variables set STRIPE_PUBLIC_KEY "pk_live_xxxxxxxxxxxx"
   railway variables set FRONTEND_URL "https://orbitaifrontend-phi.vercel.app"
   ```

3. **Redeploy Backend:**
   ```bash
   railway up --detach
   ```

## Payment Plans

The system includes 3 subscription tiers:

### Basic Plan - $1.99/month
- 5 Resume Uploads
- Basic ATS Analysis
- Email Support
- Download Reports

### Premium Plan - $5.99/month ⭐ (Most Popular)
- 50 Resume Uploads
- Advanced ATS Analysis
- AI Career Tutor Access
- Priority Email Support
- Job Matching
- Skill Recommendations

### Pro Plan - $12.99/month
- Unlimited Resume Uploads
- Expert Resume Review
- Full AI Suite Access
- 24/7 Priority Support
- API Access
- Custom Roadmaps
- Interview Prep
- Monthly Strategy Call

## Testing Payment Flow

### Test Mode (Stripe Sandbox Cards)

Use these test card numbers to test without real charges:

**Success:**
- Card: 4242 4242 4242 4242
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

**Decline:**
- Card: 4000 0000 0000 0002
- Expiry: Any future date
- CVC: Any 3 digits

## API Endpoints

- `POST /api/payment/create-checkout-session` - Create Stripe checkout session
- `POST /api/payment/verify-payment` - Verify and activate subscription
- `GET /api/payment/subscription` - Get user's subscription status

## How It Works

1. User clicks "Subscribe" on Pricing page
2. Frontend creates a Stripe checkout session
3. User is redirected to Stripe's secure checkout
4. After successful payment, Stripe redirects to `/payment-success`
5. Frontend verifies payment with backend
6. Backend activates subscription and sets resume upload limit
7. User can now upload resumes based on their plan

## Upload Limits

- **Free Tier**: 0 uploads (must subscribe)
- **Basic**: 5 uploads per month
- **Premium**: 50 uploads per month
- **Pro**: Unlimited uploads

When a user reaches their limit, they'll see a message to upgrade, and the frontend will redirect them to the Pricing page.

---

**Note:** Make sure to test the payment flow thoroughly before going live!
