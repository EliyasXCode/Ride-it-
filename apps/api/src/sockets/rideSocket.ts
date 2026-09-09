import { Server as SocketIOServer, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '@rideflow/shared';
import { DispatchService } from '../services/dispatchService';
import { TripMessage } from '../models/TripMessage';
import { DriverProfile } from '../models/DriverProfile';
import { Ride } from '../models/Ride';
import { isConnectedToMongo } from '../config/db';

export function setupRideSocket(io: SocketIOServer) {
  DispatchService.setSocketIO(io);

  io.on('connection', (socket: Socket) => {
    let currentUserId: string | null = null;

    socket.on(SOCKET_EVENTS.JOIN_USER_ROOM, (data: { userId: string }) => {
      if (!data?.userId) return;
      currentUserId = data.userId;
      socket.join(`user:${data.userId}`);
    });

    socket.on(SOCKET_EVENTS.JOIN_RIDE_ROOM, (data: { rideId: string }) => {
      if (!data?.rideId) return;
      socket.join(`ride:${data.rideId}`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_RIDE_ROOM, (data: { rideId: string }) => {
      if (!data?.rideId) return;
      socket.leave(`ride:${data.rideId}`);
    });

    // Driver streams location
    socket.on(
      SOCKET_EVENTS.DRIVER_UPDATE_LOCATION,
      async (data: { lat: number; lng: number; heading?: number; rideId?: string }) => {
        if (!data || typeof data.lat !== 'number' || typeof data.lng !== 'number') return;

        // If driver is in active ride, forward location to ride room
        if (data.rideId) {
          io.to(`ride:${data.rideId}`).emit(SOCKET_EVENTS.DRIVER_LOCATION_UPDATED, {
            rideId: data.rideId,
            lat: data.lat,
            lng: data.lng,
            heading: data.heading || 0,
          });
        }

        // Update driver location in DB
        if (currentUserId && isConnectedToMongo) {
          try {
            await DriverProfile.findOneAndUpdate(
              { userId: currentUserId },
              {
                'location.coordinates': [data.lng, data.lat],
                'location.heading': data.heading || 0,
                'location.updatedAt': new Date(),
              }
            );
          } catch (e) {
            // ignore throttle errors
          }
        }
      }
    );

    // Driver responds to offer
    socket.on(
      SOCKET_EVENTS.DRIVER_RESPOND_OFFER,
      async (data: { rideId: string; accept: boolean }, callback?: (res: any) => void) => {
        if (!currentUserId || !data?.rideId) return;

        if (data.accept) {
          const result = await DispatchService.acceptOffer(data.rideId, currentUserId);
          if (callback) callback(result);
        } else {
          // Declined
          if (callback) callback({ success: true, declined: true });
        }
      }
    );

    // In-trip messaging
    socket.on(
      SOCKET_EVENTS.SEND_TRIP_MESSAGE,
      async (data: { rideId: string; senderRole: 'rider' | 'driver'; text: string }) => {
        if (!currentUserId || !data?.rideId || !data?.text?.trim()) return;

        const messagePayload = {
          id: `msg_${Date.now()}`,
          rideId: data.rideId,
          senderId: currentUserId,
          senderRole: data.senderRole,
          text: data.text.trim(),
          createdAt: new Date().toISOString(),
        };

        if (isConnectedToMongo) {
          try {
            await TripMessage.create({
              rideId: data.rideId,
              senderId: currentUserId,
              senderRole: data.senderRole,
              text: data.text.trim(),
            });
          } catch (e) {
            // persistence log
          }
        }

        // Broadcast to ride room
        io.to(`ride:${data.rideId}`).emit(SOCKET_EVENTS.TRIP_MESSAGE_RECEIVED, {
          message: messagePayload,
        });
      }
    );

    socket.on('disconnect', () => {
      // client disconnected
    });
  });
}
