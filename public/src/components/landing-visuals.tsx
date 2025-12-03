import React, { useEffect, useRef } from 'react';
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, Users2, BookOpen, PenSquare, LayoutDashboard, Trophy, LineChart, CheckCircle2, CheckSquare } from "lucide-react";

// Interactive 3D Quiz component that adapts to theme
const Quiz3DVisual = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const canvasRef = useRef(null);

    // Animation values
    const floatAnimation = {
        y: [0, -10, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    return (
        <motion.div
            className="w-full h-64 relative"
            animate={floatAnimation}
        >
            {/* 3D-like Quiz Card Stack */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Bottom Card */}
                <div className={`absolute w-96 h-48 rounded-2xl ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-200/50'} transform rotate-6 translate-y-2 shadow-xl`}></div>

                {/* Middle Card */}
                <div className={`absolute w-96 h-48 rounded-2xl ${isDark ? 'bg-violet-900/40' : 'bg-violet-200/60'} transform -rotate-3 shadow-xl`}></div>

                {/* Top Card - Main Quiz Card */}
                <div className={`w-96 h-48 rounded-2xl ${isDark ? 'bg-gradient-to-br from-purple-800 to-indigo-900' : 'bg-gradient-to-br from-purple-300 to-indigo-400'} shadow-2xl border ${isDark ? 'border-purple-700' : 'border-purple-300'} p-5 flex flex-col justify-between relative overflow-hidden`}>
                    {/* Quiz Header */}
                    <div className="flex justify-between items-center">
                        <div className={`text-sm font-bold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>PHYSICS QUIZ</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-purple-700/50 text-purple-200' : 'bg-purple-200 text-purple-800'}`}>10:00</div>
                    </div>

                    {/* Quiz Question */}
                    <div className={`text-sm mt-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        What is Newton's First Law of Motion?
                    </div>

                    {/* Quiz Options */}
                    <div className="space-y-2 mt-2">
                        {['A', 'B', 'C', 'D'].map((option, index) => (
                            <div key={index} className={`flex items-center gap-2 text-xs ${index === 0 ? (isDark ? 'bg-purple-700/30' : 'bg-purple-200/60') : ''} p-1 rounded`}>
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${index === 0 ? (isDark ? 'bg-purple-500' : 'bg-purple-500') : (isDark ? 'bg-gray-700' : 'bg-white')} ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {option}
                                </div>
                                <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                                    {index === 0 ? "An object in motion stays in motion..." : "Option " + option}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-purple-500/20 blur-md"></div>
                    <div className="absolute -left-4 -top-4 w-16 h-16 rounded-full bg-indigo-500/20 blur-md"></div>
                </div>
            </div>

            {/* Animated particles */}
            <div className={`absolute w-3 h-3 rounded-full ${isDark ? 'bg-purple-400' : 'bg-purple-600'} top-8 right-16 animate-pulse`}></div>
            <div className={`absolute w-2 h-2 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'} bottom-12 left-20 animate-pulse delay-300`}></div>
            <div className={`absolute w-4 h-4 rounded-full ${isDark ? 'bg-violet-400' : 'bg-violet-600'} bottom-24 right-24 animate-pulse delay-700`}></div>
        </motion.div>
    );
};

// 3D Leaderboard component that adapts to theme
const Leaderboard3DVisual = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Animation for floating effect
    const floatAnimation = {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    // Leaderboard data for visualization
    const leaderboardData = [
        { name: "Aisha M.", score: 98, position: 1 },
        { name: "Raj K.", score: 95, position: 2 },
        { name: "Sam T.", score: 92, position: 3 },
        { name: "Priya S.", score: 88, position: 4 },
    ];

    return (
        <motion.div
            className="w-full h-64 relative"
            animate={floatAnimation}
        >
            {/* 3D-like Leaderboard */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Shadow/Background Plate */}
                <div className={`absolute w-96 h-52 rounded-2xl ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-200/30'} transform rotate-6 translate-y-2 shadow-xl`}></div>

                {/* Main Leaderboard Card */}
                <div className={`w-96 h-52 rounded-2xl ${isDark ? 'bg-gradient-to-br from-emerald-900 to-blue-900' : 'bg-gradient-to-br from-emerald-100 to-blue-200'} shadow-2xl border ${isDark ? 'border-emerald-800' : 'border-emerald-300'} p-4 flex flex-col justify-between relative overflow-hidden`}>
                    {/* Leaderboard Header */}
                    <div className="flex justify-between items-center border-b pb-2 mb-2 border-opacity-20 border-white">
                        <div className={`text-sm font-bold flex items-center gap-1 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                            <Trophy className="w-4 h-4" />
                            LEADERBOARD
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-emerald-700/50 text-emerald-200' : 'bg-emerald-200 text-emerald-800'}`}>
                            Global
                        </div>
                    </div>

                    {/* Leaderboard Entries */}
                    <div className="space-y-2 flex-1">
                        {leaderboardData.map((entry, index) => (
                            <div
                                key={index}
                                className={`flex items-center justify-between text-xs p-1.5 rounded ${index === 0
                                        ? (isDark ? 'bg-gradient-to-r from-yellow-600/30 to-yellow-500/10' : 'bg-gradient-to-r from-yellow-200 to-yellow-100/50')
                                        : (isDark ? 'bg-gray-800/30' : 'bg-white/60')
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${index === 0
                                            ? 'bg-yellow-500 text-black'
                                            : index === 1
                                                ? (isDark ? 'bg-gray-400 text-gray-900' : 'bg-gray-300 text-gray-800')
                                                : index === 2
                                                    ? (isDark ? 'bg-amber-700 text-amber-100' : 'bg-amber-600 text-amber-100')
                                                    : (isDark ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800')
                                        }`}>
                                        {entry.position}
                                    </div>
                                    <div className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                        {entry.name}
                                    </div>
                                </div>
                                <div className={`font-bold ${index === 0
                                        ? (isDark ? 'text-yellow-400' : 'text-yellow-600')
                                        : (isDark ? 'text-gray-300' : 'text-gray-700')
                                    }`}>
                                    {entry.score}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Your Position */}
                    <div className={`mt-2 text-xs p-1.5 rounded flex items-center justify-between ${isDark ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-700' : 'bg-blue-500'} text-white`}>
                                7
                            </div>
                            <div>Your Rank</div>
                        </div>
                        <div className="font-bold">85</div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-emerald-500/20 blur-md"></div>
                    <div className="absolute -left-6 -top-6 w-16 h-16 rounded-full bg-blue-500/20 blur-md"></div>
                </div>
            </div>

            {/* Animated particles */}
            <div className={`absolute w-3 h-3 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'} top-10 right-20 animate-pulse`}></div>
            <div className={`absolute w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-600'} bottom-16 left-24 animate-pulse delay-300`}></div>
            <div className={`absolute w-4 h-4 rounded-full ${isDark ? 'bg-teal-400' : 'bg-teal-600'} top-32 left-16 animate-pulse delay-700`}></div>
        </motion.div>
    );
};

// Enterprise 3D visual component
const Enterprise3DVisual = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Animation for floating effect
    const floatAnimation = {
        y: [0, -10, 0],
        transition: {
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    return (
        <motion.div
            className="w-full h-64 relative"
            animate={floatAnimation}
        >
            {/* 3D-like Enterprise Dashboard */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Shadow/Background Plate */}
                <div className={`absolute w-96 h-52 rounded-2xl ${isDark ? 'bg-amber-900/20' : 'bg-amber-200/30'} transform rotate-6 translate-y-2 shadow-xl`}></div>

                {/* Main Enterprise Card */}
                <div className={`w-96 h-52 rounded-2xl ${isDark ? 'bg-gradient-to-br from-amber-900 to-red-900' : 'bg-gradient-to-br from-amber-100 to-red-200'} shadow-2xl border ${isDark ? 'border-amber-800' : 'border-amber-300'} p-4 flex flex-col justify-between relative overflow-hidden`}>
                    {/* Enterprise Header */}
                    <div className="flex justify-between items-center border-b pb-2 mb-2 border-opacity-20 border-white">
                        <div className={`text-sm font-bold flex items-center gap-1 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                            <Users2 className="w-4 h-4" />
                            ENTERPRISE DASH
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-amber-700/50 text-amber-200' : 'bg-amber-200 text-amber-800'}`}>
                            Admin
                        </div>
                    </div>

                    {/* Enterprise Dashboard Content */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className={`p-2 rounded ${isDark ? 'bg-amber-900/30' : 'bg-white/60'} flex flex-col items-center justify-center`}>
                            <div className={`text-lg font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>157</div>
                            <div className={`text-xs ${isDark ? 'text-amber-400/70' : 'text-amber-700/70'}`}>Active Users</div>
                        </div>
                        <div className={`p-2 rounded ${isDark ? 'bg-amber-900/30' : 'bg-white/60'} flex flex-col items-center justify-center`}>
                            <div className={`text-lg font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>89%</div>
                            <div className={`text-xs ${isDark ? 'text-amber-400/70' : 'text-amber-700/70'}`}>Completion</div>
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-1.5">
                        {['Custom Branding', 'Batch Enrollment', 'Advanced Analytics'].map((feature, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs">
                                <CheckCircle2 className={`w-3 h-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                                <span className={`${isDark ? 'text-amber-100' : 'text-amber-900'}`}>{feature}</span>
                            </div>
                        ))}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-amber-500/20 blur-md"></div>
                    <div className="absolute -left-6 -top-6 w-16 h-16 rounded-full bg-red-500/20 blur-md"></div>
                </div>
            </div>

            {/* Animated particles */}
            <div className={`absolute w-3 h-3 rounded-full ${isDark ? 'bg-amber-400' : 'bg-amber-600'} top-12 right-16 animate-pulse`}></div>
            <div className={`absolute w-2 h-2 rounded-full ${isDark ? 'bg-red-400' : 'bg-red-600'} bottom-20 left-20 animate-pulse delay-300`}></div>
            <div className={`absolute w-4 h-4 rounded-full ${isDark ? 'bg-orange-400' : 'bg-orange-600'} top-28 left-16 animate-pulse delay-700`}></div>
        </motion.div>
    );
};

export { Quiz3DVisual, Leaderboard3DVisual, Enterprise3DVisual };