'use client';

import React, { useState } from 'react';
import { LifeBuoy, Send, CheckCircle2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchApi } from '../../lib/api';

export default function HelpPage() {
  const [category, setCategory] = useState<'trip_issue' | 'billing' | 'driver_behavior' | 'lost_item' | 'safety' | 'other'>('trip_issue');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the 4-Digit Ride-Start PIN?',
      a: 'The Ride-Start PIN is a unique security code displayed on your rider screen when a driver is assigned. You share this code with your driver before the trip begins. The driver enters it into their app, verifying that both rider and driver are matched correctly.',
    },
    {
      q: 'How are RideFlow fares calculated?',
      a: 'Fares are calculated based on base fare, estimated distance (per kilometer), estimated duration (per minute), a standard platform booking fee, and applicable taxes. Upfront fares are locked for 10 minutes from quote generation.',
    },
    {
      q: 'What is the cancellation policy?',
      a: 'You can cancel free of charge within 2 minutes of driver matching. Cancellations made after 2 minutes or after the driver has arrived at the pickup location incur a modest $3.00 compensation fee paid to the driver.',
    },
    {
      q: 'How do I retrieve a lost item?',
      a: 'If you left an item in a vehicle, submit a support ticket below under the "Lost Item" category. Our support team will coordinate with your driver to arrange a safe return.',
    },
  ];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setIsSubmitting(true);
    try {
      await fetchApi('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ category, subject, message }),
      });
      setSubmitted(true);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Customer Care</span>
        <h1 className="text-4xl font-black text-charcoal-900 tracking-tight">Help & Support</h1>
        <p className="text-xs text-charcoal-500">
          Find answers to frequently asked questions or contact our support team.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        <h3 className="text-lg font-black text-charcoal-900 mb-4">Frequently Asked Questions</h3>
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-charcoal-200/80 overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-charcoal-900 hover:bg-charcoal-50"
            >
              <span>{faq.q}</span>
              {openFaq === idx ? <ChevronUp className="w-4 h-4 text-charcoal-400" /> : <ChevronDown className="w-4 h-4 text-charcoal-400" />}
            </button>
            {openFaq === idx && (
              <div className="px-4 pb-4 text-xs text-charcoal-600 leading-relaxed border-t border-charcoal-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Submit Support Ticket Form */}
      <div className="bg-white rounded-3xl p-8 border border-charcoal-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-charcoal-900 text-base">Submit a Support Ticket</h3>
            <p className="text-xs text-charcoal-500">Our team will review your inquiry within 4 business hours.</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-900 text-sm">Ticket Submitted Successfully</h4>
            <p className="text-xs text-emerald-700">A support representative has been assigned to your case.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
                >
                  <option value="trip_issue">Trip Issue or Routing</option>
                  <option value="billing">Billing & Refund Request</option>
                  <option value="driver_behavior">Driver or Rider Feedback</option>
                  <option value="lost_item">Lost Item in Vehicle</option>
                  <option value="safety">Safety Incident</option>
                  <option value="other">Other Inquiry</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-charcoal-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-charcoal-700 block mb-1">Detailed Message</label>
              <textarea
                rows={4}
                required
                placeholder="Explain what happened in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 rounded-xl border border-charcoal-200 bg-charcoal-50 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSubmitting ? 'Submitting...' : 'Send Ticket'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
