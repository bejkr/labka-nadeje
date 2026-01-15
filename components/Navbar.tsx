import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Map, BookOpen, Heart, ShieldAlert, Building2, User as UserIcon, LogIn, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
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
    const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);
    const location = useLocation();
    const { currentUser, userRole } = useAuth();
    const { unreadCount } = useApp();
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const navLinks = [
        { name: t('nav.home'), path: '/', icon: Home },
        { name: 'Labka Match', path: '/match', icon: Sparkles },
        { name: t('nav.pets'), path: '/pets', icon: Search },
        {
            name: t('nav.shelters'),
            path: '/shelters',
            icon: Map,
            children: [
                { name: t('nav.shelterList'), path: '/shelters' },
                { name: t('nav.shelterBenefits'), path: '/for-shelters' }
            ]
        },
        { name: t('nav.blog'), path: '/blog', icon: BookOpen },
        {
            name: t('nav.support'),
            path: '/support',
            icon: Heart,
            children: [
                { name: t('nav.supportPlatform'), path: '/support' },
                { name: t('nav.supportShelters'), path: '/support-shelters' },
                { name: t('nav.virtualAdoption'), path: '/virtual-adoption' }
            ]
        },
    ];

    const isShelter = userRole === 'shelter' || (currentUser as any)?.role === 'shelter';
    const isSuperAdmin = (currentUser as any)?.isSuperAdmin;

    const toggleDropdown = (name: string, e: React.MouseEvent) => {
        e.preventDefault();
        setOpenDropdown(openDropdown === name ? null : name);
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <Logo className="h-12" />
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-1" ref={dropdownRef}>
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path || (link.children && link.children.some(child => location.pathname === child.path));
                            const hasChildren = !!link.children;

                            if (hasChildren) {
                                return (
                                    <div key={link.name} className="relative group">
                                        <button
                                            onClick={(e) => toggleDropdown(link.name, e)}
                                            className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                ? 'text-brand-600 bg-brand-50'
                                                : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {link.name}
                                            <ChevronDown size={14} className={`transition-transform duration-200 ${openDropdown === link.name ? 'rotate-180' : ''}`} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openDropdown === link.name && (
                                            <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 origin-top-left overflow-hidden">
                                                <div className="py-1">
                                                    {link.children?.map((child) => (
                                                        <Link
                                                            key={child.path}
                                                            to={child.path}
                                                            onClick={() => setOpenDropdown(null)}
                                                            className={`block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand-600 transition-colors ${location.pathname === child.path ? 'bg-brand-50 text-brand-600 font-bold' : ''}`}
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors group ${isActive
                                        ? 'text-brand-600'
                                        : 'text-gray-600 hover:text-brand-600'
                                        }`}
                                >
                                    {link.name}
                                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 transform origin-left transition-transform duration-300 ease-out ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
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
                <div className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-y-auto max-h-[80vh]">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <React.Fragment key={link.name}>
                                {link.children ? (
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => setOpenDropdown(openDropdown === link.name ? null : link.name)}
                                            className={`w-full flex items-center justify-between px-3 py-3 rounded-md text-base font-medium transition-colors ${openDropdown === link.name ? 'bg-gray-50 text-brand-600' : 'text-gray-700 hover:text-brand-600 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <link.icon size={20} />
                                                {link.name}
                                            </div>
                                            <ChevronDown size={16} className={`transition-transform ${openDropdown === link.name ? 'rotate-180' : ''}`} />
                                        </button>

                                        {openDropdown === link.name && (
                                            <div className="pl-10 pr-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                                {link.children.map(child => (
                                                    <Link
                                                        key={child.path}
                                                        to={child.path}
                                                        onClick={() => setIsOpen(false)}
                                                        className={`block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-gray-50 ${location.pathname === child.path ? 'text-brand-600 bg-brand-50' : ''}`}
                                                    >
                                                        {child.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
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
                                )}
                            </React.Fragment>
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
