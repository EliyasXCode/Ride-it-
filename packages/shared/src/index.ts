import { z } from 'zod';

// ==========================================
// Roles & Enums
// ==========================================
export const UserRoleSchema = z.enum(['rider', 'driver', 'admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const RideStatusSchema = z.enum([
  'requested',
  'searching',
  'assigned',
  'arriving',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'expired',
  'no_drivers',
]);
export type RideStatus = z.infer<typeof RideStatusSchema>;

export const VehicleCategorySchema = z.enum(['economy', 'comfort', 'xl']);
export type VehicleCategory = z.infer<typeof VehicleCategorySchema>;

export const DriverStatusSchema = z.enum(['offline', 'online', 'busy']);
export type DriverStatus = z.infer<typeof DriverStatusSchema>;

export const DriverApprovalStatusSchema = z.enum(['pending', 'approved', 'rejected', 'suspended']);
export type DriverApprovalStatus = z.infer<typeof DriverApprovalStatusSchema>;

export const PaymentMethodSchema = z.enum(['cash', 'card_sandbox']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const PaymentStatusSchema = z.enum(['pending', 'successful', 'failed', 'cancelled', 'refunded']);
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;

// ==========================================
// Geo & Coordinates
// ==========================================
export const LatLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type LatLng = z.infer<typeof LatLngSchema>;

export const LocationAddressSchema = z.object({
  address: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  placeId: z.string().optional(),
});
export type LocationAddress = z.infer<typeof LocationAddressSchema>;

// ==========================================
// User & Auth Schemas
// ==========================================
export const RegisterInputSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(['rider', 'driver']).default('rider'),
  phone: z.string().min(7).max(20).optional(),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const PasswordResetRequestSchema = z.object({
  email: z.string().email(),
});
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});
export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>;

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  phone: z.string().optional(),
  rating: z.number().default(5.0),
  ratingCount: z.number().default(0),
  isSuspended: z.boolean().default(false),
  createdAt: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

// ==========================================
// Driver Profile & Documents
// ==========================================
export const DriverRegistrationInputSchema = z.object({
  vehicleMake: z.string().min(2),
  vehicleModel: z.string().min(2),
  vehicleYear: z.number().int().min(2000).max(2030),
  licensePlate: z.string().min(2).max(15),
  vehicleColor: z.string().min(2),
  vehicleCategory: VehicleCategorySchema,
  driverLicenseNumber: z.string().min(3),
});
export type DriverRegistrationInput = z.infer<typeof DriverRegistrationInputSchema>;

export const DriverProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  approvalStatus: DriverApprovalStatusSchema,
  status: DriverStatusSchema,
  vehicle: z.object({
    make: z.string(),
    model: z.string(),
    year: z.number(),
    licensePlate: z.string(),
    color: z.string(),
    category: VehicleCategorySchema,
  }),
  driverLicenseNumber: z.string(),
  documents: z.array(
    z.object({
      id: z.string(),
      docType: z.string(),
      filename: z.string(),
      uploadedAt: z.string(),
      verified: z.boolean().default(false),
    })
  ).default([]),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    heading: z.number().optional(),
    updatedAt: z.string(),
  }).optional(),
  totalEarningsMinor: z.number().default(0),
});
export type DriverProfile = z.infer<typeof DriverProfileSchema>;

// ==========================================
// Pricing, Quotes & Fares
// ==========================================
export const FareBreakdownSchema = z.object({
  baseFareMinor: z.number(),
  distanceFareMinor: z.number(),
  timeFareMinor: z.number(),
  bookingFeeMinor: z.number(),
  taxMinor: z.number(),
  discountMinor: z.number().default(0),
  totalMinor: z.number(),
  currency: z.string().default('INR'),
  distanceKm: z.number(),
  durationMinutes: z.number(),
  vehicleCategory: VehicleCategorySchema,
  expiresAt: z.string(),
  quoteToken: z.string(),
});
export type FareBreakdown = z.infer<typeof FareBreakdownSchema>;

export const EstimateRequestSchema = z.object({
  pickup: LocationAddressSchema,
  dropoff: LocationAddressSchema,
  promoCode: z.string().optional(),
});
export type EstimateRequest = z.infer<typeof EstimateRequestSchema>;

export const VehicleOptionSchema = z.object({
  category: VehicleCategorySchema,
  displayName: z.string(),
  description: z.string(),
  capacity: z.number(),
  etaMinutes: z.number(),
  fare: FareBreakdownSchema,
});
export type VehicleOption = z.infer<typeof VehicleOptionSchema>;

// ==========================================
// Ride Booking & Verification
// ==========================================
export const CreateRideRequestSchema = z.object({
  pickup: LocationAddressSchema,
  dropoff: LocationAddressSchema,
  vehicleCategory: VehicleCategorySchema,
  quoteToken: z.string(),
  paymentMethod: PaymentMethodSchema.default('cash'),
  scheduledFor: z.string().optional(), // ISO date string
  idempotencyKey: z.string().min(8).optional(),
});
export type CreateRideRequest = z.infer<typeof CreateRideRequestSchema>;

