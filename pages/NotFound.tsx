import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dog, Home, Search, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-2xl w-full text-center">
                {/* Illustration Area */}
                <div className="mb-8 relative inline-block">
                    <div className="absolute inset-0 bg-brand-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    <div className="relative bg-white rounded-[3rem] p-12 shadow-xl border-4 border-white transform hover:scale-105 transition-transform duration-500">
                        <div className="relative">
                            <Dog size={120} className="text-brand-500 mx-auto" />
                            <div className="absolute -top-2 -right-2 text-6xl animate-bounce delay-700">?</div>
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                    Ups, tu nič nie je.
                </h1>
                <p className="text-xl text-gray-500 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
                    Stránka, ktorú hľadáte, sa nenašla. Možno sa zatúlala, rovnako ako niektorí naši zverenci.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-black rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Späť
                    </button>

                    <Link
                        to="/"
                        className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                    >
                        <Home size={20} />
                        Domov
                    </Link>

                    <Link
                        to="/pets"
                        className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 flex items-center justify-center gap-2"
                    >
                        <Search size={20} />
                        Hľadať zvieratko
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
