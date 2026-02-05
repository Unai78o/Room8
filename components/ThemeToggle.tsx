'use client'
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface Props {
    className?: string
}

export function ThemeToggle ({ className }: Props) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-xl hover:bg-accent transition-colors cursor-pointer ${className || ''}`}
        >
            {theme === 'dark' ? <Sun size={20}/> : <Moon size={20}/>}
        </button>
    );
}