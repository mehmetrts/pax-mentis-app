import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ActionPlan, loadAllPlans, savePlan, togglePlanStep } from "@/lib/actionPlan";

export type TaskStatus = "pending" | "in_progress" | "completed" | "deferred";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  resistanceScore: number;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  deferCount: number;
  tags: string[];
}

export interface MentorSession {
  id: string;
  taskId?: string;
  messages: SessionMessage[];
  resistanceSignal: string;
  resistanceScore: number;
  startedAt: number;
  completedAt?: number;
}

export interface SessionMessage {
  id: string;
  role: "user" | "mentor";
  content: string;
  timestamp: number;
  latencyMs?: number;
}

export interface DailyStats {
  date: string;
  tasksCompleted: number;
  tasksDeferred: number;
  avgResistanceScore: number;
  sessionsCount: number;
  streakDays: number;
}

interface AppContextType {
  tasks: Task[];
  sessions: MentorSession[];
  plans: ActionPlan[];
  dailyStats: DailyStats | null;
  streakDays: number;
  totalCompleted: number;
  isLoading: boolean;

  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "deferCount">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  deferTask: (id: string) => Promise<void>;

  addSession: (session: Omit<MentorSession, "id" | "startedAt">) => Promise<MentorSession>;
  updateSession: (id: string, updates: Partial<MentorSession>) => Promise<void>;
  getRecentSessions: (limit?: number) => MentorSession[];

  addPlan: (plan: ActionPlan) => Promise<void>;
  toggleStep: (planId: string, stepId: string) => Promise<void>;
  getPlansForTask: (taskId: string) => ActionPlan[];
}

const AppContext = createContext<AppContextType | null>(null);

const TASKS_KEY = "@pax_mentis:tasks";
const SESSIONS_KEY = "@pax_mentis:sessions";
const STATS_KEY = "@pax_mentis:stats";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksJson, sessionsJson, statsJson, loadedPlans] = await Promise.all([
        AsyncStorage.getItem(TASKS_KEY),
        AsyncStorage.getItem(SESSIONS_KEY),
        AsyncStorage.getItem(STATS_KEY),
        loadAllPlans(),
      ]);
      if (tasksJson) setTasks(JSON.parse(tasksJson));
      if (sessionsJson) setSessions(JSON.parse(sessionsJson));
      if (statsJson) setDailyStats(JSON.parse(statsJson));
      setPlans(loadedPlans);
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const saveTasks = useCallback(async (updated: Task[]) => {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
  }, []);

  const saveSessions = useCallback(async (updated: MentorSession[]) => {
    const recent = updated.slice(-100);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(recent));
  }, []);

  const addTask = useCallback(async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "deferCount">) => {
    const task: Task = {
      ...taskData,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      deferCount: 0,
    };
    const updated = [...tasks, task];
    setTasks(updated);
    await saveTasks(updated);
  }, [tasks, saveTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
    );
    setTasks(updated);
    await saveTasks(updated);
  }, [tasks, saveTasks]);

  const deleteTask = useCallback(async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    await saveTasks(updated);
  }, [tasks, saveTasks]);

  const completeTask = useCallback(async (id: string) => {
    await updateTask(id, { status: "completed", completedAt: Date.now() });
  }, [updateTask]);

  const deferTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { status: "deferred", deferCount: task.deferCount + 1 });
    }
  }, [tasks, updateTask]);

  const addSession = useCallback(async (sessionData: Omit<MentorSession, "id" | "startedAt">) => {
    const session: MentorSession = {
      ...sessionData,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      startedAt: Date.now(),
    };
    const updated = [...sessions, session];
    setSessions(updated);
    await saveSessions(updated);
    return session;
  }, [sessions, saveSessions]);

  const updateSession = useCallback(async (id: string, updates: Partial<MentorSession>) => {
    const updated = sessions.map(s => s.id === id ? { ...s, ...updates } : s);
    setSessions(updated);
    await saveSessions(updated);
  }, [sessions, saveSessions]);

  const getRecentSessions = useCallback((limit: number = 10) => {
    return [...sessions].sort((a, b) => b.startedAt - a.startedAt).slice(0, limit);
  }, [sessions]);

  // ─── Plan metotları ───────────────────────────────────────────────────────

  const addPlan = useCallback(async (plan: ActionPlan) => {
    await savePlan(plan);
    setPlans(prev => {
      const idx = prev.findIndex(p => p.id === plan.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = plan;
        return copy;
      }
      return [...prev, plan];
    });
  }, []);

  const toggleStep = useCallback(async (planId: string, stepId: string) => {
    const updated = await togglePlanStep(planId, stepId);
    if (updated) {
      setPlans(prev => prev.map(p => p.id === planId ? updated : p));
    }
  }, []);

  const getPlansForTask = useCallback((taskId: string) => {
    return plans.filter(p => p.taskId === taskId).sort((a, b) => b.createdAt - a.createdAt);
  }, [plans]);

  // ─── Hesaplanan değerler ──────────────────────────────────────────────────

  const streakDays = (() => {
    const completedDates = tasks
      .filter(t => t.completedAt)
      .map(t => new Date(t.completedAt!).toDateString());
    return [...new Set(completedDates)].length;
  })();

  const totalCompleted = tasks.filter(t => t.status === "completed").length;

  return (
    <AppContext.Provider value={{
      tasks,
      sessions,
      plans,
      dailyStats,
      streakDays,
      totalCompleted,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
      completeTask,
      deferTask,
      addSession,
      updateSession,
      getRecentSessions,
      addPlan,
      toggleStep,
      getPlansForTask,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
