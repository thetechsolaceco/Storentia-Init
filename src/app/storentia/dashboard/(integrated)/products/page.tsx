"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  Filter,
} from "lucide-react";
import { productsAPI, type Product, type ProductStatus } from "@/lib/apiClients";
import { PageLoader } from "@/components/admin/page-loader";
import Link from "next/link";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type SortConfig = {
  key: keyof Product | "price" | "stock";
  direction: "asc" | "desc";
} | null;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

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

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    fetchProducts();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

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
    if (selectedIds.size === 0) return;
    setFormLoading(true);
    try {
      const response = await productsAPI.bulkDelete(Array.from(selectedIds));
      if (response.success) {
        setBulkDeleteOpen(false);
        setSelectedIds(new Set());
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
    if (selectedIds.size === 0) return;
    try {
      const response = await productsAPI.bulkUpdateStatus(Array.from(selectedIds), status);
      if (response.success) {
        setSelectedIds(new Set());
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

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const handleSort = (key: keyof Product) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const aValue = a[key];
    const bValue = b[key];
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(products.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const isAllSelected = products.length > 0 && selectedIds.size === products.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < products.length;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>;
      case "DRAFT":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Draft</span>;
      case "UNLISTED":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Unlisted</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Unknown</span>;
    }
  };


  return (
    <div className="space-y-4 font-sans h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-playfair font-medium tracking-tight text-emerald-950">Products</h1>
        <p className="text-gray-500 mt-1 text-sm font-inter">Manage your product inventory.</p>
      </div>

      {/* Table Filters & buttons */}
      <div className="py-3 flex items-center justify-between gap-3">
        {/* Left side - Search & Filter */}
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-transparent pl-10 pr-4 py-2 text-sm placeholder:text-gray-400 text-gray-900 border-b-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-sm border-gray-300">
              <Filter className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="UNLISTED">Unlisted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Button */}
        <Button
          onClick={() => setCreateOpen(true)}
          size="sm"
          className="h-9 px-4 bg-black text-white hover:bg-gray-800 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Product
        </Button>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
          <span className="text-sm font-medium text-gray-700">{selectedIds.size} selected</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleBulkStatusChange("ACTIVE")}>
              Set Active
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleBulkStatusChange("DRAFT")}>
              Set Draft
            </Button>
            <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => setBulkDeleteOpen(true)}>
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-3 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchProducts()}>
              Try Again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-sm mb-4">No products found.</p>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Create your first product
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-4">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                        {...(isSomeSelected ? { "data-state": "indeterminate" } : {})}
                      />
                    </th>
                    <th className="w-16 px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Image
                    </th>
                    <th
                      className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-1.5">
                        Title
                        {sortConfig?.key === "title" ? (
                          sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-4">
                      Status
                    </th>
                    <th
                      className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("price")}
                    >
                      <div className="flex items-center gap-1.5">
                        Price
                        {sortConfig?.key === "price" ? (
                          sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th
                      className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-4 cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("stock")}
                    >
                      <div className="flex items-center gap-1.5">
                        Stock
                        {sortConfig?.key === "stock" ? (
                          sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-4">
                      SKU
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider px-4 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <Checkbox
                          checked={selectedIds.has(product.id)}
                          onCheckedChange={(checked) => handleSelectOne(product.id, checked as boolean)}
                          className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div
                          className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:opacity-80 overflow-hidden"
                          onClick={() => openImageDialog(product)}
                        >
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.title} className="h-10 w-10 object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 text-sm">{product.title}</span>
                        {product.description && (
                          <p className="text-gray-500 text-xs truncate max-w-[200px]" title={product.description}>
                            {product.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(product.status)}</td>
                      <td className="px-4 py-4">
                        <span className="text-gray-900 text-sm font-medium">${product.price?.toFixed(2) || "0.00"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-500 text-sm">{product.stock ?? "-"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-500 text-sm">{product.sku || "-"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/storentia/dashboard/products/${product.id}`}>
                            <button className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => openEditDialog(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                            onClick={() => openImageDialog(product)}
                          >
                            <ImageIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            onClick={() => openDeleteDialog(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}


      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl">New Product</DialogTitle>
            <DialogDescription>Add a new product. You can add images after creation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Product title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="border-gray-200 focus:ring-0 focus:border-black rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Product description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="border-gray-200 focus:ring-0 focus:border-black rounded-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="border-gray-200 focus:ring-0 focus:border-black rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="SKU-001"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="border-gray-200 focus:ring-0 focus:border-black rounded-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ProductStatus)}>
                  <SelectTrigger className="border-gray-200 focus:ring-0 focus:border-black rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="UNLISTED">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  className="border-gray-200 focus:ring-0 focus:border-black rounded-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={formLoading} className="hover:bg-gray-100 rounded-sm">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={formLoading || !formTitle.trim()} className="bg-black text-white hover:bg-gray-900 rounded-sm">
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl">Edit Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="border-gray-200 focus:ring-0 focus:border-black rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="border-gray-200 focus:ring-0 focus:border-black rounded-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="border-gray-200 focus:ring-0 focus:border-black rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={formSku}
                  onChange={(e) => setFormSku(e.target.value)}
                  className="border-gray-200 focus:ring-0 focus:border-black rounded-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as ProductStatus)}>
                  <SelectTrigger className="border-gray-200 focus:ring-0 focus:border-black rounded-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="UNLISTED">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  className="border-gray-200 focus:ring-0 focus:border-black rounded-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={formLoading} className="hover:bg-gray-100 rounded-sm">
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={formLoading || !formTitle.trim()} className="bg-black text-white hover:bg-gray-900 rounded-sm">
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Management Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl">Manage Images</DialogTitle>
            <DialogDescription>Upload and manage images for {selectedProduct?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              {selectedProduct?.images?.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.url} alt="" className="w-full h-24 object-cover rounded-lg border" />
                  <button
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Upload</span>
                  </>
                )}
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setImageDialogOpen(false)} className="bg-black text-white hover:bg-gray-900 rounded-sm">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-playfair">Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium text-black">&quot;{selectedProduct?.title}&quot;</span>.
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading} className="rounded-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={formLoading} className="bg-red-600 hover:bg-red-700 text-white rounded-sm">
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-playfair">Delete {selectedIds.size} Products?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} selected products? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading} className="rounded-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={formLoading} className="bg-red-600 hover:bg-red-700 text-white rounded-sm">
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
