import { atom } from "jotai";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  diagnosis: string[];
  grade?: string;
  school?: string;
  parentGuardian: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  currentGoals: Goal[];
  behaviorPlan?: BehaviorPlan;
  createdAt: Date;
  lastSession?: Date;
}

export interface Goal {
  id: string;
  category: 'academic' | 'behavioral' | 'social' | 'communication' | 'adaptive';
  description: string;
  targetBehavior: string;
  measurementType: 'frequency' | 'duration' | 'percentage' | 'rating';
  baseline: number;
  target: number;
  deadline: Date;
  status: 'active' | 'mastered' | 'discontinued';
  dataPoints: GoalDataPoint[];
}

export interface GoalDataPoint {
  date: Date;
  value: number;
  notes?: string;
  sessionId?: string;
}

export interface BehaviorPlan {
  id: string;
  targetBehaviors: string[];
  replacementBehaviors: string[];
  antecedentStrategies: string[];
  consequenceStrategies: string[];
  environmentalModifications: string[];
  reinforcementSchedule: string;
  dataCollectionPlan: string;
  lastUpdated: Date;
}

const initialClients: Client[] = [];

export const clientsAtom = atom<Client[]>(initialClients);
export const selectedClientAtom = atom<Client | null>(null);

// Load clients from localStorage on initialization
export const loadClientsAtom = atom(null, (get, set) => {
  const savedClients = localStorage.getItem('bcba-clients');
  if (savedClients) {
    const clients = JSON.parse(savedClients).map((client: any) => ({
      ...client,
      dateOfBirth: new Date(client.dateOfBirth),
      createdAt: new Date(client.createdAt),
      lastSession: client.lastSession ? new Date(client.lastSession) : undefined,
      currentGoals: client.currentGoals?.map((goal: any) => ({
        ...goal,
        deadline: new Date(goal.deadline),
        dataPoints: goal.dataPoints?.map((dp: any) => ({
          ...dp,
          date: new Date(dp.date)
        })) || []
      })) || [],
      behaviorPlan: client.behaviorPlan ? {
        ...client.behaviorPlan,
        lastUpdated: new Date(client.behaviorPlan.lastUpdated)
      } : undefined
    }));
    set(clientsAtom, clients);
  }
});

// Save clients to localStorage
export const saveClientsAtom = atom(null, (get, set) => {
  const clients = get(clientsAtom);
  localStorage.setItem('bcba-clients', JSON.stringify(clients));
});