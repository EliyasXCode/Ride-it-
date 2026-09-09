import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-semibold">
        ⚠️ TEMPLATE NOTICE: These Terms of Service represent a demonstration template. Customize with your company's
        jurisdiction and legal terms before production deployment.
      </div>

      <h1 className="text-3xl font-black text-charcoal-900">Terms of Service (Template)</h1>
      <p className="text-xs text-charcoal-500">Effective Date: January 1, 2026</p>

      <div className="prose prose-sm text-charcoal-600 text-xs leading-relaxed space-y-4">
        <h3 className="font-bold text-charcoal-900 text-sm">1. User Agreement</h3>
        <p>
          By creating an account on RideFlow, you agree to comply with local transportation regulations, treat drivers
          and fellow riders with respect, and verify trips using the provided 4-digit ride-start PIN.
        </p>

        <h3 className="font-bold text-charcoal-900 text-sm">2. Upfront Fare Quotes and Cancellation</h3>
        <p>
          Fares displayed upon quotation are locked for 10 minutes. Cancellations initiated after 2 minutes of driver
          assignment or after the driver arrives at pickup may incur a compensation fee.
        </p>

        <h3 className="font-bold text-charcoal-900 text-sm">3. Driver Terms</h3>
        <p>
          Drivers must maintain an active driver's license, valid vehicle registration, and clear background check.
          Driver accounts are subject to administrative approval and periodic compliance review.
        </p>
      </div>
    </div>
  );
}
