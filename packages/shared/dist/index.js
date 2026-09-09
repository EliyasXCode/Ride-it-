"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOCKET_EVENTS = exports.AIChatResponseSchema = exports.ProposedBookingFormSchema = exports.AIChatRequestSchema = exports.TripMessageSchema = exports.SupportTicketSchema = exports.CreateSupportTicketSchema = exports.SavedPlaceSchema = exports.RateTripRequestSchema = exports.CancelRideRequestSchema = exports.VerifyPinRequestSchema = exports.RideSchema = exports.CreateRideRequestSchema = exports.VehicleOptionSchema = exports.EstimateRequestSchema = exports.FareBreakdownSchema = exports.DriverProfileSchema = exports.DriverRegistrationInputSchema = exports.UserProfileSchema = exports.PasswordResetConfirmSchema = exports.PasswordResetRequestSchema = exports.LoginInputSchema = exports.RegisterInputSchema = exports.LocationAddressSchema = exports.LatLngSchema = exports.PaymentStatusSchema = exports.PaymentMethodSchema = exports.DriverApprovalStatusSchema = exports.DriverStatusSchema = exports.VehicleCategorySchema = exports.RideStatusSchema = exports.UserRoleSchema = void 0;
const zod_1 = require("zod");
// ==========================================
// Roles & Enums
// ==========================================
exports.UserRoleSchema = zod_1.z.enum(['rider', 'driver', 'admin']);
exports.RideStatusSchema = zod_1.z.enum([
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
exports.VehicleCategorySchema = zod_1.z.enum(['economy', 'comfort', 'xl']);
exports.DriverStatusSchema = zod_1.z.enum(['offline', 'online', 'busy']);
exports.DriverApprovalStatusSchema = zod_1.z.enum(['pending', 'approved', 'rejected', 'suspended']);
exports.PaymentMethodSchema = zod_1.z.enum(['cash', 'card_sandbox']);
exports.PaymentStatusSchema = zod_1.z.enum(['pending', 'successful', 'failed', 'cancelled', 'refunded']);
// ==========================================
// Geo & Coordinates
// ==========================================
exports.LatLngSchema = zod_1.z.object({
    lat: zod_1.z.number().min(-90).max(90),
    lng: zod_1.z.number().min(-180).max(180),
});
exports.LocationAddressSchema = zod_1.z.object({
    address: zod_1.z.string().min(1),
    lat: zod_1.z.number().min(-90).max(90),
    lng: zod_1.z.number().min(-180).max(180),
    placeId: zod_1.z.string().optional(),
});
// ==========================================
// User & Auth Schemas
// ==========================================
exports.RegisterInputSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(100),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8).max(100),
    role: zod_1.z.enum(['rider', 'driver']).default('rider'),
    phone: zod_1.z.string().min(7).max(20).optional(),
});
exports.LoginInputSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
exports.PasswordResetRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.PasswordResetConfirmSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(8).max(100),
});
exports.UserProfileSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    role: exports.UserRoleSchema,
    phone: zod_1.z.string().optional(),
    rating: zod_1.z.number().default(5.0),
    ratingCount: zod_1.z.number().default(0),
    isSuspended: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string(),
});
// ==========================================
// Driver Profile & Documents
// ==========================================
exports.DriverRegistrationInputSchema = zod_1.z.object({
    vehicleMake: zod_1.z.string().min(2),
    vehicleModel: zod_1.z.string().min(2),
    vehicleYear: zod_1.z.number().int().min(2000).max(2030),
    licensePlate: zod_1.z.string().min(2).max(15),
    vehicleColor: zod_1.z.string().min(2),
    vehicleCategory: exports.VehicleCategorySchema,
    driverLicenseNumber: zod_1.z.string().min(3),
});
exports.DriverProfileSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    approvalStatus: exports.DriverApprovalStatusSchema,
    status: exports.DriverStatusSchema,
    vehicle: zod_1.z.object({
        make: zod_1.z.string(),
        model: zod_1.z.string(),
        year: zod_1.z.number(),
        licensePlate: zod_1.z.string(),
        color: zod_1.z.string(),
        category: exports.VehicleCategorySchema,
    }),
    driverLicenseNumber: zod_1.z.string(),
    documents: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        docType: zod_1.z.string(),
        filename: zod_1.z.string(),
        uploadedAt: zod_1.z.string(),
        verified: zod_1.z.boolean().default(false),
    })).default([]),
    currentLocation: zod_1.z.object({
        lat: zod_1.z.number(),
        lng: zod_1.z.number(),
        heading: zod_1.z.number().optional(),
        updatedAt: zod_1.z.string(),
    }).optional(),
    totalEarningsMinor: zod_1.z.number().default(0),
});
// ==========================================
// Pricing, Quotes & Fares
// ==========================================
exports.FareBreakdownSchema = zod_1.z.object({
    baseFareMinor: zod_1.z.number(),
    distanceFareMinor: zod_1.z.number(),
    timeFareMinor: zod_1.z.number(),
    bookingFeeMinor: zod_1.z.number(),
    taxMinor: zod_1.z.number(),
    discountMinor: zod_1.z.number().default(0),
    totalMinor: zod_1.z.number(),
    currency: zod_1.z.string().default('INR'),
    distanceKm: zod_1.z.number(),
    durationMinutes: zod_1.z.number(),
    vehicleCategory: exports.VehicleCategorySchema,
    expiresAt: zod_1.z.string(),
    quoteToken: zod_1.z.string(),
});
exports.EstimateRequestSchema = zod_1.z.object({
    pickup: exports.LocationAddressSchema,
    dropoff: exports.LocationAddressSchema,
    promoCode: zod_1.z.string().optional(),
});
exports.VehicleOptionSchema = zod_1.z.object({
    category: exports.VehicleCategorySchema,
    displayName: zod_1.z.string(),
    description: zod_1.z.string(),
    capacity: zod_1.z.number(),
    etaMinutes: zod_1.z.number(),
    fare: exports.FareBreakdownSchema,
});
// ==========================================
// Ride Booking & Verification
// ==========================================
exports.CreateRideRequestSchema = zod_1.z.object({
    pickup: exports.LocationAddressSchema,
    dropoff: exports.LocationAddressSchema,
    vehicleCategory: exports.VehicleCategorySchema,
    quoteToken: zod_1.z.string(),
    paymentMethod: exports.PaymentMethodSchema.default('cash'),
    scheduledFor: zod_1.z.string().optional(), // ISO date string
    idempotencyKey: zod_1.z.string().min(8).optional(),
});
exports.RideSchema = zod_1.z.object({
    id: zod_1.z.string(),
    riderId: zod_1.z.string(),
    riderName: zod_1.z.string(),
    riderRating: zod_1.z.number().default(5.0),
    driverId: zod_1.z.string().optional(),
    driverName: zod_1.z.string().optional(),
    driverRating: zod_1.z.number().optional(),
    driverVehicle: zod_1.z.object({
        make: zod_1.z.string(),
        model: zod_1.z.string(),
        color: zod_1.z.string(),
        licensePlate: zod_1.z.string(),
        category: exports.VehicleCategorySchema,
    }).optional(),
    status: exports.RideStatusSchema,
    pickup: exports.LocationAddressSchema,
    dropoff: exports.LocationAddressSchema,
    routePolyline: zod_1.z.string().optional(),
    distanceKm: zod_1.z.number(),
    durationMinutes: zod_1.z.number(),
    vehicleCategory: exports.VehicleCategorySchema,
    fareMinor: zod_1.z.number(),
    currency: zod_1.z.string(),
    paymentMethod: exports.PaymentMethodSchema,
    paymentStatus: exports.PaymentStatusSchema,
    startPin: zod_1.z.string(), // 4-digit code shown to rider
    shareToken: zod_1.z.string().optional(),
    cancellationReason: zod_1.z.string().optional(),
    cancelledBy: zod_1.z.enum(['rider', 'driver', 'system']).optional(),
    cancellationFeeMinor: zod_1.z.number().default(0),
    scheduledFor: zod_1.z.string().optional(),
    createdAt: zod_1.z.string(),
    assignedAt: zod_1.z.string().optional(),
    arrivedAt: zod_1.z.string().optional(),
    startedAt: zod_1.z.string().optional(),
    completedAt: zod_1.z.string().optional(),
});
// ==========================================
// Verification PIN & Driver Actions
// ==========================================
exports.VerifyPinRequestSchema = zod_1.z.object({
    rideId: zod_1.z.string(),
    pin: zod_1.z.string().length(4),
});
exports.CancelRideRequestSchema = zod_1.z.object({
    rideId: zod_1.z.string().optional(),
    reason: zod_1.z.string().min(1).max(200),
});
exports.RateTripRequestSchema = zod_1.z.object({
    rideId: zod_1.z.string().optional(),
    score: zod_1.z.number().int().min(1).max(5),
    feedback: zod_1.z.string().max(500).optional(),
});
// ==========================================
// Saved Places
// ==========================================
exports.SavedPlaceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    label: zod_1.z.enum(['home', 'work', 'favorite', 'custom']),
    customName: zod_1.z.string().optional(),
    address: zod_1.z.string(),
    lat: zod_1.z.number(),
    lng: zod_1.z.number(),
});
// ==========================================
// Support Tickets & Chat
// ==========================================
exports.CreateSupportTicketSchema = zod_1.z.object({
    rideId: zod_1.z.string().optional(),
    category: zod_1.z.enum(['trip_issue', 'billing', 'driver_behavior', 'lost_item', 'safety', 'other']),
    subject: zod_1.z.string().min(5).max(100),
    message: zod_1.z.string().min(10).max(2000),
});
exports.SupportTicketSchema = zod_1.z.object({
    id: zod_1.z.string(),
    userId: zod_1.z.string(),
    rideId: zod_1.z.string().optional(),
    category: zod_1.z.string(),
    subject: zod_1.z.string(),
    status: zod_1.z.enum(['open', 'in_progress', 'resolved', 'closed']),
    createdAt: zod_1.z.string(),
    messages: zod_1.z.array(zod_1.z.object({
        senderId: zod_1.z.string(),
        senderRole: exports.UserRoleSchema,
        senderName: zod_1.z.string(),
        message: zod_1.z.string(),
        createdAt: zod_1.z.string(),
    })),
});
// ==========================================
// Chat Messages between Rider & Driver
// ==========================================
exports.TripMessageSchema = zod_1.z.object({
    id: zod_1.z.string(),
    rideId: zod_1.z.string(),
    senderId: zod_1.z.string(),
    senderRole: zod_1.z.enum(['rider', 'driver']),
    text: zod_1.z.string().min(1).max(500),
    createdAt: zod_1.z.string(),
});
// ==========================================
// Gemini AI Assistant Schemas
// ==========================================
exports.AIChatRequestSchema = zod_1.z.object({
    message: zod_1.z.string().min(1).max(1000),
    conversationHistory: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'model']),
        content: zod_1.z.string(),
    })).default([]),
});
exports.ProposedBookingFormSchema = zod_1.z.object({
    pickupText: zod_1.z.string().optional(),
    dropoffText: zod_1.z.string().optional(),
    vehicleCategory: exports.VehicleCategorySchema.optional(),
    scheduledTime: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.AIChatResponseSchema = zod_1.z.object({
    reply: zod_1.z.string(),
    proposedBooking: exports.ProposedBookingFormSchema.optional(),
    suggestedAction: zod_1.z.enum(['estimate_fare', 'view_rides', 'support', 'none']).default('none'),
});
// ==========================================
// Realtime Socket Events
// ==========================================
exports.SOCKET_EVENTS = {
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
};
//# sourceMappingURL=index.js.map