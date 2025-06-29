import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { sessionDataAtom, isSessionActiveAtom, saveSessionAtom, DataPoint, GoalProgress } from '@/store/session';
import { selectedClientAtom } from '@/store/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Play, Square, FileText, Target, Clock, Plus } from 'lucide-react';

export const SessionTracker: React.FC = () => {
  const [sessionData, setSessionData] = useAtom(sessionDataAtom);
  const [isActive, setIsActive] = useAtom(isSessionActiveAtom);
  const [selectedClient] = useAtom(selectedClientAtom);
  const [, saveSession] = useAtom(saveSessionAtom);
  const [showNotes, setShowNotes] = useState(false);
  const [showGoalTracking, setShowGoalTracking] = useState(false);
  const [currentGoal, setCurrentGoal] = useState('');
  const [trialData, setTrialData] = useState<{trial: number; correct: boolean; promptLevel?: string}[]>([]);

  const startSession = () => {
    if (!selectedClient) return;
    
    const newSessionId = `session_${Date.now()}`;
    setSessionData({
      ...sessionData,
      sessionId: newSessionId,
      clientId: selectedClient.id,
      clientName: `${selectedClient.firstName} ${selectedClient.lastName}`,
      startTime: new Date()
    });
    setIsActive(true);
  };

  const endSession = () => {
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - sessionData.startTime.getTime()) / 60000);
    
    const finalSessionData = {
      ...sessionData,
      endTime,
      duration
    };
    
    setSessionData(finalSessionData);
    setIsActive(false);
    
    // Save session data
    saveSession(finalSessionData);
    
    // Update client's last session date
    if (selectedClient) {
      const clients = JSON.parse(localStorage.getItem('bcba-clients') || '[]');
      const updatedClients = clients.map((client: any) => 
        client.id === selectedClient.id 
          ? { ...client, lastSession: endTime.toISOString() }
          : client
      );
      localStorage.setItem('bcba-clients', JSON.stringify(updatedClients));
    }
  };

  const addDataPoint = (behavior: string) => {
    const newDataPoint: DataPoint = {
      timestamp: new Date(),
      behavior,
      notes: '',
      location: sessionData.setting,
      staff: 'BCBA-D Student'
    };
    
    setSessionData({
      ...sessionData,
      dataPoints: [...sessionData.dataPoints, newDataPoint]
    });
  };

  const addGoalTrial = (correct: boolean, promptLevel?: string) => {
    const newTrial = {
      trial: trialData.length + 1,
      correct,
      promptLevel: promptLevel as any
    };
    
    const updatedTrials = [...trialData, newTrial];
    setTrialData(updatedTrials);
    
    const percentCorrect = Math.round((updatedTrials.filter(t => t.correct).length / updatedTrials.length) * 100);
    
    const goalProgress: GoalProgress = {
      goalId: `goal_${Date.now()}`,
      goalDescription: currentGoal,
      trialData: updatedTrials,
      percentCorrect
    };
    
    setSessionData({
      ...sessionData,
      goalProgress: [...sessionData.goalProgress.filter(gp => gp.goalDescription !== currentGoal), goalProgress]
    });
  };

  if (!selectedClient) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-600/80 backdrop-blur-sm rounded-lg p-4 border border-red-500/30">
        <p className="text-white text-sm">Please select a client first</p>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
        <div className="flex flex-col gap-2">
          <p className="text-white text-sm font-medium">
            Client: {selectedClient.firstName} {selectedClient.lastName}
          </p>
          
          <select
            value={sessionData.sessionType}
            onChange={(e) => setSessionData({
              ...sessionData,
              sessionType: e.target.value as any
            })}
            className="bg-black/50 text-white rounded px-2 py-1 text-sm"
          >
            <option value="assessment">Assessment</option>
            <option value="intervention">Intervention</option>
            <option value="consultation">Consultation</option>
            <option value="support">Support Session</option>
            <option value="iep_meeting">IEP Meeting</option>
            <option value="parent_training">Parent Training</option>
          </select>

          <select
            value={sessionData.setting}
            onChange={(e) => setSessionData({
              ...sessionData,
              setting: e.target.value as any
            })}
            className="bg-black/50 text-white rounded px-2 py-1 text-sm"
          >
            <option value="telehealth">Telehealth</option>
            <option value="clinic">Clinic</option>
            <option value="school">School</option>
            <option value="home">Home</option>
            <option value="community">Community</option>
          </select>
          
          <Button
            onClick={startSession}
            size="sm"
            className="flex items-center gap-2"
          >
            <Play className="size-4" />
            Start Session
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 border border-primary/30 min-w-[350px] max-w-[400px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-white">
              {selectedClient.firstName} {selectedClient.lastName}
            </span>
            <div className="text-xs text-gray-400">
              {sessionData.sessionType} • {sessionData.setting}
            </div>
          </div>
          <Button
            onClick={endSession}
            size="sm"
            variant="destructive"
            className="flex items-center gap-1"
          >
            <Square className="size-3" />
            End
          </Button>
        </div>

        <div className="text-xs text-gray-400 flex items-center gap-2">
          <Clock className="size-3" />
          Duration: {Math.floor((Date.now() - sessionData.startTime.getTime()) / 60000)}m
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => addDataPoint('positive_behavior')}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-xs"
          >
            + Positive
          </Button>
          <Button
            onClick={() => addDataPoint('target_behavior')}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-xs"
          >
            + Target
          </Button>
          <Button
            onClick={() => addDataPoint('challenging_behavior')}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-xs"
          >
            + Challenge
          </Button>
          <Button
            onClick={() => addDataPoint('replacement_behavior')}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-xs"
          >
            + Replace
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowGoalTracking(!showGoalTracking)}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 flex-1"
          >
            <Target className="size-3" />
            Goals
          </Button>
          <Button
            onClick={() => setShowNotes(!showNotes)}
            size="sm"
            variant="outline"
            className="flex items-center gap-1 flex-1"
          >
            <FileText className="size-3" />
            Notes
          </Button>
        </div>

        {showGoalTracking && (
          <div className="space-y-2 border-t border-gray-700 pt-2">
            <Input
              value={currentGoal}
              onChange={(e) => setCurrentGoal(e.target.value)}
              placeholder="Goal description..."
              className="bg-black/50 text-white text-xs"
            />
            <div className="grid grid-cols-2 gap-1">
              <Button
                onClick={() => addGoalTrial(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-xs"
              >
                ✓ Correct
              </Button>
              <Button
                onClick={() => addGoalTrial(false)}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-xs"
              >
                ✗ Incorrect
              </Button>
            </div>
            {trialData.length > 0 && (
              <div className="text-xs text-gray-400">
                Trials: {trialData.length} | Accuracy: {Math.round((trialData.filter(t => t.correct).length / trialData.length) * 100)}%
              </div>
            )}
          </div>
        )}

        {showNotes && (
          <Textarea
            value={sessionData.notes}
            onChange={(e) => setSessionData({
              ...sessionData,
              notes: e.target.value
            })}
            placeholder="Session notes, observations, interventions used..."
            className="bg-black/50 text-white text-sm"
            rows={3}
          />
        )}

        <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
          <div>Data Points: {sessionData.dataPoints.length}</div>
          <div>Goals Tracked: {sessionData.goalProgress.length}</div>
        </div>
      </div>
    </div>
  );
};