import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Map, BookOpen, Heart, ShieldAlert, Building2, User as UserIcon, LogIn, Menu, X, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Logo from './Logo';
import LanguageSelector from './LanguageSelector';

const NotificationBadge: React.FC<{ count: number }> = ({ count }) => {
    if (count <= 0) return null;
    return (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
            {count > 9 ? '9+' : count}
        </span>
    );
};

const Navbar: React.FC = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();
    const { currentUser, userRole } = useAuth();
    const { unreadCount } = useApp();

    const navLinks = [
        { name: t('nav.home'), path: '/', icon: Home },
        { name: 'Smart Match', path: '/match', icon: Sparkles },
        { name: t('nav.pets'), path: '/pets', icon: Search },
        { name: t('nav.shelters'), path: '/shelters', icon: Map },
        { name: t('nav.blog'), path: '/blog', icon: BookOpen },
        { name: t('nav.support'), path: '/support', icon: Heart },
    ];

    const isShelter = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';
    const isSuperAdmin = (currentUser as any)?.isSuperAdmin;

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <Logo className="h-12" />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? 'text-brand-600 bg-brand-50'
                                        : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <LanguageSelector />

                        {isSuperAdmin && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all mr-2"
                            >
                                <ShieldAlert size={18} />
                                {t('nav.admin')}
                            </Link>
                        )}

                        {isShelter ? (
                            <Link
                                to="/shelter"
                                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${location.pathname === '/shelter'
                                    ? 'text-brand-800 bg-brand-50 border border-brand-200'
                                    : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Building2 size={18} />
                                {t('nav.myShelter')}
                                <NotificationBadge count={unreadCount} />
                            </Link>
                        ) : (
                            <>
                                {!currentUser && (
                                    <Link
                                        to="/auth"
                                        state={{ role: 'shelter' }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-gray-600 hover:text-brand-600 hover:bg-gray-50 transition-all"
                                    >
                                        <Building2 size={18} />
                                        {t('nav.forShelters')}
                                    </Link>
                                )}

                                <div className="h-6 w-px bg-gray-200"></div>

                                {currentUser ? (
                                    <Link
                                        to="/profile"
                                        className={`relative flex items-center gap-2 px-3 py-2 rounded-full border transition-all ${location.pathname === '/profile'
                                            ? 'border-brand-200 bg-brand-50 text-brand-700'
                                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="w-6 h-6 rounded-full bg-brand-200 flex items-center justify-center overflow-hidden">
                                            {(currentUser as any).avatarUrl ? <img src={(currentUser as any).avatarUrl} alt="" /> : <UserIcon size={14} className="text-brand-700" />}
                                        </div>
                                        <span className="text-sm font-bold truncate max-w-[100px]">{currentUser.name}</span>
                                        <NotificationBadge count={unreadCount} />
                                    </Link>
                                ) : (
                                    <Link
                                        to="/auth"
                                        className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        <LogIn size={18} />
                                        <span className="text-sm font-bold">{t('nav.login')}</span>
                                    </Link>
                                )}

                                <Link
                                    to="/pets"
                                    className="px-5 py-2 rounded-full bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 transform hover:scale-105 duration-200"
                                >
                                    {t('nav.adopt')}
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="relative inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : (
                                <>
                                    <Menu size={24} />
                                    <NotificationBadge count={unreadCount} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${location.pathname === link.path
                                    ? 'bg-brand-50 text-brand-600'
                                    : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'
                                    }`}
                            >
                                <link.icon size={20} />
                                {link.name}
                            </Link>
                        ))}

                        {isSuperAdmin && (
                            <Link
                                to="/admin"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 bg-red-50 hover:bg-red-100"
                            >
                                <ShieldAlert size={20} />
                                {t('nav.admin')}
                            </Link>
                        )}

                        <div className="border-t border-gray-100 my-2 pt-2">
                            <div className="px-3 py-2">
                                <LanguageSelector />
                            </div>

                            {isShelter && (
                                <Link
                                    to="/shelter"
                                    onClick={() => setIsOpen(false)}
                                    className={`relative flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${location.pathname === '/shelter'
                                        ? 'bg-brand-50 text-brand-700 border border-brand-100'
                                        : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Building2 size={20} className={location.pathname === '/shelter' ? "text-brand-600" : "text-gray-500"} />
                                    {t('nav.myShelter')}
                                    <NotificationBadge count={unreadCount} />
                                </Link>
                            )}

                            {!isShelter && (
                                <>
                                    {!currentUser && (
                                        <Link
                                            to="/auth"
                                            state={{ role: 'shelter' }}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
                                        >
                                            <Building2 size={20} className="text-gray-500" />
                                            {t('nav.forShelters')}
                                        </Link>
                                    )}

                                    {currentUser ? (
                                        <Link
                                            to="/profile"
                                            onClick={() => setIsOpen(false)}
                                            className={`relative flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${location.pathname === '/profile'
                                                ? 'bg-brand-50 text-brand-700 border border-brand-100'
                                                : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            <UserIcon size={20} className={location.pathname === '/profile' ? "text-brand-600" : "text-gray-500"} />
                                            {t('nav.myAccount')}
                                            <NotificationBadge count={unreadCount} />
                                        </Link>
                                    ) : (
                                        <Link
                                            to="/auth"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50"
                                        >
                                            <LogIn size={20} className="text-gray-500" />
                                            {t('nav.login')}
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
