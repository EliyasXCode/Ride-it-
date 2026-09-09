# Gemini AI Integration & Safety Guide

RideFlow features an integrated AI assistant powered by the official `@google/genai` Node.js SDK on the backend server.

---

## 1. Official Model & Free-Tier Eligibility

- **Default Model**: `gemini-2.5-flash` (or `gemini-1.5-flash`)
- **SDK**: Official `@google/genai`
- **Free Tier Eligibility**:
  - Google AI Studio provides free-tier rate limits (up to 15 Requests Per Minute / 1 million Tokens Per Minute for flash models) at zero cost.
  - Obtain an API key instantly at [aistudio.google.com](https://aistudio.google.com/).

---

## 2. Environment Configuration

In `rideflow/apps/api/.env`:
```env
GEMINI_API_KEY=AIzaSy...your_gemini_key_here
GEMINI_MODEL=gemini-2.5-flash
```

---

## 3. Capabilities & System Boundaries

The AI Assistant is accessible from both the booking screen and the help portal to:
1. Answer FAQs about RideFlow services, policies, and pricing formulas.
2. Explain vehicle categories (Economy, Comfort, XL) and fare breakdown components.
3. Parse unstructured natural language into structured booking parameters (e.g. *"I need a ride from Union Square to SFO Airport"*).
4. Direct users to the relevant support ticket category.

### Strict Deterministic Boundaries:
- **Zero Hallucination of Coordinates or Fares**: The AI Assistant **never** invents coordinates, driver positions, or prices. It only proposes pickup/destination text strings to the client form.
- **Explicit Confirmation**: Rides are never booked or cancelled automatically by AI responses; the rider must explicitly review and confirm via the booking screen.
- **Zero Access to Sensitive Data**: Payment details, credentials, driver government documents, and raw GPS history are strictly blocked from AI prompts.
- **Graceful Fallback**: If `GEMINI_API_KEY` is not provided or the Gemini API is unreachable, the booking interface functions completely normally without AI assistance.
