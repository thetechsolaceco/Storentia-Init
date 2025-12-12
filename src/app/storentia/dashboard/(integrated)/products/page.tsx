"use client";

import { useState, useEffect, useRef } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  MoreHorizontal, Plus, Search, Filter, Loader2, Pencil, Trash2,
  Image as ImageIcon, Upload, X, Eye,
} from "lucide-react";
import { productsAPI, type Product, type ProductStatus } from "@/lib/apiClients";
import Link from "next/link";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formStatus, setFormStatus] = useState<ProductStatus>("ACTIVE");
  const [formStock, setFormStock] = useState("");

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsAPI.getAll({
        page,
        limit: 20,
        status: statusFilter !== "all" ? (statusFilter as ProductStatus) : undefined,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setProducts(response.data);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || "Failed to fetch products");
        setProducts([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch products";
      setError(msg.includes("Store ID") ? "Please go to Dashboard first to initialize your store." : msg);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchProducts();
  }, [page, statusFilter]);

  const handleSearch = () => { setPage(1); fetchProducts(); };

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormPrice("");
    setFormSku("");
    setFormStatus("ACTIVE");
    setFormStock("");
  };

  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    setFormLoading(true);
    try {
      const response = await productsAPI.create({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        price: formPrice ? parseFloat(formPrice) : undefined,
        sku: formSku.trim() || undefined,
        status: formStatus,
        stock: formStock ? parseInt(formStock) : undefined,
      });
      if (response.success && response.data) {
        setCreateOpen(false);
        resetForm();
        // Open image dialog for the new product
        setSelectedProduct(response.data);
        setImageDialogOpen(true);
        fetchProducts();
      } else {
        alert(response.message || "Failed to create product");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct || !formTitle.trim()) return;
    setFormLoading(true);
    try {
      const response = await productsAPI.update(selectedProduct.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        price: formPrice ? parseFloat(formPrice) : undefined,
        sku: formSku.trim() || undefined,
        status: formStatus,
        stock: formStock ? parseInt(formStock) : undefined,
      });
      if (response.success) {
        setEditOpen(false);
        setSelectedProduct(null);
        resetForm();
        fetchProducts();
      } else {
        alert(response.message || "Failed to update product");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    setFormLoading(true);
    try {
      const response = await productsAPI.delete(selectedProduct.id);
      if (response.success) {
        setDeleteOpen(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        alert(response.message || "Failed to delete product");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setFormLoading(true);
    try {
      const response = await productsAPI.bulkDelete(selectedIds);
      if (response.success) {
        setBulkDeleteOpen(false);
        setSelectedIds([]);
        fetchProducts();
      } else {
        alert(response.message || "Failed to delete products");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete products");
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkStatusChange = async (status: ProductStatus) => {
    if (selectedIds.length === 0) return;
    try {
      const response = await productsAPI.bulkUpdateStatus(selectedIds, status);
      if (response.success) {
        setSelectedIds([]);
        fetchProducts();
      } else {
        alert(response.message || "Failed to update status");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProduct || !e.target.files?.length) return;
    setUploadingImage(true);
    try {
      const file = e.target.files[0];
      const response = await productsAPI.uploadImage(selectedProduct.id, file);
      if (response.success) {
        // Refresh product data
        const updated = await productsAPI.getById(selectedProduct.id);
        if (updated.success && updated.data) {
          setSelectedProduct(updated.data);
        }
        fetchProducts();
      } else {
        alert(response.message || "Failed to upload image");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    if (!selectedProduct) return;
    try {
      const response = await productsAPI.removeImage(selectedProduct.id, imageId);
      if (response.success) {
        const updated = await productsAPI.getById(selectedProduct.id);
        if (updated.success && updated.data) {
          setSelectedProduct(updated.data);
        }
        fetchProducts();
      } else {
        alert(response.message || "Failed to remove image");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove image");
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormTitle(product.title);
    setFormDescription(product.description || "");
    setFormPrice(product.price ? String(product.price) : "");
    setFormSku(product.sku || "");
    setFormStatus(product.status || "ACTIVE");
    setFormStock(product.stock ? String(product.stock) : "");
    setEditOpen(true);
  };

  const openImageDialog = (product: Product) => {
    setSelectedProduct(product);
    setImageDialogOpen(true);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === products.length ? [] : products.map((p) => p.id));
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE": return <Badge variant="default">Active</Badge>;
      case "DRAFT": return <Badge variant="secondary">Draft</Badge>;
      case "UNLISTED": return <Badge variant="outline">Unlisted</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-8" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="UNLISTED">Unlisted</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleSearch}>Search</Button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 bg-muted p-3 rounded-lg">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("ACTIVE")}>Set Active</Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange("DRAFT")}>Set Draft</Button>
            <Button size="sm" variant="destructive" onClick={() => setBulkDeleteOpen(true)}>Delete Selected</Button>
          </div>
        </div>
      )}

      <div className="border rounded-lg bg-background">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="outline" onClick={fetchProducts}>Try Again</Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products found</p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create your first product
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox checked={selectedIds.length === products.length && products.length > 0} onCheckedChange={toggleSelectAll} />
                </TableHead>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox checked={selectedIds.includes(product.id)} onCheckedChange={() => toggleSelect(product.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center cursor-pointer hover:opacity-80"
                      onClick={() => openImageDialog(product)}>
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.title} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.title}</div>
                    {product.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>${product.price?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>{product.stock ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku || "-"}</TableCell>
                  <TableCell className="text-right">
                    {mounted ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/storentia/dashboard/products/${product.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openImageDialog(product)}>
                            <ImageIcon className="mr-2 h-4 w-4" /> Manage Images
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedProduct(product); setDeleteOpen(true); }}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button variant="ghost" size="icon" disabled><MoreHorizontal className="h-4 w-4" /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}


      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Product</DialogTitle>
            <DialogDescription>Add a new product. You can add images after creation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Product title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Product description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" placeholder="0.00" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="SKU-001" value={formSku} onChange={(e) => setFormSku(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ProductStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="UNLISTED">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" placeholder="0" value={formStock} onChange={(e) => setFormStock(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={formLoading}>Cancel</Button>
            <Button onClick={handleCreate} disabled={formLoading || !formTitle.trim()}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input id="edit-title" placeholder="Product title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" placeholder="Product description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input id="edit-price" type="number" step="0.01" placeholder="0.00" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input id="edit-sku" placeholder="SKU-001" value={formSku} onChange={(e) => setFormSku(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ProductStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="UNLISTED">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input id="edit-stock" type="number" placeholder="0" value={formStock} onChange={(e) => setFormStock(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={formLoading}>Cancel</Button>
            <Button onClick={handleEdit} disabled={formLoading || !formTitle.trim()}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Management Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Images</DialogTitle>
            <DialogDescription>Upload and manage images for {selectedProduct?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              {selectedProduct?.images?.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.url} alt="" className="w-full h-24 object-cover rounded border" />
                  <button
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Upload</span>
                  </>
                )}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setImageDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedProduct?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={formLoading} className="bg-red-600 hover:bg-red-700">
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} selected products? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={formLoading} className="bg-red-600 hover:bg-red-700">
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
