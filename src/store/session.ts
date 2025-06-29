import { atom } from "jotai";

interface SessionData {
  sessionId: string;
  clientId?: string;
  startTime: Date;
  endTime?: Date;
  sessionType: 'assessment' | 'intervention' | 'consultation' | 'support';
  notes: string;
  behaviorTargets: string[];
  interventionStrategies: string[];
  dataPoints: {
    timestamp: Date;
    behavior: string;
    frequency?: number;
    duration?: number;
    intensity?: number;
    antecedent?: string;
    consequence?: string;
    notes?: string;
  }[];
}

const initialSessionData: SessionData = {
  sessionId: '',
  startTime: new Date(),
  sessionType: 'support',
  notes: '',
  behaviorTargets: [],
  interventionStrategies: [],
  dataPoints: []
};

export const sessionDataAtom = atom<SessionData>(initialSessionData);
export const isSessionActiveAtom = atom<boolean>(false);