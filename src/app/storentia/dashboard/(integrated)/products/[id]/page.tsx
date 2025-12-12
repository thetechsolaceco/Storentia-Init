"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Loader2, Pencil, Trash2, Upload, X, Save, Calendar, Package,
} from "lucide-react";
import { productsAPI, type Product, type ProductStatus } from "@/lib/apiClients";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formStatus, setFormStatus] = useState<ProductStatus>("ACTIVE");
  const [formStock, setFormStock] = useState("");
  const [formSku, setFormSku] = useState("");

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productsAPI.getById(productId);
      if (response.success && response.data) {
        setProduct(response.data);
        setFormTitle(response.data.title);
        setFormDescription(response.data.description || "");
        setFormPrice(response.data.price ? String(response.data.price) : "");
        setFormStatus(response.data.status || "ACTIVE");
        setFormStock(response.data.stock ? String(response.data.stock) : "");
        setFormSku(response.data.sku || "");
      } else {
        setError(response.message || "Product not found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchProduct();
  }, [productId]);

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    try {
      const response = await productsAPI.update(productId, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        price: formPrice ? parseFloat(formPrice) : undefined,
        status: formStatus,
        stock: formStock ? parseInt(formStock) : undefined,
        sku: formSku.trim() || undefined,
      });
      if (response.success) {
        setEditing(false);
        fetchProduct();
      } else {
        alert(response.message || "Failed to update product");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await productsAPI.delete(productId);
      if (response.success) {
        router.push("/storentia/dashboard/products");
      } else {
        alert(response.message || "Failed to delete product");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImage(true);
    try {
      const file = e.target.files[0];
      const response = await productsAPI.uploadImage(productId, file);
      if (response.success) {
        fetchProduct();
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
    try {
      const response = await productsAPI.removeImage(productId, imageId);
      if (response.success) {
        fetchProduct();
      } else {
        alert(response.message || "Failed to remove image");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove image");
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE": return <Badge variant="default">Active</Badge>;
      case "DRAFT": return <Badge variant="secondary">Draft</Badge>;
      case "UNLISTED": return <Badge variant="outline">Unlisted</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Product not found"}</p>
        <Button variant="outline" asChild>
          <Link href="/storentia/dashboard/products">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
          </Link>
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/storentia/dashboard/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(product.status)}
              <span className="text-sm text-muted-foreground">ID: {product.id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
                    </div>
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
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input type="number" value={formStock} onChange={(e) => setFormStock(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>SKU</Label>
                      <Input value={formSku} onChange={(e) => setFormSku(e.target.value)} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label className="text-muted-foreground">Title</Label>
                    <p className="font-medium">{product.title}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-sm">{product.description || "No description"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Price</Label>
                      <p className="font-medium text-lg">${product.price?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div className="mt-1">{getStatusBadge(product.status)}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Stock</Label>
                      <p className="font-medium">{product.stock ?? "Not tracked"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">SKU</Label>
                      <p className="font-medium">{product.sku || "-"}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {product.images?.map((img) => (
                  <div key={img.id} className="relative group aspect-square">
                    <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      onClick={() => handleRemoveImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-2">Upload</span>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Store ID</p>
                  <p className="text-xs font-mono">{product.storeId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{product.createdAt ? new Date(product.createdAt).toLocaleString() : "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Updated</p>
                  <p className="text-sm">{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Collections</CardTitle>
            </CardHeader>
            <CardContent>
              {product.collections && product.collections.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.collections.map((col, i) => (
                    <Badge key={i} variant="secondary">{String(col)}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No collections assigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{product.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
