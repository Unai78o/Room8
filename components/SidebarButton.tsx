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
            isActive ? 'text-foreground' : 'text-gray-400 hover:text-foreground'
            }`}
        >

            {/* {if (isActive ) {
                'text-white'
            } else {
                'text-gray-400 hover:text-white'
            }} */}

            {isActive && (
                <motion.div
                    layoutId="sidebarSlider"
                    className="absolute left-0 w-1 bg-main h-8 rounded-r-md"
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                    }}
                />
            )}

            <Icon size={24} className="relative z-10"/>
        </button>
    );
}