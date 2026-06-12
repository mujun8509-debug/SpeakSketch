import { create } from 'zustand';
import { DrawCommand, CommandLog } from '../core/commandTypes';
import { generateId } from '../utils/id';

interface AppState {
  transcript: string;
  isListening: boolean;
  logs: CommandLog[];
  commandHistory: DrawCommand[];
  currentCommand: DrawCommand | null;

  setTranscript: (transcript: string) => void;
  setIsListening: (isListening: boolean) => void;
  addLog: (log: Omit<CommandLog, 'id' | 'timestamp'>) => string;
  updateLog: (id: string, updates: Partial<CommandLog>) => void;
  addCommand: (command: DrawCommand) => void;
  setCurrentCommand: (command: DrawCommand | null) => void;
  clearLogs: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  transcript: '',
  isListening: false,
  logs: [],
  commandHistory: [],
  currentCommand: null,

  setTranscript: (transcript) => set({ transcript }),

  setIsListening: (isListening) => set({ isListening }),

  addLog: (log) => {
    const id = generateId();
    set((state) => ({
      logs: [...state.logs, {
        ...log,
        id,
        timestamp: Date.now(),
      }],
    }));
    return id;
  },

  updateLog: (id, updates) => set((state) => ({
    logs: state.logs.map((log) =>
      log.id === id ? { ...log, ...updates } : log
    ),
  })),

  addCommand: (command) => set((state) => ({
    commandHistory: [...state.commandHistory, command],
  })),

  setCurrentCommand: (currentCommand) => set({ currentCommand }),

  clearLogs: () => set({ logs: [] }),
}));