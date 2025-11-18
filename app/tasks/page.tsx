'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, X, Save, Trash2, CheckCircle2, Circle, Clock, Flame, AlertCircle, Calendar, Link as LinkIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  assignedTo?: string;
  linkedModule?: string;
  linkedItemId?: string;
  linkedItemName?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface LinkableItem {
  id: string;
  name: string;
  type: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  imageUrl?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [saving, setSaving] = useState(false);
  const [showLinkSearch, setShowLinkSearch] = useState(false);
  const [linkSearchTerm, setLinkSearchTerm] = useState('');
  const [linkableItems, setLinkableItems] = useState<LinkableItem[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedModule && showLinkSearch) {
      fetchLinkableItems(selectedModule);
    }
  }, [selectedModule, showLinkSearch]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLinkableItems = async (module: string) => {
    try {
      let endpoint = '';
      switch (module) {
        case 'customer':
          endpoint = '/api/customers';
          break;
        case 'opportunity':
          endpoint = '/api/opportunities';
          break;
        case 'faq':
          endpoint = '/api/faqs';
          break;
        case 'supplier':
          endpoint = '/api/suppliers';
          break;
        case 'training':
          endpoint = '/api/training/modules';
          break;
        default:
          return;
      }

      const res = await fetch(endpoint);
      const data = await res.json();

      // Map the data to LinkableItem format
      const items: LinkableItem[] = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id,
        name: item.name || item.title || item.question || 'Untitled',
        type: module,
      })) : [];

      setLinkableItems(items);
    } catch (error) {
      console.error('Error fetching linkable items:', error);
      setLinkableItems([]);
    }
  };

  const handleCreateClick = () => {
    setEditingTask({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      dueDate: '',
      notes: '',
    });
  };

  const handleEditClick = (task: Task) => {
    setEditingTask({ ...task });
    if (task.linkedModule) {
      setSelectedModule(task.linkedModule);
    }
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setShowLinkSearch(false);
    setSelectedModule('');
    setLinkSearchTerm('');
    setLinkableItems([]);
  };

  const handleSave = async () => {
    if (!editingTask || !editingTask.title) return;

    setSaving(true);
    try {
      const isNew = !editingTask.id;
      const url = isNew ? '/api/tasks' : `/api/tasks/${editingTask.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTask),
      });

      if (res.ok) {
        await fetchTasks();
        handleCloseModal();
      } else {
        console.error('Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchTasks();
      } else {
        console.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const updateField = (field: keyof Task, value: any) => {
    if (editingTask) {
      setEditingTask({ ...editingTask, [field]: value });
    }
  };

  const handleLinkItem = (item: LinkableItem) => {
    setEditingTask({
      ...editingTask,
      linkedModule: item.type,
      linkedItemId: item.id,
      linkedItemName: item.name,
    });
    setShowLinkSearch(false);
    setLinkSearchTerm('');
  };

  const handleRemoveLink = () => {
    setEditingTask({
      ...editingTask,
      linkedModule: undefined,
      linkedItemId: undefined,
      linkedItemName: undefined,
    });
    setSelectedModule('');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.linkedItemName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesModule = moduleFilter === 'all' || task.linkedModule === moduleFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesModule;
  });

  const filteredLinkableItems = linkableItems.filter(item =>
    item.name.toLowerCase().includes(linkSearchTerm.toLowerCase())
  );

  const priorityConfig = {
    urgent: { color: 'text-error bg-error/10 border-error/20', icon: Flame, label: 'Urgent' },
    high: { color: 'text-warning bg-warning/10 border-warning/20', icon: AlertCircle, label: 'High' },
    medium: { color: 'text-primary-600 bg-primary-50 border-primary-100', icon: Clock, label: 'Medium' },
    low: { color: 'text-grey-600 bg-grey-100 border-grey-200', icon: Circle, label: 'Low' },
  };

  const statusConfig = {
    pending: { color: 'bg-grey-100 text-grey-700', label: 'Pending' },
    'in-progress': { color: 'bg-primary-100 text-primary-700', label: 'In Progress' },
    completed: { color: 'bg-success/20 text-success', label: 'Completed' },
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-grey-600">Loading tasks...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-grey-800">Task Management</h1>
        <p className="text-sm text-grey-500 mt-1">Manage your tasks and link them to customers, leads, FAQs, and more</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-grey-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-grey-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-xs font-medium text-grey-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Module Filter */}
          <div>
            <label className="block text-xs font-medium text-grey-700 mb-2">Linked To</label>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Modules</option>
              <option value="customer">Customers</option>
              <option value="opportunity">Opportunities</option>
              <option value="faq">FAQs</option>
              <option value="supplier">Suppliers</option>
              <option value="training">Training</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-medium text-grey-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-grey-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-grey-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Create Task
        </button>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-grey-200">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Circle className="h-16 w-16 text-grey-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-grey-700 mb-2">No tasks found</h3>
            <p className="text-sm text-grey-500 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || moduleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first task to get started'}
            </p>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && moduleFilter === 'all' && (
              <button
                onClick={handleCreateClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-grey-200">
            {filteredTasks.map((task) => {
              const config = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;
              const PriorityIcon = config.icon;
              const statusCfg = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending;

              return (
                <div key={task.id} className="p-6 hover:bg-grey-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="flex-shrink-0 mt-1"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="h-6 w-6 text-success" />
                      ) : (
                        <Circle className="h-6 w-6 text-grey-400 hover:text-primary-500 transition-colors" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-base font-semibold text-grey-800 mb-1 ${task.status === 'completed' ? 'line-through text-grey-500' : ''}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-grey-600 mb-2">{task.description}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditClick(task)}
                            className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {/* Priority */}
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border ${config.color}`}>
                          <PriorityIcon className="h-3.5 w-3.5" />
                          <span className="font-medium">{config.label}</span>
                        </div>

                        {/* Status */}
                        <div className={`inline-flex items-center px-2 py-1 rounded-md font-medium ${statusCfg.color}`}>
                          {statusCfg.label}
                        </div>

                        {/* Due Date */}
                        {task.dueDate && (
                          <div className="inline-flex items-center gap-1.5 text-grey-600">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Due: {formatDate(task.dueDate)}</span>
                          </div>
                        )}

                        {/* Linked Item */}
                        {task.linkedItemName && task.linkedModule && (
                          <div className="inline-flex items-center gap-1.5 text-primary-600 bg-primary-50 px-2 py-1 rounded-md">
                            <LinkIcon className="h-3.5 w-3.5" />
                            <span className="capitalize">{task.linkedModule}</span>
                            <span>•</span>
                            <span className="font-medium">{task.linkedItemName}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {task.notes && (
                        <div className="mt-3 text-sm text-grey-600 bg-grey-50 p-3 rounded-lg">
                          <span className="font-medium">Notes: </span>
                          {task.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-grey-200">
              <h2 className="text-xl font-bold text-grey-800">
                {editingTask.id ? 'Edit Task' : 'Create Task'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-grey-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-grey-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={editingTask.title || ''}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Enter task description..."
                  rows={3}
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Priority and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={editingTask.priority || 'medium'}
                    onChange={(e) => updateField('priority', e.target.value)}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-2">
                    Status
                  </label>
                  <select
                    value={editingTask.status || 'pending'}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editingTask.dueDate || ''}
                  onChange={(e) => updateField('dueDate', e.target.value)}
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Assign To
                </label>
                <select
                  value={editingTask.assignedTo || ''}
                  onChange={(e) => updateField('assignedTo', e.target.value)}
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Link to Module */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Link to Module (Optional)
                </label>
                {editingTask.linkedItemName ? (
                  <div className="flex items-center gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <LinkIcon className="h-5 w-5 text-primary-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-grey-800 capitalize">
                        {editingTask.linkedModule}
                      </p>
                      <p className="text-sm text-grey-600">{editingTask.linkedItemName}</p>
                    </div>
                    <button
                      onClick={handleRemoveLink}
                      className="p-1 hover:bg-primary-100 rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-grey-600" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="flex-1 px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select module type...</option>
                        <option value="customer">Customer</option>
                        <option value="opportunity">Opportunity</option>
                        <option value="faq">FAQ</option>
                        <option value="supplier">Supplier</option>
                        <option value="training">Training Module</option>
                      </select>
                      <button
                        onClick={() => setShowLinkSearch(true)}
                        disabled={!selectedModule}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Search
                      </button>
                    </div>

                    {/* Link Search Results */}
                    {showLinkSearch && selectedModule && (
                      <div className="border border-grey-300 rounded-lg p-3 space-y-2">
                        <input
                          type="text"
                          placeholder={`Search ${selectedModule}...`}
                          value={linkSearchTerm}
                          onChange={(e) => setLinkSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-grey-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredLinkableItems.length === 0 ? (
                            <p className="text-sm text-grey-500 text-center py-4">
                              No items found
                            </p>
                          ) : (
                            filteredLinkableItems.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => handleLinkItem(item)}
                                className="w-full text-left px-3 py-2 hover:bg-grey-100 rounded-lg transition-colors text-sm"
                              >
                                {item.name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={editingTask.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                  className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-grey-200 bg-grey-50">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-grey-700 hover:bg-grey-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingTask.title}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
