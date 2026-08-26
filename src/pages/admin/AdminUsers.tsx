import { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/userService';

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => userService.getUsers(),
  });

  const rawUsers = data as any;
  const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers?.users || []);

  // Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      (userService as any).updateUserRole ? (userService as any).updateUserRole(userId, role) : Promise.reject('Not implemented'),
    onMutate: ({ userId }) => setMutatingId(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      alert('✅ User role updated');
    },
    onError: (err: any) => alert(err?.message || 'Failed to update role'),
    onSettled: () => setMutatingId(null),
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (userId: string) =>
      (userService as any).deleteUser ? (userService as any).deleteUser(userId) : Promise.reject('Not implemented'),
    onMutate: (userId) => setMutatingId(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      alert('✅ User deleted');
    },
    onError: (err: any) => alert(err?.message || 'Failed to delete user'),
    onSettled: () => setMutatingId(null),
  });

  const filteredUsers = users.filter((u: any) => {
    const term = searchQuery.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout title="Customer & Admin Base" subtitle="Manage registered user accounts, assign admin privileges, or delete accounts.">
      <div className="space-y-6">
        <div className="p-4 rounded-3xl bg-white border border-amber-950/10 shadow-sm flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs font-medium focus:outline-none focus:border-primary"
            />
          </div>
          <span className="text-xs font-bold text-stone-500">Total Users: {users.length}</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 size={36} className="text-primary animate-spin mx-auto mb-2" />
            <p className="text-xs text-stone-500 font-bold">Loading users...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-amber-950/10 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-100 text-[11px] font-black uppercase tracking-wider text-stone-400">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredUsers.map((u: any, idx: number) => {
                  const userId = u.id || u._id || `user-${idx}`;
                  const isAdmin = u.role === 'admin';
                  const isMutating = mutatingId === userId;

                  return (
                    <tr key={userId} className="hover:bg-amber-50/30">
                      <td className="py-4 px-6 font-bold text-stone-900">
                        {u.firstName} {u.lastName}
                        <span className="block text-[11px] font-normal text-stone-400">{u.email}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {isAdmin ? <ShieldAlert size={11} /> : <ShieldCheck size={11} />}
                          {u.role || 'customer'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-stone-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => updateRoleMutation.mutate({ userId, role: isAdmin ? 'user' : 'admin' })}
                          disabled={isMutating}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 font-bold"
                        >
                          {isAdmin ? 'Make Customer' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete user ${u.email}?`)) deleteMutation.mutate(userId);
                          }}
                          disabled={isMutating}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;