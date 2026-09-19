import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, LogOut, User, Crown, Briefcase, LayoutDashboard, FileText, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
    { to: '/', label: 'Home' },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/quiz', label: 'Quiz' },
    { to: '/assistant', label: 'Assistant', icon: Sparkles },
    { to: '/courses', label: 'Courses' },
    { to: '/blog', label: 'Blog' },
];

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Close the mobile sheet whenever the route changes.
    useEffect(() => { setMobileOpen(false); }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (to) => (to === '/' ? location.pathname === '/' : location.pathname.startsWith(to));

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`sticky top-0 z-50 transition-all duration-500 ${scrolled ? 'glass-strong shadow-[0_10px_40px_-15px_rgba(37,60,180,0.45)]' : 'bg-transparent border-b border-transparent'}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="relative">
                            <BrainCircuit className="h-8 w-8 text-cortex-400 group-hover:text-cortex-50 transition-colors" />
                            <div className="absolute inset-0 bg-cortex-500/40 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight gradient-text">
                            SkillCortex
                        </span>
                    </Link>

                    {/* Desktop links with the sliding active pill */}
                    <div className="hidden md:block">
                        <div className="ml-6 flex items-center space-x-1">
                            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`relative px-3.5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive(to) ? 'text-white' : 'text-slate-400 hover:text-slate-100'}`}
                                >
                                    {isActive(to) && (
                                        <motion.span
                                            layoutId="nav-active-pill"
                                            className="absolute inset-0 rounded-full bg-indigo-500/15 border border-indigo-400/25"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        {Icon && <Icon className="w-4 h-4" />}
                                        {label}
                                    </span>
                                </Link>
                            ))}
                            <Link to="/premium" className="relative px-3.5 py-2 rounded-full text-sm font-bold text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1.5 group">
                                <Crown className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                <span className="relative">
                                    Premium
                                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-60" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
                                    </span>
                                </span>
                            </Link>
                        </div>
                    </div>

                    {/* Desktop auth area */}
                    <div className="hidden md:block">
                        {user ? (
                            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-700/60">
                                {user.role === 'hr' ? (
                                    <NavLink href="/hr/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="HR" />
                                ) : (
                                    <>
                                        <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
                                        <NavLink href="/applications" icon={<FileText className="w-4 h-4" />} label="Apps" />
                                    </>
                                )}
                                <Link to="/profile" className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full hover:bg-slate-800/70 transition-colors group">
                                    <motion.div whileHover={{ scale: 1.08, rotate: 4 }} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center ring-glow">
                                        <User className="w-4 h-4 text-white" />
                                    </motion.div>
                                    <span className="text-sm font-medium max-w-[100px] truncate group-hover:text-white">{user.name}</span>
                                </Link>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/70 rounded-full transition-all"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </motion.button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 pl-3 border-l border-slate-700/60">
                                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
                                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                    <Link to="/register" className="block bg-gradient-to-r from-indigo-500 to-fuchsia-600 hover:from-indigo-400 hover:to-fuchsia-500 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/30 ring-glow">
                                        Get Started
                                    </Link>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800/70 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile sheet */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="md:hidden overflow-hidden glass-strong border-t border-slate-800/60"
                    >
                        <div className="px-4 py-4 space-y-1">
                            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                                <Link key={to} to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${isActive(to) ? 'bg-indigo-500/15 text-white' : 'text-slate-300 hover:bg-slate-800/60'}`}>
                                    {Icon && <Icon className="w-4 h-4" />}
                                    {label}
                                </Link>
                            ))}
                            <Link to="/premium" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-yellow-400 hover:bg-yellow-400/10">
                                <Crown className="w-4 h-4" /> Premium
                            </Link>
                            <div className="pt-3 mt-2 border-t border-slate-700/60">
                                {user ? (
                                    <div className="flex items-center justify-between px-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center">
                                                <User className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-[11px] text-slate-500">{user.role === 'hr' ? 'Recruiter' : 'Candidate'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link to={user.role === 'hr' ? '/hr/dashboard' : '/dashboard'} className="px-3 py-1.5 text-xs rounded-lg bg-slate-800">Dashboard</Link>
                                            <button onClick={handleLogout} className="px-3 py-1.5 text-xs rounded-lg bg-red-500/15 text-red-400">Logout</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 px-2">
                                        <Link to="/login" className="flex-1 text-center py-2.5 rounded-xl bg-slate-800 text-sm font-medium">Sign In</Link>
                                        <Link to="/register" className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-600 text-sm font-semibold">Get Started</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

function NavLink({ href, icon, label }) {
    return (
        <Link to={href} className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white px-3 py-2 rounded-full hover:bg-slate-800/70 transition-colors">
            {icon}
            {label}
        </Link>
    );
}
