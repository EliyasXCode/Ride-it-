import { FareEngine } from '../src/services/fareEngine';

describe('FareEngine Calculation & Quote Locking', () => {
  const mockPickup = { address: 'Market St, San Francisco', lat: 37.7749, lng: -122.4194 };
  const mockDropoff = { address: 'SFO Airport', lat: 37.6213, lng: -122.3790 };

  it('calculates integer minor fare breakdowns for Economy, Comfort, and XL', async () => {
    const distanceKm = 20.0;
    const durationMinutes = 25;

    const result = await FareEngine.calculateEstimate(
      mockPickup,
      mockDropoff,
      distanceKm,
      durationMinutes
    );

    expect(result.quoteToken).toBeDefined();
    expect(result.options).toHaveLength(3);

    const economy = result.options.find((o) => o.category === 'economy');
    const comfort = result.options.find((o) => o.category === 'comfort');
    const xl = result.options.find((o) => o.category === 'xl');

    expect(economy).toBeDefined();
    expect(comfort).toBeDefined();
    expect(xl).toBeDefined();

    // Prices must be in minor units (positive integers)
    expect(Number.isInteger(economy!.fare.totalMinor)).toBe(true);
    expect(economy!.fare.totalMinor).toBeGreaterThan(500); // Greater than min fare $5.00

    // Comfort must be higher than Economy, and XL higher than Comfort
    expect(comfort!.fare.totalMinor).toBeGreaterThan(economy!.fare.totalMinor);
    expect(xl!.fare.totalMinor).toBeGreaterThan(comfort!.fare.totalMinor);
  });

  it('verifies quote tokens accurately and rejects invalid tokens', async () => {
    const result = await FareEngine.calculateEstimate(mockPickup, mockDropoff, 10, 15);

    const verification = await FareEngine.verifyQuote(result.quoteToken, 'economy');
    expect(verification.valid).toBe(true);
    expect(verification.fareMinor).toBeGreaterThan(0);

    const fakeVerification = await FareEngine.verifyQuote('invalid_token_12345', 'economy');
    expect(fakeVerification.valid).toBe(false);
  });

  it('applies promo code discounts correctly', async () => {
    const withoutPromo = await FareEngine.calculateEstimate(mockPickup, mockDropoff, 10, 15);
    const withPromo = await FareEngine.calculateEstimate(mockPickup, mockDropoff, 10, 15, 'RIDEFLOW5');

    const econStandard = withoutPromo.options.find((o) => o.category === 'economy')!.fare.totalMinor;
    const econPromo = withPromo.options.find((o) => o.category === 'economy')!.fare.totalMinor;

    expect(econStandard - econPromo).toBe(500); // Exactly $5.00 discount
  });
});
