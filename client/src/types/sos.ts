// src/types/sos.ts
export interface Location {
    lat: number;
    lng: number;
    address?: string;
    timestamp?: Date;
}

export interface UserInfo {
    name: string;
    phone: string;
}

export interface Volunteer {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    phone: string;
    skills: string[];
    currentLocation?: Location;
    isAvailable: boolean;
    isOnline: boolean;
    rating: number;
    completedCases: number;
    responseTime: number;
    socketId?: string;
    lastActive?: Date;
}

export interface SOSAlert {
    _id: string;
    userId: string;
    userInfo: UserInfo;
    location: Location;
    photo?: string;
    status: 'active' | 'accepted' | 'resolved' | 'cancelled';
    acceptedBy?: Volunteer;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
    createdAt: Date;
    acceptedAt?: Date;
    resolvedAt?: Date;
    cancelledAt?: Date;
}

export interface SocketEventData {
    alertId: string;
    alert: SOSAlert;
    volunteer: Volunteer;
    location: Location;
    timestamp: Date;
}


export interface SOSContextType {
    socket: any | null;
    isConnected: boolean;
    currentAlert: SOSAlert | null;
    volunteers: Volunteer[];
    userLocation: Location | null;
    acceptedVolunteer: Volunteer | null; // Add this line
    triggerSOS: (photo?: string | null) => Promise<SOSAlert>;
    cancelSOS: () => Promise<void>;
    acceptSOS: (alertId: string, volunteerId: string) => Promise<SOSAlert>;
    updateLocation: (location: Location) => void;
    getCurrentLocation: () => Promise<Location>;
}