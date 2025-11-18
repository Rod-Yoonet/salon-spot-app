'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Mail, Phone, MapPin, Building2, X, Save } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Customer } from '@/types';
import DashboardLayout from '@/components/DashboardLayout';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const handleEditClick = (customer: Customer) => {
    setEditingCustomer({ ...customer });
  };

  const handleCloseModal = () => {
    setEditingCustomer(null);
  };

  const handleSave = async () => {
    if (!editingCustomer) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCustomer),
      });

      if (res.ok) {
        await fetchCustomers();
        setEditingCustomer(null);
      } else {
        console.error('Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Customer, value: any) => {
    if (editingCustomer) {
      setEditingCustomer({ ...editingCustomer, [field]: value });
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-grey-600">Loading customers...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-grey-800">Customer Management</h1>
        <p className="text-sm text-grey-500 mt-1">Manage your customer relationships and contacts</p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-grey-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800 placeholder-grey-400"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
          <Plus className="h-5 w-5" />
          Add Customer
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <p className="text-sm text-grey-600 mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-grey-800">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <p className="text-sm text-grey-600 mb-1">From Ads</p>
          <p className="text-2xl font-bold text-grey-800">
            {customers.filter(c => c.source === 'ads').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <p className="text-sm text-grey-600 mb-1">Organic</p>
          <p className="text-2xl font-bold text-grey-800">
            {customers.filter(c => c.source === 'organic').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-grey-200 p-6">
          <p className="text-sm text-grey-600 mb-1">Referrals</p>
          <p className="text-2xl font-bold text-grey-800">
            {customers.filter(c => c.source === 'referral').length}
          </p>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl shadow-sm border border-grey-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-grey-200">
            <thead className="bg-grey-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Est. Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  First Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-grey-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-grey-500">
                    {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => handleEditClick(customer)}
                    className="hover:bg-grey-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {customer.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-grey-800">{customer.name}</div>
                          {customer.company && (
                            <div className="text-sm text-grey-500 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {customer.company}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {customer.email && (
                          <div className="text-sm text-grey-800 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-grey-400" />
                            {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="text-sm text-grey-500 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-grey-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.location && (
                        <div className="text-sm text-grey-800 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-grey-400" />
                          {customer.location}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.source === 'ads' ? 'bg-primary-100 text-primary-800' :
                        customer.source === 'organic' ? 'bg-success/10 text-success' :
                        customer.source === 'referral' ? 'bg-info/10 text-info' :
                        customer.source === 'social' ? 'bg-warning/10 text-warning' :
                        'bg-grey-100 text-grey-800'
                      }`}>
                        {customer.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-800">
                      {customer.estimatedAnnualBudget ? formatCurrency(customer.estimatedAnnualBudget) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-500">
                      {formatDate(customer.firstContactDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-grey-200">
              <h2 className="text-xl font-semibold text-grey-800">Edit Customer</h2>
              <button
                onClick={handleCloseModal}
                className="text-grey-400 hover:text-grey-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editingCustomer.email || ''}
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
                    value={editingCustomer.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.company || ''}
                    onChange={(e) => updateField('company', e.target.value)}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editingCustomer.website || ''}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                  />
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Business Type
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.businessType || ''}
                    onChange={(e) => updateField('businessType', e.target.value)}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingCustomer.location || ''}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Source
                  </label>
                  <select
                    value={editingCustomer.source}
                    onChange={(e) => updateField('source', e.target.value)}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                  >
                    <option value="organic">Organic</option>
                    <option value="ads">Ads</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social</option>
                    <option value="outreach">Outreach</option>
                  </select>
                </div>

                {/* Estimated Annual Budget */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Estimated Annual Budget ($)
                  </label>
                  <input
                    type="number"
                    value={editingCustomer.estimatedAnnualBudget || ''}
                    onChange={(e) => updateField('estimatedAnnualBudget', parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                  />
                </div>

                {/* Preferred Contact */}
                <div>
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    value={editingCustomer.preferredContact || 'email'}
                    onChange={(e) => updateField('preferredContact', e.target.value)}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-grey-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editingCustomer.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-grey-800"
                    placeholder="Add any notes about this customer..."
                  />
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
