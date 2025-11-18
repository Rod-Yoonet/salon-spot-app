'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Edit, X, Save, MessageSquare, Mail, MessageCircle, Phone, User, Calendar, CheckCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import DashboardLayout from '@/components/DashboardLayout';

interface FAQ {
  id: string;
  question: string;
  answer?: string;
  category?: string;
  status: string;
  submissionCount: number;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  lastUpdatedAt?: string;
}

interface Submission {
  id: string;
  faqItemId: string;
  questionText: string;
  source: string;
  sourceDetails?: string;
  askedBy?: string;
  askedAt: string;
  notes?: string;
  createdAt: string;
}

const SOURCE_OPTIONS = [
  { id: 'email', name: 'Email', icon: Mail, color: 'text-blue-600 bg-blue-50' },
  { id: 'social-media', name: 'Social Media', icon: MessageCircle, color: 'text-purple-600 bg-purple-50' },
  { id: 'live-chat', name: 'Live Chat', icon: MessageSquare, color: 'text-green-600 bg-green-50' },
  { id: 'phone', name: 'Phone', icon: Phone, color: 'text-orange-600 bg-orange-50' },
  { id: 'in-person', name: 'In Person', icon: User, color: 'text-pink-600 bg-pink-50' },
];

const STATUS_OPTIONS = [
  { id: 'draft', name: 'Draft', color: 'bg-grey-100 text-grey-800' },
  { id: 'pending-review', name: 'Pending Review', color: 'bg-warning/10 text-warning' },
  { id: 'published', name: 'Published', color: 'bg-success/10 text-success' },
  { id: 'archived', name: 'Archived', color: 'bg-grey-200 text-grey-600' },
];

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [saving, setSaving] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [newSubmission, setNewSubmission] = useState({
    questionText: '',
    source: 'email',
    sourceDetails: '',
    askedBy: '',
    askedAt: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await fetch('/api/faqs');
      const data = await res.json();
      setFaqs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setLoading(false);
    }
  };

  const fetchSubmissions = async (faqId: string) => {
    try {
      const res = await fetch(`/api/faqs/${faqId}/submissions`);
      const data = await res.json();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setSubmissions([]);
    }
  };

  const handleEditClick = (faq: FAQ) => {
    setEditingFaq({ ...faq });
    if (faq.id) {
      fetchSubmissions(faq.id);
    }
  };

  const handleAddClick = () => {
    setEditingFaq({
      id: '',
      question: '',
      answer: '',
      category: '',
      status: 'draft',
      submissionCount: 0,
      createdAt: new Date().toISOString(),
    } as FAQ);
    setSubmissions([]);
  };

  const handleCloseModal = () => {
    setEditingFaq(null);
    setShowSubmissions(false);
    setShowAddSubmission(false);
    setNewSubmission({
      questionText: '',
      source: 'email',
      sourceDetails: '',
      askedBy: '',
      askedAt: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleSave = async () => {
    if (!editingFaq || !editingFaq.question.trim()) return;

    setSaving(true);
    try {
      const isNew = !editingFaq.id;
      const url = isNew ? '/api/faqs' : `/api/faqs/${editingFaq.id}`;
      const method = isNew ? 'POST' : 'PATCH';

      // If marking as published, set approvedAt
      const payload = { ...editingFaq };
      if (editingFaq.status === 'published' && !editingFaq.approvedAt) {
        payload.approvedAt = new Date().toISOString();
        payload.approvedBy = 'Current User'; // You can replace this with actual user
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchFAQs();
        setEditingFaq(null);
      } else {
        console.error(`Failed to ${isNew ? 'create' : 'update'} FAQ`);
      }
    } catch (error) {
      console.error(`Error ${editingFaq.id ? 'updating' : 'creating'} FAQ:`, error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubmission = async () => {
    if (!editingFaq || !editingFaq.id || !newSubmission.questionText.trim()) return;

    try {
      const res = await fetch(`/api/faqs/${editingFaq.id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubmission),
      });

      if (res.ok) {
        await fetchSubmissions(editingFaq.id);
        await fetchFAQs(); // Refresh to update submission count
        setNewSubmission({
          questionText: '',
          source: 'email',
          sourceDetails: '',
          askedBy: '',
          askedAt: new Date().toISOString().split('T')[0],
          notes: '',
        });
        setShowAddSubmission(false);
      }
    } catch (error) {
      console.error('Error adding submission:', error);
    }
  };

  const updateField = (field: keyof FAQ, value: any) => {
    if (editingFaq) {
      setEditingFaq({ ...editingFaq, [field]: value });
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || faq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getSourceIcon = (source: string) => {
    const sourceOption = SOURCE_OPTIONS.find(s => s.id === source);
    return sourceOption || SOURCE_OPTIONS[0];
  };

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.id === status)?.color || 'bg-grey-100 text-grey-800';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-grey-600">Loading FAQs...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-grey-800">FAQ Management</h1>
        <p className="text-sm text-grey-500 mt-1">Manage frequently asked questions and track submission sources</p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-grey-400" />
          <input
            type="text"
            placeholder="Search FAQs by question or answer..."
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
          Add FAQ
        </button>
      </div>

      {/* Status Filter Buttons */}
      <div className="mb-6 flex gap-2 items-center bg-white rounded-lg shadow-sm border border-grey-200 p-2">
        <span className="text-sm font-medium text-grey-700 px-2">Filter by status:</span>
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary-500 text-white'
              : 'text-grey-700 hover:bg-grey-100'
          }`}
        >
          All ({faqs.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending-review')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'pending-review'
              ? 'bg-warning text-white'
              : 'text-grey-700 hover:bg-grey-100'
          }`}
        >
          Needs Approval ({faqs.filter(f => f.status === 'pending-review').length})
        </button>
        <button
          onClick={() => setStatusFilter('draft')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'draft'
              ? 'bg-grey-600 text-white'
              : 'text-grey-700 hover:bg-grey-100'
          }`}
        >
          Draft ({faqs.filter(f => f.status === 'draft').length})
        </button>
        <button
          onClick={() => setStatusFilter('published')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'published'
              ? 'bg-success text-white'
              : 'text-grey-700 hover:bg-grey-100'
          }`}
        >
          Published ({faqs.filter(f => f.status === 'published').length})
        </button>
        <button
          onClick={() => setStatusFilter('archived')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'archived'
              ? 'bg-grey-400 text-white'
              : 'text-grey-700 hover:bg-grey-100'
          }`}
        >
          Archived ({faqs.filter(f => f.status === 'archived').length})
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <p className="text-sm text-grey-600 mb-1">Total FAQs</p>
          <p className="text-2xl font-bold text-grey-800">{faqs.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <p className="text-sm text-grey-600 mb-1">Published</p>
          <p className="text-2xl font-bold text-success">{faqs.filter(f => f.status === 'published').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <p className="text-sm text-grey-600 mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-warning">{faqs.filter(f => f.status === 'pending-review').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <p className="text-sm text-grey-600 mb-1">Total Submissions</p>
          <p className="text-2xl font-bold text-primary-600">{faqs.reduce((acc, f) => acc + (f.submissionCount || 0), 0)}</p>
        </div>
      </div>

      {/* FAQs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-grey-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-grey-200">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Submissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-grey-200">
              {filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-grey-500">
                    {searchTerm ? 'No FAQs found matching your search' : 'No FAQs yet'}
                  </td>
                </tr>
              ) : (
                filteredFaqs.map((faq) => (
                  <tr
                    key={faq.id}
                    className="hover:bg-grey-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <div className="text-sm font-medium text-grey-800">{faq.question}</div>
                        {faq.answer && (
                          <div className="text-sm text-grey-500 mt-1 line-clamp-2">{faq.answer}</div>
                        )}
                        {faq.status === 'published' && faq.approvedBy && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-success">
                            <CheckCircle className="h-3 w-3" />
                            Approved by {faq.approvedBy}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(faq.status)}`}>
                        {STATUS_OPTIONS.find(s => s.id === faq.status)?.name || faq.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-grey-400" />
                        <span className="text-sm font-medium text-grey-800">{faq.submissionCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                      {faq.lastUpdatedAt ? formatDate(faq.lastUpdatedAt) : formatDate(faq.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEditClick(faq)}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add FAQ Modal */}
      {editingFaq && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-grey-200">
              <h2 className="text-xl font-semibold text-grey-800">
                {editingFaq.id ? 'Edit FAQ' : 'Add New FAQ'}
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
              <div className={`grid grid-cols-1 ${editingFaq.id ? 'lg:grid-cols-2' : ''} gap-6`}>
                {/* Left Column - FAQ Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-grey-800 mb-4">Master FAQ Answer</h3>

                  {/* Question */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Question *
                    </label>
                    <input
                      type="text"
                      value={editingFaq.question}
                      onChange={(e) => updateField('question', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                      placeholder="Enter the question..."
                    />
                  </div>

                  {/* Answer */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Approved Master Answer
                    </label>
                    <textarea
                      value={editingFaq.answer || ''}
                      onChange={(e) => updateField('answer', e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                      placeholder="Enter the official approved answer..."
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingFaq.category || ''}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                      placeholder="e.g., Products, Services, Policies"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-grey-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editingFaq.status}
                      onChange={(e) => updateField('status', e.target.value)}
                      className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                    >
                      {STATUS_OPTIONS.map(status => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column - Submission History (only show for existing FAQs) */}
                {editingFaq.id && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-grey-800">
                        Submission History ({submissions.length})
                      </h3>
                      <button
                        onClick={() => setShowAddSubmission(!showAddSubmission)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        Add Submission
                      </button>
                    </div>

                    {/* Add Submission Form */}
                    {showAddSubmission && (
                      <div className="bg-grey-50 rounded-lg p-4 mb-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-grey-700 mb-1">
                            Question Text *
                          </label>
                          <textarea
                            value={newSubmission.questionText}
                            onChange={(e) => setNewSubmission({ ...newSubmission, questionText: e.target.value })}
                            rows={2}
                            placeholder="How did the customer ask this question?"
                            className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-grey-800 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-grey-700 mb-1">
                              Source *
                            </label>
                            <select
                              value={newSubmission.source}
                              onChange={(e) => setNewSubmission({ ...newSubmission, source: e.target.value })}
                              className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-grey-800 text-sm"
                            >
                              {SOURCE_OPTIONS.map(source => (
                                <option key={source.id} value={source.id}>{source.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-grey-700 mb-1">
                              Date Asked
                            </label>
                            <input
                              type="date"
                              value={newSubmission.askedAt}
                              onChange={(e) => setNewSubmission({ ...newSubmission, askedAt: e.target.value })}
                              className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-grey-800 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-grey-700 mb-1">
                            Asked By
                          </label>
                          <input
                            type="text"
                            value={newSubmission.askedBy}
                            onChange={(e) => setNewSubmission({ ...newSubmission, askedBy: e.target.value })}
                            placeholder="Customer name or identifier"
                            className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-grey-800 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-grey-700 mb-1">
                            Source Details / Notes
                          </label>
                          <input
                            type="text"
                            value={newSubmission.sourceDetails}
                            onChange={(e) => setNewSubmission({ ...newSubmission, sourceDetails: e.target.value })}
                            placeholder="e.g., Instagram DM, Gmail"
                            className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-grey-800 text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddSubmission}
                            className="flex-1 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                          >
                            Add Submission
                          </button>
                          <button
                            onClick={() => setShowAddSubmission(false)}
                            className="px-3 py-2 bg-grey-200 text-grey-700 rounded-lg hover:bg-grey-300 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Submissions List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {!Array.isArray(submissions) || submissions.length === 0 ? (
                        <div className="text-center py-8 text-grey-500 text-sm">
                          No submissions yet
                        </div>
                      ) : (
                        submissions.map((submission) => {
                          const sourceInfo = getSourceIcon(submission.source);
                          const SourceIcon = sourceInfo.icon;

                          return (
                            <div key={submission.id} className="bg-grey-50 rounded-lg p-4 border border-grey-200">
                              <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 p-2 rounded-lg ${sourceInfo.color}`}>
                                  <SourceIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-grey-700 uppercase">
                                      {sourceInfo.name}
                                    </span>
                                    <span className="text-xs text-grey-500 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(submission.askedAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-grey-800 mb-1">
                                    &ldquo;{submission.questionText}&rdquo;
                                  </p>
                                  {submission.askedBy && (
                                    <p className="text-xs text-grey-600">
                                      Asked by: {submission.askedBy}
                                    </p>
                                  )}
                                  {submission.sourceDetails && (
                                    <p className="text-xs text-grey-500 mt-1">
                                      {submission.sourceDetails}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
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
