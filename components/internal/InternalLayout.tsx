import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useParams } from 'react-router-dom';
import {
    LayoutDashboard, Dog, Stethoscope, FileText, Settings,
    LogOut, Menu, X, Bell, Search, FolderOpen, Command, Moon, Sun
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CommandPalette from './CommandPalette';
import NotificationsPopover from './NotificationsPopover';

const InternalLayout: React.FC = () => {
    // Desktop: default open. Mobile: uses overlay logic.
    const [isDesktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isSearchOpen, setSearchOpen] = useState(false);
    const [isNotificationsOpen, setNotificationsOpen] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const { logout, currentUser } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { shelterSlug } = useParams();

    // Ctrl+K Listener
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth?role=shelter'); // Redirect to login
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    const navItems = [
        { label: 'Prehľad', icon: LayoutDashboard, path: `/${shelterSlug}` },
        { label: 'Zvieratá', icon: Dog, path: `/${shelterSlug}/pets` },
        { label: 'Zdravotné záznamy', icon: Stethoscope, path: `/${shelterSlug}/medical` },
        { label: 'Adopcie', icon: FileText, path: `/${shelterSlug}/adoptions` },
        { label: 'Dokumenty', icon: FolderOpen, path: `/${shelterSlug}/documents` },
        { label: 'Nastavenia', icon: Settings, path: `/${shelterSlug}/settings` },
    ];

    const NavContent = ({ mobile = false }) => (
        <>
            <div className="h-20 flex flex-col justify-center border-b border-gray-100 dark:border-gray-700 px-4 py-4 flex-shrink-0">
                {(isDesktopSidebarOpen || mobile) ? (
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold overflow-hidden flex-shrink-0">
                            {(currentUser as any)?.logoUrl ? <img src={(currentUser as any).logoUrl} className="w-full h-full object-cover" /> : (currentUser?.name.substring(0, 2).toUpperCase())}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-900 dark:text-white text-sm leading-tight truncate" title={currentUser?.name}>{currentUser?.name}</span>
                            <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 tracking-wider">Interný portál</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center w-full">
                        <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm flex-shrink-0">
                            {(currentUser as any)?.logoUrl ? <img src={(currentUser as any).logoUrl} className="w-full h-full object-cover rounded-lg" /> : (currentUser?.name.substring(0, 2).toUpperCase())}
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => mobile && setMobileMenuOpen(false)}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                            ${isActive
                                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 font-bold shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white font-medium'}
                        `}
                        end={item.path === `/${shelterSlug}`}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={22} className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-200'} />
                                {(isDesktopSidebarOpen || mobile) && <span>{item.label}</span>}
                                {!isDesktopSidebarOpen && !mobile && (
                                    <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                        {item.label}
                                    </div>
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${(!isDesktopSidebarOpen && !mobile) && 'justify-center'}`}
                >
                    <LogOut size={20} />
                    {(isDesktopSidebarOpen || mobile) && <span className="font-bold">Odhlásiť</span>}
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans flex text-gray-900 dark:text-gray-100 transition-colors duration-300">

            {/* Desktop Sidebar */}
            <aside
                className={`
                    hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out
                    ${isDesktopSidebarOpen ? 'w-64' : 'w-20'}
                `}
            >
                <NavContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
                        <div className="absolute top-4 right-4">
                            <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400">
                                <X size={20} />
                            </button>
                        </div>
                        <NavContent mobile />
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isDesktopSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                <header className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between shadow-sm transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (window.innerWidth >= 768) {
                                    setDesktopSidebarOpen(!isDesktopSidebarOpen);
                                } else {
                                    setMobileMenuOpen(true);
                                }
                            }}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 hover:text-gray-900 rounded-lg transition"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="font-bold text-gray-900 dark:text-white hidden sm:block text-lg tracking-tight">
                            Administrácia
                        </h1>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div
                            onClick={() => setSearchOpen(true)}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100/50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-500 text-sm hover:bg-white dark:hover:bg-gray-750 hover:border-brand-200 dark:hover:border-gray-600 hover:text-brand-600 transition-all cursor-pointer w-48 lg:w-64 group select-none"
                        >
                            <Search size={16} className="group-hover:text-brand-500 transition-colors" />
                            <span className="flex-1">Hľadať...</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded shadow-sm text-gray-400 dark:text-gray-500 group-hover:text-brand-500 transition-colors border border-gray-100 dark:border-gray-600">
                                <Command size={10} /> K
                            </div>
                        </div>

                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block"></div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400 rounded-lg transition-colors"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setNotificationsOpen(!isNotificationsOpen)}
                                className={`p-2 relative text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition ${isNotificationsOpen ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800' : 'hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <Bell size={20} />
                                {unreadNotifications > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900 notification-pulse"></span>
                                )}
                            </button>
                            <NotificationsPopover
                                isOpen={isNotificationsOpen}
                                onClose={() => setNotificationsOpen(false)}
                                onCountChange={setUnreadNotifications}
                            />
                        </div>

                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-black text-xs ring-2 ring-transparent hover:ring-brand-200 transition cursor-pointer select-none">
                            {currentUser?.email?.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
                    <Outlet />
                </main>
            </div>

            <CommandPalette isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
};

export default InternalLayout;
