'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Users, Target, BookOpen, AlertCircle, TrendingUp, DollarSign, CheckCircle2, Circle, Clock, Flame, Plus } from 'lucide-react';
import { formatCurrency, formatPercentage, calculatePercentage, formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';

interface DashboardStats {
  sales: {
    target: number;
    actual: number;
    byCategory: {
      target: Record<string, number>;
      actual: Record<string, number>;
    };
  };
  opportunities: {
    byStage: Array<{ stage: string; count: number; totalValue: number }>;
    totalValue: number;
  };
  training: {
    totalModules: number;
    completed: number;
    inProgress: number;
    percentComplete: number;
  };
  followUps: {
    upcomingCount: number;
  };
  customers: {
    recentCount: number;
  };
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  linkedModule?: string;
  linkedItemId?: string;
  linkedItemName?: string;
  createdAt: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/stats').then(res => res.json()),
      fetch('/api/tasks?status=pending').then(res => res.json()),
    ])
      .then(([statsData, tasksData]) => {
        setStats(statsData);
        setTasks(Array.isArray(tasksData) ? tasksData.slice(0, 5) : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-grey-600">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-error">Error loading dashboard data</div>
        </div>
      </DashboardLayout>
    );
  }

  const revenueProgress = stats.sales.target > 0
    ? calculatePercentage(stats.sales.actual, stats.sales.target)
    : 0;

  return (
    <DashboardLayout>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-grey-800">Dashboard</h1>
        <p className="text-sm text-grey-500 mt-1">Welcome back, Dominique! Here's your business overview.</p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Revenue Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-grey-600">Monthly Revenue</h3>
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold text-grey-800">
              {formatCurrency(stats.sales.actual)}
            </p>
            <p className="text-sm text-grey-500">
              Target: {formatCurrency(stats.sales.target)}
            </p>
            <div className="w-full bg-grey-200 rounded-full h-2">
              <div
                className="bg-success h-2 rounded-full transition-all"
                style={{ width: `${Math.min(revenueProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-grey-500">
              {formatPercentage(revenueProgress)} of target
            </p>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-grey-600">Pipeline Value</h3>
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-grey-800">
            {formatCurrency(stats.opportunities.totalValue)}
          </p>
          <p className="text-sm text-grey-500 mt-3">
            {stats.opportunities.byStage.reduce((sum, s) => sum + s.count, 0)} active opportunities
          </p>
        </div>

        {/* Training Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-grey-600">VA Training</h3>
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-grey-800">
            {stats.training.percentComplete}%
          </p>
          <p className="text-sm text-grey-500 mt-3">
            {stats.training.completed} of {stats.training.totalModules} modules completed
          </p>
          <div className="w-full bg-grey-200 rounded-full h-2 mt-3">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${stats.training.percentComplete}%` }}
            />
          </div>
        </div>

        {/* Follow-ups */}
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-grey-600">Upcoming Follow-ups</h3>
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
          </div>
          <p className="text-2xl font-bold text-grey-800">
            {stats.followUps.upcomingCount}
          </p>
          <p className="text-sm text-grey-500 mt-3">
            Due in next 7 days
          </p>
        </div>
      </div>

      {/* Tasks & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-grey-200">
          <div className="px-6 py-4 border-b border-grey-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-grey-800">Upcoming Tasks</h2>
            <Link
              href="/tasks"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="p-6">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <Circle className="h-12 w-12 text-grey-300 mx-auto mb-3" />
                <p className="text-sm text-grey-500 mb-4">No pending tasks</p>
                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Create Task
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const priorityConfig = {
                    urgent: { color: 'text-error bg-error/10 border-error/20', icon: Flame },
                    high: { color: 'text-warning bg-warning/10 border-warning/20', icon: AlertCircle },
                    medium: { color: 'text-primary-600 bg-primary-50 border-primary-100', icon: Clock },
                    low: { color: 'text-grey-600 bg-grey-100 border-grey-200', icon: Circle },
                  };
                  const config = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                  const PriorityIcon = config.icon;

                  return (
                    <Link
                      key={task.id}
                      href="/tasks"
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors hover:shadow-sm ${config.color}`}
                    >
                      <PriorityIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-grey-800 line-clamp-1">{task.title}</p>
                        {task.linkedItemName && (
                          <p className="text-xs text-grey-600 mt-1">
                            {task.linkedModule}: {task.linkedItemName}
                          </p>
                        )}
                        {task.dueDate && (
                          <p className="text-xs text-grey-500 mt-1">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
                <Link
                  href="/tasks"
                  className="block text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Create New Task +
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Opportunity Pipeline Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-grey-200">
          <div className="px-6 py-4 border-b border-grey-200">
            <h2 className="text-lg font-semibold text-grey-800">Pipeline by Stage</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.opportunities.byStage.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-grey-700 capitalize">
                      {stage.stage.replace(/-/g, ' ')}
                    </span>
                    <span className="text-sm text-grey-600">
                      {stage.count} ({formatCurrency(stage.totalValue || 0)})
                    </span>
                  </div>
                  <div className="w-full bg-grey-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          calculatePercentage(stage.totalValue || 0, stats.opportunities.totalValue),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="bg-white rounded-xl shadow-sm border border-grey-200">
        <div className="px-6 py-4 border-b border-grey-200">
          <h2 className="text-lg font-semibold text-grey-800">Revenue by Category</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(stats.sales.byCategory.actual).map(([category, actual]) => {
              const target = stats.sales.byCategory.target[category] || 0;
              const progress = target > 0 ? calculatePercentage(actual, target) : 0;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-grey-700 capitalize">
                      {category.replace(/-/g, ' ')}
                    </h4>
                    <span className="text-sm text-grey-600">
                      {formatPercentage(progress)}
                    </span>
                  </div>
                  <div className="w-full bg-grey-200 rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-grey-500">
                    <span>{formatCurrency(actual)}</span>
                    <span>Target: {formatCurrency(target)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
