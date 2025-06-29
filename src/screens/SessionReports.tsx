import React, { useState, useEffect } from 'react';
import { DialogWrapper, AnimatedTextBlockWrapper } from '@/components/DialogWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Calendar, BarChart3, Filter, FileText, TrendingUp } from 'lucide-react';
import { SessionData } from '@/store/session';

export const SessionReports: React.FC = () => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionData[]>([]);
  const [filterClient, setFilterClient] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const savedSessions = JSON.parse(localStorage.getItem('bcba-sessions') || '[]');
    const parsedSessions = savedSessions.map((s: any) => ({
      ...s,
      startTime: new Date(s.startTime),
      endTime: s.endTime ? new Date(s.endTime) : undefined,
      dataPoints: s.dataPoints?.map((dp: any) => ({
        ...dp,
        timestamp: new Date(dp.timestamp)
      })) || [],
      goalProgress: s.goalProgress || [],
      antecedentData: s.antecedentData || [],
      reinforcementData: s.reinforcementData || []
    }));
    setSessions(parsedSessions);
    setFilteredSessions(parsedSessions);
  }, []);

  useEffect(() => {
    let filtered = sessions;
    
    if (filterClient) {
      filtered = filtered.filter(s => 
        s.clientName.toLowerCase().includes(filterClient.toLowerCase())
      );
    }
    
    if (filterType) {
      filtered = filtered.filter(s => s.sessionType === filterType);
    }
    
    if (dateRange.start) {
      filtered = filtered.filter(s => 
        s.startTime >= new Date(dateRange.start)
      );
    }
    
    if (dateRange.end) {
      filtered = filtered.filter(s => 
        s.startTime <= new Date(dateRange.end)
      );
    }
    
    setFilteredSessions(filtered);
  }, [sessions, filterClient, filterType, dateRange]);

  const exportSession = (session: SessionData) => {
    const reportData = {
      sessionInfo: {
        sessionId: session.sessionId,
        clientName: session.clientName,
        sessionType: session.sessionType,
        setting: session.setting,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString(),
        duration: session.duration
      },
      behaviorData: {
        totalDataPoints: session.dataPoints.length,
        positiveCount: session.dataPoints.filter(dp => dp.behavior === 'positive_behavior').length,
        targetCount: session.dataPoints.filter(dp => dp.behavior === 'target_behavior').length,
        challengingCount: session.dataPoints.filter(dp => dp.behavior === 'challenging_behavior').length,
        replacementCount: session.dataPoints.filter(dp => dp.behavior === 'replacement_behavior').length,
        detailedData: session.dataPoints
      },
      goalProgress: session.goalProgress.map(gp => ({
        goal: gp.goalDescription,
        trialsCompleted: gp.trialData.length,
        percentCorrect: gp.percentCorrect,
        trialDetails: gp.trialData
      })),
      clinicalNotes: session.notes,
      interventionStrategies: session.interventionStrategies,
      behaviorTargets: session.behaviorTargets,
      antecedentData: session.antecedentData,
      reinforcementData: session.reinforcementData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BCBA_Session_Report_${session.clientName.replace(' ', '_')}_${session.startTime.toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAllSessions = () => {
    const allData = {
      exportDate: new Date().toISOString(),
      totalSessions: filteredSessions.length,
      dateRange: {
        earliest: filteredSessions.length > 0 ? Math.min(...filteredSessions.map(s => s.startTime.getTime())) : null,
        latest: filteredSessions.length > 0 ? Math.max(...filteredSessions.map(s => s.startTime.getTime())) : null
      },
      sessions: filteredSessions.map(session => ({
        sessionInfo: {
          sessionId: session.sessionId,
          clientName: session.clientName,
          sessionType: session.sessionType,
          setting: session.setting,
          startTime: session.startTime.toISOString(),
          endTime: session.endTime?.toISOString(),
          duration: session.duration
        },
        behaviorSummary: {
          totalDataPoints: session.dataPoints.length,
          positiveCount: session.dataPoints.filter(dp => dp.behavior === 'positive_behavior').length,
          targetCount: session.dataPoints.filter(dp => dp.behavior === 'target_behavior').length,
          challengingCount: session.dataPoints.filter(dp => dp.behavior === 'challenging_behavior').length,
          replacementCount: session.dataPoints.filter(dp => dp.behavior === 'replacement_behavior').length
        },
        goalProgress: session.goalProgress.map(gp => ({
          goal: gp.goalDescription,
          trialsCompleted: gp.trialData.length,
          percentCorrect: gp.percentCorrect
        })),
        notes: session.notes
      }))
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BCBA_All_Sessions_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSessionTypeColor = (type: string) => {
    const colors = {
      assessment: 'bg-purple-600/20 text-purple-300',
      intervention: 'bg-blue-600/20 text-blue-300',
      consultation: 'bg-green-600/20 text-green-300',
      support: 'bg-yellow-600/20 text-yellow-300',
      iep_meeting: 'bg-red-600/20 text-red-300',
      parent_training: 'bg-pink-600/20 text-pink-300'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-600/20 text-gray-300';
  };

  return (
    <DialogWrapper>
      <AnimatedTextBlockWrapper>
        <div className="w-full max-w-6xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="size-6" />
              BCBA Session Reports
            </h2>
            <Button onClick={exportAllSessions} className="flex items-center gap-2">
              <Download className="size-4" />
              Export All
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-black/30 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="size-4 text-white" />
              <span className="text-white font-medium">Filters</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Filter by client name..."
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="bg-black/20"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-black/20 text-white rounded px-3 py-2 border border-gray-600"
              >
                <option value="">All Session Types</option>
                <option value="assessment">Assessment</option>
                <option value="intervention">Intervention</option>
                <option value="consultation">Consultation</option>
                <option value="support">Support</option>
                <option value="iep_meeting">IEP Meeting</option>
                <option value="parent_training">Parent Training</option>
              </select>
              <Input
                type="date"
                placeholder="Start date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="bg-black/20"
              />
              <Input
                type="date"
                placeholder="End date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="bg-black/20"
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-600/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{filteredSessions.length}</div>
              <div className="text-sm text-blue-300">Total Sessions</div>
            </div>
            <div className="bg-green-600/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {Math.round(filteredSessions.reduce((acc, s) => acc + s.duration, 0) / 60)}h
              </div>
              <div className="text-sm text-green-300">Total Hours</div>
            </div>
            <div className="bg-purple-600/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {new Set(filteredSessions.map(s => s.clientName)).size}
              </div>
              <div className="text-sm text-purple-300">Unique Clients</div>
            </div>
            <div className="bg-yellow-600/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {filteredSessions.reduce((acc, s) => acc + s.dataPoints.length, 0)}
              </div>
              <div className="text-sm text-yellow-300">Data Points</div>
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="size-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No sessions found matching your criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="bg-black/30 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {session.clientName}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSessionTypeColor(session.sessionType)}`}>
                          {session.sessionType.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-gray-600/20 text-gray-300">
                          {session.setting.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {session.startTime.toLocaleDateString()} at{' '}
                        {session.startTime.toLocaleTimeString()} • Duration: {session.duration}m
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

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
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
                        {session.dataPoints.filter(dp => dp.behavior === 'replacement_behavior').length}
                      </div>
                      <div className="text-xs text-blue-300">Replacement</div>
                    </div>
                    <div className="bg-purple-600/20 rounded p-2 text-center">
                      <div className="text-lg font-bold text-purple-400">
                        {session.goalProgress.length}
                      </div>
                      <div className="text-xs text-purple-300">Goals Tracked</div>
                    </div>
                  </div>

                  {session.goalProgress.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                        <TrendingUp className="size-4" />
                        Goal Progress
                      </h4>
                      <div className="space-y-1">
                        {session.goalProgress.map((goal, idx) => (
                          <div key={idx} className="bg-black/20 rounded p-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-300">{goal.goalDescription}</span>
                              <span className="text-sm font-medium text-white">
                                {goal.percentCorrect}% ({goal.trialData.length} trials)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {session.notes && (
                    <div className="bg-black/20 rounded p-3">
                      <h4 className="text-sm font-medium text-white mb-1 flex items-center gap-1">
                        <FileText className="size-4" />
                        Clinical Notes:
                      </h4>
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