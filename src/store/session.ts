import { atom } from "jotai";

export interface SessionData {
  sessionId: string;
  clientId: string;
  clientName: string;
  startTime: Date;
  endTime?: Date;
  sessionType: 'assessment' | 'intervention' | 'consultation' | 'support' | 'iep_meeting' | 'parent_training';
  setting: 'clinic' | 'school' | 'home' | 'community' | 'telehealth';
  notes: string;
  behaviorTargets: string[];
  interventionStrategies: string[];
  dataPoints: DataPoint[];
  goalProgress: GoalProgress[];
  antecedentData: AntecedentData[];
  reinforcementData: ReinforcementData[];
  duration: number; // in minutes
  billableUnits?: number;
  supervisorReview?: {
    reviewed: boolean;
    reviewedBy: string;
    reviewDate: Date;
    comments: string;
  };
}

export interface DataPoint {
  timestamp: Date;
  behavior: string;
  frequency?: number;
  duration?: number;
  intensity?: number;
  antecedent?: string;
  consequence?: string;
  notes?: string;
  location?: string;
  staff?: string;
}

export interface GoalProgress {
  goalId: string;
  goalDescription: string;
  trialData: {
    trial: number;
    correct: boolean;
    promptLevel?: 'independent' | 'verbal' | 'gestural' | 'physical' | 'full_physical';
    notes?: string;
  }[];
  percentCorrect: number;
}

export interface AntecedentData {
  timestamp: Date;
  antecedent: string;
  setting: string;
  people_present: string[];
  environmental_factors: string[];
}

export interface ReinforcementData {
  timestamp: Date;
  reinforcer: string;
  schedule: string;
  effectiveness: 'high' | 'medium' | 'low';
  notes?: string;
}

const initialSessionData: SessionData = {
  sessionId: '',
  clientId: '',
  clientName: '',
  startTime: new Date(),
  sessionType: 'support',
  setting: 'telehealth',
  notes: '',
  behaviorTargets: [],
  interventionStrategies: [],
  dataPoints: [],
  goalProgress: [],
  antecedentData: [],
  reinforcementData: [],
  duration: 0
};

export const sessionDataAtom = atom<SessionData>(initialSessionData);
export const isSessionActiveAtom = atom<boolean>(false);
export const sessionHistoryAtom = atom<SessionData[]>([]);

// Load session history from localStorage
export const loadSessionHistoryAtom = atom(null, (get, set) => {
  const savedSessions = localStorage.getItem('bcba-sessions');
  if (savedSessions) {
    const sessions = JSON.parse(savedSessions).map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined,
      dataPoints: session.dataPoints?.map((dp: any) => ({
        ...dp,
        timestamp: new Date(dp.timestamp)
      })) || [],
      antecedentData: session.antecedentData?.map((ad: any) => ({
        ...ad,
        timestamp: new Date(ad.timestamp)
      })) || [],
      reinforcementData: session.reinforcementData?.map((rd: any) => ({
        ...rd,
        timestamp: new Date(rd.timestamp)
      })) || []
    }));
    set(sessionHistoryAtom, sessions);
  }
});

// Save session to history
export const saveSessionAtom = atom(null, (get, set, session: SessionData) => {
  const history = get(sessionHistoryAtom);
  const updatedHistory = [...history, session];
  set(sessionHistoryAtom, updatedHistory);
  localStorage.setItem('bcba-sessions', JSON.stringify(updatedHistory));
});