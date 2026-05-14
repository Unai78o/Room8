/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { FrostedCard as GlassCard } from '@/components/FrostedCard';
import { Home, User, Check, Flame, Ghost, Zap, Activity, ChevronRight, Trash2 } from 'lucide-react';
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

  return (
    <div className="relative min-h-screen w-full bg-[#141210] text-[#e5dcd3] font-sans overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #1a1614 0%, #141210 100%)',
          transform: `translate(${parallaxX * -0.5}px, ${parallaxY * -0.5}px)`
        }}
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#ffb38a]/10 blur-[120px] rounded-full"
          style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)` }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#8C7B70]/10 blur-[150px] rounded-full"
          style={{ transform: `translate(${parallaxX * -1.5}px, ${parallaxY * -1.5}px)` }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
      </div>

      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="text-9xl animate-bounce">✨🏆✨</div>
        </div>
      )}



      <div className={`relative z-10 w-full h-full min-h-screen flex transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>

        {/* LOGIN */}
        {!isLoggedIn && (
          <div className="flex-1 flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-md p-10 flex flex-col items-center">
              <div className="w-20 h-20 border border-[#ffb38a]/30 rotate-45 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(255,179,138,0.15)] bg-[#1a1614]/80">
                <span className="-rotate-45 text-4xl font-serif italic text-[#ffb38a] ml-1">R</span>
              </div>
              <h1 className="text-2xl font-bold mb-2 tracking-widest text-[#e5dcd3]">ROOMMATE<span className="text-[#ffb38a]">OS</span></h1>
              <p className="font-mono text-sm text-[#8C7B70] mb-8">v2.4.0 // INITIALIZATION</p>

              <div className="flex bg-[#141210]/50 p-1 rounded-xl w-full mb-6 border border-white/5">
                <button
                  className={`flex-1 py-2 font-mono text-xs rounded-lg transition-all ${authMode === 'login' ? 'bg-[#ffb38a]/10 text-[#ffb38a]' : 'text-[#8C7B70] hover:text-[#e5dcd3]'}`}
                  onClick={() => setAuthMode('login')}
                >
                  LOGIN
                </button>
                <button
                  className={`flex-1 py-2 font-mono text-xs rounded-lg transition-all ${authMode === 'register' ? 'bg-[#ffb38a]/10 text-[#ffb38a]' : 'text-[#8C7B70] hover:text-[#e5dcd3]'}`}
                  onClick={() => setAuthMode('register')}
                >
                  SIGN UP
                </button>
              </div>

              <form onSubmit={handleAuth} className="w-full flex flex-col gap-4">
                {authMode === 'register' && (
                  <input
                    type="text"
                    placeholder="Alias"
                    required
                    value={alias} onChange={e => setAlias(e.target.value)}
                    className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70]"
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70]"
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70]"
                />

                <div className="mt-4 flex flex-col gap-3">
                  <button type="submit" className="w-full bg-[#ffb38a] text-[#141210] font-bold py-3 rounded-xl hover:bg-[#ffb38a]/90 hover:shadow-[0_0_20px_rgba(255,179,138,0.3)] transition-all uppercase tracking-wider text-sm">
                    Inicializar
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        )}

        {/* HOUSE SELECTION */}
        {isLoggedIn && !selectedHouse && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <SectionTitle title={`Hola, ${currentUser?.alias || 'Viajero'}`} subtitle="Selecciona Servidor Doméstico" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-8">
              {availableHouses.map(house => (
                <GlassCard key={house._id} className="p-6 flex flex-col items-center text-center group">
                  <div className="w-16 h-16 rounded-full bg-[#141210] border border-white/10 flex items-center justify-center mb-4 group-hover:border-[#ffb38a]/50 transition-colors">
                    <Home className="text-[#ffb38a]" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{house.name}</h3>
                  <p className="text-[#8C7B70] text-xs font-mono mb-6">{house.address}</p>

                  <div className="flex -space-x-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-[#ffb38a]/20 border-2 border-[#1a1614] flex items-center justify-center text-[10px] font-bold text-[#ffb38a]">TÚ</div>
                    {house.members?.slice(0, 3).map((m: any, idx: number) => (
                      <div key={idx} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#1a1614] flex items-center justify-center text-[10px] font-bold">M</div>
                    ))}
                  </div>

                  <button onClick={() => selectHouse(house)} className="w-full py-2 bg-white/5 hover:bg-[#ffb38a]/10 text-[#e5dcd3] hover:text-[#ffb38a] border border-white/10 hover:border-[#ffb38a]/30 rounded-lg transition-all text-sm font-mono tracking-widest">
                    CONECTAR
                  </button>
                </GlassCard>
              ))}

              <div className="flex flex-col gap-4">
                <GlassCard
                  className="p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-white/5 transition-all border-dashed h-full"
                  onClick={() => setIsHouseModalOpen(true)}
                >
                  <div className="w-16 h-16 rounded-full bg-[#141210] border border-white/10 flex items-center justify-center mb-4 group-hover:border-[#ffb38a]/50 transition-colors">
                    <span className="text-[#ffb38a] text-3xl">+</span>
                  </div>
                  <h3 className="font-bold text-[#e5dcd3] mb-2 font-mono text-sm">CREAR NUEVO SERVIDOR</h3>
                </GlassCard>

                <GlassCard
                  className="p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-white/5 transition-all border-dashed h-full"
                  onClick={() => setIsJoinModalOpen(true)}
                >
                  <div className="w-16 h-16 rounded-full bg-[#141210] border border-white/10 flex items-center justify-center mb-4 group-hover:border-[#ffb38a]/50 transition-colors">
                    <Zap className="text-[#ffb38a]" size={28} />
                  </div>
                  <h3 className="font-bold text-[#e5dcd3] mb-2 font-mono text-sm">UNIRSE CON CÓDIGO</h3>
                </GlassCard>
              </div>
            </div>

            <button
              onClick={() => {
                setIsLoggedIn(false);
                setCurrentUser(null);
                setSelectedHouse(null);
                localStorage.removeItem('roommate_user_id');
              }}
              className="mt-12 text-[#8C7B70] hover:text-red-400 font-mono text-sm border-b border-transparent hover:border-red-400/30 transition-all pb-1"
            >
              [ CERRAR SESIÓN ]
            </button>
          </div>
        )}

        {/* MAIN APP */}
        {isLoggedIn && selectedHouse && (
          <div className="flex flex-1 w-full relative">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onBackToSelection={() => setSelectedHouse(null)} />

            <main className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen custom-scrollbar">

              {/* DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-end mb-10">
                    <SectionTitle title="Página Principal" subtitle="Resumen de Estado" />
                    <div className="hidden md:flex items-center gap-3 bg-[#1a1614]/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="font-mono text-xs text-[#8C7B70]">SERVER: ONLINE</span>
                    </div>
                  </div>

                  <GlassCard className="p-8 mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffb38a]/5 blur-[80px] group-hover:bg-[#ffb38a]/10 transition-colors" />
                    <h3 className="font-mono text-[#8C7B70] tracking-widest text-sm mb-2">SISTEMA</h3>
                    <h2 className="text-4xl font-bold text-[#ffb38a] mb-6 tracking-tight">ESTADO ÓPTIMO</h2>

                    <div className="mb-8">
                      <div className="flex justify-between font-mono text-xs mb-2">
                        <span>Sincronización de Convivencia</span>
                        <span className="text-[#ffb38a]">98%</span>
                      </div>
                      <div className="w-full h-1 bg-[#141210] rounded-full overflow-hidden">
                        <div className="h-full bg-[#ffb38a] w-[98%] shadow-[0_0_10px_#ffb38a]" />
                      </div>
                    </div>

                    <div className="mb-8 p-4 bg-[#141210]/50 rounded-xl border border-white/5 inline-block">
                      <p className="font-mono text-[10px] text-[#8C7B70] mb-1">CÓDIGO DE INVITACIÓN (CÓPIALO PARA INVITAR)</p>
                      <p className="font-mono text-sm text-[#ffb38a] select-all cursor-copy">{selectedHouse?._id}</p>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setActiveTab('chorelock')} className="bg-[#ffb38a] text-[#141210] px-6 py-2 rounded-lg font-bold text-sm tracking-wider hover:shadow-[0_0_15px_rgba(255,179,138,0.4)] transition-all">
                        TAREAS PENDIENTES
                      </button>
                    </div>
                  </GlassCard>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="p-6 md:col-span-2">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-sans font-bold text-xl">Tareas & Facturas</h3>
                        <Activity className="text-[#8C7B70]" size={20} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#141210]/50 p-4 rounded-xl border border-white/5">
                          <p className="font-mono text-[#8C7B70] text-xs mb-1">DEUDA ACTIVA</p>
                          <p className="text-2xl font-bold font-mono text-[#e5dcd3]">
                            {bills.reduce((acc, b) => acc + (b.total - b.paid), 0)}<span className="text-[#ffb38a]">€</span>
                          </p>
                        </div>
                        <div className="bg-[#141210]/50 p-4 rounded-xl border border-white/5">
                          <p className="font-mono text-[#8C7B70] text-xs mb-1">PENDIENTES</p>
                          <p className="text-2xl font-bold font-mono text-[#e5dcd3]">
                            {tasks.length}<span className="text-sm text-[#8C7B70] ml-2">TAREAS</span>
                          </p>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="font-sans font-bold text-xl mb-4">Leaderboard</h3>
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center bg-[#ffb38a]/10 border border-[#ffb38a]/30 p-2 rounded-lg">
                            <span className="text-sm font-bold text-[#ffb38a]">{currentUser?.alias || 'TÚ'}</span>
                            <span className="font-mono text-xs">{userXP} XP</span>
                          </div>
                          {houseMembers.filter(m => m._id !== currentUser?._id).map((member: any) => (
                            <div key={member._id} className="flex justify-between items-center p-2">
                              <span className="text-sm text-[#8C7B70]">{member.alias}</span>
                              <span className="font-mono text-xs text-[#8C7B70]">{member.xp} XP</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-center gap-2 font-mono text-xs text-[#ffb38a] bg-[#141210]/50 p-2 rounded-lg border border-white/5">
                        <Flame size={14} /> RACHA: 12 DÍAS
                      </div>
                    </GlassCard>
                  </div>
                </div>
              )}

              {/* HOUSE RULES */}
              {activeTab === 'houserules' && (
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionTitle title="Normas" subtitle="Normas de Convivencia" />

                  <div className="flex flex-col gap-4 mb-8">
                    {rules.map(rule => (
                      <GlassCard key={rule._id} className="p-6 flex items-start gap-6">
                        <div className="font-mono text-4xl text-[#141210] font-black text-stroke tracking-tighter" style={{ WebkitTextStroke: '1px #ffb38a', color: 'transparent' }}>
                          {rule.ruleId}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className="bg-[#ffb38a]/10 text-[#ffb38a] font-mono text-[10px] px-2 py-1 rounded border border-[#ffb38a]/20 uppercase tracking-widest">
                              {rule.category}
                            </span>
                            <span className="font-mono text-xs text-[#8C7B70]">
                              VOTOS: {rule.votes}/{rule.maxVotes}
                            </span>
                          </div>
                          <p className="text-[#e5dcd3]">{rule.description}</p>
                        </div>
                        <button
                          onClick={() => removeRule(rule._id)}
                          className="bg-transparent border border-red-500/20 text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all self-center"
                          title="Eliminar directiva"
                        >
                          <Trash2 size={16} />
                        </button>
                      </GlassCard>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsRuleModalOpen(true)}
                    className="w-full py-4 border border-dashed border-[#8C7B70]/50 rounded-[2rem] text-[#8C7B70] hover:text-[#ffb38a] hover:border-[#ffb38a]/50 hover:bg-[#ffb38a]/5 transition-all font-mono tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    + NUEVA DIRECTIVA
                  </button>
                </div>
              )}

              {/* SHARED BILLS */}
              {activeTab === 'sharedbills' && (
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionTitle title="Facturas" subtitle="Facturas compartidas" />

                  <div className="flex flex-col gap-4">
                    {bills.map(bill => {
                      const isPaid = bill.paid >= bill.total;
                      const percentage = (bill.paid / bill.total) * 100;
                      return (
                        <GlassCard key={bill._id} className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{bill.concept}</h3>
                            {isPaid ? (
                              <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded font-mono text-xs tracking-wider">
                                PAGADO
                              </span>
                            ) : (
                              <span className="font-mono text-[#ffb38a]">
                                {bill.paid} / {bill.total} €
                              </span>
                            )}
                            <button
                              onClick={() => removeBill(bill._id)}
                              className="ml-4 bg-transparent border border-red-500/20 text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                              title="Eliminar cuota"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          <div className="w-full h-2 bg-[#141210] rounded-full overflow-hidden mb-6">
                            <div
                              className={`h-full transition-all duration-1000 ${isPaid ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-[#ffb38a] shadow-[0_0_10px_#ffb38a]'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          {!isPaid && (
                            <div className="flex justify-end">
                              <button
                                onClick={() => setBillToPay(bill._id)}
                                className="bg-[#141210] border border-white/10 hover:border-[#ffb38a] text-[#e5dcd3] hover:text-[#ffb38a] px-4 py-2 rounded-lg text-sm font-mono transition-all flex items-center gap-2"
                              >
                                TRANSFERIR CUOTA <ChevronRight size={14} />
                              </button>
                            </div>
                          )}
                        </GlassCard>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setIsBillModalOpen(true)}
                    className="w-full py-4 mt-6 border border-dashed border-[#8C7B70]/50 rounded-[2rem] text-[#8C7B70] hover:text-[#ffb38a] hover:border-[#ffb38a]/50 hover:bg-[#ffb38a]/5 transition-all font-mono tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    + NUEVO GASTO
                  </button>
                </div>
              )}

              {/* TASKS */}
              {activeTab === 'chorelock' && (
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionTitle title="Tareas" subtitle="Tareas pendientes" />

                  {tasks.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center">
                      <Ghost size={48} className="text-[#8C7B70] mb-4 opacity-50" />
                      <p className="font-mono text-[#8C7B70]">No hay tareas pendientes.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {tasks.map(task => (
                        <GlassCard key={task._id} className="p-4 pl-6 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="flex flex-col items-center justify-center w-10 h-10 rounded-full bg-[#141210] border border-white/10 shrink-0">
                              <span className="text-[10px] font-bold text-[#8C7B70]">{(!task.assignedTo || task.assignedTo === currentUser?._id) ? 'TÚ' : 'OT'}</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-[#e5dcd3]">{task.title}</h3>
                              <span className="font-mono text-xs text-[#ffb38a]">+{task.xpReward} XP</span>
                            </div>
                          </div>

                          {(!task.assignedTo || task.assignedTo === currentUser?._id) && (
                            <button
                              onClick={() => completeTask(task._id, task.xpReward)}
                              className="w-12 h-12 rounded-xl bg-[#141210] border border-white/10 hover:border-[#ffb38a] hover:bg-[#ffb38a]/10 flex items-center justify-center text-[#8C7B70] hover:text-[#ffb38a] transition-all group"
                            >
                              <Check size={20} className="group-hover:scale-125 transition-transform" />
                            </button>
                          )}
                        </GlassCard>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="w-full py-4 mt-6 border border-dashed border-[#8C7B70]/50 rounded-[2rem] text-[#8C7B70] hover:text-[#ffb38a] hover:border-[#ffb38a]/50 hover:bg-[#ffb38a]/5 transition-all font-mono tracking-widest text-sm flex items-center justify-center gap-2"
                  >
                    + NUEVA TAREA
                  </button>
                </div>
              )}

              {/* PROFILE */}
              {activeTab === 'profile' && (
                <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <SectionTitle title="Perfil de Usuario" subtitle="Datos Biométricos" />
                  <GlassCard className="p-8 text-center">
                    <div className="w-24 h-24 rounded-full bg-[#ffb38a]/20 border-2 border-[#ffb38a] mx-auto mb-4 flex items-center justify-center">
                      <User size={40} className="text-[#ffb38a]" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">{currentUser?.alias}</h2>
                    <p className="font-mono text-[#8C7B70] mb-6">Nivel {Math.floor(userXP / 100) + 1} • {userXP} XP</p>
                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
                        setCurrentUser(null);
                        setSelectedHouse(null);
                        localStorage.removeItem('roommate_user_id');
                      }}
                      className="bg-[#141210] border border-red-500/30 text-red-400 hover:bg-red-500/10 px-6 py-2 rounded-lg font-mono text-sm transition-all"
                    >
                      DESCONECTAR
                    </button>
                  </GlassCard>
                </div>
              )}
            </main>
          </div>
        )}
      </div>

      {/* MODALS */}
      <GlassModal isOpen={isRuleModalOpen} onClose={() => setIsRuleModalOpen(false)}>
        <h3 className="text-xl font-bold mb-2">Nueva Norma</h3>
        <p className="text-sm text-[#8C7B70] mb-6">Propón una nueva regla para el servidor doméstico.</p>
        <textarea
          value={newRuleText}
          onChange={(e) => setNewRuleText(e.target.value)}
          placeholder="Ej: Prohibido consumir raciones ajenas..."
          className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70] min-h-[100px] mb-6 resize-none"
        />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setIsRuleModalOpen(false)} className="px-4 py-2 font-mono text-xs text-[#8C7B70] hover:text-[#e5dcd3]">CANCELAR</button>
          <button onClick={addRule} className="bg-[#ffb38a] text-[#141210] px-6 py-2 rounded-lg font-bold text-sm">ENVIAR</button>
        </div>
      </GlassModal>

      <GlassModal isOpen={billToPay !== null} onClose={() => setBillToPay(null)}>
        <h3 className="text-xl font-bold mb-2 text-center">Confirmar Transferencia</h3>
        <p className="text-sm text-[#8C7B70] mb-8 text-center">¿Estas seguro/a?</p>
        <div className="flex gap-4">
          <button onClick={() => setBillToPay(null)} className="flex-1 py-3 border border-white/10 rounded-xl font-mono text-sm text-[#8C7B70] hover:text-[#e5dcd3] hover:bg-white/5 transition-all">CANCELAR</button>
          <button onClick={payBill} className="flex-1 py-3 bg-[#ffb38a] rounded-xl font-bold text-sm text-[#141210] hover:bg-[#ffb38a]/90 transition-all shadow-[0_0_15px_rgba(255,179,138,0.3)]">AUTORIZAR</button>
        </div>
      </GlassModal>

      <GlassModal isOpen={isHouseModalOpen} onClose={() => setIsHouseModalOpen(false)}>
        <h3 className="text-xl font-bold mb-2">Inicializar Servidor</h3>
        <p className="text-sm text-[#8C7B70] mb-6">Define los parámetros de tu nueva vivienda.</p>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Nombre de la Base"
            value={newHouseName}
            onChange={(e) => setNewHouseName(e.target.value)}
            className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70]"
          />
          <input
            type="text"
            placeholder="Coordenadas / Dirección (Opcional)"
            value={newHouseAddress}
            onChange={(e) => setNewHouseAddress(e.target.value)}
            className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70]"
          />
          <div className="flex gap-3 justify-end mt-2">
            <button onClick={() => setIsHouseModalOpen(false)} className="px-4 py-2 font-mono text-xs text-[#8C7B70] hover:text-[#e5dcd3]">CANCELAR</button>
            <button onClick={createNewHouse} className="bg-[#ffb38a] text-[#141210] px-6 py-2 rounded-lg font-bold text-sm">CREAR</button>
          </div>
        </div>
      </GlassModal>

      <GlassModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)}>
        <div className="bg-[#1a1614] p-8 rounded-3xl max-w-md w-full border border-white/10 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
          <h2 className="text-2xl font-bold font-sans tracking-tight mb-2">Unirse a Servidor</h2>
          <input
            type="text"
            placeholder="Introduce el código de invitación"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70] font-mono"
          />
          <div className="flex gap-3 justify-end mt-2">
            <button onClick={() => setIsJoinModalOpen(false)} className="px-4 py-2 font-mono text-xs text-[#8C7B70] hover:text-[#e5dcd3]">CANCELAR</button>
            <button onClick={handleJoinHouse} className="bg-[#ffb38a] text-[#141210] px-6 py-2 rounded-lg font-bold text-sm">CONECTAR</button>
          </div>
        </div>
      </GlassModal>

      <GlassModal isOpen={isBillModalOpen} onClose={() => setIsBillModalOpen(false)}>
        <h3 className="text-xl font-bold mb-2">Nueva Gasto Conjunto</h3>
        <p className="text-sm text-[#8C7B70] mb-6">Añade un nuevo gasto para repartir.</p>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Concepto (Ej: Enlace Orbital)"
            value={newBillConcept}
            onChange={(e) => setNewBillConcept(e.target.value)}
            className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70]"
          />
          <input
            type="number"
            placeholder="Total €"
            value={newBillTotal}
            onChange={(e) => setNewBillTotal(e.target.value)}
            className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70]"
          />
          <div className="flex gap-3 justify-end mt-2">
            <button onClick={() => setIsBillModalOpen(false)} className="px-4 py-2 font-mono text-xs text-[#8C7B70] hover:text-[#e5dcd3]">CANCELAR</button>
            <button onClick={addNewBill} className="bg-[#ffb38a] text-[#141210] px-6 py-2 rounded-lg font-bold text-sm">AÑADIR GASTO</button>
          </div>
        </div>
      </GlassModal>

      <GlassModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)}>
        <h3 className="text-xl font-bold mb-2">Nueva Tarea</h3>
        <p className="text-sm text-[#8C7B70] mb-6">Asigna una nueva tarea de mantenimiento.</p>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Título de la Tarea"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70]"
          />
          <input
            type="number"
            placeholder="Recompensa (XP)"
            value={newTaskXP}
            onChange={(e) => setNewTaskXP(e.target.value)}
            className="w-full bg-[#141210]/60 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffb38a]/50 transition-colors placeholder:text-[#8C7B70]"
          />
          <div className="flex gap-3 justify-end mt-2">
            <button onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 font-mono text-xs text-[#8C7B70] hover:text-[#e5dcd3]">CANCELAR</button>
            <button onClick={addNewTask} className="bg-[#ffb38a] text-[#141210] px-6 py-2 rounded-lg font-bold text-sm">CREAR TAREA</button>
          </div>
        </div>
      </GlassModal>

      {/* TOASTS */}
      <ToastNotification toast={toast} />
    </div>
  );
}
