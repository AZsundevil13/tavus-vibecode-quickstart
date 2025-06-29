import React, { useState, useEffect } from 'react';
import { DialogWrapper, AnimatedTextBlockWrapper } from '@/components/DialogWrapper';
import { Button } from '@/components/ui/button';
import { Download, Calendar, BarChart3 } from 'lucide-react';

interface SessionReport {
  sessionId: string;
  clientId?: string;
  startTime: Date;
  endTime?: Date;
  sessionType: string;
  notes: string;
  dataPoints: any[];
}

export const SessionReports: React.FC = () => {
  const [sessions, setSessions] = useState<SessionReport[]>([]);

  useEffect(() => {
    const savedSessions = JSON.parse(localStorage.getItem('bcba-sessions') || '[]');
    setSessions(savedSessions.map((s: any) => ({
      ...s,
      startTime: new Date(s.startTime),
      endTime: s.endTime ? new Date(s.endTime) : undefined
    })));
  }, []);

  const exportSession = (session: SessionReport) => {
    const reportData = {
      sessionId: session.sessionId,
      sessionType: session.sessionType,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime?.toISOString(),
      duration: session.endTime 
        ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 60000)
        : 0,
      notes: session.notes,
      dataPoints: session.dataPoints,
      behaviorSummary: {
        totalDataPoints: session.dataPoints.length,
        positiveCount: session.dataPoints.filter(dp => dp.behavior === 'positive_behavior').length,
        targetCount: session.dataPoints.filter(dp => dp.behavior === 'target_behavior').length,
        challengingCount: session.dataPoints.filter(dp => dp.behavior === 'challenging_behavior').length
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session_report_${session.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <div className="w-full max-w-4xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="size-6" />
            Session Reports
          </h2>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No sessions recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="bg-black/30 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white capitalize">
                        {session.sessionType.replace('_', ' ')} Session
                      </h3>
                      <p className="text-sm text-gray-400">
                        {session.startTime.toLocaleDateString()} at{' '}
                        {session.startTime.toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => exportSession(session)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Download className="size-4" />
                      Export
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div className="bg-green-600/20 rounded p-2 text-center">
                      <div className="text-lg font-bold text-green-400">
                        {session.dataPoints.filter(dp => dp.behavior === 'positive_behavior').length}
                      </div>
                      <div className="text-xs text-green-300">Positive</div>
                    </div>
                    <div className="bg-yellow-600/20 rounded p-2 text-center">
                      <div className="text-lg font-bold text-yellow-400">
                        {session.dataPoints.filter(dp => dp.behavior === 'target_behavior').length}
                      </div>
                      <div className="text-xs text-yellow-300">Target</div>
                    </div>
                    <div className="bg-red-600/20 rounded p-2 text-center">
                      <div className="text-lg font-bold text-red-400">
                        {session.dataPoints.filter(dp => dp.behavior === 'challenging_behavior').length}
                      </div>
                      <div className="text-xs text-red-300">Challenging</div>
                    </div>
                    <div className="bg-blue-600/20 rounded p-2 text-center">
                      <div className="text-lg font-bold text-blue-400">
                        {session.endTime 
                          ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 60000)
                          : 0}m
                      </div>
                      <div className="text-xs text-blue-300">Duration</div>
                    </div>
                  </div>

                  {session.notes && (
                    <div className="bg-black/20 rounded p-3">
                      <h4 className="text-sm font-medium text-white mb-1">Notes:</h4>
                      <p className="text-sm text-gray-300">{session.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};