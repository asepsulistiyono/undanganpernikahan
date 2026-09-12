import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { AdminUser } from '../types';
import {
  LogOut, Users, Search, Plus, Trash2, Edit3, Check, X, Shield, ShieldOff,
  Key, Download, Upload, BarChart3, Activity, UserCheck, UserX, Copy,
  ChevronLeft, ChevronRight, Filter, RefreshCw, Eye, EyeOff
} from 'lucide-react';

interface Props {
  onLogout: () => void;
}

export default function SuperAdminDashboard({ onLogout }: Props) {
  const users = useStore(s => s.users);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'super-admin' | 'user'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);

  // Form State
  const [newUser, setNewUser] = useState<{
    username: string;
    password: string;
    displayName: string;
    role: 'user' | 'super-admin';
  }>({
    username: '',
    password: '',
    displayName: '',
    role: 'user'
  });
  const [resetPassword, setResetPassword] = useState('');
  const [bulkImportText, setBulkImportText] = useState('');

  // Filtered and paginated users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.displayName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && user.isActive) ||
                           (statusFilter === 'inactive' && !user.isActive);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Statistics
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
    superAdmins: users.filter(u => u.role === 'super-admin').length,
    regularUsers: users.filter(u => u.role === 'user').length
  }), [users]);

  // Handlers
  const handleAddUser = () => {
    try {
      if (!newUser.username || !newUser.password || !newUser.displayName) {
        alert('Username, password, dan display name harus diisi');
        return;
      }
      const { createUser } = useStore.getState();
      const success = createUser({
        username: newUser.username,
        password: newUser.password,
        displayName: newUser.displayName,
        role: newUser.role
      });
      if (success) {
        setNewUser({ username: '', password: '', displayName: '', role: 'user' });
        setShowAddModal(false);
        alert('User berhasil ditambahkan!');
      } else {
        alert('Username sudah digunakan');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Terjadi kesalahan saat menambahkan user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    const { updateUser } = useStore.getState();
    updateUser(editingUser.username, {
      displayName: editingUser.displayName,
      role: editingUser.role
    });
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleResetPassword = () => {
    if (!resetPasswordUser || !resetPassword) return;
    const { resetUserPassword } = useStore.getState();
    resetUserPassword(resetPasswordUser.username, resetPassword);
    setResetPassword('');
    setShowResetPasswordModal(false);
    setResetPasswordUser(null);
  };

  const handleToggleActive = (username: string) => {
    const { toggleUserActive } = useStore.getState();
    toggleUserActive(username);
  };

  const handleDeleteUser = (username: string) => {
    if (username === 'admin') {
      alert('Tidak dapat menghapus super admin utama');
      return;
    }
    if (confirm(`Hapus user "${username}"? Semua data undangan akan dihapus.`)) {
      const { deleteUser } = useStore.getState();
      deleteUser(username);
    }
  };

  const handleSelectUser = (username: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(username)) {
      newSelected.delete(username);
    } else {
      newSelected.add(username);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.username)));
    }
  };

  const handleBulkDelete = () => {
    const selected = Array.from(selectedUsers);
    if (selected.includes('admin')) {
      alert('Tidak dapat menghapus super admin utama');
      return;
    }
    if (confirm(`Hapus ${selected.length} user yang dipilih?`)) {
      const { deleteUser } = useStore.getState();
      selected.forEach(username => deleteUser(username));
      setSelectedUsers(new Set());
    }
  };

  const handleBulkActivate = () => {
    const { toggleUserActive } = useStore.getState();
    Array.from(selectedUsers).forEach(username => {
      const user = users.find(u => u.username === username);
      if (user && !user.isActive) {
        toggleUserActive(username);
      }
    });
    setSelectedUsers(new Set());
  };

  const handleBulkDeactivate = () => {
    const { toggleUserActive } = useStore.getState();
    Array.from(selectedUsers).forEach(username => {
      const user = users.find(u => u.username === username);
      if (user && user.isActive) {
        toggleUserActive(username);
      }
    });
    setSelectedUsers(new Set());
  };

  const handleBulkImport = () => {
    const lines = bulkImportText.split('\n').filter(l => l.trim());
    let successCount = 0;
    let failCount = 0;
    const { createUser } = useStore.getState();

    lines.forEach(line => {
      const parts = line.split(/[,;\t]/).map(p => p.trim());
      if (parts.length >= 3) {
        const success = createUser({
          username: parts[0],
          password: parts[1],
          displayName: parts[2],
          role: 'user'
        });
        if (success) successCount++;
        else failCount++;
      }
    });

    alert(`Import selesai: ${successCount} berhasil, ${failCount} gagal`);
    setBulkImportText('');
    setShowBulkImportModal(false);
  };

  const handleExportUsers = () => {
    const csv = ['Username,Password,DisplayName,Role,Status,CreatedAt'];
    users.forEach(u => {
      csv.push(`${u.username},${u.password},${u.displayName},${u.role},${u.isActive ? 'Active' : 'Inactive'},${u.createdAt}`);
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const copyUserLink = (username: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?user=${username}`;
    
    // Fallback untuk mobile yang tidak support clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert(`Link berhasil disalin:\n${url}`);
      }).catch(() => {
        // Fallback: buat textarea untuk copy manual
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          alert(`Link berhasil disalin:\n${url}`);
        } catch (err) {
          alert(`Link undangan:\n${url}`);
        }
        document.body.removeChild(textArea);
      });
    } else {
      // Fallback untuk browser lama
      alert(`Link undangan:\n${url}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Super Admin Dashboard</h1>
              <p className="text-xs text-gray-400">Kelola semua user</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#/admin"
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </a>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-gray-400">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
                <p className="text-xs text-gray-400">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.inactive}</p>
                <p className="text-xs text-gray-400">Inactive</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.superAdmins}</p>
                <p className="text-xs text-gray-400">Super Admins</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.regularUsers}</p>
                <p className="text-xs text-gray-400">Regular Users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {selectedUsers.size > 0 && (
            <>
              <button
                onClick={handleBulkActivate}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition"
              >
                <Check className="w-4 h-4" />
                Activate ({selectedUsers.size})
              </button>
              <button
                onClick={handleBulkDeactivate}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition"
              >
                <X className="w-4 h-4" />
                Deactivate ({selectedUsers.size})
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedUsers.size})
              </button>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username or display name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Roles</option>
              <option value="super-admin">Super Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
              <option value={200}>200 per page</option>
            </select>
          </div>
          <div className="mt-3 text-sm text-gray-400">
            Showing {paginatedUsers.length} of {filteredUsers.length} users
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Display Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Created</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedUsers.map(user => (
                  <tr key={user.username} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.username)}
                        onChange={() => handleSelectUser(user.username)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{user.username}</span>
                        {user.role === 'super-admin' && (
                          <Shield className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{user.displayName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'super-admin' 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isActive 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyUserLink(user.username)}
                          className="p-1.5 hover:bg-white/10 rounded transition"
                          title="Copy invitation link"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user.username)}
                          className="p-1.5 hover:bg-white/10 rounded transition"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <EyeOff className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-green-400" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-1.5 hover:bg-white/10 rounded transition"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => {
                            setResetPasswordUser(user);
                            setShowResetPasswordModal(true);
                          }}
                          className="p-1.5 hover:bg-white/10 rounded transition"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4 text-purple-400" />
                        </button>
                        {user.username !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.username)}
                            className="p-1.5 hover:bg-white/10 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-black/40 border-t border-white/10 px-4 py-3 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded transition ${
                          currentPage === pageNum
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="user">User</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  value={editingUser.username}
                  disabled
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingUser.displayName}
                  onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="user">User</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && resetPasswordUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Reset Password</h2>
            <p className="text-gray-400 mb-4">
              Reset password for user <span className="text-white font-medium">{resetPasswordUser.username}</span>
            </p>
            <div>
              <label className="block text-sm text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Bulk Import Users</h2>
            <p className="text-gray-400 mb-4 text-sm">
              Format: username,password,displayName (satu user per baris)
            </p>
            <textarea
              value={bulkImportText}
              onChange={(e) => setBulkImportText(e.target.value)}
              placeholder="user1,password1,User One&#10;user2,password2,User Two&#10;user3,password3,User Three"
              rows={10}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 font-mono text-sm"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBulkImportModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition"
              >
                Import Users
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
