
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useParams, Link } from 'react-router-dom';
import {
    LayoutDashboard, Dog, Stethoscope, FileText, Settings,
    LogOut, Menu, X, ChevronRight, Bell, Search, FolderOpen
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../Logo';

const InternalLayout: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const { shelterSlug } = useParams();

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

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex text-gray-900">
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'w-64' : 'w-20'}
          hidden md:flex flex-col
        `}
            >
                <div className="h-20 flex flex-col items-center justify-center border-b border-gray-100 px-4 py-4">
                    {isSidebarOpen ? (
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 font-bold overflow-hidden">
                                {(currentUser as any)?.logoUrl ? <img src={(currentUser as any).logoUrl} className="w-full h-full object-cover" /> : (currentUser?.name.substring(0, 2).toUpperCase())}
                            </div>
                            <span className="font-bold text-gray-900 text-sm text-center leading-tight line-clamp-2">{currentUser?.name}</span>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm">
                            {(currentUser as any)?.logoUrl ? <img src={(currentUser as any).logoUrl} className="w-full h-full object-cover rounded-lg" /> : (currentUser?.name.substring(0, 2).toUpperCase())}
                        </div>
                    )}
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive
                                    ? 'bg-brand-50 text-brand-700 font-bold shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'}
              `}
                            end={item.path === `/${shelterSlug}`}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={22} className={isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'} />
                                    {isSidebarOpen && <span>{item.label}</span>}
                                    {!isSidebarOpen && (
                                        <div className="absolute left-full ml-6 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                            {item.label}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-bold">Odhlásiť</span>}
                    </button>
                </div>
            </aside>

            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="font-bold text-gray-700 hidden sm:block">
                            Administrácia útulku
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Rýchle hľadanie..."
                                className="pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-brand-500 focus:ring-2 ring-brand-200 rounded-lg text-sm w-64 transition-all outline-none"
                            />
                        </div>
                        <button className="p-2 relative text-gray-400 hover:bg-gray-100 rounded-full transition">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs ring-2 ring-transparent hover:ring-brand-200 transition cursor-pointer">
                            {currentUser?.email?.substring(0, 2).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default InternalLayout;
