// src/constants/crimeTypes.js
export const CRIME_TYPES = {
    THEFT: 'theft',
    BURGLARY: 'burglary',
    HARASSMENT: 'harassment',
    ASSAULT: 'assault',
    VANDALISM: 'vandalism',
    SCAM: 'scam',
    PICKPOCKET: 'pickpocket',
    DRUG: 'drug',
    TRAFFIC: 'traffic',
    POLLUTION: 'pollution',
    OTHER: 'other'
};

export const CRIME_TYPE_LABELS = {
    [CRIME_TYPES.THEFT]: 'Theft',
    [CRIME_TYPES.BURGLARY]: 'Burglary',
    [CRIME_TYPES.HARASSMENT]: 'Harassment',
    [CRIME_TYPES.ASSAULT]: 'Assault',
    [CRIME_TYPES.VANDALISM]: 'Vandalism',
    [CRIME_TYPES.SCAM]: 'Scam/Fraud',
    [CRIME_TYPES.PICKPOCKET]: 'Pickpocket',
    [CRIME_TYPES.DRUG]: 'Drug Related',
    [CRIME_TYPES.TRAFFIC]: 'Traffic Issue',
    [CRIME_TYPES.POLLUTION]: 'Pollution',
    [CRIME_TYPES.OTHER]: 'Other'
};

export const SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

export const STATUS_VALUES = {
    ACTIVE: 'active',
    RESOLVED: 'resolved',
    SPAM: 'spam'
};