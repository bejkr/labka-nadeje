import React, { useState, MouseEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PetCardImageSliderProps {
    pet: {
        id: string;
        slug?: string;
        name: string;
        imageUrl: string;
        gallery?: string[];
        adoptionStatus?: string;
        age?: number;
    };
    aspectRatio?: string;
    showStatusBadge?: boolean;
    showAgeBadge?: boolean;
    children?: React.ReactNode;
}

const PetCardImageSlider: React.FC<PetCardImageSliderProps> = ({
    pet,
    aspectRatio = "aspect-[3/4]",
    showStatusBadge = true,
    showAgeBadge = true,
    children
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Combine main image and gallery, ensure uniqueness
    const images = React.useMemo(() => {
        const result = [pet.imageUrl];
        if (pet.gallery && pet.gallery.length > 0) {
            pet.gallery.forEach(img => {
                if (img && img !== pet.imageUrl) {
                    result.push(img);
                }
            });
        }
        return result;
    }, [pet.imageUrl, pet.gallery]);

    const handlePrev = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const currentImage = images[currentImageIndex];

    return (
        <div className={`relative ${aspectRatio} overflow-hidden bg-gray-100 group/slider`}>
            <Link to={`/pets/${pet.slug || pet.id}`} className="block w-full h-full">
                <img
                    src={currentImage}
                    alt={pet.name}
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                />
            </Link>

            {/* Badges */}
            {showAgeBadge && pet.age !== undefined && (
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-xl text-xs font-bold text-gray-800 shadow-sm border border-gray-100 z-10 pointer-events-none">
                    {pet.age} {pet.age === 1 ? 'rok' : (pet.age >= 2 && pet.age <= 4 ? 'roky' : 'rokov')}
                </div>
            )}

            {showStatusBadge && pet.adoptionStatus === 'Reserved' && (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-xl font-bold text-xs shadow-lg">Rezervovaný</span>
                </div>
            )}

            {children}

            {/* Navigation Arrows - Only if more than 1 image */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-white text-gray-800 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200 z-20"
                    >
                        <ChevronLeft size={16} strokeWidth={3} />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur hover:bg-white text-gray-800 rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200 z-20"
                    >
                        <ChevronRight size={16} strokeWidth={3} />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200">
                        {images.slice(0, 5).map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default PetCardImageSlider;
