// components/Sidebar.tsx
'use client';

import { Suspense } from 'react';
import { SidebarButton } from "./SidebarButton";
import { House, Gavel, Receipt, Lock, User, LogOut, LucideIcon } from "lucide-react";
import { LayoutGroup } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ThemeToggle } from './ThemeToggle';

function SidebarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';
  interface NavItem {
    btnName: string;
    icon: LucideIcon;
  }

  const navbarButtons: NavItem[] = [
    { btnName: "home", icon: House },
    { btnName: "houseChores", icon: Gavel },
    { btnName: "sharedBills", icon: Receipt },
    { btnName: "choreLock", icon: Lock },
    { btnName: "profile", icon: User },
    { btnName: "selHome", icon: LogOut }
  ];

  const handleTabClick = (name: string) => {
    router.replace(`${pathname}?tab=${name}`, { scroll: false });
  }

  return (
    <nav>
      <LayoutGroup>
        <div className="flex flex-col gap-8 mt-5">
          {navbarButtons.map((button) => (
            <SidebarButton
              key={button.btnName}
              icon={button.icon}
              isActive={activeTab === button.btnName}
              onClick={() => handleTabClick(button.btnName)}
            />
          ))}
        </div>
      </LayoutGroup>
    </nav>
  );
}

export function Sidebar() {
  return (
      <aside className="sticky top-0 h-screen w-20 p-4 bg-backgroun flex flex-col gap-10 min-h-screen">
        <Suspense fallback={<div className="p-8">Cargando navegación...</div>}>
          <SidebarContent />
        </Suspense>
        <ThemeToggle className={"absolute bottom-0 mb-5"}/>
      </aside>
    );
}