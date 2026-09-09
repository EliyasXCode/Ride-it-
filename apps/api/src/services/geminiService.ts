import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env';
import { AIChatResponse, ProposedBookingForm } from '@rideflow/shared';

export class GeminiService {
  private static aiClient: GoogleGenAI | null = null;

  private static getClient(): GoogleGenAI | null {
    if (!this.aiClient && config.geminiApiKey) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
      } catch (err: any) {
        console.warn(`[Gemini SDK Warning] Failed to initialize GoogleGenAI: ${err.message}`);
      }
    }
    return this.aiClient;
  }

  public static async processChat(
    userMessage: string,
    history: Array<{ role: 'user' | 'model'; content: string }> = []
  ): Promise<AIChatResponse> {
    const client = this.getClient();

    if (!client || !config.geminiApiKey) {
      return this.fallbackRulesBasedResponse(userMessage);
    }

    const systemPrompt = `
You are RideFlow Assistant, an AI pair for the RideFlow ride-booking web application.
Your role:
1. Help riders with FAQs about ride booking, vehicle types (Economy, Comfort, XL), safety, pricing formulas, and receipts.
2. If the user expresses an intent to book a trip (e.g. "I want to go from Downtown to the Airport"), extract the pickup address, destination address, preferred vehicle category (economy, comfort, or xl), and any requested schedule time.
3. If the user asks for help with a lost item, fare dispute, or safety, suggest creating a support ticket.
4. IMPORTANT: Never invent fake coordinates, credit card numbers, or driver locations. Dispatch and fare confirmation are strictly performed by backend systems after explicit user confirmation.

Output format: You MUST respond in valid JSON format matching this schema:
{
  "reply": "Your friendly, concise assistant reply in plain markdown.",
  "suggestedAction": "estimate_fare" | "view_rides" | "support" | "none",
  "proposedBooking": {
    "pickupText": "extracted pickup address or null",
    "dropoffText": "extracted dropoff address or null",
    "vehicleCategory": "economy" | "comfort" | "xl" | null,
    "scheduledTime": "extracted ISO date or human string or null"
  }
}
`;

    try {
      const formattedContents = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        ...history.map((h) => ({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
        { role: 'user', parts: [{ text: userMessage }] },
      ];

      // Call the official @google/genai SDK
      const response = await client.models.generateContent({
        model: config.geminiModel || 'gemini-2.5-flash',
        contents: formattedContents as any,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text || '';
      try {
        const parsed = JSON.parse(text);
        return {
          reply: parsed.reply || 'Here is what I found for you.',
          suggestedAction: parsed.suggestedAction || 'none',
          proposedBooking: parsed.proposedBooking || undefined,
        };
      } catch {
        return {
          reply: text,
          suggestedAction: 'none',
        };
      }
    } catch (err: any) {
      console.warn(`[Gemini API Error] ${err.message}. Providing smart fallback.`);
      return this.fallbackRulesBasedResponse(userMessage);
    }
  }

  private static fallbackRulesBasedResponse(userMessage: string): AIChatResponse {
    const lower = userMessage.toLowerCase();

    // Check for trip planning intent
    if (lower.includes('from') && lower.includes('to')) {
      const match = userMessage.match(/from\s+([^,]+?)\s+to\s+([^,.\n]+)/i);
      if (match) {
        return {
          reply: `I've prepared a ride proposal from **${match[1].trim()}** to **${match[2].trim()}**. You can review fare estimates and select your vehicle on the booking screen.`,
          suggestedAction: 'estimate_fare',
          proposedBooking: {
            pickupText: match[1].trim(),
            dropoffText: match[2].trim(),
            vehicleCategory: lower.includes('xl') ? 'xl' : lower.includes('comfort') ? 'comfort' : 'economy',
          },
        };
      }
    }

    if (lower.includes('cancel') || lower.includes('refund')) {
      return {
        reply: `You can cancel an active ride anytime from your live trip screen. Free cancellation applies within 2 minutes of driver matching. After that, a small cancellation fee applies to compensate the driver for fuel. For refund requests, you can submit a support ticket under Billing.`,
        suggestedAction: 'support',
      };
    }

    if (lower.includes('vehicle') || lower.includes('category') || lower.includes('car')) {
      return {
        reply: `RideFlow offers three distinct categories:\n- **Economy**: Everyday affordable rides (up to 4 passengers).\n- **Comfort**: Newer vehicles with extra legroom and experienced top-rated drivers.\n- **XL**: Spacious SUVs and vans seating up to 6 passengers with ample luggage space.`,
        suggestedAction: 'estimate_fare',
      };
    }

    if (lower.includes('safety') || lower.includes('pin') || lower.includes('emergency')) {
      return {
        reply: `Your safety is our top priority! Every RideFlow trip requires a **4-Digit Start PIN** that you give your driver before the ride starts. You can also share your live trip route with trusted contacts or tap the Emergency Action button in the Safety Panel.`,
        suggestedAction: 'none',
      };
    }

    return {
      reply: `Hello! I'm your RideFlow Assistant. I can help you find rides, explain vehicle categories and pricing, or assist you with customer support. Try asking: *"I need a ride from Union Square to SFO Airport"*!`,
      suggestedAction: 'none',
    };
  }
}
