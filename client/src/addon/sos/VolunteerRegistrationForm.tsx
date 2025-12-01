// components/volunteer/VolunteerRegistrationForm.tsx
import React, { useState } from 'react';

interface VolunteerFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    skills: string[];
    availability: {
        days: string[];
        hours: string;
    };
    location: {
        lat: number;
        lng: number;
    };
}

export const VolunteerRegistrationForm: React.FC = () => {
    const [formData, setFormData] = useState<VolunteerFormData>({
        name: '',
        email: '',
        phone: '',
        address: '',
        skills: [],
        availability: {
            days: [],
            hours: ''
        },
        location: { lat: 0, lng: 0 }
    });

    const skillsOptions = [
        'First Aid', 'Self Defense', 'Counseling', 'Legal Aid',
        'Medical', 'Security', 'Community Support', 'Other'
    ];

    const daysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleSkillToggle = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const handleDayToggle = (day: string) => {
        setFormData(prev => ({
            ...prev,
            availability: {
                ...prev.availability,
                days: prev.availability.days.includes(day)
                    ? prev.availability.days.filter(d => d !== day)
                    : [...prev.availability.days, day]
            }
        }));
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }));
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Become a Volunteer</h2>

            <form className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Skills Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Skills & Expertise *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {skillsOptions.map(skill => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => handleSkillToggle(skill)}
                                className={`p-2 rounded-md text-sm font-medium transition-colors ${formData.skills.includes(skill)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {skill}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Availability */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Available Days *
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {daysOptions.map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleDayToggle(day)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.availability.days.includes(day)
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preferred Hours
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., 9 AM - 5 PM"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.availability.hours}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                availability: { ...prev.availability, hours: e.target.value }
                            }))}
                        />
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                    </label>
                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Use Current Location
                    </button>
                    {formData.location.lat !== 0 && (
                        <p className="text-sm text-green-600 mt-2">
                            Location captured: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-500 text-white py-3 rounded-md font-semibold hover:bg-green-600 transition-colors"
                >
                    Register as Volunteer
                </button>
            </form>
        </div>
    );
};