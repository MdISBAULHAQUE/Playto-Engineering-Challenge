import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Settings, LogOut, Menu, X, Bell, TrendingUp } from 'lucide-react';
import Leaderboard from './Leaderboard';
import { setToken } from '../api';

const Layout = ({ children, user, setUser }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const handleLogout = () => {
        setToken(null);
        setUser(null);
    };

    const NavItem = ({ to, icon: Icon, label, active }) => (
        <Link 
            to={to} 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
        >
            <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
            <span>{label}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Bottom Nav (Mobile Only) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-6 py-2 flex justify-between items-center text-xs font-medium text-gray-500">
                <Link to="/" className={`flex flex-col items-center ${location.pathname === '/' ? 'text-blue-600' : ''}`}>
                    <Home className="w-6 h-6 mb-1" />
                    Home
                </Link>
                <Link to="/trending" className={`flex flex-col items-center ${location.pathname === '/trending' ? 'text-blue-600' : ''}`}>
                    <TrendingUp className="w-6 h-6 mb-1" />
                    Trending
                </Link>
                <Link to="/search" className={`flex flex-col items-center ${location.pathname === '/search' ? 'text-blue-600' : ''}`}>
                    <Search className="w-6 h-6 mb-1" />
                    Search
                </Link>
                <Link to="/settings" className={`flex flex-col items-center ${location.pathname === '/settings' ? 'text-blue-600' : ''}`}>
                    {user ? <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">{user.username[0].toUpperCase()}</div> : <User className="w-6 h-6 mb-1" />}
                    {user ? 'Profile' : 'Login'}
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 py-8">
                    
                    {/* Left Sidebar (Desktop) */}
                    <div className="hidden lg:block lg:col-span-1 sticky top-8 h-fit space-y-2">
                            <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">
                                KarmaX<span className="text-gray-900">.</span>
                            </h1>
                        
                        <nav className="space-y-1">
                            <NavItem to="/" icon={Home} label="Home" active={location.pathname === '/'} />
                            <NavItem to="/trending" icon={TrendingUp} label="Trending" active={location.pathname === '/trending'} />
                            <NavItem to="/search" icon={Search} label="Search" active={location.pathname === '/search'} />
                            <NavItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
                        </nav>

                        {user ? (
                            <div className="pt-6 mt-6 border-t px-4">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="bg-gradient-to-tr from-blue-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">@{user.username}</p>
                                        <p className="text-xs text-gray-500">View Profile</p>
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="text-sm font-medium text-gray-500 hover:text-red-600 flex items-center">
                                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6 px-4">
                                <Link to="/login" className="block w-full text-center bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition shadow-md shadow-blue-200">
                                    Log In
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 min-h-[80vh]">
                        {children}
                    </div>

                    {/* Right Sidebar (Desktop) */}
                    <div className="hidden lg:block lg:col-span-1 sticky top-8 h-fit space-y-6">
                        <Leaderboard />
                        <div className="text-xs text-gray-400 text-center">
                            © 2024 PlaytoFeed Prototype
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
