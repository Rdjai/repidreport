// src/pages/VolunteerLogin.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, Shield } from 'lucide-react';
import axios from 'axios';

const VolunteerLogin: React.FC = () => {
    const baseUri = import.meta.env.VITE_BASE_URL
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        skills: [] as string[]
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const skillsOptions = ['First Aid', 'Self Defense', 'Counseling', 'Medical', 'Security'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = isLogin
                ? `${baseUri}/api/volunteer/login`
                : `${baseUri}/api/volunteer/register`;

            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : formData;

            const response = await axios.post(url, payload);

            // Save token
            localStorage.setItem('volunteerToken', response.data.token);
            localStorage.setItem('volunteerData', JSON.stringify(response.data.data));

            // Redirect to dashboard
            navigate('/volunteer/dashboard');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="text-blue-600" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Volunteer Portal</h1>
                    <p className="text-gray-600 mt-2">Join our community safety network</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Skills</label>
                                <div className="flex flex-wrap gap-2">
                                    {skillsOptions.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => {
                                                const newSkills = formData.skills.includes(skill)
                                                    ? formData.skills.filter(s => s !== skill)
                                                    : [...formData.skills, skill];
                                                setFormData({ ...formData, skills: newSkills });
                                            }}
                                            className={`px-3 py-1 rounded-full text-sm ${formData.skills.includes(skill)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <>
                                {isLogin ? <LogIn className="mr-2" size={20} /> : <UserPlus className="mr-2" size={20} />}
                                {isLogin ? 'Login' : 'Register'}
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        {isLogin
                            ? "Don't have an account? Register"
                            : "Already have an account? Login"}
                    </button>
                </div>

                <div className="text-center mt-8">
                    <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VolunteerLogin;