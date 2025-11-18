'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Mail, Phone, Globe, Edit, X, Save, MessageSquare, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';

interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  categories: string; // JSON string of array
  stage: string;
  notes?: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommunicationLog {
  id: string;
  supplierId: string;
  type: string;
  subject: string;
  notes?: string;
  contactDate: string;
  createdAt: string;
}

const CATEGORIES = ['beauty', 'furniture', 'hair-furniture', 'laser-machines', 'supplies'];
const STAGES = [
  { id: 'discovered', name: 'Discovered', color: 'bg-grey-100 text-grey-800' },
  { id: 'approved', name: 'Approved', color: 'bg-info/10 text-info' },
  { id: 'contacted', name: 'Contacted', color: 'bg-primary-100 text-primary-800' },
  { id: 'proceeded', name: 'Proceeded', color: 'bg-success/10 text-success' },
  { id: 'lost', name: 'Lost', color: 'bg-error/10 text-error' },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>([]);
  const [showCommLog, setShowCommLog] = useState(false);
  const [newLog, setNewLog] = useState({
    type: 'email',
    subject: '',
    notes: '',
    contactDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      setSuppliers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setLoading(false);
    }
  };

  const fetchCommunicationLogs = async (supplierId: string) => {
    try {
      const res = await fetch(`/api/suppliers/${supplierId}/communications`);
      const data = await res.json();
      setCommunicationLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching communication logs:', error);
      setCommunicationLogs([]);
    }
  };

  const handleEditClick = (supplier: Supplier) => {
    const categoriesArray = supplier.categories ? JSON.parse(supplier.categories) : [];
    setEditingSupplier({ ...supplier, categories: JSON.stringify(categoriesArray) });
    fetchCommunicationLogs(supplier.id);
  };

  const handleAddClick = () => {
    setEditingSupplier({
      id: '', // Empty ID indicates new supplier
      name: '',
      contactName: '',
      email: '',
      phone: '',
      website: '',
      categories: '[]',
      stage: 'discovered',
      notes: '',
      lastContactDate: '',
      nextFollowUpDate: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Supplier);
    setCommunicationLogs([]);
  };

  const handleCloseModal = () => {
    setEditingSupplier(null);
    setShowCommLog(false);
    setNewLog({
      type: 'email',
      subject: '',
      notes: '',
      contactDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleSave = async () => {
    if (!editingSupplier || !editingSupplier.name.trim()) return;

    setSaving(true);
    try {
      const isNew = !editingSupplier.id;
      const url = isNew ? '/api/suppliers' : `/api/suppliers/${editingSupplier.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSupplier),
      });

      if (res.ok) {
        await fetchSuppliers();
        setEditingSupplier(null);
      } else {
        console.error(`Failed to ${isNew ? 'create' : 'update'} supplier`);
      }
    } catch (error) {
      console.error(`Error ${editingSupplier.id ? 'updating' : 'creating'} supplier:`, error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCommunication = async () => {
    if (!editingSupplier || !newLog.subject.trim()) return;

    try {
      const res = await fetch(`/api/suppliers/${editingSupplier.id}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });

      if (res.ok) {
        await fetchCommunicationLogs(editingSupplier.id);
        setNewLog({
          type: 'email',
          subject: '',
          notes: '',
          contactDate: new Date().toISOString().split('T')[0],
        });
        setShowCommLog(false);
      }
    } catch (error) {
      console.error('Error adding communication log:', error);
    }
  };

  const updateField = (field: keyof Supplier, value: any) => {
    if (editingSupplier) {
      setEditingSupplier({ ...editingSupplier, [field]: value });
    }
  };

  const toggleCategory = (category: string) => {
    if (!editingSupplier) return;
    const currentCategories = JSON.parse(editingSupplier.categories || '[]');
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c: string) => c !== category)
      : [...currentCategories, category];
    updateField('categories', JSON.stringify(newCategories));
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStageColor = (stage: string) => {
    return STAGES.find(s => s.id === stage)?.color || 'bg-grey-100 text-grey-800';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-grey-600">Loading suppliers...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-grey-800">Supplier Management</h1>
        <p className="text-sm text-grey-500 mt-1">Manage supplier relationships and outreach</p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-grey-400" />
          <input
            type="text"
            placeholder="Search suppliers by name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800 placeholder-grey-400"
          />
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
        >
          <Plus className="h-5 w-5" />
          Add Supplier
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        {STAGES.map(stage => (
          <div key={stage.id} className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
            <p className="text-sm text-grey-600 mb-1 capitalize">{stage.name}</p>
            <p className="text-2xl font-bold text-grey-800">
              {suppliers.filter(s => s.stage === stage.id).length}
            </p>
          </div>
        ))}
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-grey-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-grey-200">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Last Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-grey-200">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-grey-500">
                    {searchTerm ? 'No suppliers found matching your search' : 'No suppliers yet'}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => {
                  const categories = supplier.categories ? JSON.parse(supplier.categories) : [];
                  return (
                    <tr
                      key={supplier.id}
                      className="hover:bg-grey-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-grey-800">{supplier.name}</div>
                          {supplier.contactName && (
                            <div className="text-sm text-grey-500">{supplier.contactName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {supplier.email && (
                            <div className="text-sm text-grey-800 flex items-center gap-1">
                              <Mail className="h-3 w-3 text-grey-400" />
                              {supplier.email}
                            </div>
                          )}
                          {supplier.phone && (
                            <div className="text-sm text-grey-500 flex items-center gap-1">
                              <Phone className="h-3 w-3 text-grey-400" />
                              {supplier.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {categories.map((cat: string) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 bg-primary-100 text-primary-800 text-xs rounded-full"
                            >
                              {cat.replace(/-/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStageColor(supplier.stage)}`}>
                          {STAGES.find(s => s.id === supplier.stage)?.name || supplier.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                        {supplier.lastContactDate ? formatDate(supplier.lastContactDate) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEditClick(supplier)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-grey-200">
              <h2 className="text-xl font-semibold text-grey-800">
                {editingSupplier.id ? 'Edit Supplier' : 'Add Supplier'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-grey-400 hover:text-grey-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className={`grid grid-cols-1 ${editingSupplier.id ? 'lg:grid-cols-2' : ''} gap-6`}>
                {/* Left Column - Supplier Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-grey-800 mb-4">Supplier Details</h3>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Supplier Name *
                    </label>
                    <input
                      type="text"
                      value={editingSupplier.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                    />
                  </div>

                  {/* Contact Name */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={editingSupplier.contactName || ''}
                      onChange={(e) => updateField('contactName', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-grey-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editingSupplier.email || ''}
                        onChange={(e) => updateField('email', e.target.value)}
                        className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-grey-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={editingSupplier.phone || ''}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      value={editingSupplier.website || ''}
                      onChange={(e) => updateField('website', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                    />
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-2">
                      Product Categories
                    </label>
                    <div className="space-y-2">
                      {CATEGORIES.map(category => {
                        const categories = JSON.parse(editingSupplier.categories || '[]');
                        const isChecked = categories.includes(category);
                        return (
                          <label key={category} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategory(category)}
                              className="w-4 h-4 text-primary-600 border-grey-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-sm text-grey-700 capitalize">
                              {category.replace(/-/g, ' ')}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stage */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Stage
                    </label>
                    <select
                      value={editingSupplier.stage}
                      onChange={(e) => updateField('stage', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                    >
                      {STAGES.map(stage => (
                        <option key={stage.id} value={stage.id}>{stage.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editingSupplier.notes || ''}
                      onChange={(e) => updateField('notes', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                      placeholder="Add notes about this supplier..."
                    />
                  </div>
                </div>

                {/* Right Column - Communication Log (only show for existing suppliers) */}
                {editingSupplier.id && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-grey-800">Communication Log</h3>
                    <button
                      onClick={() => setShowCommLog(!showCommLog)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Log
                    </button>
                  </div>

                  {/* Add Communication Form */}
                  {showCommLog && (
                    <div className="bg-grey-50 rounded-lg p-4 mb-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-grey-700 mb-1">
                            Type
                          </label>
                          <select
                            value={newLog.type}
                            onChange={(e) => setNewLog({ ...newLog, type: e.target.value })}
                            className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-grey-800 text-sm"
                          >
                            <option value="email">Email</option>
                            <option value="phone">Phone Call</option>
                            <option value="meeting">Meeting</option>
                            <option value="zoom">Zoom/Video</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-grey-700 mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            value={newLog.contactDate}
                            onChange={(e) => setNewLog({ ...newLog, contactDate: e.target.value })}
                            className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-grey-800 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-grey-700 mb-1">
                          Subject *
                        </label>
                        <input
                          type="text"
                          value={newLog.subject}
                          onChange={(e) => setNewLog({ ...newLog, subject: e.target.value })}
                          placeholder="e.g., Requested price list"
                          className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-grey-800 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-grey-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={newLog.notes}
                          onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                          rows={2}
                          placeholder="Add details about this communication..."
                          className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-grey-800 text-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddCommunication}
                          className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                        >
                          Add Log Entry
                        </button>
                        <button
                          onClick={() => setShowCommLog(false)}
                          className="px-3 py-2 bg-grey-200 text-grey-700 rounded-lg hover:bg-grey-300 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Communication History */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {!Array.isArray(communicationLogs) || communicationLogs.length === 0 ? (
                      <div className="text-center py-8 text-grey-500 text-sm">
                        No communication logs yet
                      </div>
                    ) : (
                      communicationLogs.map((log) => (
                        <div key={log.id} className="bg-grey-50 rounded-lg p-4 border border-grey-200">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <MessageSquare className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-primary-600 uppercase">
                                  {log.type}
                                </span>
                                <span className="text-xs text-grey-500">
                                  {formatDate(log.contactDate)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-grey-800 mb-1">
                                {log.subject}
                              </p>
                              {log.notes && (
                                <p className="text-sm text-grey-600 whitespace-pre-wrap">
                                  {log.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                )}
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
