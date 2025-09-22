'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  exploratoryCall?: string;
  techInterview?: string;
  ceoInterview?: string;
  interviewStatus?: string;
  date1stInterview?: string;
  date2ndInterview?: string;
  date3rdInterview?: string;
  status: string;
  aiScore: number;
  humanScore: number;
}

interface InterviewPipelineTabProps {
  candidates: Candidate[];
}

/**
 * Interview Pipeline tab tracking Exploratory → Tech → CEO flow
 */
export function InterviewPipelineTab({ candidates }: InterviewPipelineTabProps) {
  // Process interview pipeline data
  const pipelineAnalysis = candidates.reduce((acc: any, candidate) => {
    const role = candidate.role;
    if (!role) return acc; // Skip candidates without roles
    
    if (!acc[role]) {
      acc[role] = {
        role,
        total: 0,
        exploratoryScheduled: 0,
        exploratoryCompleted: 0,
        techScheduled: 0,
        techCompleted: 0,
        ceoScheduled: 0,
        ceoCompleted: 0,
        hired: 0,
        rejected: 0,
      };
    }
    
    const roleData = acc[role];
    roleData.total++;
    
    // Track interview stages using Interview Status field
    const interviewStatus = candidate.interviewStatus || '';
    const status = candidate.status?.toLowerCase() || '';
    
    // Map Interview Status to role-specific pipeline stages
    switch (interviewStatus) {
      case 'To be scheduled':
      case 'Scheduled':
      case 'Rescheduling':
        roleData.exploratoryScheduled++;
        break;
        
      case 'Awaits feedback from HM after Exp':
      case 'Followed up':
        roleData.exploratoryCompleted++;
        roleData.techScheduled++;
        break;
        
      case 'Completed':
        roleData.exploratoryCompleted++;
        roleData.techCompleted++;
        roleData.ceoCompleted++;
        break;
        
      case 'Not responding':
        // Don't count as progress
        break;
    }
    
    // Final outcomes
    if (status.includes('hired') || status.includes('offer')) {
      roleData.hired++;
    } else if (status.includes('reject') || status.includes('declined')) {
      roleData.rejected++;
    }
    
    return acc;
  }, {});

  const pipelineData = Object.values(pipelineAnalysis)
    .filter((role: any) => role.total > 0)
    .sort((a: any, b: any) => b.total - a.total);

  // Debug: Let's see what values are actually in the interview fields
  const debugSample = candidates.slice(0, 10);
  console.log('Interview field samples:', debugSample.map(c => ({
    name: c.name,
    exploratoryCall: c.exploratoryCall,
    techInterview: c.techInterview,
    ceoInterview: c.ceoInterview,
    interviewStatus: c.interviewStatus,
    status: c.status,
    date1st: c.date1stInterview,
    date2nd: c.date2ndInterview,
    date3rd: c.date3rdInterview
  })));

  // Pipeline based on Interview Status field - the main workflow tracker
  const overallPipeline = candidates.reduce((acc, candidate) => {
    acc.total++;
    
    const interviewStatus = candidate.interviewStatus || '';
    const mainStatus = candidate.status || '';
    
    // Map Interview Status to pipeline stages
    switch (interviewStatus) {
      case 'To be scheduled':
      case 'Scheduled':
      case 'Rescheduling':
        acc.exploratoryCompleted++; // In the interview process
        break;
        
      case 'Awaits feedback from HM after Exp':
      case 'Followed up':
        acc.exploratoryCompleted++;
        acc.techCompleted++; // Progressed past exploratory
        break;
        
      case 'Completed':
        acc.exploratoryCompleted++;
        acc.techCompleted++;
        acc.ceoCompleted++; // Completed full process
        break;
        
      case 'Not responding':
        // Don't count as progress
        break;
    }
    
    // Check for hired status
    const statusLower = mainStatus.toLowerCase();
    if (statusLower.includes('hired') || statusLower.includes('offer') || statusLower.includes('accepted')) {
      acc.hired++;
    }
    
    return acc;
  }, {
    total: 0,
    exploratoryCompleted: 0,
    techCompleted: 0,
    ceoCompleted: 0,
    hired: 0,
  });

  const funnelData = [
    { name: 'Total Candidates', value: overallPipeline.total, fill: '#e5e7eb' },
    { name: 'Exploratory Call', value: overallPipeline.exploratoryCompleted, fill: '#3b82f6' },
    { name: 'Tech Interview', value: overallPipeline.techCompleted, fill: '#10b981' },
    { name: 'CEO Interview', value: overallPipeline.ceoCompleted, fill: '#f59e0b' },
    { name: 'Hired', value: overallPipeline.hired, fill: '#ef4444' },
  ];

  // Current pipeline status - using available data
  const currentPipeline = candidates.reduce((acc, candidate) => {
    const status = candidate.status?.toLowerCase() || '';
    const interviewStatus = candidate.interviewStatus?.toLowerCase() || '';
    
    // Use status fields to estimate pipeline activity
    if (status.includes('exploratory') || interviewStatus.includes('exploratory') || 
        status.includes('scheduled') || interviewStatus.includes('scheduled')) {
      acc.exploratoryScheduled++;
    }
    
    if (status.includes('tech') || interviewStatus.includes('tech') ||
        status.includes('technical')) {
      acc.techScheduled++;
    }
    
    if (status.includes('ceo') || interviewStatus.includes('ceo') ||
        status.includes('final')) {
      acc.ceoScheduled++;
    }
    
    return acc;
  }, {
    exploratoryScheduled: 0,
    techScheduled: 0,
    ceoScheduled: 0,
  });

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Exploratory': '#3b82f6',
      'Tech': '#10b981',
      'CEO': '#f59e0b',
      'Hired': '#ef4444',
    };
    return colors[stage] || '#6b7280';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Interview Pipeline</h2>
        <p className="text-gray-600">Exploratory → Tech → CEO interview flow tracking</p>
      </div>


      {/* Current Pipeline Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Exploratory Calls</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{currentPipeline.exploratoryScheduled}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <span>Tech Interviews</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{currentPipeline.techScheduled}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-orange-600" />
              <span>CEO Interviews</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{currentPipeline.ceoScheduled}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4 text-red-600" />
              <span>Total Hired</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallPipeline.hired}</div>
            <p className="text-xs text-muted-foreground">Successful hires</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Funnel and Role Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Interview Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Interview Funnel</CardTitle>
            <CardDescription>
              Conversion rates through interview stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => {
                const conversionRate = index === 0 ? 100 : 
                  funnelData[0].value > 0 ? (stage.value / funnelData[0].value * 100) : 0;
                
                return (
                  <div key={stage.name} className="flex items-center space-x-4">
                    <div className="w-32 text-sm font-medium">{stage.name}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className="h-6 rounded-full transition-all flex items-center justify-center text-white text-sm font-medium"
                            style={{ 
                              width: `${Math.max(conversionRate, 8)}%`,
                              backgroundColor: stage.fill 
                            }}
                          >
                            {stage.value}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 w-12">
                          {conversionRate.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    {index < funnelData.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Role-specific Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Role</CardTitle>
            <CardDescription>
              Interview progress for each job role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="role" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="exploratoryCompleted" stackId="a" fill="#3b82f6" name="Exploratory" />
                <Bar dataKey="techCompleted" stackId="a" fill="#10b981" name="Tech" />
                <Bar dataKey="ceoCompleted" stackId="a" fill="#f59e0b" name="CEO" />
                <Bar dataKey="hired" stackId="a" fill="#ef4444" name="Hired" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Pipeline Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Pipeline Metrics</CardTitle>
          <CardDescription>
            Interview stage breakdown by role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">Exploratory</th>
                  <th className="text-left p-3 font-medium">Tech</th>
                  <th className="text-left p-3 font-medium">CEO</th>
                  <th className="text-left p-3 font-medium">Hired</th>
                  <th className="text-left p-3 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {pipelineData.map((role: any) => {
                  const conversionRate = role.total > 0 ? (role.hired / role.total * 100) : 0;
                  
                  return (
                    <tr key={role.role} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{role.role}</td>
                      <td className="p-3">{role.total}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 font-medium">
                            {role.exploratoryCompleted + role.exploratoryScheduled}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {role.exploratoryScheduled} scheduled
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 font-medium">
                            {role.techCompleted + role.techScheduled}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {role.techScheduled} scheduled
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-orange-600 font-medium">
                            {role.ceoCompleted + role.ceoScheduled}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {role.ceoScheduled} scheduled
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-red-600 font-bold">{role.hired}</span>
                      </td>
                      <td className="p-3">
                        <span className={`font-medium ${
                          conversionRate >= 10 ? 'text-green-600' :
                          conversionRate >= 5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {conversionRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Performance Insights</CardTitle>
          <CardDescription>
            Key metrics and bottleneck analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-blue-600">🔄 Current Activity</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Exploratory Calls:</span>
                  <span className="font-medium text-blue-600">{currentPipeline.exploratoryScheduled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tech Interviews:</span>
                  <span className="font-medium text-green-600">{currentPipeline.techScheduled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">CEO Interviews:</span>
                  <span className="font-medium text-orange-600">{currentPipeline.ceoScheduled}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-green-600">📈 Conversion Rates</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">To Exploratory:</span>
                  <span className="font-medium">
                    {overallPipeline.total > 0 ? (overallPipeline.exploratoryCompleted / overallPipeline.total * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">To Tech:</span>
                  <span className="font-medium">
                    {overallPipeline.exploratoryCompleted > 0 ? (overallPipeline.techCompleted / overallPipeline.exploratoryCompleted * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">To CEO:</span>
                  <span className="font-medium">
                    {overallPipeline.techCompleted > 0 ? (overallPipeline.ceoCompleted / overallPipeline.techCompleted * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-red-600">🎯 Final Outcomes</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Hired:</span>
                  <span className="font-medium text-red-600">{overallPipeline.hired}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Overall Rate:</span>
                  <span className="font-medium">
                    {overallPipeline.total > 0 ? (overallPipeline.hired / overallPipeline.total * 100).toFixed(2) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">From CEO:</span>
                  <span className="font-medium">
                    {overallPipeline.ceoCompleted > 0 ? (overallPipeline.hired / overallPipeline.ceoCompleted * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
