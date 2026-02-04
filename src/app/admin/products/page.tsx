
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Product, CATEGORIES, Category, ProductType, ProductVariant } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Settings2,
  Tags,
  PlusCircle,
  XCircle,
  Percent,
  DollarSign,
  ImagePlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function ProductsManagementPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  const productsQuery = useMemoFirebase(() => query(collection(db, 'products'), orderBy('title', 'asc')), [db]);
  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handlePriceChange = (field: 'price' | 'salePrice' | 'discountPercentage', value: number) => {
    if (!editingProduct) return;
    
    let updates: Partial<Product> = { [field]: value };
    const price = field === 'price' ? value : Number(editingProduct.price || 0);
    
    if (field === 'price' || field === 'salePrice') {
      const sPrice = field === 'salePrice' ? value : Number(editingProduct.salePrice || 0);
      if (price > 0 && sPrice > 0) {
        updates.discountPercentage = Math.round(((price - sPrice) / price) * 100);
      }
    } else if (field === 'discountPercentage') {
      if (price > 0 && value > 0) {
        updates.salePrice = Number((price * (1 - value / 100)).toFixed(2));
      }
    }

    setEditingProduct({ ...editingProduct, ...updates });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 800KB for the prototype."
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct({ ...editingProduct, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.title || !editingProduct?.price) return;

    const id = editingProduct.id || doc(collection(db, 'products')).id;
    const productRef = doc(db, 'products', id);
    
    const finalData: Product = {
      ...editingProduct as Product,
      id,
      price: Number(editingProduct.price),
      salePrice: editingProduct.salePrice ? Number(editingProduct.salePrice) : undefined,
      discountPercentage: editingProduct.discountPercentage ? Number(editingProduct.discountPercentage) : undefined,
      stock: Number(editingProduct.stock || 0),
      type: (editingProduct.type || 'single') as ProductType,
      category: (editingProduct.category || 'Decor') as Category,
      tags: typeof editingProduct.tags === 'string' ? (editingProduct.tags as string).split(',').map(t => t.trim()) : (editingProduct.tags || []),
    };

    setDocumentNonBlocking(productRef, finalData, { merge: true });
    
    toast({
      title: editingProduct.id ? "Product Updated" : "Product Created",
      description: `${finalData.title} has been saved to the heritage catalog.`,
    });
    
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleAddVariant = () => {
    const variants = [...(editingProduct?.variants || [])];
    variants.push({ id: Math.random().toString(36).substr(2, 9), name: '', price: editingProduct?.price || 0, stock: 0 });
    setEditingProduct({ ...editingProduct, variants });
  };

  const handleRemoveVariant = (id: string) => {
    const variants = (editingProduct?.variants || []).filter(v => v.id !== id);
    setEditingProduct({ ...editingProduct, variants });
  };

  const handleUpdateVariant = (id: string, updates: Partial<ProductVariant>) => {
    const variants = (editingProduct?.variants || []).map(v => v.id === id ? { ...v, ...updates } : v);
    setEditingProduct({ ...editingProduct, variants });
  };

  const handleAddSpec = () => {
    const specs = { ...(editingProduct?.specs || {}), '': '' };
    setEditingProduct({ ...editingProduct, specs });
  };

  const handleRemoveSpec = (key: string) => {
    const specs = { ...(editingProduct?.specs || {}) };
    delete specs[key];
    setEditingProduct({ ...editingProduct, specs });
  };

  const handleUpdateSpec = (oldKey: string, newKey: string, value: string) => {
    const specs = { ...(editingProduct?.specs || {}) };
    if (oldKey !== newKey) {
      delete specs[oldKey];
    }
    specs[newKey] = value;
    setEditingProduct({ ...editingProduct, specs });
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

    const headers = ['id', 'sku', 'brand', 'title', 'price', 'salePrice', 'discountPercentage', 'stock', 'category', 'description', 'imageUrl', 'type', 'tags'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => [
        p.id,
        p.sku || '',
        p.brand || '',
        `"${p.title.replace(/"/g, '""')}"`,
        p.price,
        p.salePrice || '',
        p.discountPercentage || '',
        p.stock,
        p.category,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        `"${p.imageUrl}"`,
        p.type,
        `"${(p.tags || []).join(',')}"`
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
            salePrice: productData.salePrice ? Number(productData.salePrice) : undefined,
            discountPercentage: productData.discountPercentage ? Number(productData.discountPercentage) : undefined,
            stock: Number(productData.stock || 0),
            tags: productData.tags ? productData.tags.split(',') : []
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
                onClick={() => setEditingProduct({ type: 'single', category: 'Decor', stock: 0, price: 0, specs: {}, variants: [], tags: [], imageUrl: '' })}
              >
                <Plus className="h-4 w-4" />
                Add New Piece
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[800px] h-[90vh] sm:h-auto max-h-[95vh] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden flex flex-col p-0">
              <DialogHeader className="p-6 sm:p-8 pb-0 shrink-0">
                <DialogTitle className="font-headline text-2xl">
                  {editingProduct?.id ? 'Edit Heritage Piece' : 'Catalogue New Masterpiece'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground italic">Comprehensive marketplace listing details.</p>
              </DialogHeader>
              
              <ScrollArea className="flex-1 px-6 sm:px-8 py-4 overflow-y-auto">
                <form id="product-form" onSubmit={handleSaveProduct} className="space-y-8 pb-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Core Info */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider">Product Title</Label>
                        <Input 
                          id="title" 
                          value={editingProduct?.title || ''} 
                          onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                          placeholder="e.g., Hand-Painted Terracotta Vase"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sku" className="text-xs font-bold uppercase tracking-wider">SKU</Label>
                          <Input 
                            id="sku" 
                            value={editingProduct?.sku || ''} 
                            onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                            placeholder="VRD-001"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="brand" className="text-xs font-bold uppercase tracking-wider">Brand / Origin</Label>
                          <Input 
                            id="brand" 
                            value={editingProduct?.brand || ''} 
                            onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                            placeholder="Vridhira Heritage"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-xs font-bold uppercase tracking-wider">Category</Label>
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
                          <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider">Listing Type</Label>
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
                      </div>
                    </div>

                    {/* Pricing & Media */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider">Product Image</Label>
                        <div className="flex flex-col gap-4">
                          {editingProduct?.imageUrl ? (
                            <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted group">
                              <Image 
                                src={editingProduct.imageUrl} 
                                alt="Preview" 
                                fill 
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button 
                                  type="button" 
                                  variant="destructive" 
                                  size="sm"
                                  className="rounded-full"
                                  onClick={() => setEditingProduct({ ...editingProduct, imageUrl: '' })}
                                >
                                  Remove Image
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors border-primary/20"
                              onClick={() => imageUploadRef.current?.click()}
                            >
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <ImagePlus className="h-5 w-5" />
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-secondary">Upload Masterpiece</p>
                                <p className="text-[10px] text-muted-foreground">PNG, JPG up to 800KB</p>
                              </div>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            ref={imageUploadRef} 
                            className="hidden" 
                            onChange={handleImageUpload}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            Original Price ($) <DollarSign className="h-3 w-3" />
                          </Label>
                          <Input 
                            id="price" 
                            type="number" 
                            step="0.01"
                            value={editingProduct?.price || ''} 
                            onChange={(e) => handlePriceChange('price', Number(e.target.value))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stock" className="text-xs font-bold uppercase tracking-wider">Total Inventory</Label>
                          <Input 
                            id="stock" 
                            type="number" 
                            value={editingProduct?.stock || ''} 
                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <div className="space-y-2">
                          <Label htmlFor="salePrice" className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                            Sale Price ($) <DollarSign className="h-3 w-3" />
                          </Label>
                          <Input 
                            id="salePrice" 
                            type="number" 
                            step="0.01"
                            value={editingProduct?.salePrice || ''} 
                            onChange={(e) => handlePriceChange('salePrice', Number(e.target.value))}
                            className="border-primary/20 focus:border-primary bg-white"
                            placeholder="Optional"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discount" className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                            Discount (%) <Percent className="h-3 w-3" />
                          </Label>
                          <Input 
                            id="discount" 
                            type="number" 
                            value={editingProduct?.discountPercentage || ''} 
                            onChange={(e) => handlePriceChange('discountPercentage', Number(e.target.value))}
                            className="border-primary/20 focus:border-primary bg-white"
                            placeholder="Auto-calc"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <Label htmlFor="tags" className="text-xs font-bold uppercase tracking-wider">Search Tags (Comma separated)</Label>
                      <div className="relative">
                        <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="tags" 
                          value={Array.isArray(editingProduct?.tags) ? editingProduct.tags.join(', ') : editingProduct?.tags || ''} 
                          onChange={(e) => setEditingProduct({ ...editingProduct, tags: e.target.value })}
                          placeholder="handmade, vintage, gift"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider">Heritage Story (Description)</Label>
                      <Textarea 
                        id="description" 
                        className="min-h-[100px] rounded-xl"
                        value={editingProduct?.description || ''} 
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        placeholder="Tell the story of this craft, its history and significance..."
                      />
                    </div>

                    {/* Variants Section */}
                    {editingProduct?.type === 'variable' && (
                      <div className="col-span-1 md:col-span-2 space-y-4 border-t pt-6">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-bold flex items-center gap-2">
                            <PlusCircle className="h-4 w-4 text-primary" />
                            Product Variants
                          </Label>
                          <Button type="button" variant="ghost" size="sm" onClick={handleAddVariant} className="text-primary hover:text-primary/80">
                            Add Variant
                          </Button>
                        </div>
                        <div className="grid gap-4">
                          {editingProduct.variants?.map((v) => (
                            <div key={v.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-3 items-start sm:items-end bg-muted/30 p-4 rounded-xl">
                              <div className="w-full sm:col-span-4 space-y-1">
                                <Label className="text-[10px] font-bold">Variant Name</Label>
                                <Input value={v.name} onChange={(e) => handleUpdateVariant(v.id, { name: e.target.value })} placeholder="Large / Blue" />
                              </div>
                              <div className="w-full sm:col-span-2 space-y-1">
                                <Label className="text-[10px] font-bold">Price ($)</Label>
                                <Input type="number" value={v.price} onChange={(e) => handleUpdateVariant(v.id, { price: Number(e.target.value) })} />
                              </div>
                              <div className="w-full sm:col-span-2 space-y-1">
                                <Label className="text-[10px] font-bold">Sale ($)</Label>
                                <Input type="number" value={v.salePrice} onChange={(e) => handleUpdateVariant(v.id, { salePrice: Number(e.target.value) })} />
                              </div>
                              <div className="w-full sm:col-span-2 space-y-1">
                                <Label className="text-[10px] font-bold">Stock</Label>
                                <Input type="number" value={v.stock} onChange={(e) => handleUpdateVariant(v.id, { stock: Number(e.target.value) })} />
                              </div>
                              <div className="w-full sm:col-span-2 flex justify-end">
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVariant(v.id)} className="text-destructive h-10 w-10">
                                  <XCircle className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Specs Section */}
                    <div className="col-span-1 md:col-span-2 space-y-4 border-t pt-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-primary" />
                          Technical Specifications
                        </Label>
                        <Button type="button" variant="ghost" size="sm" onClick={handleAddSpec} className="text-primary hover:text-primary/80">
                          Add Specification
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(editingProduct?.specs || {}).map(([key, value], idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-muted/20 p-2 rounded-lg border">
                            <Input 
                              className="h-9 text-xs font-bold bg-white" 
                              value={key} 
                              onChange={(e) => handleUpdateSpec(key, e.target.value, value)} 
                              placeholder="e.g., Material"
                            />
                            <Input 
                              className="h-9 text-xs bg-white" 
                              value={value} 
                              onChange={(e) => handleUpdateSpec(key, key, e.target.value)} 
                              placeholder="e.g., Silk"
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSpec(key)} className="h-9 w-9 text-destructive shrink-0">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </form>
              </ScrollArea>

              <DialogFooter className="p-6 sm:p-8 bg-muted/30 border-t shrink-0 flex flex-row gap-2 sm:gap-4">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" className="flex-1 sm:flex-none rounded-xl">Cancel</Button>
                </DialogClose>
                <Button form="product-form" type="submit" className="flex-1 sm:flex-none bg-secondary text-white rounded-xl px-8 sm:px-12 shadow-lg hover:scale-[1.02] transition-all">
                  Save Heritage Listing
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search catalog by SKU, name or category..." 
            className="pl-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center text-sm font-medium text-muted-foreground whitespace-nowrap">
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
                  <TableHead className="font-bold">SKU</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Price</TableHead>
                  <TableHead className="font-bold">Stock</TableHead>
                  <TableHead className="text-right px-8 font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/10 group transition-colors">
                    <TableCell className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm border shrink-0 bg-muted">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                              <Package className="h-6 w-6 opacity-20" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-secondary truncate">{product.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-muted-foreground uppercase font-medium opacity-60">{product.brand || 'Vridhira Heritage'}</p>
                            {product.salePrice && <Badge variant="secondary" className="h-4 text-[8px] px-1 bg-primary/10 text-primary border-none">Sale</Badge>}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-code text-xs text-muted-foreground">{product.sku || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full px-3 py-0.5 border-primary/20 text-primary bg-primary/5">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-secondary">
                      {product.salePrice ? (
                        <div className="flex flex-col">
                          <span className="line-through text-muted-foreground text-xs font-normal">${product.price.toFixed(2)}</span>
                          <span className="text-primary">${product.salePrice.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span>${product.price.toFixed(2)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={product.stock < 5 ? 'text-destructive font-black' : 'font-medium'}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            setEditingProduct({
                              ...product,
                              specs: product.specs || {},
                              variants: product.variants || [],
                              tags: product.tags || []
                            });
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
