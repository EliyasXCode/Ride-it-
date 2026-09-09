'use client';

import React, { useState } from 'react';
import { Sparkles, X, Send, ArrowRight, Bot, User, Car } from 'lucide-react';
import { fetchApi } from '../lib/api';
import { AIChatResponse } from '@rideflow/shared';
import { useRideStore } from '../stores/rideStore';

export const AIAssistantWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; content: string; proposedBooking?: any }>>([
    {
      role: 'model',
      content:
        "Hi! I'm your RideFlow Assistant. Ask me about pricing, vehicle categories, or tell me where you'd like to ride (e.g. *\"Take me from Union Square to SFO Airport\"*)!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { setPickup, setDropoff, setSelectedCategory } = useRideStore();

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, content: userText }];
    setMessages(newMessages);
    setIsSending(true);

    try {
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetchApi<AIChatResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userText,
          conversationHistory: history,
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: res.reply,
          proposedBooking: res.proposedBooking,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: 'Sorry, I had trouble connecting. You can still book your ride directly on the main booking screen!',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyBooking = (proposed: any) => {
    if (proposed.pickupText) {
      setPickup({
        address: proposed.pickupText,
        lat: 37.7749,
        lng: -122.4194,
      });
    }
    if (proposed.dropoffText) {
      setDropoff({
        address: proposed.dropoffText,
        lat: 37.7833,
        lng: -122.4167,
      });
    }
    if (proposed.vehicleCategory) {
      setSelectedCategory(proposed.vehicleCategory);
    }
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-charcoal-900 text-white rounded-full shadow-2xl hover:bg-charcoal-800 transition-all duration-200 hover:scale-105 border border-charcoal-700/50"
          aria-label="Open RideFlow AI Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1">RideFlow AI</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[360px] sm:w-[400px] h-[520px] rounded-3xl shadow-2xl border border-charcoal-200/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-charcoal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">RideFlow Assistant</h3>
                <div className="text-[10px] text-emerald-400 font-medium">Powered by Gemini AI</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-white hover:bg-charcoal-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-2xl ${
                    m.role === 'user'
                      ? 'bg-charcoal-900 text-white rounded-br-none'
                      : 'bg-charcoal-100 text-charcoal-800 rounded-bl-none leading-relaxed'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>

                  {/* Proposed Booking Card from AI */}
                  {m.proposedBooking && (m.proposedBooking.pickupText || m.proposedBooking.dropoffText) && (
                    <div className="mt-3 p-3 bg-white rounded-xl border border-charcoal-200 shadow-sm text-charcoal-900 space-y-2">
                      <div className="font-bold text-[11px] text-emerald-700 flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        Proposed Itinerary
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div>
                          <span className="text-charcoal-400 font-medium">From: </span>
                          <span className="font-semibold">{m.proposedBooking.pickupText || 'Current location'}</span>
                        </div>
                        <div>
                          <span className="text-charcoal-400 font-medium">To: </span>
                          <span className="font-semibold">{m.proposedBooking.dropoffText || 'Destination'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleApplyBooking(m.proposedBooking)}
                        className="w-full mt-1 py-1.5 px-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg flex items-center justify-center gap-1 text-[11px] shadow-sm"
                      >
                        <span>Apply to Booking Form</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex gap-2 items-center text-charcoal-400 text-xs italic">
                <Bot className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-charcoal-50 border-t border-charcoal-200 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything or request a ride..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-charcoal-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="p-2.5 rounded-xl bg-charcoal-900 text-white disabled:opacity-50 hover:bg-charcoal-800 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
