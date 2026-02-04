
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
  Filter
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
      banDate.setFullYear(banDate.getFullYear() + 10); // Persistent ban
      handleUpdateUser(targetUser.id, { banUntil: banDate.toISOString() });
    }
  };

  const handleExportCSV = () => {
    if (!allUsers || allUsers.length === 0) return;

    const headers = ['id', 'email', 'firstName', 'lastName', 'username', 'role', 'isVerified', 'address', 'phoneNumber'];
    const csvContent = [
      headers.join(','),
      ...allUsers.map(u => [
        u.id,
        u.email,
        u.firstName,
        u.lastName,
        u.username || '',
        u.role,
        u.isVerified || false,
        `"${(u.address || '').replace(/"/g, '""')}"`,
        u.phoneNumber || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vridhira-users-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-secondary">User Command Center</h1>
          <p className="text-muted-foreground">Absolute management of marketplace identity and access levels.</p>
        </div>
        <div className="flex gap-3">
          {isOwner && (
            <>
              <Button variant="outline" className="rounded-full gap-2" onClick={handleExportCSV}>
                <Download className="h-4 w-4" />
                Export Ledger
              </Button>
              <Badge className="bg-primary px-4 py-2 text-white font-bold animate-pulse-glow">Owner Access Active</Badge>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-border/50">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, or @username..." 
            className="pl-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-48 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="rounded-xl pl-10">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="store admin">Store Admin</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm font-bold text-muted-foreground px-2 whitespace-nowrap">
          {filteredUsers.length} total users
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="px-8 font-bold text-secondary">Member</TableHead>
                <TableHead className="font-bold text-secondary">Role</TableHead>
                <TableHead className="font-bold text-secondary">Verification</TableHead>
                <TableHead className="font-bold text-secondary">Status</TableHead>
                <TableHead className="text-right px-8 font-bold text-secondary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => {
                const isBanned = u.banUntil && new Date(u.banUntil) > new Date();
                // @ts-ignore - 'isHidden' is a custom property for UI management
                const isHidden = u.isHidden === true;

                return (
                  <TableRow key={u.id} className="hover:bg-muted/10 group transition-colors border-b last:border-0">
                    <TableCell className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-secondary">{u.firstName} {u.lastName}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                        {u.username && <span className="text-[10px] text-primary font-bold">@{u.username}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-none",
                        u.role === 'owner' ? "bg-secondary text-white" :
                        u.role === 'store admin' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {u.role || 'user'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.isVerified ? (
                        <div className="flex items-center gap-1.5 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-bold">Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs font-bold">Pending</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {isBanned && <Badge variant="destructive" className="h-5 text-[8px] uppercase">Banned</Badge>}
                        {isHidden && <Badge variant="secondary" className="h-5 text-[8px] uppercase bg-orange-100 text-orange-700">Hidden</Badge>}
                        {!isBanned && !isHidden && <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Active</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl">
                          <DropdownMenuLabel>Command Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer" onClick={() => {
                            setEditingUser(u);
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit2 className="h-4 w-4 text-blue-500" /> Modify Details
                          </DropdownMenuItem>

                          <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer" onClick={() => handleUpdateUser(u.id, { isVerified: !u.isVerified })}>
                            {u.isVerified ? (
                              <><XCircle className="h-4 w-4 text-orange-500" /> Revoke Verify</>
                            ) : (
                              <><CheckCircle2 className="h-4 w-4 text-green-500" /> Certify Identity</>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuItem className="rounded-xl gap-2 cursor-pointer" onClick={() => handleUpdateUser(u.id, { isHidden: !isHidden })}>
                            {isHidden ? (
                              <><Eye className="h-4 w-4 text-blue-500" /> Reveal Profile</>
                            ) : (
                              <><EyeOff className="h-4 w-4 text-gray-500" /> Mask Profile</>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />
                          
                          <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Admin Controls</DropdownMenuLabel>
                          
                          <div className="px-2 py-1.5">
                            <Select 
                              value={u.role} 
                              onValueChange={(val) => handleUpdateUser(u.id, { role: val as UserRole })}
                              disabled={u.role === 'owner' && u.id !== user?.uid} // Protect other owners
                            >
                              <SelectTrigger className="h-8 text-xs rounded-lg border-primary/20">
                                <SelectValue placeholder="Set Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="store admin">Store Admin</SelectItem>
                                <SelectItem value="owner">Owner</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className={cn("rounded-xl gap-2 cursor-pointer", isBanned ? "text-green-600" : "text-destructive")} 
                            onClick={() => toggleBan(u)}
                          >
                            <Ban className="h-4 w-4" />
                            {isBanned ? 'Lift Account Ban' : 'Restrict Account'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Full Data Manipulation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Modify User Master Record</DialogTitle>
            <p className="text-sm text-muted-foreground italic">Update secure heritage data for {editingUser?.firstName}.</p>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">First Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10"
                  value={editingUser?.firstName || ''} 
                  onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Last Name</Label>
              <Input 
                value={editingUser?.lastName || ''} 
                onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10"
                  value={editingUser?.email || ''} 
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-xs font-bold uppercase">Shipping Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-10"
                  value={editingUser?.address || ''} 
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  placeholder="No address saved"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-xl">Cancel</Button>
            </DialogClose>
            <Button 
              className="bg-secondary text-white rounded-xl px-8"
              onClick={() => {
                if (editingUser?.id) {
                  handleUpdateUser(editingUser.id, editingUser);
                  setIsEditDialogOpen(false);
                }
              }}
            >
              Commit Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
