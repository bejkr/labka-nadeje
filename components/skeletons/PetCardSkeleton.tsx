import React from 'react';
import Skeleton from '../ui/Skeleton';

const PetCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
            {/* Image Area */}
            <div className="relative aspect-[4/3] bg-gray-100">
                <Skeleton className="w-full h-full" />
                <div className="absolute top-4 right-4">
                    <Skeleton className="w-16 h-6 rounded-xl bg-white/50" />
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                    <Skeleton className="w-32 h-7" /> {/* Name */}
                    <Skeleton className="w-8 h-8 !rounded-lg" /> {/* Gender Icon */}
                </div>

                <Skeleton className="w-24 h-4" /> {/* Breed */}

                <div className="space-y-2">
                    <Skeleton className="w-full h-4" variant="text" />
                    <Skeleton className="w-3/4 h-4" variant="text" />
                </div>

                <div className="flex gap-2">
                    <Skeleton className="w-16 h-5 rounded-md" />
                    <Skeleton className="w-20 h-5 rounded-md" />
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Skeleton className="w-24 h-4" /> {/* Location */}
                    <Skeleton className="w-20 h-4" /> {/* Detail link */}
                </div>
            </div>
        </div>
    );
};

export default PetCardSkeleton;
