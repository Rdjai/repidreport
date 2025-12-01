// src/components/problems/ReportProblemForm.tsx
import React, { useState, useRef } from 'react';
import {
    Upload, X, AlertTriangle, MapPin,
    Tag, FileText, Image as ImageIcon,
    Video
} from 'lucide-react';
import axios from 'axios';

interface ReportProblemFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const ReportProblemForm: React.FC<ReportProblemFormProps> = ({ onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [address, setAddress] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Other',
        severity: 'medium',
        anonymous: false,
        userInfo: {
            name: '',
            email: '',
            phone: ''
        }
    });

    const categories = [
        'Infrastructure',
        'Safety',
        'Health',
        'Environment',
        'Transport',
        'Other'
    ];

    const severities = [
        { value: 'low', label: 'Low', color: 'bg-green-500' },
        { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
        { value: 'high', label: 'High', color: 'bg-orange-500' },
        { value: 'critical', label: 'Critical', color: 'bg-red-500' }
    ];

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(location);

                    // Reverse geocode to get address (simplified)
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`)
                        .then(res => res.json())
                        .then(data => {
                            setAddress(data.display_name || 'Location captured');
                        })
                        .catch(() => {
                            setAddress('Location captured');
                        });
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Unable to get location. Please enable location services.');
                }
            );
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const validFiles = selectedFiles.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'application/pdf'];
            return validTypes.includes(file.type);
        });

        setFiles(prev => [...prev, ...validFiles.slice(0, 5 - prev.length)]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataObj = new FormData();

            // Add form data
            formDataObj.append('title', formData.title);
            formDataObj.append('description', formData.description);
            formDataObj.append('category', formData.category);
            formDataObj.append('severity', formData.severity);

            if (userLocation) {
                formDataObj.append('location', JSON.stringify(userLocation));
            }

            if (!formData.anonymous) {
                formDataObj.append('userInfo', JSON.stringify(formData.userInfo));
            }

            formDataObj.append('userId', `user-${Date.now()}`);

            // Add files
            files.forEach(file => {
                formDataObj.append('evidence', file);
            });

            const baseUri = import.meta.env.VITE_API_URL
            const response = await axios.post(
                `${baseUri}/api/problems`,
                formDataObj,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Problem reported:', response.data);

            if (onSuccess) {
                onSuccess();
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                category: 'Other',
                severity: 'medium',
                anonymous: false,
                userInfo: { name: '', email: '', phone: '' }
            });
            setFiles([]);
            setStep(1);

        } catch (error) {
            console.error('Error reporting problem:', error);
            alert('Failed to report problem. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && (!formData.title || !formData.description)) {
            alert('Please fill in all required fields');
            return;
        }
        setStep(step + 1);
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Report a Problem</h2>
                            <p className="text-gray-600">Help improve your community</p>
                        </div>
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        )}
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center mb-8">
                        {[1, 2, 3].map((stepNum) => (
                            <React.Fragment key={stepNum}>
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= stepNum
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {stepNum}
                                </div>
                                {stepNum < 3 && (
                                    <div className={`flex-1 h-1 mx-2 ${step > stepNum ? 'bg-blue-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                        <div className="ml-4 text-sm text-gray-600">
                            Step {step} of 3
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Problem Details */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Problem Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Brief description of the problem"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Detailed Description *
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Provide detailed information about the problem..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Severity
                                        </label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            value={formData.severity}
                                            onChange={e => setFormData({ ...formData, severity: e.target.value })}
                                        >
                                            {severities.map(sev => (
                                                <option key={sev.value} value={sev.value}>{sev.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Evidence & Location */}
                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Location */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center">
                                            <MapPin className="mr-2" size={16} />
                                            Location
                                        </label>
                                        <button
                                            type="button"
                                            onClick={getCurrentLocation}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Use Current Location
                                        </button>
                                    </div>

                                    {userLocation ? (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-green-700 font-medium">Location captured</p>
                                                    <p className="text-sm text-green-600">{address}</p>
                                                    <p className="text-xs text-green-500 mt-1">
                                                        {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setUserLocation(null)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                            <MapPin className="mx-auto text-gray-400 mb-2" size={32} />
                                            <p className="text-gray-500">No location selected</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Adding location helps volunteers find the problem
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Evidence Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Evidence (Photos/Videos/Documents)
                                    </label>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        multiple
                                        accept="image/*,video/*,.pdf,.doc,.docx"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />

                                    {files.length === 0 ? (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                        >
                                            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                                            <p className="text-gray-600">Click to upload evidence</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Upload photos, videos, or documents (max 5 files)
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">
                                                    {files.length} file(s) selected
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    Add More
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {files.map((file, index) => (
                                                    <div key={index} className="relative group">
                                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                            {file.type.startsWith('image/') ? (
                                                                <img
                                                                    src={URL.createObjectURL(file)}
                                                                    alt={`Preview ${index + 1}`}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    {file.type.startsWith('video/') ? (
                                                                        <Video className="text-gray-400" size={24} />
                                                                    ) : (
                                                                        <FileText className="text-gray-400" size={24} />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                        <div className="text-xs text-gray-500 truncate mt-1">
                                                            {file.name}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Contact Information */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center mb-4">
                                    <input
                                        type="checkbox"
                                        id="anonymous"
                                        checked={formData.anonymous}
                                        onChange={e => setFormData({ ...formData, anonymous: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <label htmlFor="anonymous" className="ml-2 text-gray-700">
                                        Report anonymously
                                    </label>
                                </div>

                                {!formData.anonymous && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Optional"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={formData.userInfo.name}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    userInfo: { ...formData.userInfo, name: e.target.value }
                                                })}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder="Optional"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={formData.userInfo.email}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        userInfo: { ...formData.userInfo, email: e.target.value }
                                                    })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone
                                                </label>
                                                <input
                                                    type="tel"
                                                    placeholder="Optional"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={formData.userInfo.phone}
                                                    onChange={e => setFormData({
                                                        ...formData,
                                                        userInfo: { ...formData.userInfo, phone: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-start">
                                        <AlertTriangle className="text-blue-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                                        <p className="text-sm text-blue-700">
                                            Your report will be public and visible to other users and volunteers.
                                            Contact information is optional but helps with follow-up.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Back
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Report'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportProblemForm;   