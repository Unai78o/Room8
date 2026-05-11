/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { FrostedCard as GlassCard } from '@/components/FrostedCard';
import { Home, User, Check, Ghost, Zap, Activity, ChevronRight, Trash2 } from 'lucide-react';
import {
  registerUser, loginUser, getUserHouses, joinHouse, createHouse,
  getHouseData, createRule, completeTask as dbCompleteTask, payBill as dbPayBill,
  createBill, createTask, getUserById, deleteBill, deleteRule
} from '@/app/actions';

// Micro-components
const SectionTitle = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="mb-8">
    <h2 className="text-3xl sm:text-4xl font-sans font-bold text-[#e5dcd3] tracking-tight">{title}</h2>
    <div className="flex items-center gap-4 mt-2">
      <div className="h-[2px] w-12 bg-[#ffb38a]" />
      <span className="font-mono text-[#8C7B70] text-sm uppercase tracking-widest">{subtitle}</span>
    </div>
  </div>
);

const ToastNotification = ({ toast }: { toast: { message: string, type: string } | null }) => {
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-[#1a1614]/90 backdrop-blur-xl border border-[#ffb38a]/50 text-[#ffb38a] px-6 py-4 rounded-2xl shadow-lg shadow-black/50 font-mono text-sm flex items-center gap-3">
        <Zap size={16} />
        {toast.message}
      </div>
    </div>
  );
};

const GlassModal = ({ children, isOpen, onClose }: { children: React.ReactNode, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60 animate-in fade-in duration-200" onClick={onClose}>
      <div className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="p-8">
          {children}
        </GlassCard>
      </div>
    </div>
  );
};

