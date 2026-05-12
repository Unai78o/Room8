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
      </div>

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

    </div>
  );
}