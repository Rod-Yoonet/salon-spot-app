'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Shield, Users as UsersIcon, Mail, Crown } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  imageUrl?: string;
  createdAt: string;
}

export default function UsersPage() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = currentUser?.publicMetadata?.role === 'admin' ||
                  currentUser?.emailAddresses[0]?.emailAddress === 'ben@yoonet.io';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        await fetchUsers();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-lg text-grey-600">Loading users...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="h-16 w-16 text-grey-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-grey-700 mb-2">Access Denied</h2>
            <p className="text-grey-500">Only admins can access user management</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-grey-800">User Management</h1>
        <p className="text-sm text-grey-500 mt-1">Manage user roles and permissions</p>
      </div>

      {/* Info Box */}
      <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-primary-900 mb-1">Admin Privileges</h3>
            <p className="text-sm text-primary-700">
              As an admin, you can promote team members to admin status. Admins have full access to all features including user management.
            </p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-grey-200">
        <div className="px-6 py-4 border-b border-grey-200">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-grey-600" />
            <h2 className="text-lg font-semibold text-grey-800">
              All Users ({users.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-grey-50 border-b border-grey-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-grey-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-200">
              {users.map((user) => {
                const isBen = user.email === 'ben@yoonet.io';
                const isCurrentUser = user.id === currentUser?.id;

                return (
                  <tr key={user.id} className="hover:bg-grey-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt={user.name}
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-semibold text-sm">
                              {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-grey-800">
                              {user.name || 'Unnamed User'}
                            </p>
                            {isBen && (
                              <Crown className="h-4 w-4 text-warning" aria-label="Platform Owner" />
                            )}
                            {isCurrentUser && (
                              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-grey-600">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          user.role === 'admin'
                            ? 'bg-error/10 text-error'
                            : 'bg-grey-100 text-grey-700'
                        }`}
                      >
                        {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-grey-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {isBen ? (
                        <span className="text-xs text-grey-500">Platform Owner</span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={updating === user.id}
                          className={`px-3 py-1.5 border border-grey-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            updating === user.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'
                          }`}
                        >
                          <option value="team">Team Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="h-16 w-16 text-grey-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-grey-700 mb-2">No users yet</h3>
            <p className="text-sm text-grey-500">Users will appear here once they sign up</p>
          </div>
        )}
      </div>

      {/* Role Descriptions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-grey-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-error" />
            </div>
            <h3 className="font-semibold text-grey-800">Admin</h3>
          </div>
          <p className="text-sm text-grey-600">
            Full access to all features including user management, settings, and the ability to promote other users to admin.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-grey-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-grey-100 flex items-center justify-center">
              <UsersIcon className="h-4 w-4 text-grey-600" />
            </div>
            <h3 className="font-semibold text-grey-800">Team Member</h3>
          </div>
          <p className="text-sm text-grey-600">
            Access to all core features including tasks, customers, pipeline, training, FAQs, and suppliers.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
