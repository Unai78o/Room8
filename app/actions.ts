'use server';

import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import House from '@/models/House';
import Task from '@/models/Task';
import Bill from '@/models/Bill';
import Rule from '@/models/Rule';
import bcrypt from 'bcryptjs';

export async function registerUser(alias: string, email: string, passwordPlain: string) {
  await connectToDatabase();
  const existing = await User.findOne({ email });
  if (existing) throw new Error('El email ya existe');
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordPlain, salt);
  
  const user = await User.create({ alias, email, passwordHash, xp: 0 });
  return JSON.parse(JSON.stringify(user));
}

export async function loginUser(email: string, passwordPlain: string) {
  await connectToDatabase();
  const user = await User.findOne({ email });
  if (!user) throw new Error('Credenciales incorrectas');

  const isMatch = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isMatch) throw new Error('Credenciales incorrectas');

  return JSON.parse(JSON.stringify(user));
}

export async function getUserById(userId: string) {
  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  return JSON.parse(JSON.stringify(user));
}

export async function getUserHouses(userId: string) {
  await connectToDatabase();
  const houses = await House.find({ members: userId });
  return JSON.parse(JSON.stringify(houses));
}

export async function joinHouse(userId: string, houseId: string) {
  await connectToDatabase();
  const houseCheck = await House.findById(houseId);
  if (!houseCheck) throw new Error('Código de servidor inválido');
  
  const user = await User.findByIdAndUpdate(userId, { houseId }, { new: true });
  await House.findByIdAndUpdate(houseId, { $addToSet: { members: userId } });
  return JSON.parse(JSON.stringify(user));
}

export async function createHouse(name: string, address: string, userId: string) {
  await connectToDatabase();
  const house = await House.create({ name, address, members: [userId] });
  await User.findByIdAndUpdate(userId, { houseId: house._id });
  return JSON.parse(JSON.stringify(house));
}

export async function getHouseData(houseId: string) {
  await connectToDatabase();
  
  // DATOS POR DEFECTO
  const taskCount = await Task.countDocuments({ houseId });
  if (taskCount === 0) {
    await Task.create([
      { title: "Fregar los platos", xpReward: 50, houseId },
      { title: "Tirar la basura", xpReward: 20, houseId },
      { title: "Barrer el salon", xpReward: 75, houseId }
    ]);
  }
  
  const billCount = await Bill.countDocuments({ houseId });
  if (billCount === 0) {
    await Bill.create([
      { concept: "Fibra", total: 45, paid: 15, houseId },
      { concept: "Luz", total: 80, paid: 80, houseId }
    ]);
  }

  const ruleCount = await Rule.countDocuments({ houseId });
  if (ruleCount === 0) {
    await Rule.create([
      { ruleId: "01", category: "RUIDO", description: "No hacer ruido a partir de las 00:00", votes: 4, maxVotes: 4, houseId },
      { ruleId: "02", category: "LIMPIEZA", description: "Limpiar los platos en menos de 24 horas", votes: 3, maxVotes: 4, houseId }
    ]);
  }

  const tasks = await Task.find({ houseId, completed: false });
  const bills = await Bill.find({ houseId });
  const rules = await Rule.find({ houseId });
  const members = await User.find({ houseId }, 'alias xp');

  return {
    tasks: JSON.parse(JSON.stringify(tasks)),
    bills: JSON.parse(JSON.stringify(bills)),
    rules: JSON.parse(JSON.stringify(rules)),
    members: JSON.parse(JSON.stringify(members))
  };
}

export async function createRule(houseId: string, ruleId: string, category: string, description: string) {
  await connectToDatabase();
  const rule = await Rule.create({ houseId, ruleId, category, description, votes: 1, maxVotes: 4 });
  return JSON.parse(JSON.stringify(rule));
}

export async function completeTask(taskId: string, userId: string, xpReward: number) {
  await connectToDatabase();
  await Task.findByIdAndUpdate(taskId, { completed: true, assignedTo: userId });
  const user = await User.findByIdAndUpdate(userId, { $inc: { xp: xpReward } }, { new: true });
  return JSON.parse(JSON.stringify(user));
}

export async function payBill(billId: string, amount: number) {
  await connectToDatabase();
  const bill = await Bill.findById(billId);
  if (bill) {
    bill.paid = Math.min(bill.total, bill.paid + amount);
    await bill.save();
  }
  return JSON.parse(JSON.stringify(bill));
}

export async function createBill(houseId: string, concept: string, total: number) {
  await connectToDatabase();
  const bill = await Bill.create({ houseId, concept, total, paid: 0 });
  return JSON.parse(JSON.stringify(bill));
}

export async function createTask(houseId: string, title: string, xpReward: number) {
  await connectToDatabase();
  const task = await Task.create({ houseId, title, xpReward, completed: false });
  return JSON.parse(JSON.stringify(task));
}

export async function deleteBill(billId: string) {
  await connectToDatabase();
  const bill = await Bill.findByIdAndDelete(billId);
  return JSON.parse(JSON.stringify(bill));
}

export async function deleteRule(ruleId: string) {
  await connectToDatabase();
  const rule = await Rule.findByIdAndDelete(ruleId);
  return JSON.parse(JSON.stringify(rule));
}
