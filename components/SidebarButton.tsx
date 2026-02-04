import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    icon: LucideIcon;
    isActive?: boolean;
    onClick?: () => void;
    className?: string;
}

export function SidebarButton({ icon: Icon, isActive = false, onClick }: Props) {
    return (
        <button
        onClick={onClick}
        className={`relative flex items-center justify-center group w-12 h-12 cursor-pointer transition-colors ${
            isActive ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
        >
            {isActive && (
                <motion.div
                    className="absolute left-0 w-1 bg-indigo-500 h-8 rounded-r-md"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    exit={{ scaleY: 0, opacity: 0 }}
                    transition={{ duration: .25 }}
                />

                // <motion.div
                //     layoutId="sidebarSlider"
                //     className="absolute left-0 w-1 bg-indigo-500 h-8 rounded-r-md"
                //     transition={{
                //         type: "spring",
                //         stiffness: 1100,
                //         damping: 30
                //     }}
                // />
                
            )}

            <Icon size={24} className="relative z-10"/>
        </button>
    );
}