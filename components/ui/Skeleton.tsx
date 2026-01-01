import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'circle' | 'text';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'default' }) => {
    const baseClasses = "animate-pulse bg-gray-200";
    const variantClasses = {
        default: "rounded-xl",
        circle: "rounded-full",
        text: "rounded-md h-4"
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}></div>
    );
};

export default Skeleton;
