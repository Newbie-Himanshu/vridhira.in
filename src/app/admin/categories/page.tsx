
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
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
  DialogClose
} from '@/components/ui/dialog';
import { 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Layers, 
  CheckCircle2, 
  XCircle,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CategoriesPage() {
  const db = useFirestore();
  const { toast } = useToast();

  const categoriesQuery = useMemoFirebase(() => query(collection(db, 'categories'), orderBy('name', 'asc')), [db]);
  const { data: categories, isLoading } = useCollection<any>(categoriesQuery);

  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;

    const id = editingCategory.id || doc(collection(db, 'categories')).id;
    const catRef = doc(db, 'categories', id);
    
    const finalData = {
      ...editingCategory,
      id,
      isActive: editingCategory.isActive ?? true
    };

    setDocumentNonBlocking(catRef, finalData, { merge: true });
    
    toast({
      title: editingCategory.id ? "Category Updated" : "New Category Added",
      description: `"${finalData.name}" is now available in the taxonomy.`
    });
    
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this category? Products assigned to it will remain, but the category filter may break.')) {
      deleteDocumentNonBlocking(doc(db, 'categories', id));
      toast({ variant: "destructive", title: "Category Removed" });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-secondary flex items-center gap-3">
            <Tag className="h-8 w-8 text-primary" />
            Marketplace Taxonomy
          </h1>
          <p className="text-muted-foreground">Manage the classification system for all handcrafted treasures.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="rounded-full bg-primary text-white shadow-lg gap-2"
              onClick={() => setEditingCategory({ name: '', description: '', isActive: true })}
            >
              <Plus className="h-4 w-4" />
              Define New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Category Definition</DialogTitle>
              <p className="text-sm text-muted-foreground">Set the rules for this product grouping.</p>
            </DialogHeader>
            <form onSubmit={handleSaveCategory} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input 
                  value={editingCategory?.name || ''} 
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g., Sustainable Textiles"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Public Description</Label>
                <Textarea 
                  value={editingCategory?.description || ''} 
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Tell customers what this collection represents..."
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                <div className="space-y-0.5">
                  <Label>Active Status</Label>
                  <p className="text-xs text-muted-foreground">Visible in filters and navigation.</p>
                </div>
                <Button 
                  type="button"
                  variant={editingCategory?.isActive ? "default" : "outline"}
                  onClick={() => setEditingCategory({ ...editingCategory, isActive: !editingCategory?.isActive })}
                  className="rounded-full h-8"
                >
                  {editingCategory?.isActive ? "Public" : "Hidden"}
                </Button>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-secondary text-white h-12 rounded-xl">Save Category</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="px-8 font-bold">Category</TableHead>
                <TableHead className="font-bold">Description</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="text-right px-8 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories?.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-muted/10 transition-colors border-b last:border-0">
                  <TableCell className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Layers className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-secondary">{cat.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm text-muted-foreground line-clamp-1">{cat.description || 'No description provided.'}</p>
                  </TableCell>
                  <TableCell>
                    {cat.isActive ? (
                      <Badge className="bg-green-100 text-green-700 border-none gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground gap-1">
                        <XCircle className="h-3 w-3" /> Hidden
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!categories || categories.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20">
                    <Sparkles className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-xl font-headline font-bold text-muted-foreground">No Categories Defined</p>
                    <p className="text-sm text-muted-foreground">Start by defining how products are grouped.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