export const RideSchema = z.object({
  id: z.string(),
  riderId: z.string(),
  riderName: z.string(),
  riderRating: z.number().default(5.0),
  driverId: z.string().optional(),
  driverName: z.string().optional(),
  driverRating: z.number().optional(),
  driverVehicle: z.object({
    make: z.string(),
    model: z.string(),
    color: z.string(),
    licensePlate: z.string(),
    category: VehicleCategorySchema,
  }).optional(),
  status: RideStatusSchema,
  pickup: LocationAddressSchema,
  dropoff: LocationAddressSchema,
  routePolyline: z.string().optional(),
  distanceKm: z.number(),
  durationMinutes: z.number(),
  vehicleCategory: VehicleCategorySchema,
  fareMinor: z.number(),
  currency: z.string(),
  paymentMethod: PaymentMethodSchema,
  paymentStatus: PaymentStatusSchema,
  startPin: z.string(), // 4-digit code shown to rider
  shareToken: z.string().optional(),
  cancellationReason: z.string().optional(),
  cancelledBy: z.enum(['rider', 'driver', 'system']).optional(),
  cancellationFeeMinor: z.number().default(0),
  scheduledFor: z.string().optional(),
  createdAt: z.string(),
  assignedAt: z.string().optional(),
  arrivedAt: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});
export type Ride = z.infer<typeof RideSchema>;

// ==========================================
// Verification PIN & Driver Actions
// ==========================================
export const VerifyPinRequestSchema = z.object({
  rideId: z.string(),
  pin: z.string().length(4),
});
export type VerifyPinRequest = z.infer<typeof VerifyPinRequestSchema>;

export const CancelRideRequestSchema = z.object({
  rideId: z.string().optional(),
  reason: z.string().min(1).max(200),
});
export type CancelRideRequest = z.infer<typeof CancelRideRequestSchema>;

export const RateTripRequestSchema = z.object({
  rideId: z.string().optional(),
  score: z.number().int().min(1).max(5),
  feedback: z.string().max(500).optional(),
});
export type RateTripRequest = z.infer<typeof RateTripRequestSchema>;

// ==========================================
// Saved Places
// ==========================================
export const SavedPlaceSchema = z.object({
  id: z.string(),
  userId: z.string(),
  label: z.enum(['home', 'work', 'favorite', 'custom']),
  customName: z.string().optional(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type SavedPlace = z.infer<typeof SavedPlaceSchema>;

// ==========================================
// Support Tickets & Chat
// ==========================================
export const CreateSupportTicketSchema = z.object({
  rideId: z.string().optional(),
  category: z.enum(['trip_issue', 'billing', 'driver_behavior', 'lost_item', 'safety', 'other']),
  subject: z.string().min(5).max(100),
  message: z.string().min(10).max(2000),
});
export type CreateSupportTicket = z.infer<typeof CreateSupportTicketSchema>;

export const SupportTicketSchema = z.object({
  id: z.string(),
  userId: z.string(),
  rideId: z.string().optional(),
  category: z.string(),
  subject: z.string(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  createdAt: z.string(),
  messages: z.array(
    z.object({
      senderId: z.string(),
      senderRole: UserRoleSchema,
      senderName: z.string(),
      message: z.string(),
      createdAt: z.string(),
    })
  ),
});
export type SupportTicket = z.infer<typeof SupportTicketSchema>;

// ==========================================
// Chat Messages between Rider & Driver
// ==========================================
export const TripMessageSchema = z.object({
  id: z.string(),
  rideId: z.string(),
  senderId: z.string(),
  senderRole: z.enum(['rider', 'driver']),
  text: z.string().min(1).max(500),
  createdAt: z.string(),
});
export type TripMessage = z.infer<typeof TripMessageSchema>;

// ==========================================
// Gemini AI Assistant Schemas
// ==========================================
export const AIChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ).default([]),
});
export type AIChatRequest = z.infer<typeof AIChatRequestSchema>;

export const ProposedBookingFormSchema = z.object({
  pickupText: z.string().optional(),
  dropoffText: z.string().optional(),
  vehicleCategory: VehicleCategorySchema.optional(),
  scheduledTime: z.string().optional(),
  notes: z.string().optional(),
});
export type ProposedBookingForm = z.infer<typeof ProposedBookingFormSchema>;

export const AIChatResponseSchema = z.object({
  reply: z.string(),
  proposedBooking: ProposedBookingFormSchema.optional(),
  suggestedAction: z.enum(['estimate_fare', 'view_rides', 'support', 'none']).default('none'),
});
export type AIChatResponse = z.infer<typeof AIChatResponseSchema>;

// ==========================================
// Realtime Socket Events
// ==========================================
export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_USER_ROOM: 'join_user_room',
  DRIVER_UPDATE_LOCATION: 'driver:update_location',
  DRIVER_RESPOND_OFFER: 'driver:respond_offer',
  JOIN_RIDE_ROOM: 'join_ride_room',
  LEAVE_RIDE_ROOM: 'leave_ride_room',
  SEND_TRIP_MESSAGE: 'trip:send_message',

  // Server -> Client
  RIDE_OFFER_DISPATCHED: 'ride:offer_dispatched',
  RIDE_STATUS_UPDATED: 'ride:status_updated',
  DRIVER_LOCATION_UPDATED: 'driver:location_updated',
  TRIP_MESSAGE_RECEIVED: 'trip:message_received',
  RIDE_CANCELLED: 'ride:cancelled',
  SCHEDULED_RIDE_MATCHED: 'ride:scheduled_matched',
  SYSTEM_NOTIFICATION: 'system:notification',
} as const;

// ==========================================
// API Standard Response Wrapper
// ==========================================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
