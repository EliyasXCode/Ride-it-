import { z } from 'zod';
export declare const UserRoleSchema: z.ZodEnum<["rider", "driver", "admin"]>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export declare const RideStatusSchema: z.ZodEnum<["requested", "searching", "assigned", "arriving", "arrived", "in_progress", "completed", "cancelled", "expired", "no_drivers"]>;
export type RideStatus = z.infer<typeof RideStatusSchema>;
export declare const VehicleCategorySchema: z.ZodEnum<["economy", "comfort", "xl"]>;
export type VehicleCategory = z.infer<typeof VehicleCategorySchema>;
export declare const DriverStatusSchema: z.ZodEnum<["offline", "online", "busy"]>;
export type DriverStatus = z.infer<typeof DriverStatusSchema>;
export declare const DriverApprovalStatusSchema: z.ZodEnum<["pending", "approved", "rejected", "suspended"]>;
export type DriverApprovalStatus = z.infer<typeof DriverApprovalStatusSchema>;
export declare const PaymentMethodSchema: z.ZodEnum<["cash", "card_sandbox"]>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export declare const PaymentStatusSchema: z.ZodEnum<["pending", "successful", "failed", "cancelled", "refunded"]>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export declare const LatLngSchema: z.ZodObject<{
    lat: z.ZodNumber;
    lng: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
}, {
    lat: number;
    lng: number;
}>;
export type LatLng = z.infer<typeof LatLngSchema>;
export declare const LocationAddressSchema: z.ZodObject<{
    address: z.ZodString;
    lat: z.ZodNumber;
    lng: z.ZodNumber;
    placeId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
    address: string;
    placeId?: string | undefined;
}, {
    lat: number;
    lng: number;
    address: string;
    placeId?: string | undefined;
}>;
export type LocationAddress = z.infer<typeof LocationAddressSchema>;
export declare const RegisterInputSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["rider", "driver"]>>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role: "rider" | "driver";
    phone?: string | undefined;
}, {
    name: string;
    email: string;
    password: string;
    role?: "rider" | "driver" | undefined;
    phone?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export declare const LoginInputSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
export declare const PasswordResetRequestSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
export declare const PasswordResetConfirmSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
export type PasswordResetConfirm = z.infer<typeof PasswordResetConfirmSchema>;
export declare const UserProfileSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodEnum<["rider", "driver", "admin"]>;
    phone: z.ZodOptional<z.ZodString>;
    rating: z.ZodDefault<z.ZodNumber>;
    ratingCount: z.ZodDefault<z.ZodNumber>;
    isSuspended: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    role: "rider" | "driver" | "admin";
    id: string;
    rating: number;
    ratingCount: number;
    isSuspended: boolean;
    createdAt: string;
    phone?: string | undefined;
}, {
    name: string;
    email: string;
    role: "rider" | "driver" | "admin";
    id: string;
    createdAt: string;
    phone?: string | undefined;
    rating?: number | undefined;
    ratingCount?: number | undefined;
    isSuspended?: boolean | undefined;
}>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export declare const DriverRegistrationInputSchema: z.ZodObject<{
    vehicleMake: z.ZodString;
    vehicleModel: z.ZodString;
    vehicleYear: z.ZodNumber;
    licensePlate: z.ZodString;
    vehicleColor: z.ZodString;
    vehicleCategory: z.ZodEnum<["economy", "comfort", "xl"]>;
    driverLicenseNumber: z.ZodString;
}, "strip", z.ZodTypeAny, {
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    licensePlate: string;
    vehicleColor: string;
    vehicleCategory: "economy" | "comfort" | "xl";
    driverLicenseNumber: string;
}, {
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    licensePlate: string;
    vehicleColor: string;
    vehicleCategory: "economy" | "comfort" | "xl";
    driverLicenseNumber: string;
}>;
export type DriverRegistrationInput = z.infer<typeof DriverRegistrationInputSchema>;
export declare const DriverProfileSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    approvalStatus: z.ZodEnum<["pending", "approved", "rejected", "suspended"]>;
    status: z.ZodEnum<["offline", "online", "busy"]>;
    vehicle: z.ZodObject<{
        make: z.ZodString;
        model: z.ZodString;
        year: z.ZodNumber;
        licensePlate: z.ZodString;
        color: z.ZodString;
        category: z.ZodEnum<["economy", "comfort", "xl"]>;
    }, "strip", z.ZodTypeAny, {
        licensePlate: string;
        make: string;
        model: string;
        year: number;
        color: string;
        category: "economy" | "comfort" | "xl";
    }, {
        licensePlate: string;
        make: string;
        model: string;
        year: number;
        color: string;
        category: "economy" | "comfort" | "xl";
    }>;
    driverLicenseNumber: z.ZodString;
    documents: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        docType: z.ZodString;
        filename: z.ZodString;
        uploadedAt: z.ZodString;
        verified: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        docType: string;
        filename: string;
        uploadedAt: string;
        verified: boolean;
    }, {
        id: string;
        docType: string;
        filename: string;
        uploadedAt: string;
        verified?: boolean | undefined;
    }>, "many">>;
    currentLocation: z.ZodOptional<z.ZodObject<{
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        heading: z.ZodOptional<z.ZodNumber>;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
        updatedAt: string;
        heading?: number | undefined;
    }, {
        lat: number;
        lng: number;
        updatedAt: string;
        heading?: number | undefined;
    }>>;
    totalEarningsMinor: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "offline" | "online" | "busy";
    id: string;
    driverLicenseNumber: string;
    userId: string;
    approvalStatus: "pending" | "approved" | "rejected" | "suspended";
    vehicle: {
        licensePlate: string;
        make: string;
        model: string;
        year: number;
        color: string;
        category: "economy" | "comfort" | "xl";
    };
    documents: {
        id: string;
        docType: string;
        filename: string;
        uploadedAt: string;
        verified: boolean;
    }[];
    totalEarningsMinor: number;
    currentLocation?: {
        lat: number;
        lng: number;
        updatedAt: string;
        heading?: number | undefined;
    } | undefined;
}, {
    status: "offline" | "online" | "busy";
    id: string;
    driverLicenseNumber: string;
    userId: string;
    approvalStatus: "pending" | "approved" | "rejected" | "suspended";
    vehicle: {
        licensePlate: string;
        make: string;
        model: string;
        year: number;
        color: string;
        category: "economy" | "comfort" | "xl";
    };
    documents?: {
        id: string;
        docType: string;
        filename: string;
        uploadedAt: string;
        verified?: boolean | undefined;
    }[] | undefined;
    currentLocation?: {
        lat: number;
        lng: number;
        updatedAt: string;
        heading?: number | undefined;
    } | undefined;
    totalEarningsMinor?: number | undefined;
}>;
export type DriverProfile = z.infer<typeof DriverProfileSchema>;
export declare const FareBreakdownSchema: z.ZodObject<{
    baseFareMinor: z.ZodNumber;
    distanceFareMinor: z.ZodNumber;
    timeFareMinor: z.ZodNumber;
    bookingFeeMinor: z.ZodNumber;
    taxMinor: z.ZodNumber;
    discountMinor: z.ZodDefault<z.ZodNumber>;
    totalMinor: z.ZodNumber;
    currency: z.ZodDefault<z.ZodString>;
    distanceKm: z.ZodNumber;
    durationMinutes: z.ZodNumber;
    vehicleCategory: z.ZodEnum<["economy", "comfort", "xl"]>;
    expiresAt: z.ZodString;
    quoteToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    vehicleCategory: "economy" | "comfort" | "xl";
    baseFareMinor: number;
    distanceFareMinor: number;
    timeFareMinor: number;
    bookingFeeMinor: number;
    taxMinor: number;
    discountMinor: number;
    totalMinor: number;
    currency: string;
    distanceKm: number;
    durationMinutes: number;
    expiresAt: string;
    quoteToken: string;
}, {
    vehicleCategory: "economy" | "comfort" | "xl";
    baseFareMinor: number;
    distanceFareMinor: number;
    timeFareMinor: number;
    bookingFeeMinor: number;
    taxMinor: number;
    totalMinor: number;
    distanceKm: number;
    durationMinutes: number;
    expiresAt: string;
    quoteToken: string;
    discountMinor?: number | undefined;
    currency?: string | undefined;
}>;
export type FareBreakdown = z.infer<typeof FareBreakdownSchema>;
export declare const EstimateRequestSchema: z.ZodObject<{
    pickup: z.ZodObject<{
        address: z.ZodString;
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        placeId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }>;
    dropoff: z.ZodObject<{
        address: z.ZodString;
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        placeId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }>;
    promoCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    pickup: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    dropoff: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    promoCode?: string | undefined;
}, {
    pickup: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    dropoff: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    promoCode?: string | undefined;
}>;
export type EstimateRequest = z.infer<typeof EstimateRequestSchema>;
export declare const VehicleOptionSchema: z.ZodObject<{
    category: z.ZodEnum<["economy", "comfort", "xl"]>;
    displayName: z.ZodString;
    description: z.ZodString;
    capacity: z.ZodNumber;
    etaMinutes: z.ZodNumber;
    fare: z.ZodObject<{
        baseFareMinor: z.ZodNumber;
        distanceFareMinor: z.ZodNumber;
        timeFareMinor: z.ZodNumber;
        bookingFeeMinor: z.ZodNumber;
        taxMinor: z.ZodNumber;
        discountMinor: z.ZodDefault<z.ZodNumber>;
        totalMinor: z.ZodNumber;
        currency: z.ZodDefault<z.ZodString>;
        distanceKm: z.ZodNumber;
        durationMinutes: z.ZodNumber;
        vehicleCategory: z.ZodEnum<["economy", "comfort", "xl"]>;
        expiresAt: z.ZodString;
        quoteToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        vehicleCategory: "economy" | "comfort" | "xl";
        baseFareMinor: number;
        distanceFareMinor: number;
        timeFareMinor: number;
        bookingFeeMinor: number;
        taxMinor: number;
        discountMinor: number;
        totalMinor: number;
        currency: string;
        distanceKm: number;
        durationMinutes: number;
        expiresAt: string;
        quoteToken: string;
    }, {
        vehicleCategory: "economy" | "comfort" | "xl";
        baseFareMinor: number;
        distanceFareMinor: number;
        timeFareMinor: number;
        bookingFeeMinor: number;
        taxMinor: number;
        totalMinor: number;
        distanceKm: number;
        durationMinutes: number;
        expiresAt: string;
        quoteToken: string;
        discountMinor?: number | undefined;
        currency?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    category: "economy" | "comfort" | "xl";
    displayName: string;
    description: string;
    capacity: number;
    etaMinutes: number;
    fare: {
        vehicleCategory: "economy" | "comfort" | "xl";
        baseFareMinor: number;
        distanceFareMinor: number;
        timeFareMinor: number;
        bookingFeeMinor: number;
        taxMinor: number;
        discountMinor: number;
        totalMinor: number;
        currency: string;
        distanceKm: number;
        durationMinutes: number;
        expiresAt: string;
        quoteToken: string;
    };
}, {
    category: "economy" | "comfort" | "xl";
    displayName: string;
    description: string;
    capacity: number;
    etaMinutes: number;
    fare: {
        vehicleCategory: "economy" | "comfort" | "xl";
        baseFareMinor: number;
        distanceFareMinor: number;
        timeFareMinor: number;
        bookingFeeMinor: number;
        taxMinor: number;
        totalMinor: number;
        distanceKm: number;
        durationMinutes: number;
        expiresAt: string;
        quoteToken: string;
        discountMinor?: number | undefined;
        currency?: string | undefined;
    };
}>;
export type VehicleOption = z.infer<typeof VehicleOptionSchema>;
export declare const CreateRideRequestSchema: z.ZodObject<{
    pickup: z.ZodObject<{
        address: z.ZodString;
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        placeId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }>;
    dropoff: z.ZodObject<{
        address: z.ZodString;
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        placeId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }>;
    vehicleCategory: z.ZodEnum<["economy", "comfort", "xl"]>;
    quoteToken: z.ZodString;
    paymentMethod: z.ZodDefault<z.ZodEnum<["cash", "card_sandbox"]>>;
    scheduledFor: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    vehicleCategory: "economy" | "comfort" | "xl";
    quoteToken: string;
    pickup: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    dropoff: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    paymentMethod: "cash" | "card_sandbox";
    scheduledFor?: string | undefined;
    idempotencyKey?: string | undefined;
}, {
    vehicleCategory: "economy" | "comfort" | "xl";
    quoteToken: string;
    pickup: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    dropoff: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    paymentMethod?: "cash" | "card_sandbox" | undefined;
    scheduledFor?: string | undefined;
    idempotencyKey?: string | undefined;
}>;
export type CreateRideRequest = z.infer<typeof CreateRideRequestSchema>;
export declare const RideSchema: z.ZodObject<{
    id: z.ZodString;
    riderId: z.ZodString;
    riderName: z.ZodString;
    riderRating: z.ZodDefault<z.ZodNumber>;
    driverId: z.ZodOptional<z.ZodString>;
    driverName: z.ZodOptional<z.ZodString>;
    driverRating: z.ZodOptional<z.ZodNumber>;
    driverVehicle: z.ZodOptional<z.ZodObject<{
        make: z.ZodString;
        model: z.ZodString;
        color: z.ZodString;
        licensePlate: z.ZodString;
        category: z.ZodEnum<["economy", "comfort", "xl"]>;
    }, "strip", z.ZodTypeAny, {
        licensePlate: string;
        make: string;
        model: string;
        color: string;
        category: "economy" | "comfort" | "xl";
    }, {
        licensePlate: string;
        make: string;
        model: string;
        color: string;
        category: "economy" | "comfort" | "xl";
    }>>;
    status: z.ZodEnum<["requested", "searching", "assigned", "arriving", "arrived", "in_progress", "completed", "cancelled", "expired", "no_drivers"]>;
    pickup: z.ZodObject<{
        address: z.ZodString;
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        placeId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }>;
    dropoff: z.ZodObject<{
        address: z.ZodString;
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        placeId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }, {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    }>;
    routePolyline: z.ZodOptional<z.ZodString>;
    distanceKm: z.ZodNumber;
    durationMinutes: z.ZodNumber;
    vehicleCategory: z.ZodEnum<["economy", "comfort", "xl"]>;
    fareMinor: z.ZodNumber;
    currency: z.ZodString;
    paymentMethod: z.ZodEnum<["cash", "card_sandbox"]>;
    paymentStatus: z.ZodEnum<["pending", "successful", "failed", "cancelled", "refunded"]>;
    startPin: z.ZodString;
    shareToken: z.ZodOptional<z.ZodString>;
    cancellationReason: z.ZodOptional<z.ZodString>;
    cancelledBy: z.ZodOptional<z.ZodEnum<["rider", "driver", "system"]>>;
    cancellationFeeMinor: z.ZodDefault<z.ZodNumber>;
    scheduledFor: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    assignedAt: z.ZodOptional<z.ZodString>;
    arrivedAt: z.ZodOptional<z.ZodString>;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "requested" | "searching" | "assigned" | "arriving" | "arrived" | "in_progress" | "completed" | "cancelled" | "expired" | "no_drivers";
    id: string;
    createdAt: string;
    vehicleCategory: "economy" | "comfort" | "xl";
    currency: string;
    distanceKm: number;
    durationMinutes: number;
    pickup: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    dropoff: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    paymentMethod: "cash" | "card_sandbox";
    riderId: string;
    riderName: string;
    riderRating: number;
    fareMinor: number;
    paymentStatus: "cancelled" | "pending" | "successful" | "failed" | "refunded";
    startPin: string;
    cancellationFeeMinor: number;
    scheduledFor?: string | undefined;
    driverId?: string | undefined;
    driverName?: string | undefined;
    driverRating?: number | undefined;
    driverVehicle?: {
        licensePlate: string;
        make: string;
        model: string;
        color: string;
        category: "economy" | "comfort" | "xl";
    } | undefined;
    routePolyline?: string | undefined;
    shareToken?: string | undefined;
    cancellationReason?: string | undefined;
    cancelledBy?: "rider" | "driver" | "system" | undefined;
    assignedAt?: string | undefined;
    arrivedAt?: string | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
}, {
    status: "requested" | "searching" | "assigned" | "arriving" | "arrived" | "in_progress" | "completed" | "cancelled" | "expired" | "no_drivers";
    id: string;
    createdAt: string;
    vehicleCategory: "economy" | "comfort" | "xl";
    currency: string;
    distanceKm: number;
    durationMinutes: number;
    pickup: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    dropoff: {
        lat: number;
        lng: number;
        address: string;
        placeId?: string | undefined;
    };
    paymentMethod: "cash" | "card_sandbox";
    riderId: string;
    riderName: string;
    fareMinor: number;
    paymentStatus: "cancelled" | "pending" | "successful" | "failed" | "refunded";
    startPin: string;
    scheduledFor?: string | undefined;
    riderRating?: number | undefined;
    driverId?: string | undefined;
    driverName?: string | undefined;
    driverRating?: number | undefined;
    driverVehicle?: {
        licensePlate: string;
        make: string;
        model: string;
        color: string;
        category: "economy" | "comfort" | "xl";
    } | undefined;
    routePolyline?: string | undefined;
    shareToken?: string | undefined;
    cancellationReason?: string | undefined;
    cancelledBy?: "rider" | "driver" | "system" | undefined;
    cancellationFeeMinor?: number | undefined;
    assignedAt?: string | undefined;
    arrivedAt?: string | undefined;
    startedAt?: string | undefined;
    completedAt?: string | undefined;
}>;
export type Ride = z.infer<typeof RideSchema>;
export declare const VerifyPinRequestSchema: z.ZodObject<{
    rideId: z.ZodString;
    pin: z.ZodString;
}, "strip", z.ZodTypeAny, {
    rideId: string;
    pin: string;
}, {
    rideId: string;
    pin: string;
}>;
export type VerifyPinRequest = z.infer<typeof VerifyPinRequestSchema>;
export declare const CancelRideRequestSchema: z.ZodObject<{
    rideId: z.ZodOptional<z.ZodString>;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    reason: string;
    rideId?: string | undefined;
}, {
    reason: string;
    rideId?: string | undefined;
}>;
export type CancelRideRequest = z.infer<typeof CancelRideRequestSchema>;
export declare const RateTripRequestSchema: z.ZodObject<{
    rideId: z.ZodOptional<z.ZodString>;
    score: z.ZodNumber;
    feedback: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    score: number;
    rideId?: string | undefined;
    feedback?: string | undefined;
}, {
    score: number;
    rideId?: string | undefined;
    feedback?: string | undefined;
}>;
export type RateTripRequest = z.infer<typeof RateTripRequestSchema>;
export declare const SavedPlaceSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    label: z.ZodEnum<["home", "work", "favorite", "custom"]>;
    customName: z.ZodOptional<z.ZodString>;
    address: z.ZodString;
    lat: z.ZodNumber;
    lng: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
    address: string;
    id: string;
    userId: string;
    label: "custom" | "home" | "work" | "favorite";
    customName?: string | undefined;
}, {
    lat: number;
    lng: number;
    address: string;
    id: string;
    userId: string;
    label: "custom" | "home" | "work" | "favorite";
    customName?: string | undefined;
}>;
export type SavedPlace = z.infer<typeof SavedPlaceSchema>;
export declare const CreateSupportTicketSchema: z.ZodObject<{
    rideId: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["trip_issue", "billing", "driver_behavior", "lost_item", "safety", "other"]>;
    subject: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    category: "trip_issue" | "billing" | "driver_behavior" | "lost_item" | "safety" | "other";
    subject: string;
    rideId?: string | undefined;
}, {
    message: string;
    category: "trip_issue" | "billing" | "driver_behavior" | "lost_item" | "safety" | "other";
    subject: string;
    rideId?: string | undefined;
}>;
export type CreateSupportTicket = z.infer<typeof CreateSupportTicketSchema>;
export declare const SupportTicketSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    rideId: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    subject: z.ZodString;
    status: z.ZodEnum<["open", "in_progress", "resolved", "closed"]>;
    createdAt: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        senderId: z.ZodString;
        senderRole: z.ZodEnum<["rider", "driver", "admin"]>;
        senderName: z.ZodString;
        message: z.ZodString;
        createdAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        createdAt: string;
        senderId: string;
        senderRole: "rider" | "driver" | "admin";
        senderName: string;
    }, {
        message: string;
        createdAt: string;
        senderId: string;
        senderRole: "rider" | "driver" | "admin";
        senderName: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    status: "in_progress" | "open" | "resolved" | "closed";
    id: string;
    createdAt: string;
    userId: string;
    category: string;
    subject: string;
    messages: {
        message: string;
        createdAt: string;
        senderId: string;
        senderRole: "rider" | "driver" | "admin";
        senderName: string;
    }[];
    rideId?: string | undefined;
}, {
    status: "in_progress" | "open" | "resolved" | "closed";
    id: string;
    createdAt: string;
    userId: string;
    category: string;
    subject: string;
    messages: {
        message: string;
        createdAt: string;
        senderId: string;
        senderRole: "rider" | "driver" | "admin";
        senderName: string;
    }[];
    rideId?: string | undefined;
}>;
export type SupportTicket = z.infer<typeof SupportTicketSchema>;
export declare const TripMessageSchema: z.ZodObject<{
    id: z.ZodString;
    rideId: z.ZodString;
    senderId: z.ZodString;
    senderRole: z.ZodEnum<["rider", "driver"]>;
    text: z.ZodString;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    rideId: string;
    senderId: string;
    senderRole: "rider" | "driver";
    text: string;
}, {
    id: string;
    createdAt: string;
    rideId: string;
    senderId: string;
    senderRole: "rider" | "driver";
    text: string;
}>;
export type TripMessage = z.infer<typeof TripMessageSchema>;
export declare const AIChatRequestSchema: z.ZodObject<{
    message: z.ZodString;
    conversationHistory: z.ZodDefault<z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["user", "model"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        role: "model" | "user";
        content: string;
    }, {
        role: "model" | "user";
        content: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    message: string;
    conversationHistory: {
        role: "model" | "user";
        content: string;
    }[];
}, {
    message: string;
    conversationHistory?: {
        role: "model" | "user";
        content: string;
    }[] | undefined;
}>;
export type AIChatRequest = z.infer<typeof AIChatRequestSchema>;
export declare const ProposedBookingFormSchema: z.ZodObject<{
    pickupText: z.ZodOptional<z.ZodString>;
    dropoffText: z.ZodOptional<z.ZodString>;
    vehicleCategory: z.ZodOptional<z.ZodEnum<["economy", "comfort", "xl"]>>;
    scheduledTime: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    vehicleCategory?: "economy" | "comfort" | "xl" | undefined;
    pickupText?: string | undefined;
    dropoffText?: string | undefined;
    scheduledTime?: string | undefined;
    notes?: string | undefined;
}, {
    vehicleCategory?: "economy" | "comfort" | "xl" | undefined;
    pickupText?: string | undefined;
    dropoffText?: string | undefined;
    scheduledTime?: string | undefined;
    notes?: string | undefined;
}>;
export type ProposedBookingForm = z.infer<typeof ProposedBookingFormSchema>;
export declare const AIChatResponseSchema: z.ZodObject<{
    reply: z.ZodString;
    proposedBooking: z.ZodOptional<z.ZodObject<{
        pickupText: z.ZodOptional<z.ZodString>;
        dropoffText: z.ZodOptional<z.ZodString>;
        vehicleCategory: z.ZodOptional<z.ZodEnum<["economy", "comfort", "xl"]>>;
        scheduledTime: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        vehicleCategory?: "economy" | "comfort" | "xl" | undefined;
        pickupText?: string | undefined;
        dropoffText?: string | undefined;
        scheduledTime?: string | undefined;
        notes?: string | undefined;
    }, {
        vehicleCategory?: "economy" | "comfort" | "xl" | undefined;
        pickupText?: string | undefined;
        dropoffText?: string | undefined;
        scheduledTime?: string | undefined;
        notes?: string | undefined;
    }>>;
    suggestedAction: z.ZodDefault<z.ZodEnum<["estimate_fare", "view_rides", "support", "none"]>>;
}, "strip", z.ZodTypeAny, {
    reply: string;
    suggestedAction: "estimate_fare" | "view_rides" | "support" | "none";
    proposedBooking?: {
        vehicleCategory?: "economy" | "comfort" | "xl" | undefined;
        pickupText?: string | undefined;
        dropoffText?: string | undefined;
        scheduledTime?: string | undefined;
        notes?: string | undefined;
    } | undefined;
}, {
    reply: string;
    proposedBooking?: {
        vehicleCategory?: "economy" | "comfort" | "xl" | undefined;
        pickupText?: string | undefined;
        dropoffText?: string | undefined;
        scheduledTime?: string | undefined;
        notes?: string | undefined;
    } | undefined;
    suggestedAction?: "estimate_fare" | "view_rides" | "support" | "none" | undefined;
}>;
export type AIChatResponse = z.infer<typeof AIChatResponseSchema>;
export declare const SOCKET_EVENTS: {
    readonly JOIN_USER_ROOM: "join_user_room";
    readonly DRIVER_UPDATE_LOCATION: "driver:update_location";
    readonly DRIVER_RESPOND_OFFER: "driver:respond_offer";
    readonly JOIN_RIDE_ROOM: "join_ride_room";
    readonly LEAVE_RIDE_ROOM: "leave_ride_room";
    readonly SEND_TRIP_MESSAGE: "trip:send_message";
    readonly RIDE_OFFER_DISPATCHED: "ride:offer_dispatched";
    readonly RIDE_STATUS_UPDATED: "ride:status_updated";
    readonly DRIVER_LOCATION_UPDATED: "driver:location_updated";
    readonly TRIP_MESSAGE_RECEIVED: "trip:message_received";
    readonly RIDE_CANCELLED: "ride:cancelled";
    readonly SCHEDULED_RIDE_MATCHED: "ride:scheduled_matched";
    readonly SYSTEM_NOTIFICATION: "system:notification";
};
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
//# sourceMappingURL=index.d.ts.map