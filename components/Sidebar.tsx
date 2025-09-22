'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Target, 
  Calendar, 
  DollarSign,
  Building2,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Home,
  Clock
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  {
    id: 'home',
    label: 'Executive Summary',
    icon: Home,
    description: 'CEO dashboard overview'
  },
  {
    id: 'outstanding-reviews',
    label: 'Outstanding Reviews',
    icon: Clock,
    description: 'Pending AI/Human reviews by manager'
  },
  {
    id: 'ai-vs-human',
    label: 'AI vs Human Scores',
    icon: BarChart3,
    description: 'Score discrepancy analysis'
  },
  {
    id: 'lead-sources',
    label: 'Lead Sources',
    icon: Target,
    description: 'Join, Wellfound, etc. performance'
  },
  {
    id: 'role-performance',
    label: 'Role Performance',
    icon: Users,
    description: 'AI Engineer, AI Innovator, PSE, FA'
  },
  {
    id: 'interview-pipeline',
    label: 'Interview Pipeline',
    icon: Calendar,
    description: 'Exploratory → Tech → CEO flow'
  },
  {
    id: 'weekly-kpis',
    label: 'Weekly KPIs',
    icon: TrendingUp,
    description: 'L / QL / QC / H metrics'
  },
  {
    id: 'cost-analysis',
    label: 'Cost Analysis',
    icon: DollarSign,
    description: 'Cost per lead by source'
  },
  {
    id: 'candidate-quality',
    label: 'Candidate Quality',
    icon: UserCheck,
    description: 'Quality trends over time'
  }
];

/**
 * Sidebar navigation component for HR Dashboard
 */
export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col h-screen sticky top-0",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header with CEF Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src="https://cdn.prod.website-files.com/674765a62fb62fecf4da7696/674765a62fb62fecf4da7836_Logo%20Nav.svg"
                alt="CEF Logo"
                className="h-8 w-8"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  HR Dashboard
                </h1>
                <p className="text-slate-400 text-sm">Team Growth Analytics</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <img 
              src="https://cdn.prod.website-files.com/674765a62fb62fecf4da7696/674765a62fb62fecf4da7836_Logo%20Nav.svg"
              alt="CEF Logo"
              className="h-6 w-6 mx-auto"
            />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left",
                    isActive 
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg" 
                      : "hover:bg-slate-700 text-slate-300 hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isCollapsed ? "mx-auto" : "mr-3"
                  )} />
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className={cn(
                        "text-xs truncate",
                        isActive ? "text-blue-100" : "text-slate-400"
                      )}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Connected to Notion</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
