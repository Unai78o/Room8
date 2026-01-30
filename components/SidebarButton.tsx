import { LucideIcon } from "lucide-react";

interface Props {
    icon: LucideIcon;
    isActive?: boolean;
    onClick?: () => void;
}

export function SidebarButton({ icon: Icon, isActive = false, onClick }: Props) {
    return (
        <button
        onClick={onClick}
        className={`relative flex items-center justify-center group w-3/4 h-full cursor-pointer text-gray-400 hover:text-white transition-colors  ${
            isActive && 'text-white'
        }`}>
            {isActive
                && <div className='absolute left-0 top-0 bottom-0 bg-indigo-500 w-1 h-auto rounded-r-md'></div>
            }
            <Icon size={24} />
        </button>
    );
}