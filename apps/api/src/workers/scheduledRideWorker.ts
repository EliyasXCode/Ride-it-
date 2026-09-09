import { Ride } from '../models/Ride';
import { isConnectedToMongo } from '../config/db';
import { DispatchService } from '../services/dispatchService';

export class ScheduledRideWorker {
  private static interval: NodeJS.Timeout | null = null;

  public static start(intervalMs: number = 30000) {
    console.log(`[Worker] ScheduledRideWorker started. Polling every ${intervalMs / 1000}s`);

    this.interval = setInterval(async () => {
      await this.pollScheduledRides();
    }, intervalMs);

    // Initial check on boot
    this.pollScheduledRides();
  }

  public static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private static async pollScheduledRides() {
    if (!isConnectedToMongo) return;

    try {
      // Find rides scheduled within next 10 minutes that haven't been dispatched
      const thresholdTime = new Date(Date.now() + 10 * 60 * 1000);

      const readyRides = await Ride.find({
        status: 'requested',
        scheduledFor: { $lte: thresholdTime },
      }).limit(10);

      for (const ride of readyRides) {
        console.log(`[Worker] Enqueuing scheduled ride ${ride.id} for dispatch.`);
        await DispatchService.initiateDispatch(ride.id);
      }
    } catch (err: any) {
      console.error(`[Worker Error] ${err.message}`);
    }
  }
}
