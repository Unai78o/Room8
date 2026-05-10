// components/Sidebar.tsx
import { SidebarButton } from "./SidebarButton";
import { House, Gavel, Receipt, Gamepad2, User, LogOut, LucideIcon } from "lucide-react";
import { LayoutGroup } from "motion/react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBackToSelection: () => void;
}

export function Sidebar({ activeTab, onTabChange, onBackToSelection }: SidebarProps) {
  interface NavItem {
    btnName: string;
    icon: LucideIcon;
    label: string;
  }

  const navbarButtons: NavItem[] = [
    { btnName: "dashboard", icon: House, label: "Dashboard" },
    { btnName: "houserules", icon: Gavel, label: "House Rules" },
    { btnName: "sharedbills", icon: Receipt, label: "Shared Bills" },
    { btnName: "chorelock", icon: Gamepad2, label: "Chore Lock" },
    { btnName: "profile", icon: User, label: "Profile" }
  ];

  return (
    <aside className="sticky top-0 h-screen w-24 p-4 bg-[#1a1614]/40 backdrop-blur-md border-r border-white/5 flex flex-col justify-between z-40">
      <nav className="mt-5 flex-1 flex flex-col">
        <LayoutGroup>
          <div className="flex flex-col gap-8 items-center">
            {navbarButtons.map((button) => (
              <SidebarButton
                key={button.btnName}
                icon={button.icon}
                isActive={activeTab === button.btnName}
                onClick={() => onTabChange(button.btnName)}
                tooltip={button.label}
              />
            ))}
          </div>
        </LayoutGroup>
      </nav>

      <div className="mb-5 flex flex-col items-center">
        <SidebarButton
          icon={LogOut}
          onClick={onBackToSelection}
          tooltip="Cambiar Servidor"
        />
      </div>
    </aside>
  );
}