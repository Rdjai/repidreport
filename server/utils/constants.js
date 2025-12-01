// utils/constants.js
export const SOS_STATUS = {
    ACTIVE: 'active',
    ACCEPTED: 'accepted',
    RESOLVED: 'resolved',
    CANCELLED: 'cancelled'
};

export const SOCKET_EVENTS = {
    SOS_TRIGGER: 'sos-trigger',
    SOS_ACCEPTED: 'sos-accepted',
    SOS_CANCELLED: 'sos-cancelled',
    LOCATION_UPDATE: 'location-update',
    VOLUNTEER_LOCATION_UPDATE: 'volunteer-location-update',
    USER_LOCATION_UPDATE: 'user-location-update',
    VOLUNTEER_JOIN: 'volunteer-join',
    NEW_SOS_ALERT: 'new-sos-alert'
};

export const RESPONSE_MESSAGES = {
    SOS_TRIGGERED: 'SOS alert triggered successfully',
    SOS_ACCEPTED: 'SOS alert accepted by volunteer',
    SOS_CANCELLED: 'SOS alert cancelled successfully'
};