export default function RoommateOS() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableHouses, setAvailableHouses] = useState<any[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [toast, setToast] = useState<{ message: string, type: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showConfetti, setShowConfetti] = useState(false);

  // DB
  const [tasks, setTasks] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [houseMembers, setHouseMembers] = useState<any[]>([]);

  const [billToPay, setBillToPay] = useState<string | null>(null);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [newRuleText, setNewRuleText] = useState("");

  const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);
  const [newHouseName, setNewHouseName] = useState("");
  const [newHouseAddress, setNewHouseAddress] = useState("");

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [newBillConcept, setNewBillConcept] = useState("");
  const [newBillTotal, setNewBillTotal] = useState("");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskXP, setNewTaskXP] = useState("");

  const showToast = (message: string) => {
    setToast({ message, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const savedUserId = localStorage.getItem('roommate_user_id');
      if (savedUserId) {
        setIsTransitioning(true);
        try {
          const user = await getUserById(savedUserId);
          setCurrentUser(user);
          setUserXP(user.xp);
          setIsLoggedIn(true);

          const houses = await getUserHouses(savedUserId);
          setAvailableHouses(houses);
        } catch (e) {
          console.error("Session restore failed", e);
          localStorage.removeItem('roommate_user_id');
        } finally {
          setIsTransitioning(false);
        }
      }
    };
    restoreSession();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransitioning(true);
    try {
      let user;
      if (authMode === 'register') {
        user = await registerUser(alias, email, password);
      } else {
        user = await loginUser(email, password);
      }
      setCurrentUser(user);
      setUserXP(user.xp);
      setIsLoggedIn(true);
      localStorage.setItem('roommate_user_id', user._id);

      const houses = await getUserHouses(user._id);
      setAvailableHouses(houses);
    } catch (error: any) {
      showToast(error.message || "Error al iniciar sesión");
    } finally {
      setIsTransitioning(false);
    }
  };

  const selectHouse = async (house: any) => {
    setIsTransitioning(true);
    try {
      if (!currentUser.houseId || currentUser.houseId !== house._id) {
        await joinHouse(currentUser._id, house._id);
        setCurrentUser({ ...currentUser, houseId: house._id });
      }
      setSelectedHouse(house);
      const data = await getHouseData(house._id);
      setTasks(data.tasks);
      setBills(data.bills);
      setRules(data.rules);
      setHouseMembers(data.members);
    } catch (error: any) {
      showToast(error.message);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleJoinHouse = async () => {
    if (!inviteCode.trim() || !currentUser) return;
    setIsTransitioning(true);
    try {
      await joinHouse(currentUser._id, inviteCode.trim());
      const houses = await getUserHouses(currentUser._id);
      setAvailableHouses(houses);
      setIsJoinModalOpen(false);
      setInviteCode("");
      showToast("Conexión establecida");
    } catch (err: any) {
      showToast(err.message || "Error al unirse");
    } finally {
      setIsTransitioning(false);
    }
  };

  const createNewHouse = async () => {
    if (newHouseName.trim() && currentUser) {
      setIsTransitioning(true);
      try {
        const house = await createHouse(newHouseName, newHouseAddress, currentUser._id);
        setCurrentUser({ ...currentUser, houseId: house._id });
        setSelectedHouse(house);
        const data = await getHouseData(house._id);
        setTasks(data.tasks);
        setBills(data.bills);
        setRules(data.rules);
        setHouseMembers(data.members);

        const houses = await getUserHouses(currentUser._id);
        setAvailableHouses(houses);

        setIsHouseModalOpen(false);
        setNewHouseName("");
        setNewHouseAddress("");
        showToast("Nuevo Servidor Doméstico Creado");
      } catch (err: any) {
        showToast(err.message);
      } finally {
        setIsTransitioning(false);
      }
    }
  };

  const completeTask = async (taskId: string, xp: number) => {
    try {
      await dbCompleteTask(taskId, currentUser._id, xp);
      setTasks(tasks.filter(t => t._id !== taskId));
      setUserXP(prev => prev + xp);
      setShowConfetti(true);
      showToast("Misión cumplida. XP + " + xp);
      setTimeout(() => setShowConfetti(false), 2000);
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const payBill = async () => {
    if (billToPay) {
      try {
        await dbPayBill(billToPay);
        setBills(bills.map(b => b._id === billToPay ? { ...b, paid: b.total } : b));
        showToast("Deuda pagada");
        setBillToPay(null);
      } catch (err: any) {
        showToast(err.message);
      }
    }
  };

  const addRule = async () => {
    if (newRuleText.trim() && selectedHouse) {
      try {
        const ruleIdStr = `0${rules.length + 1}`;
        const newRule = await createRule(selectedHouse._id, ruleIdStr, "NUEVA", newRuleText);
        setRules([...rules, newRule]);
        setNewRuleText("");
        setIsRuleModalOpen(false);
        showToast("Nueva norma creada");
      } catch (err: any) {
        showToast(err.message);
      }
    }
  };

  const addNewBill = async () => {
    const total = parseFloat(newBillTotal);
    if (newBillConcept.trim() && !isNaN(total) && total > 0 && selectedHouse) {
      try {
        const newBill = await createBill(selectedHouse._id, newBillConcept, total);
        setBills([...bills, newBill]);
        setNewBillConcept("");
        setNewBillTotal("");
        setIsBillModalOpen(false);
        showToast("Nueva deuda creada");
      } catch (err: any) {
        showToast(err.message);
      }
    }
  };

  const addNewTask = async () => {
    const xp = parseInt(newTaskXP);
    if (newTaskTitle.trim() && !isNaN(xp) && xp > 0 && selectedHouse) {
      try {
        const newTask = await createTask(selectedHouse._id, newTaskTitle, xp);
        setTasks([...tasks, newTask]);
        setNewTaskTitle("");
        setNewTaskXP("");
        setIsTaskModalOpen(false);
        showToast("Nueva tarea de convivencia creada");
      } catch (err: any) {
        showToast(err.message);
      }
    }
  };

  const removeRule = async (ruleId: string) => {
    try {
      await deleteRule(ruleId);
      setRules(rules.filter(r => r._id !== ruleId));
      showToast("Norma eliminada");
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const removeBill = async (billId: string) => {
    try {
      await deleteBill(billId);
      setBills(bills.filter(b => b._id !== billId));
      showToast("Deuda eliminada con éxito");
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const parallaxX = (mousePos.x / (typeof window !== 'undefined' ? window.innerWidth : 1000) - 0.5) * 20;
  const parallaxY = (mousePos.y / (typeof window !== 'undefined' ? window.innerHeight : 1000) - 0.5) * 20;
}
