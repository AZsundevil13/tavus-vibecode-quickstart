import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { sessionDataAtom, isSessionActiveAtom } from '@/store/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Play, Square, FileText } from 'lucide-react';

export const SessionTracker: React.FC = () => {
  const [sessionData, setSessionData] = useAtom(sessionDataAtom);
  const [isActive, setIsActive] = useAtom(isSessionActiveAtom);
  const [showNotes, setShowNotes] = useState(false);

  const startSession = () => {
    const newSessionId = `session_${Date.now()}`;
    setSessionData({
      ...sessionData,
      sessionId: newSessionId,
      startTime: new Date()
    });
    setIsActive(true);
  };

  const endSession = () => {
    setSessionData({
      ...sessionData,
      endTime: new Date()
    });
    setIsActive(false);
    
    // Save session data to localStorage for now
    const sessions = JSON.parse(localStorage.getItem('bcba-sessions') || '[]');
    sessions.push(sessionData);
    localStorage.setItem('bcba-sessions', JSON.stringify(sessions));
  };

  const addDataPoint = (behavior: string) => {
    const newDataPoint = {
      timestamp: new Date(),
      behavior,
      notes: ''
    };
    
    setSessionData({
      ...sessionData,
      dataPoints: [...sessionData.dataPoints, newDataPoint]
    });
  };

  if (!isActive) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-primary/30">
        <div className="flex flex-col gap-2">
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
    <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 border border-primary/30 min-w-[300px]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            Session Active: {sessionData.sessionType}
          </span>
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

        <div className="text-xs text-gray-400">
          Duration: {Math.floor((Date.now() - sessionData.startTime.getTime()) / 60000)}m
        </div>

        <div className="flex gap-2">
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
        </div>

        <Button
          onClick={() => setShowNotes(!showNotes)}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="size-4" />
          {showNotes ? 'Hide' : 'Show'} Notes
        </Button>

        {showNotes && (
          <Textarea
            value={sessionData.notes}
            onChange={(e) => setSessionData({
              ...sessionData,
              notes: e.target.value
            })}
            placeholder="Session notes..."
            className="bg-black/50 text-white text-sm"
            rows={3}
          />
        )}

        <div className="text-xs text-gray-400">
          Data Points: {sessionData.dataPoints.length}
        </div>
      </div>
    </div>
  );
};