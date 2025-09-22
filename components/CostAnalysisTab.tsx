'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown, TrendingUp, Calculator, Target } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  source: string;
  aiScore: number;
  humanScore: number;
  dateAdded: string;
  status: string;
  passedAiFilter: boolean;
  passedHumanFilter: boolean;
}

interface CostAnalysisTabProps {
  candidates: Candidate[];
}

/**
 * Cost Analysis tab showing cost per lead and ROI by source and role
 */
export function CostAnalysisTab({ candidates }: CostAnalysisTabProps) {
  // Estimated costs based on your Team Growth execution data
  const sourceCosts: Record<string, { monthly: number; setup: number }> = {
    'Join': { monthly: 289, setup: 0 }, // LinkedIn P4P Posting - Small
    'Wellfound': { monthly: 200, setup: 0 }, // Paid Wellfound subscription
    'LinkedIn': { monthly: 400, setup: 0 }, // LinkedIn job posts + boosting
    'Company Website': { monthly: 0, setup: 100 }, // Setup cost only
    'Outbound': { monthly: 500, setup: 200 }, // Lemlist + Clay + manual effort
    'Referral': { monthly: 0, setup: 0 }, // Free but potential bonuses
  };

  // Process cost analysis by source
  const sourceAnalysis = candidates.reduce((acc: any, candidate) => {
    const source = normalizeSource(candidate.source);
    
    if (!acc[source]) {
      acc[source] = {
        source,
        totalCandidates: 0,
        qualityLeads: 0,
        hires: 0,
        monthlyCost: sourceCosts[source]?.monthly || 0,
        setupCost: sourceCosts[source]?.setup || 0,
      };
    }
    
    acc[source].totalCandidates++;
    
    if (candidate.passedAiFilter || candidate.aiScore >= 7) {
      acc[source].qualityLeads++;
    }
    
    if (candidate.status?.toLowerCase().includes('hired') || 
        candidate.status?.toLowerCase().includes('offer')) {
      acc[source].hires++;
    }
    
    return acc;
  }, {});

  // Calculate cost metrics
  const costData = Object.values(sourceAnalysis).map((source: any) => {
    const totalCost = source.monthlyCost + source.setupCost;
    const costPerLead = source.totalCandidates > 0 ? totalCost / source.totalCandidates : 0;
    const costPerQL = source.qualityLeads > 0 ? totalCost / source.qualityLeads : 0;
    const costPerHire = source.hires > 0 ? totalCost / source.hires : 0;
    const roi = source.hires > 0 ? ((source.hires * 100000) - totalCost) / totalCost * 100 : -100; // Assuming $100k value per hire
    
    return {
      ...source,
      totalCost,
      costPerLead,
      costPerQL,
      costPerHire,
      roi,
      efficiency: source.totalCandidates > 0 ? source.qualityLeads / source.totalCandidates : 0,
    };
  }).sort((a, b) => a.costPerQL - b.costPerQL);

  // Role-based cost analysis
  const roleAnalysis = candidates.reduce((acc: any, candidate) => {
    const role = candidate.role;
    if (!role) return acc; // Skip candidates without roles
    
    if (!acc[role]) {
      acc[role] = {
        role,
        totalCandidates: 0,
        qualityLeads: 0,
        hires: 0,
        estimatedCost: 0,
      };
    }
    
    acc[role].totalCandidates++;
    
    if (candidate.passedAiFilter || candidate.aiScore >= 7) {
      acc[role].qualityLeads++;
    }
    
    if (candidate.status?.toLowerCase().includes('hired')) {
      acc[role].hires++;
    }
    
    // Estimate cost based on source
    const source = normalizeSource(candidate.source);
    const sourceCost = sourceCosts[source];
    if (sourceCost) {
      acc[role].estimatedCost += (sourceCost.monthly + sourceCost.setup) / 30; // Daily cost
    }
    
    return acc;
  }, {});

  const roleCostData = Object.values(roleAnalysis).map((role: any) => ({
    ...role,
    costPerLead: role.totalCandidates > 0 ? role.estimatedCost / role.totalCandidates : 0,
    costPerQL: role.qualityLeads > 0 ? role.estimatedCost / role.qualityLeads : 0,
    costPerHire: role.hires > 0 ? role.estimatedCost / role.hires : 0,
  }));

  function normalizeSource(source: string): string {
    if (!source) return null;
    const normalized = source.toLowerCase();
    
    if (normalized.includes('join')) return 'Join';
    if (normalized.includes('wellfound')) return 'Wellfound';
    if (normalized.includes('linkedin')) return 'LinkedIn';
    if (normalized.includes('website')) return 'Company Website';
    if (normalized.includes('outbound')) return 'Outbound';
    if (normalized.includes('referral')) return 'Referral';
    
    return null;
  }

  // Calculate totals
  const totalSpend = costData.reduce((sum, source) => sum + source.totalCost, 0);
  const totalLeads = costData.reduce((sum, source) => sum + source.totalCandidates, 0);
  const totalQL = costData.reduce((sum, source) => sum + source.qualityLeads, 0);
  const totalHires = costData.reduce((sum, source) => sum + source.hires, 0);

  const avgCostPerLead = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const avgCostPerQL = totalQL > 0 ? totalSpend / totalQL : 0;
  const avgCostPerHire = totalHires > 0 ? totalSpend / totalHires : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Cost Analysis</h2>
        <p className="text-gray-600">Cost per lead, quality lead, and hire by source and role</p>
      </div>

      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>Total Spend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalSpend.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Monthly + setup costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span>Cost per Lead</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${avgCostPerLead.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Average across all sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span>Cost per QL</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${avgCostPerQL.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Per quality lead</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-red-600" />
              <span>Cost per Hire</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${avgCostPerHire > 0 ? avgCostPerHire.toFixed(0) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Total cost per successful hire</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Efficiency Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost per Lead by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Efficiency by Source</CardTitle>
            <CardDescription>
              Cost per quality lead across different sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="source" width={100} />
                <Tooltip 
                  formatter={(value: any) => [`$${value.toFixed(0)}`, 'Cost per QL']}
                />
                <Bar dataKey="costPerQL" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ROI by Source */}
        <Card>
          <CardHeader>
            <CardTitle>ROI by Source</CardTitle>
            <CardDescription>
              Return on investment (assuming $100k value per hire)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costData.filter(d => d.hires > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(1)}%`, 'ROI']}
                />
                <Bar dataKey="roi" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Cost Table */}
      <Card>
        <CardHeader>
          <CardTitle>Source Cost Breakdown</CardTitle>
          <CardDescription>
            Detailed cost analysis for each lead source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Source</th>
                  <th className="text-left p-3 font-medium">Monthly Cost</th>
                  <th className="text-left p-3 font-medium">Total Leads</th>
                  <th className="text-left p-3 font-medium">Quality Leads</th>
                  <th className="text-left p-3 font-medium">Cost/Lead</th>
                  <th className="text-left p-3 font-medium">Cost/QL</th>
                  <th className="text-left p-3 font-medium">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {costData.map((source) => (
                  <tr key={source.source} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{source.source}</td>
                    <td className="p-3">
                      <span className="font-medium">${source.monthlyCost}</span>
                      {source.setupCost > 0 && (
                        <span className="text-xs text-gray-500 block">
                          +${source.setupCost} setup
                        </span>
                      )}
                    </td>
                    <td className="p-3">{source.totalCandidates}</td>
                    <td className="p-3">
                      <span className="font-medium text-green-600">{source.qualityLeads}</span>
                      <span className="text-xs text-gray-500 block">
                        {source.totalCandidates > 0 ? (source.qualityLeads / source.totalCandidates * 100).toFixed(1) : 0}% conversion
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        source.costPerLead <= 50 ? 'text-green-600' :
                        source.costPerLead <= 100 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        ${source.costPerLead.toFixed(0)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        source.costPerQL <= 200 ? 'text-green-600' :
                        source.costPerQL <= 500 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        ${source.costPerQL > 0 ? source.costPerQL.toFixed(0) : 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              source.efficiency >= 0.2 ? 'bg-green-600' :
                              source.efficiency >= 0.1 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.min(source.efficiency * 500, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {(source.efficiency * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Cost Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Analysis by Role</CardTitle>
          <CardDescription>
            Estimated recruitment costs for each job role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleCostData.map((role: any) => (
              <Card key={role.role} className="border-l-4 border-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{role.role}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Cost:</span>
                      <span className="font-medium">${role.estimatedCost.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cost/Lead:</span>
                      <span className="font-medium">${role.costPerLead.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cost/QL:</span>
                      <span className="font-medium">${role.costPerQL > 0 ? role.costPerQL.toFixed(0) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Leads:</span>
                      <span className="font-medium text-blue-600">{role.totalCandidates}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Insights</CardTitle>
          <CardDescription>
            Recommendations based on cost efficiency analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">💰 Most Cost-Effective Sources</h4>
              <ul className="space-y-2">
                {costData
                  .filter(s => s.qualityLeads > 0)
                  .slice(0, 3)
                  .map((source, index) => (
                    <li key={source.source} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">
                        #{index + 1} {source.source}
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        ${source.costPerQL.toFixed(0)}/QL
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-red-600">⚠️ Optimization Opportunities</h4>
              <ul className="space-y-2">
                {costData
                  .filter(s => s.costPerQL > 500 && s.qualityLeads > 0)
                  .map((source, index) => (
                    <li key={source.source} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <span className="text-sm font-medium">
                        {source.source}
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        ${source.costPerQL.toFixed(0)}/QL
                      </span>
                    </li>
                  ))}
                {costData.filter(s => s.costPerQL > 500 && s.qualityLeads > 0).length === 0 && (
                  <li className="text-gray-500 text-sm">All sources performing efficiently! 🎉</li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">💡 Key Recommendations</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Focus budget on sources with cost per QL under $200</li>
              <li>• Consider scaling successful sources (Join: $289/month shows good ROI)</li>
              <li>• Monitor Wellfound performance vs cost ($200/month investment)</li>
              <li>• Optimize or reduce spend on sources with cost per QL over $500</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
