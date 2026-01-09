
import React from 'react';

const InternalDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Prehľad</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Placeholder Widgets */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-32 flex items-center justify-center text-gray-400 font-medium border-dashed">Widget 1</div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-32 flex items-center justify-center text-gray-400 font-medium border-dashed">Widget 2</div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-32 flex items-center justify-center text-gray-400 font-medium border-dashed">Widget 3</div>
            </div>
        </div>
    );
};

export default InternalDashboard;
