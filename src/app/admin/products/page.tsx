
'use client';

import { useState, useMemo, useRef } from 'react';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Product, CATEGORIES, Category, ProductType } from '@/lib/mock-data';
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Loader2, 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ProductsManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const productsQuery = useMemoFirebase(() => query(collection(db, 'products'), orderBy('title', 'asc')), [db]);
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.title || !editingProduct?.price) return;

    const id = editingProduct.id || doc(collection(db, 'products')).id;
    const productRef = doc(db, 'products', id);
    
    const finalData: Product = {
      ...editingProduct as Product,
      id,
      price: Number(editingProduct.price),
      stock: Number(editingProduct.stock || 0),
      type: (editingProduct.type || 'single') as ProductType,
      category: (editingProduct.category || 'Decor') as Category,
    };

    setDocumentNonBlocking(productRef, finalData, { merge: true });
    
    toast({
      title: editingProduct.id ? "Product Updated" : "Product Created",
      description: `${finalData.title} has been saved to the heritage catalog.`,
    });
    
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this piece from the catalog?')) {
      const productRef = doc(db, 'products', id);
      deleteDocumentNonBlocking(productRef);
      toast({
        variant: "destructive",
        title: "Product Removed",
        description: "The item has been deleted from the database.",
      });
    }
  };

  const handleExportCSV = () => {
    if (!products || products.length === 0) return;

    const headers = ['id', 'title', 'price', 'stock', 'category', 'description', 'imageUrl', 'type'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => [
        p.id,
        `"${p.title.replace(/"/g, '""')}"`,
        p.price,
        p.stock,
        p.category,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        `"${p.imageUrl}"`,
        p.type
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vridhira-catalog-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n');
      const headers = rows[0].split(',');
      
      let importCount = 0;
      
      rows.slice(1).forEach(row => {
        if (!row.trim()) return;
        
        // Simple CSV parser for quoted fields
        const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!values) return;

        const cleanValues = values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        const productData: any = {};
        headers.forEach((header, i) => {
          const key = header.trim();
          productData[key] = cleanValues[i];
        });

        if (productData.title) {
          const id = productData.id || doc(collection(db, 'products')).id;
          const productRef = doc(db, 'products', id);
          
          setDocumentNonBlocking(productRef, {
            ...productData,
            id,
            price: Number(productData.price || 0),
            stock: Number(productData.stock || 0),
          }, { merge: true });
          importCount++;
        }
      });

      toast({
        title: "Import Successful",
        description: `Imported/Updated ${importCount} products in the catalog.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-secondary">Heritage Inventory</h1>
          <p className="text-muted-foreground italic">Manage your handcrafted treasures and platform listings.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            className="hidden" 
          />
          <Button 
            variant="outline" 
            className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 text-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full gap-2 border-primary/20 hover:bg-primary/5 text-primary"
            onClick={handleExportCSV}
          >
            <Download className="h-4 w-4" />
            Export Catalog
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="rounded-full bg-primary text-white hover:bg-primary/90 shadow-lg gap-2"
                onClick={() => setEditingProduct({ type: 'single', category: 'Decor', stock: 0, price: 0 })}
              >
                <Plus className="h-4 w-4" />
                Add New Piece
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">
                  {editingProduct?.id ? 'Edit Heritage Piece' : 'Catalogue New Masterpiece'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground italic">Fill in the details for the marketplace listing.</p>
              </DialogHeader>
              <form onSubmit={handleSaveProduct} className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="title">Product Title</Label>
                    <Input 
                      id="title" 
                      value={editingProduct?.title || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                      placeholder="e.g., Hand-Painted Terracotta Vase"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={editingProduct?.category} 
                      onValueChange={(val) => setEditingProduct({ ...editingProduct, category: val as Category })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Listing Type</Label>
                    <Select 
                      value={editingProduct?.type} 
                      onValueChange={(val) => setEditingProduct({ ...editingProduct, type: val as ProductType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Item</SelectItem>
                        <SelectItem value="variable">Variable (Sizes/Colors)</SelectItem>
                        <SelectItem value="group">Group Set</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      step="0.01"
                      value={editingProduct?.price || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Inventory Count</Label>
                    <Input 
                      id="stock" 
                      type="number" 
                      value={editingProduct?.stock || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input 
                      id="imageUrl" 
                      value={editingProduct?.imageUrl || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                      placeholder="https://picsum.photos/..."
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Heritage Story (Description)</Label>
                    <Textarea 
                      id="description" 
                      className="min-h-[100px]"
                      value={editingProduct?.description || ''} 
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      placeholder="Tell the story of this craft..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-secondary text-white rounded-xl px-8">Save Listing</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search catalog by name or category..." 
            className="pl-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center text-sm font-medium text-muted-foreground">
          <FileSpreadsheet className="h-4 w-4" />
          {filteredProducts.length} Pieces found
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="px-8 font-bold">Item</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Price</TableHead>
                  <TableHead className="font-bold">Stock</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="text-right px-8 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/10 group transition-colors">
                    <TableCell className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border shrink-0">
                          <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-secondary truncate">{product.title}</p>
                          <p className="text-xs text-muted-foreground font-code truncate opacity-60">#{product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full px-3 py-0.5 border-primary/20 text-primary bg-primary/5">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-secondary">${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={product.stock < 5 ? 'text-destructive font-black' : 'font-medium'}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize text-xs font-medium text-muted-foreground">{product.type}</TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-xl font-headline font-bold text-muted-foreground">Your catalog is empty.</p>
                      <p className="text-sm text-muted-foreground">Start by adding a piece or importing a CSV file.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
