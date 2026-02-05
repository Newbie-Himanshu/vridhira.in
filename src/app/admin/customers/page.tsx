
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Customer, UserRole } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
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
  ShieldHalf
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminManagementPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<Partial<Customer> | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const currentUserRef = useMemoFirebase(() => user ? doc(db, 'customers', user.uid) : null, [db, user]);
  const { data: currentCustomer } = useDoc<Customer>(currentUserRef);
  
  const customersQuery = useMemoFirebase(() => collection(db, 'customers'), [db]);
  const { data: allUsers, isLoading } = useCollection<Customer>(customersQuery);

  const isOwner = currentCustomer?.role === 'owner';

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

  const handleUpdateUser = (userId: string, updates: Partial<Customer>) => {
    if (!isOwner) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only the Owner can modify users." });
      return;
    }
    const targetRef = doc(db, 'customers', userId);
    updateDocumentNonBlocking(targetRef, updates);
    toast({ title: "User Updated", description: "The changes have been applied to the account." });
  };

  const toggleBan = (targetUser: Customer) => {
    const isBanned = !!targetUser.banUntil && new Date(targetUser.banUntil) > new Date();
    if (isBanned) {
      handleUpdateUser(targetUser.id, { banUntil: null, failedAttempts: 0 });
    } else {
      const banDate = new Date();
      banDate.setFullYear(banDate.getFullYear() + 10);
      handleUpdateUser(targetUser.id, { banUntil: banDate.toISOString() });
    }
  };

  const handleExportCSV = () => {
    if (!allUsers || allUsers.length === 0) return;
    const headers = ['id', 'email', 'firstName', 'lastName', 'role', 'isVerified'];
    const csv = [headers.join(','), ...allUsers.map(u => [u.id, u.email, u.firstName, u.lastName, u.role, u.isVerified].join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vridhira-users.csv';
    a.click();
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-secondary">User Command Center</h1>
          <p className="text-muted-foreground">Manage marketplace identity and access levels.</p>
        </div>
        <Button variant="outline" className="rounded-full gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" /> Export Ledger
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." className="flex-1 border-none shadow-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48 rounded-xl"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="store admin">Store Admin</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="px-8">Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => {
              const isBanned = u.banUntil && new Date(u.banUntil) > new Date();
              return (
                <TableRow key={u.id} className="hover:bg-muted/5">
                  <TableCell className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-secondary">{u.firstName} {u.lastName}</span>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={u.role === 'owner' ? "bg-secondary text-white" : "bg-muted text-muted-foreground"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isBanned ? <Badge variant="destructive">Banned</Badge> : 
                     u.isVerified ? <Badge className="bg-green-100 text-green-700">Verified</Badge> : 
                     <Badge variant="outline">Unverified</Badge>}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl w-56">
                        <DropdownMenuItem className="gap-2" onClick={() => handleUpdateUser(u.id, { isVerified: !u.isVerified })}>
                          <CheckCircle2 className="h-4 w-4" /> {u.isVerified ? 'Revoke Verify' : 'Certify Identity'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className={cn("gap-2", isBanned ? "text-green-600" : "text-destructive")} onClick={() => toggleBan(u)}>
                          <Ban className="h-4 w-4" /> {isBanned ? 'Unban Account' : 'Ban Account'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
