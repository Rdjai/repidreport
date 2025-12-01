// src/utils/ipUtils.js
export const hashIp = (ip) => {
    if (!ip) return null;

    let hash = 0;
    for (let i = 0; i < ip.length; i++) {
        const char = ip.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
};

export const getClientIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0];
    }
    return req.socket.remoteAddress;
};