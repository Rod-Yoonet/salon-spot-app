'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Clock, CheckCircle, Circle, PlayCircle, Edit, X, Save, Plus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface TrainingModule {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedHours: number;
  requiredForRole: boolean;
  createdAt: string;
}

interface TrainingProgress {
  id: string;
  vaId: string;
  moduleId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  completionDate?: string;
  score?: number;
  notes?: string;
  lastAccessedAt?: string;
  updatedAt?: string;
}

export default function TrainingPage() {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await fetch('/api/training/modules');
      const data = await res.json();
      setModules(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching training modules:', error);
      setLoading(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent, module: TrainingModule) => {
    e.stopPropagation();
    setEditingModule({ ...module });
  };

  const handleCloseModal = () => {
    setEditingModule(null);
  };

  const handleSave = async () => {
    if (!editingModule) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/training/modules/${editingModule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingModule),
      });

      if (res.ok) {
        await fetchModules();
        setEditingModule(null);
      } else {
        console.error('Failed to update module');
      }
    } catch (error) {
      console.error('Error updating module:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof TrainingModule, value: any) => {
    if (editingModule) {
      setEditingModule({ ...editingModule, [field]: value });
    }
  };

  const totalHours = modules.reduce((sum, mod) => sum + mod.estimatedHours, 0);
  const requiredModules = modules.filter(m => m.requiredForRole);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'shopify': 'bg-primary-100 text-primary-800 border-primary-300',
      'apps': 'bg-info/10 text-info border-info/30',
      'customer-service': 'bg-success/10 text-success border-success/30',
      'product-knowledge': 'bg-warning/10 text-warning border-warning/30',
      'brand-guidelines': 'bg-primary-100 text-primary-800 border-primary-300',
      'compliance': 'bg-error/10 text-error border-error/30',
    };
    return colors[category] || 'bg-grey-100 text-grey-800 border-grey-300';
  };

  const getCategoryIcon = (category: string) => {
    return <BookOpen className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-grey-600">Loading training modules...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-grey-800">VA Training & Onboarding</h1>
          <p className="text-sm text-grey-500 mt-1">Track VA progress through training modules</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
          <Plus className="h-5 w-5" />
          New Module
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-grey-600">Total Modules</h3>
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-grey-800">{modules.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-grey-600">Required Modules</h3>
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Circle className="h-5 w-5 text-warning" />
            </div>
          </div>
          <p className="text-2xl font-bold text-grey-800">{requiredModules.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-grey-600">Total Hours</h3>
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-grey-800">{totalHours}h</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-grey-600">Completion</h3>
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
          </div>
          <p className="text-2xl font-bold text-grey-800">0%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-grey-800">Overall Training Progress</h3>
          <span className="text-sm text-grey-600">0 of {modules.length} modules completed</span>
        </div>
        <div className="w-full bg-grey-200 rounded-full h-3">
          <div
            className="bg-primary-500 h-3 rounded-full transition-all"
            style={{ width: '0%' }}
          />
        </div>
      </div>

      {/* Training Modules Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-grey-800">Training Modules</h2>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-warning/10 text-warning text-xs font-medium rounded-full border border-warning/30">
              Required
            </span>
            <span className="px-3 py-1 bg-grey-100 text-grey-800 text-xs font-medium rounded-full border border-grey-200">
              Optional
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-xl shadow-sm border border-grey-200 hover:shadow-md transition-shadow overflow-hidden group"
            >
              {/* Module Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(module.category)} border`}>
                    {getCategoryIcon(module.category)}
                  </div>
                  <div className="flex items-center gap-2">
                    {module.requiredForRole && (
                      <span className="px-2 py-1 bg-warning/10 text-warning text-xs font-medium rounded border border-warning/30">
                        Required
                      </span>
                    )}
                    <button
                      onClick={(e) => handleEditClick(e, module)}
                      className="p-1.5 hover:bg-grey-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit module"
                    >
                      <Edit className="h-4 w-4 text-grey-600" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-grey-800 mb-2">{module.name}</h3>
                <p className="text-sm text-grey-600 mb-4 line-clamp-2">{module.description}</p>

                <div className="flex items-center gap-4 text-sm text-grey-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{module.estimatedHours}h</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(module.category)}`}>
                      {module.category.replace(/-/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Module Status */}
              <div className="px-6 py-4 bg-grey-50 border-t border-grey-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-grey-400" />
                    <span className="text-sm text-grey-600">Not Started</span>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                    <PlayCircle className="h-4 w-4" />
                    Start
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Training Categories */}
      <div className="mt-12 bg-white rounded-xl shadow-sm border border-grey-200 p-6">
        <h3 className="text-lg font-semibold text-grey-800 mb-4">Training Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries({
            'shopify': 'Shopify',
            'apps': 'Apps & Tools',
            'customer-service': 'Customer Service',
            'product-knowledge': 'Product Knowledge',
            'brand-guidelines': 'Brand Guidelines',
            'compliance': 'Compliance',
          }).map(([key, label]) => {
            const count = modules.filter(m => m.category === key).length;
            return (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 ${getCategoryColor(key)} text-center`}
              >
                <p className="font-semibold mb-1">{label}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Module Modal */}
      {editingModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-grey-200">
              <h2 className="text-xl font-semibold text-grey-800">Edit Training Module</h2>
              <button
                onClick={handleCloseModal}
                className="text-grey-400 hover:text-grey-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Module Name *
                  </label>
                  <input
                    type="text"
                    value={editingModule.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingModule.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                    placeholder="Describe what this module covers..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editingModule.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                    >
                      <option value="shopify">Shopify</option>
                      <option value="apps">Apps & Tools</option>
                      <option value="customer-service">Customer Service</option>
                      <option value="product-knowledge">Product Knowledge</option>
                      <option value="brand-guidelines">Brand Guidelines</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>

                  {/* Estimated Hours */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={editingModule.estimatedHours}
                      onChange={(e) => updateField('estimatedHours', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>

                {/* Required for Role */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requiredForRole"
                    checked={editingModule.requiredForRole}
                    onChange={(e) => updateField('requiredForRole', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-grey-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="requiredForRole" className="text-sm font-medium text-grey-700">
                    Required for role
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-grey-200 bg-grey-50">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-grey-700 bg-white border border-grey-300 rounded-lg hover:bg-grey-50 transition-colors"
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
