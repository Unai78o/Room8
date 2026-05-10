import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface Props {
    icon: LucideIcon;
    isActive?: boolean;
    onClick?: () => void;
    className?: string;
    tooltip?: string;
}

export function SidebarButton({ icon: Icon, isActive = false, onClick, tooltip }: Props) {
    return (
        <button
            onClick={onClick}
            className={`relative flex items-center justify-center group w-12 h-12 cursor-pointer transition-colors ${
                isActive ? 'text-[#ffb38a]' : 'text-[#8C7B70] hover:text-[#e5dcd3]'
            }`}
        >
            {isActive && (
                <motion.div
                    layoutId="sidebarSlider"
                    className="absolute left-[-16px] w-1 bg-[#ffb38a] h-8 rounded-r-md"
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30
                    }}
                />
            )}

            <Icon size={24} className="relative z-10"/>
            {tooltip && (
                <div className="absolute left-16 px-2 py-1 bg-[#141210] text-[#e5dcd3] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/10 shadow-lg">
                    {tooltip}
                </div>
            )}
        </button>
    );
}