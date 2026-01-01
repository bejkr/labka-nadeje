import React from 'react';
import Skeleton from '../ui/Skeleton';

const ShelterCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-32 bg-gray-100 relative">
                <Skeleton className="w-full h-full !rounded-none" />

                {/* Logo Circle */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-20">
                    <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-lg p-1">
                        <Skeleton className="w-full h-full !rounded-[1.8rem]" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 pt-16 pb-4 text-center flex flex-col items-center gap-3">
                <Skeleton className="w-48 h-8" /> {/* Name */}
                <Skeleton className="w-32 h-4" /> {/* Location */}
            </div>

            {/* Stats & Footer */}
            <div className="px-6 py-6 mt-auto flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20 rounded-[1.5rem]" />
                    <Skeleton className="h-20 rounded-[1.5rem]" />
                </div>

                <Skeleton className="h-14 rounded-2xl" /> {/* Button */}
            </div>
        </div>
    );
};

export default ShelterCardSkeleton;
