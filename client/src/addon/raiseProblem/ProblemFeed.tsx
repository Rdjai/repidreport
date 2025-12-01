// components/problems/ProblemFeed.tsx
import React, { useState } from 'react';

interface Problem {
    id: string;
    title: string;
    description: string;
    evidence: string[];
    upvotes: number;
    userVoted: boolean;
    createdAt: Date;
    location: string;
    category: string;
}

export const ProblemFeed: React.FC = () => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [sortBy, setSortBy] = useState<'recent' | 'top'>('top');

    const handleUpvote = async (problemId: string) => {
        // API call to upvote
        setProblems(prev => prev.map(problem =>
            problem.id === problemId
                ? {
                    ...problem,
                    upvotes: problem.userVoted ? problem.upvotes - 1 : problem.upvotes + 1,
                    userVoted: !problem.userVoted
                }
                : problem
        ));
    };

    const sortedProblems = [...problems].sort((a, b) => {
        if (sortBy === 'top') return b.upvotes - a.upvotes;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Community Problems</h2>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'top')}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="top">Top Voted</option>
                    <option value="recent">Most Recent</option>
                </select>
            </div>

            {/* Problem List */}
            <div className="space-y-4">
                {sortedProblems.map(problem => (
                    <div key={problem.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-semibold text-gray-800">{problem.title}</h3>
                            <span className="text-sm text-gray-500">
                                {problem.createdAt.toLocaleDateString()}
                            </span>
                        </div>

                        <p className="text-gray-600 mb-4">{problem.description}</p>

                        {/* Evidence Gallery */}
                        {problem.evidence.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                {problem.evidence.map((evidence, index) => (
                                    <img
                                        key={index}
                                        src={evidence}
                                        alt={`Evidence ${index + 1}`}
                                        className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-80"
                                        onClick={() => window.open(evidence, '_blank')}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Meta Information */}
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                            <span>📍 {problem.location}</span>
                            <span>🏷️ {problem.category}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => handleUpvote(problem.id)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${problem.userVoted
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <span>👍</span>
                                <span>Upvote ({problem.upvotes})</span>
                            </button>

                            <button className="text-blue-500 hover:text-blue-600 font-medium">
                                Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};