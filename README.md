# FinPilot AI — Autonomous Financial Copilot & Agent

FinPilot AI is a competition-ready, zero-cost AI financial copilot engineered for safe, human-supervised financial optimization. It combines a responsive FinTech portfolio dashboard with an autonomous agent operating under strict **Plan → Act → Verify → Recover** guardrails.

---

## Non-Negotiable Zero-Cost AI Policy

- **Zero-Cost Inference**: Configured strictly to use OpenRouter's free-tier endpoint (`https://openrouter.ai/api/v1/chat/completions`).
- **No Paid Providers**: Never connects to paid OpenAI, Anthropic, or Gemini billable APIs.
- **Configurable Model**: Default model is `openrouter/free` (or free alternatives like `meta-llama/llama-3.3-70b-instruct:free`).
- **Full Offline / Demo Sandbox**: The application functions 100% out of the box in Demo Mode without requiring any API keys or credit cards.
- **Rate Limit & Fault Tolerance**: If upstream free models encounter rate limits (HTTP 429) or timeouts, FinPilot recovers seamlessly using its built-in deterministic simulation engine.

---

## Core Capabilities

1. **FinTech Dashboard**:
   - Liquid cash balance, monthly inflow, monthly burn, net cashflow, and emergency runway calculation.
   - Interactive category budget allocation with real-time solvency guards.
   - Savings goals tracking with progress percentages, target deadlines, and shortfall calculations.
   - Transaction ledger with search, multi-category filters, and 1-click copilot queries.
2. **Safe Autonomous Agent (Plan → Act → Verify → Recover)**:
   - **Plan**: Evaluates financial portfolio state and formulates a reasoned optimization strategy.
   - **Act**: Synthesizes a structured Proposed Action and checks server-side invariant rules.
   - **Verify (Human-in-the-Loop)**: Renders a dedicated Proposed-Action Review screen detailing the intended action, expected effect, and invariant checks. Consequential mutations are blocked until the user explicitly clicks "Approve".
   - **Recover**: If an action is rejected by the user or violates an invariant (e.g. overdraft, duplicate category shift), it safely aborts and logs the explanation in the immutable audit trail.
3. **Safety Invariants**:
   - Never moves real money or initiates wire payments.
   - Enforces strict positive amount and liquid balance limits.
   - Treats transaction descriptions and user inputs as untrusted data (sanitizes potential script injection).
   - Complete audit trail logging every simulation event and verification outcome.

---

## Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Backend**: Vercel Serverless API Functions (`/api/agent.ts`, `/api/health.ts`).
- **Local Dev Server**: Vite with built-in API dev middleware (no separate Express process required).
- **Test Framework**: Vitest with unit & integration tests covering safety invariants, agent workflows, and demo mode.

---

## Local Setup & Quickstart (Windows & Cross-Platform)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended).
- **npm**: v9+ (bundled with Node.js).

### 2. Clone / Open the Project
Open PowerShell or Command Prompt in the project folder:
```powershell
# Navigate to the project directory
cd finpilot-ai
```

### 3. Install Dependencies
```powershell
npm install
```

### 4. Configure Environment Variables (Optional for Live AI)
Copy the example environment file:
```powershell
# In Windows PowerShell:
Copy-Item .env.example .env

# Or in Windows CMD:
copy .env.example .env
```

Open `.env` in your text editor:
```env
# Optional: Enter your free OpenRouter API key from https://openrouter.ai/keys
# If left blank, FinPilot automatically operates in 100% functional Demo Mode
OPENROUTER_API_KEY="your_openrouter_api_key_here"

# Zero-cost OpenRouter model router
OPENROUTER_MODEL="openrouter/free"

# Local URL
APP_URL="http://localhost:3000"
```

### 5. Run the Local Development Server
```powershell
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## Build, Test & Lint Scripts

Run the verification scripts locally:

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local server with `/api` serverless middleware on port 3000 |
| `npm test` | Runs the Vitest automated test suite (8 safety invariant tests) |
| `npm run lint` | Runs TypeScript typechecker (`tsc --noEmit`) to verify zero type errors |
| `npm run build` | Compiles production assets into `/dist` for Vercel deployment |

---

## Vercel Deployment Instructions

### Exact Vercel Environment Variables:
Configure these in the Vercel Project Settings under **Settings → Environment Variables**:

| Variable Name | Required? | Example Value | Description |
| :--- | :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | Optional | `sk-or-v1-...` | Free API key from openrouter.ai. Never prefix with `VITE_`. |
| `OPENROUTER_MODEL` | Optional | `openrouter/free` | Configurable free model. Defaults to `openrouter/free`. |
| `APP_URL` | Optional | `https://your-app.vercel.app` | Production app deployment URL. |

### Deploy via Vercel CLI:
```powershell
# Install Vercel CLI globally (if not installed)
npm install -g vercel

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

### Deploy via GitHub:
1. Push your repository to GitHub.
2. In Vercel Dashboard, click **Add New Project** and import the repository.
3. Vercel automatically detects the **Vite** framework preset, builds with `npm run build`, and mounts serverless routes in `/api`.
4. Add the `OPENROUTER_API_KEY` environment variable in Vercel settings if desired.

---

## Local Verification Status & Remaining Checks

### Tests Executed & Passed:
- `npm test`: **8/8 tests passed** (Workflow lifecycle, positive amount guardrails, liquid balance constraints, category distinction, script injection sanitization, simulated execution accuracy, deterministic demo mode, failure rollback).
- `npm run lint`: **0 errors** (`tsc --noEmit` clean).
- `npm run build`: **Built successfully** in 1.08s into `/dist`.

### Exact Checks Remaining for You to Run Locally:
1. **Live OpenRouter API Key Test (Optional)**: If you possess an OpenRouter API key, add it to your local `.env` as `OPENROUTER_API_KEY="..."` and prompt the Copilot to verify responses directly from OpenRouter's free router. (Demo mode works completely without it).
2. **Interactive UI Walkthrough**: Open `http://localhost:3000`, switch profiles between Alex Mercer (Founder) and Elena Chen (Freelancer), test clicking "Approve & Execute" on the pre-staged Proposed Action, and inspect the Agent Audit Log tab.
