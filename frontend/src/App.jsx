import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import FeedPage from './pages/FeedPage';
import PostPage from './pages/PostPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import TrendingPage from './pages/TrendingPage';
import UserProfilePage from './pages/UserProfilePage';
import Layout from './components/Layout';
import { setToken } from './api';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUser({ username: 'Returned User' }); 
        }
        setLoading(false);
    }, []);

    if (loading) return null;

    return (
        <Router>
            <Toaster position="bottom-right" />
            <Layout user={user} setUser={setUser}>
                <Routes>
                    <Route path="/" element={<FeedPage />} />
                    <Route path="/trending" element={<TrendingPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/posts/:id" element={<PostPage />} />
                    <Route path="/u/:username" element={<UserProfilePage />} />
                    <Route path="/login" element={!user ? <LoginPage setUser={setUser} /> : <Navigate to="/" />} />
                    <Route path="/signup" element={!user ? <SignupPage setUser={setUser} /> : <Navigate to="/" />} />
                    <Route path="/settings" element={user ? <SettingsPage user={user} setUser={setUser} /> : <Navigate to="/login" />} />
                    
                    {/* Redirect Profile to Settings for now */}
                    <Route path="/profile" element={<Navigate to="/settings" />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
