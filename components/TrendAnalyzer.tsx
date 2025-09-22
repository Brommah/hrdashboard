'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendData {
  current: number;
  previous: number;
  label: string;
  format?: 'number' | 'percentage' | 'currency';
  reverseGood?: boolean; // For metrics where lower is better (like discrepancy)
}

interface TrendAnalyzerProps {
  data: TrendData;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

/**
 * Universal trend analyzer component for showing improvements/declines
 */
export function TrendAnalyzer({ 
  data, 
  size = 'md', 
  showIcon = true, 
  showText = true 
}: TrendAnalyzerProps) {
  const calculateTrend = () => {
    if (data.previous === 0) return { change: 0, percentage: 0, isPositive: true, isSignificant: false };
    
    const change = data.current - data.previous;
    const percentage = (change / data.previous) * 100;
    const isPositive = data.reverseGood ? change < 0 : change > 0;
    const isSignificant = Math.abs(percentage) >= 5; // 5% change is significant
    
    return { change, percentage, isPositive, isSignificant };
  };

  const trend = calculateTrend();
  
  const formatValue = (value: number) => {
    switch (data.format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      default:
        return value.toFixed(1);
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-3 w-3';
      case 'lg': return 'h-6 w-6';
      default: return 'h-4 w-4';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'lg': return 'text-base';
      default: return 'text-sm';
    }
  };

  const TrendIcon = () => {
    if (!trend.isSignificant) return <Minus className={`${getIconSize()} text-gray-400`} />;
    return trend.isPositive ? 
      <TrendingUp className={`${getIconSize()} text-green-600`} /> : 
      <TrendingDown className={`${getIconSize()} text-red-600`} />;
  };

  const getTrendColor = () => {
    if (!trend.isSignificant) return 'text-gray-600';
    return trend.isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="flex items-center space-x-1">
      {showIcon && <TrendIcon />}
      {showText && (
        <span className={`${getTextSize()} font-medium ${getTrendColor()}`}>
          {trend.isSignificant ? 
            `${trend.isPositive ? '+' : ''}${Math.abs(trend.percentage).toFixed(1)}%` : 
            'Stable'
          }
        </span>
      )}
    </div>
  );
}

/**
 * Trend summary component for displaying multiple metrics
 */
export function TrendSummary({ trends }: { trends: TrendData[] }) {
  const overallHealth = trends.reduce((acc, trend) => {
    const trendCalc = trend.previous === 0 ? { isPositive: true, isSignificant: false } : {
      isPositive: trend.reverseGood ? trend.current < trend.previous : trend.current > trend.previous,
      isSignificant: Math.abs((trend.current - trend.previous) / trend.previous * 100) >= 5
    };
    
    if (trendCalc.isPositive && trendCalc.isSignificant) acc.improving++;
    else if (!trendCalc.isPositive && trendCalc.isSignificant) acc.declining++;
    else acc.stable++;
    
    return acc;
  }, { improving: 0, declining: 0, stable: 0 });

  const getOverallStatus = () => {
    if (overallHealth.improving > overallHealth.declining) return { status: 'Improving', color: 'text-green-600' };
    if (overallHealth.declining > overallHealth.improving) return { status: 'Declining', color: 'text-red-600' };
    return { status: 'Stable', color: 'text-gray-600' };
  };

  const overall = getOverallStatus();

  return (
    <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800">Overall Trend Summary</h4>
        <div className={`font-bold ${overall.color}`}>{overall.status}</div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-green-600">{overallHealth.improving}</div>
          <div className="text-xs text-gray-600">Improving</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-600">{overallHealth.stable}</div>
          <div className="text-xs text-gray-600">Stable</div>
        </div>
        <div>
          <div className="text-lg font-bold text-red-600">{overallHealth.declining}</div>
          <div className="text-xs text-gray-600">Declining</div>
        </div>
      </div>
    </div>
  );
}
