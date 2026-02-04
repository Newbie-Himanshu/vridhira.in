
'use client';

import { useFirestore, useCollection, useUser, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Customer } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck, ShieldAlert, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AdminManagementPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const currentUserRef = useMemoFirebase(() => user ? doc(db, 'customers', user.uid) : null, [db, user]);
  const { data: currentCustomer } = useDoc<Customer>(currentUserRef);
  
  const customersQuery = useMemoFirebase(() => collection(db, 'customers'), [db]);
  const { data: allUsers, isLoading } = useCollection<Customer>(customersQuery);

  const isOwner = currentCustomer?.role === 'owner';

  const toggleAdminRole = (targetUser: Customer) => {
    if (!isOwner) {
      toast({ variant: "destructive", title: "Unauthorized", description: "Only the Owner can promote or demote admins." });
      return;
    }

    if (targetUser.role === 'owner') {
      toast({ variant: "destructive", title: "Error", description: "Owner role cannot be modified." });
      return;
    }

    const newRole = targetUser.role === 'store admin' ? 'user' : 'store admin';
    const targetRef = doc(db, 'customers', targetUser.id);
    
    // Use the non-blocking helper to handle permission error emission
    updateDocumentNonBlocking(targetRef, { role: newRole });
    
    toast({ 
      title: "Role update requested", 
      description: `Attempting to set ${targetUser.firstName} as ${newRole}.` 
    });
  };

  if (isLoading) {
    return <div className="p-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-secondary">User Management</h1>
          <p className="text-muted-foreground">Manage roles and permissions across the marketplace.</p>
        </div>
        {isOwner && (
          <Badge className="bg-primary px-4 py-2 text-white font-bold animate-pulse-glow">Owner View</Badge>
        )}
      </div>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Active Users & Staff
          </CardTitle>
          <CardDescription>Review and manage access levels for your team.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-bold">Name</TableHead>
                <TableHead className="font-bold">Email</TableHead>
                <TableHead className="font-bold">Current Role</TableHead>
                <TableHead className="text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers?.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/20">
                  <TableCell className="font-medium">{u.firstName} {u.lastName}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      u.role === 'owner' ? "bg-secondary text-white" :
                      u.role === 'store admin' ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {u.role || 'user'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isOwner && u.role !== 'owner' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-full gap-2 border-primary/20 hover:bg-primary/5"
                        onClick={() => toggleAdminRole(u)}
                      >
                        {u.role === 'store admin' ? (
                          <><ShieldAlert className="h-4 w-4 text-destructive" /> Demote to User</>
                        ) : (
                          <><ShieldCheck className="h-4 w-4 text-primary" /> Promote to Admin</>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
