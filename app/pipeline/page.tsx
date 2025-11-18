'use client';

import { useEffect, useState } from 'react';
import { Plus, DollarSign, X, Save, ExternalLink, Edit } from 'lucide-react';
import { formatCurrency, formatDate, calculatePercentage } from '@/lib/utils';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface OpportunityWithCustomer {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  title: string;
  description?: string;
  stage: string;
  expectedValue: number;
  probability: number;
  estimatedCloseDate: string;
  createdAt: string;
}

const stages = [
  { id: 'lead', name: 'Lead', color: 'bg-gray-100 border-gray-300' },
  { id: 'interested', name: 'Interested', color: 'bg-blue-100 border-blue-300' },
  { id: 'quote-sent', name: 'Quote Sent', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'negotiating', name: 'Negotiating', color: 'bg-orange-100 border-orange-300' },
  { id: 'won', name: 'Won', color: 'bg-green-100 border-green-300' },
  { id: 'lost', name: 'Lost', color: 'bg-red-100 border-red-300' },
];

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState<OpportunityWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOpportunity, setEditingOpportunity] = useState<OpportunityWithCustomer | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedOpportunity, setDraggedOpportunity] = useState<string | null>(null);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(25000);
  const [editingGoal, setEditingGoal] = useState(false);

  useEffect(() => {
    fetchOpportunities();
    // Load saved goal from localStorage
    const savedGoal = localStorage.getItem('monthlyGoal');
    if (savedGoal) {
      setMonthlyGoal(parseFloat(savedGoal));
    }
  }, []);

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/opportunities');
      const data = await res.json();
      setOpportunities(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      setLoading(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, opportunity: OpportunityWithCustomer) => {
    e.stopPropagation();
    setEditingOpportunity({ ...opportunity });
  };

  const handleCloseModal = () => {
    setEditingOpportunity(null);
  };

  const handleSave = async () => {
    if (!editingOpportunity) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/opportunities/${editingOpportunity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOpportunity),
      });

      if (res.ok) {
        await fetchOpportunities();
        setEditingOpportunity(null);
      } else {
        console.error('Failed to update opportunity');
      }
    } catch (error) {
      console.error('Error updating opportunity:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof OpportunityWithCustomer, value: any) => {
    if (editingOpportunity) {
      setEditingOpportunity({ ...editingOpportunity, [field]: value });
    }
  };

  const handleDragStart = (opportunityId: string) => {
    setDraggedOpportunity(opportunityId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStage: string) => {
    if (!draggedOpportunity) return;

    const opportunity = opportunities.find(o => o.id === draggedOpportunity);
    if (!opportunity || opportunity.stage === newStage) {
      setDraggedOpportunity(null);
      return;
    }

    try {
      const res = await fetch(`/api/opportunities/${draggedOpportunity}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (res.ok) {
        await fetchOpportunities();
      }
    } catch (error) {
      console.error('Error updating opportunity stage:', error);
    } finally {
      setDraggedOpportunity(null);
    }
  };

  const saveMonthlyGoal = () => {
    localStorage.setItem('monthlyGoal', monthlyGoal.toString());
    setEditingGoal(false);
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter(opp => opp.stage === stageId);
  };

  const getTotalValueByStage = (stageId: string) => {
    return getOpportunitiesByStage(stageId).reduce((sum, opp) => sum + opp.expectedValue, 0);
  };

  const totalPipelineValue = opportunities.reduce((sum, opp) => sum + opp.expectedValue, 0);
  const wonThisMonth = getOpportunitiesByStage('won').reduce((sum, opp) => sum + opp.expectedValue, 0);
  const goalProgress = calculatePercentage(wonThisMonth, monthlyGoal);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-grey-600">Loading pipeline...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-grey-800">Sales Pipeline</h1>
          <p className="text-sm text-grey-500 mt-1">Track opportunities through your sales process</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
          <Plus className="h-5 w-5" />
          New Opportunity
        </button>
      </div>
        {/* Monthly Goal Tracker */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">This Month's Sales Goal</h3>
                {editingGoal ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={monthlyGoal}
                      onChange={(e) => setMonthlyGoal(parseFloat(e.target.value) || 0)}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={saveMonthlyGoal}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingGoal(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Goal</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(monthlyGoal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Won This Month</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(wonThisMonth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pipeline</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(totalPipelineValue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Progress to Goal</span>
              <span className="text-sm font-bold text-gray-900">{goalProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  goalProgress >= 100 ? 'bg-green-600' : goalProgress >= 75 ? 'bg-blue-600' : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(goalProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Remaining: {formatCurrency(Math.max(monthlyGoal - wonThisMonth, 0))}</span>
              <span>
                {goalProgress >= 100 ? '🎉 Goal Achieved!' : `${(100 - goalProgress).toFixed(1)}% to go`}
              </span>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stages.map((stage) => {
            const stageOpportunities = getOpportunitiesByStage(stage.id);
            const stageValue = getTotalValueByStage(stage.id);

            return (
              <div
                key={stage.id}
                className="flex flex-col"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.id)}
              >
                {/* Stage Header */}
                <div className={`rounded-t-lg border-2 ${stage.color} px-4 py-3`}>
                  <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">{stageOpportunities.length} deals</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(stageValue)}</span>
                  </div>
                </div>

                {/* Stage Cards */}
                <div className="flex-1 bg-gray-100 border-2 border-t-0 border-gray-200 rounded-b-lg p-2 min-h-[500px] space-y-2">
                  {stageOpportunities.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No opportunities
                    </div>
                  ) : (
                    stageOpportunities.map((opp) => (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={() => handleDragStart(opp.id)}
                        onClick={(e) => handleEditClick(e, opp)}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-move hover:cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 flex-1">{opp.title}</h4>
                          <Edit className="h-4 w-4 text-gray-400" />
                        </div>

                        <Link
                          href={`/customers?highlight=${opp.customerId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mb-3"
                        >
                          {opp.customerName}
                          <ExternalLink className="h-3 w-3" />
                        </Link>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Value:</span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(opp.expectedValue)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Probability:</span>
                            <span className="font-medium text-gray-700">{opp.probability}%</span>
                          </div>

                          {opp.estimatedCloseDate && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Close:</span>
                              <span className="text-gray-700">{formatDate(opp.estimatedCloseDate)}</span>
                            </div>
                          )}
                        </div>

                        {opp.description && (
                          <p className="mt-3 text-xs text-gray-500 line-clamp-2">
                            {opp.description}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Opportunities</h3>
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{opportunities.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Pipeline</h3>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {opportunities.filter(o => !['won', 'lost'].includes(o.stage)).length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Won This Month</h3>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {getOpportunitiesByStage('won').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Avg Deal Size</h3>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {opportunities.length > 0
                ? formatCurrency(totalPipelineValue / opportunities.length)
                : formatCurrency(0)
              }
            </p>
          </div>
        </div>

      {/* Edit Opportunity Modal */}
      {editingOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Opportunity</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opportunity Title *
                  </label>
                  <input
                    type="text"
                    value={editingOpportunity.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Customer (Read-only with link) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer
                  </label>
                  <Link
                    href={`/customers?highlight=${editingOpportunity.customerId}`}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-blue-600 hover:text-blue-700"
                  >
                    {editingOpportunity.customerName}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>

                {/* Expected Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Value ($) *
                  </label>
                  <input
                    type="number"
                    value={editingOpportunity.expectedValue}
                    onChange={(e) => updateField('expectedValue', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Probability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingOpportunity.probability}
                    onChange={(e) => updateField('probability', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Stage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage *
                  </label>
                  <select
                    value={editingOpportunity.stage}
                    onChange={(e) => updateField('stage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>

                {/* Estimated Close Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Close Date
                  </label>
                  <input
                    type="date"
                    value={editingOpportunity.estimatedCloseDate?.split('T')[0] || ''}
                    onChange={(e) => updateField('estimatedCloseDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingOpportunity.description || ''}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add details about this opportunity..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
