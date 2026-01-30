'use client';

import { House } from "lucide-react";
import { SidebarButton } from "@/components/SidebarButton";
import { useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState("");

  return (
    <div>
      <h1>Welcome to Next.js!</h1>
      <SidebarButton icon={House} isActive={activeTab === "home"} onClick={() => setActiveTab("home")}/>
    </div>
  );
}
