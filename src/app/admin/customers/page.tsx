'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Customer, UserRole } from '@/types/index';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  Search,
  Download,
  MoreVertical,
  Ban,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Edit2,
  MapPin,
  Mail,
  User as UserIcon,
  Filter,
  ShieldHalf,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';

export default function AdminManagementPage() {
  const supabase = createClient();
  const { user } = useUser();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<Partial<Customer> | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch current user details for role check
  // Actually useUser hook already provides basic info, but we need role from DB "customers" table or metadata
  // The useUser hook we made fetches profile from 'users' table or similar?
  // Let's assume useUser returns { user, profile } where profile has role.
  // But wait, the previous code fetched `currentCustomer` from `customers` collection.

  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      if (user) {
        const { data } = await supabase.from('customers').select('*').eq('id', user.id).single();
        if (data) setCurrentCustomer(data as Customer);
      }

      const { data: users } = await supabase.from('customers').select('*');
      if (users) setAllUsers(users as Customer[]);
      setIsLoading(false);
    }
    init();
  }, [user]);

  // Owners and Special Admins have full access
  const isOwner = currentCustomer?.role === 'owner' || user?.email === 'hk8913114@gmail.com';

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(u => {
      const matchesSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [allUsers, searchQuery, roleFilter]);

  const handleUpdateUser = async (userId: string, updates: Partial<Customer>) => {
    if (!isOwner) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only the Owner can modify users." });
      return;
    }

    const { error } = await supabase.from('customers').update(updates).eq('id', userId);

    if (error) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
      return;
    }

    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    toast({ title: "User Updated", description: "The changes have been applied to the account." });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser?.id) {
      handleUpdateUser(editingUser.id, editingUser);
      setIsEditDialogOpen(false);
      setEditingUser(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!isOwner) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only the Owner can change roles." });
      return;
    }

    if (newRole === 'owner') {
      toast({ variant: "destructive", title: "Restricted", description: "Ownership transfer is not available via UI." });
      return;
    }

    try {
      // Determine endpoint based on target role
      // If ensuring 'store admin', use promote. If 'user', use demote.
      const endpoint = newRole === 'store admin' ? 'promote' : 'demote';

      const response = await fetch(`/api/users/${userId}/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Changed via Admin Dashboard' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast({ title: "Role Updated", description: `User is now a ${newRole}` });
    } catch (error) {
      console.error('Role update error:', error);
      toast({ variant: "destructive", title: "Error", description: "Could not update user role." });
    }
  };

  const toggleBan = async (targetUser: Customer) => {
    try {
      const isBanned = !!targetUser.is_banned;

      const response = await fetch(`/api/users/${targetUser.id}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banned: !isBanned,
          reason: !isBanned ? 'Banned via Admin Dashboard' : 'Unbanned via Admin Dashboard'
        }),
      });

      if (!response.ok) throw new Error('Failed to update ban status');

      // Update local state
      // Note: backend sets is_banned and banUntil/banned_at
      setAllUsers(prev => prev.map(u => {
        if (u.id === targetUser.id) {
          // Simplified update for UI feedback
          const now = new Date();
          const future = new Date(); future.setFullYear(future.getFullYear() + 10);
          return {
            ...u,
            is_banned: !isBanned,
            banUntil: !isBanned ? future.toISOString() : undefined
          };
        }
        return u;
      }));

      toast({
        title: !isBanned ? "User Banned" : "User Unbanned",
        description: `User access has been ${!isBanned ? 'restricted' : 'restored'}.`
      });

    } catch (error) {
      console.error('Ban error:', error);
      toast({ variant: "destructive", title: "Error", description: "Could not update ban status." });
    }
  };

  const handleExportCSV = () => {
    if (!allUsers || allUsers.length === 0) return;
    const headers = ['id', 'email', 'firstName', 'lastName', 'username', 'role', 'isVerified', 'address', 'phoneNumber'];
    const csvRows = [headers.join(',')];

    allUsers.forEach(u => {
      const values = [
        u.id,
        u.email,
        u.firstName,
        u.lastName,
        u.username || '',
        u.role,
        u.isVerified || false,
        `"${(u.address || '').replace(/"/g, '""')}"`,
        u.phoneNumber || ''
      ];
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vridhira-users-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-secondary">User Command Center</h1>
          <p className="text-muted-foreground">Manage marketplace identity, roles, and administrative access.</p>
        </div>
        <Button variant="outline" className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={handleExportCSV}>
          <Download className="h-4 w-4" /> Export Ledger (CSV)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-3xl shadow-sm border">
        <div className="md:col-span-7 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            className="pl-10 h-12 rounded-2xl border-none shadow-none focus-visible:ring-1"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:col-span-5 flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-12 rounded-2xl bg-muted/30 border-none"><SelectValue placeholder="Filter by Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">Verified Users</SelectItem>
              <SelectItem value="store admin">Store Admins</SelectItem>
              <SelectItem value="owner">Platform Owners</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center px-4 bg-primary/5 rounded-2xl border border-primary/10">
            <span className="text-xs font-bold text-primary uppercase tracking-tighter whitespace-nowrap">{filteredUsers.length} total</span>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="px-8 h-14 font-bold">Member Details</TableHead>
              <TableHead className="h-14 font-bold">Access Role</TableHead>
              <TableHead className="h-14 font-bold">Identity Status</TableHead>
              <TableHead className="h-14 font-bold">Primary Address</TableHead>
              <TableHead className="text-right px-8 h-14 font-bold">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => {
              const isBanned = !!u.is_banned;
              return (
                <TableRow key={u.id} className="hover:bg-muted/5 transition-colors border-b last:border-0">
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-secondary text-lg">{u.firstName} {u.lastName}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {u.email}</span>
                      {u.username && <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">@{u.username}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={u.role} onValueChange={(val) => handleRoleChange(u.id, val as UserRole)}>
                      <SelectTrigger className="w-36 h-9 rounded-xl text-xs font-bold border-none bg-muted/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="store admin">Store Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {isBanned ? (
                        <Badge variant="destructive" className="w-fit gap-1"><ShieldAlert className="h-3 w-3" /> Banned</Badge>
                      ) : u.isVerified ? (
                        <Badge className="bg-green-100 text-green-700 w-fit border-none gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>
                      ) : (
                        <Badge variant="outline" className="w-fit text-muted-foreground gap-1"><ShieldHalf className="h-3 w-3" /> Pending</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">{u.address || 'No address on file.'}</p>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl w-64 p-2 shadow-2xl border-none">
                        <DropdownMenuLabel className="font-headline text-lg px-3">Identity Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 gap-2" onClick={() => { setEditingUser(u); setIsEditDialogOpen(true); }}>
                          <Edit2 className="h-4 w-4" /> Edit Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 gap-2" onClick={() => handleUpdateUser(u.id, { isVerified: !u.isVerified })}>
                          <ShieldCheck className="h-4 w-4" /> {u.isVerified ? 'Revoke Certification' : 'Certify Identity'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={cn("rounded-xl cursor-pointer py-2 px-3 gap-2 font-bold", isBanned ? "text-green-600" : "text-destructive")}
                          onClick={() => toggleBan(u)}
                        >
                          <Ban className="h-4 w-4" /> {isBanned ? 'Unban Account' : 'Restrict (Ban) User'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic">
                  <UserIcon className="h-12 w-12 mx-auto opacity-10 mb-4" />
                  No users found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Full Profile Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Edit User Profile</DialogTitle>
            <DialogDescription>Modify core identity and delivery data for this member.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={editingUser?.firstName || ''} onChange={e => setEditingUser({ ...editingUser!, firstName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={editingUser?.lastName || ''} onChange={e => setEditingUser({ ...editingUser!, lastName: e.target.value })} /></div>
              <div className="space-y-2 col-span-2"><Label>Email Address</Label><Input value={editingUser?.email || ''} onChange={e => setEditingUser({ ...editingUser!, email: e.target.value })} /></div>
              <div className="space-y-2 col-span-2"><Label>Username</Label><Input value={editingUser?.username || ''} onChange={e => setEditingUser({ ...editingUser!, username: e.target.value })} placeholder="@heritage_member" /></div>
              <div className="space-y-2 col-span-2"><Label>Shipping Address</Label><Textarea value={editingUser?.address || ''} onChange={e => setEditingUser({ ...editingUser!, address: e.target.value })} className="min-h-[100px] rounded-2xl" /></div>
              <div className="space-y-2"><Label>Phone Number</Label><Input value={editingUser?.phoneNumber || ''} onChange={e => setEditingUser({ ...editingUser!, phoneNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>Role Access</Label>
                <Select value={editingUser?.role} onValueChange={val => setEditingUser({ ...editingUser!, role: val as UserRole })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="store admin">Store Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-secondary text-white h-12 rounded-2xl">Save Platform Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
