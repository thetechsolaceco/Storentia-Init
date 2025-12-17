"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { collectionsAPI, type Collection } from "@/lib/apiClients";
import { Checkbox } from "@/components/ui/checkbox";
import { PageLoader } from "@/components/admin/page-loader";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type SortConfig = {
  key: keyof Collection | "productCount";
  direction: "asc" | "desc";
} | null;

export default function CategoriesPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchCollections = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await collectionsAPI.getAll({
        page,
        limit: 20,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        setCollections(response.data);
        setPagination(response.pagination || null);
      } else {
        setError(response.message || "Failed to fetch categories");
        setCollections([]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch categories";
      if (errorMessage.includes("Store ID not found")) {
        setError("Please go to Dashboard first to initialize your store.");
      } else {
        setError(errorMessage);
      }
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [page]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  // Effect to trigger search when term changes with debounce
  useEffect(() => {
      const timer = setTimeout(() => {
          setPage(1);
          fetchCollections(); 
      }, 500);
      return () => clearTimeout(timer);
  }, [searchTerm]);


  const handleCreate = async () => {
    if (!formTitle.trim()) return;
    setFormLoading(true);
    try {
      const response = await collectionsAPI.create({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
      });
      if (response.success) {
        setCreateOpen(false);
        setFormTitle("");
        setFormDescription("");
        fetchCollections();
      } else {
        alert(response.message || "Failed to create category");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedCollection || !formTitle.trim()) return;
    setFormLoading(true);
    try {
      const response = await collectionsAPI.update(selectedCollection.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
      });
      if (response.success) {
        setEditOpen(false);
        setSelectedCollection(null);
        setFormTitle("");
        setFormDescription("");
        fetchCollections();
      } else {
        alert(response.message || "Failed to update category");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCollection) return;
    setFormLoading(true);
    try {
      const response = await collectionsAPI.delete(selectedCollection.id);
      if (response.success) {
        setDeleteOpen(false);
        setSelectedCollection(null);
        fetchCollections();
      } else {
        alert(response.message || "Failed to delete category");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setFormLoading(false);
    }
  };

  const openEditDialog = (collection: Collection) => {
    setSelectedCollection(collection);
    setFormTitle(collection.title);
    setFormDescription(collection.description || "");
    setEditOpen(true);
  };

  const openDeleteDialog = (collection: Collection) => {
    setSelectedCollection(collection);
    setDeleteOpen(true);
  };

  const handleSort = (key: keyof Collection | "productCount") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedCollections = [...collections].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    let aValue: any = a[key as keyof Collection];
    let bValue: any = b[key as keyof Collection];

    if (key === "productCount") {
        aValue = a.products?.length || 0;
        bValue = b.products?.length || 0;
    }

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(collections.map(c => c.id)));
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

  const isAllSelected = collections.length > 0 && selectedIds.size === collections.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < collections.length;

  return (
    <div className="space-y-4 font-sans h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-playfair font-medium tracking-tight text-emerald-950 dark:text-white">Categories</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1 text-sm font-inter">Manage and organize your product types.</p>
      </div>

     {/* Table Filters & buttons */}
      <div className="py-3 flex items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-zinc-500" />
            <input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-transparent pl-10 pr-4 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-zinc-700 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
        </div>

        {/* Add Button */}
        <Button 
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="h-9 px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-zinc-200 rounded-md text-sm font-medium transition-colors"
        >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Category
        </Button>
      </div>


      {/* Table Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-3 text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchCollections()}>
              Try Again
            </Button>
          </div>
        ) : collections.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-8 text-center">
            <p className="text-gray-500 dark:text-zinc-400 text-sm">No categories found matching your search.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
                  <tr>
                    <th className="w-12 px-4 py-4">
                      <Checkbox 
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:border-black dark:data-[state=checked]:border-white"
                        {...(isSomeSelected ? { "data-state": "indeterminate" } : {})}
                      />
                    </th>
                    <th 
                      className="text-left text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider px-4 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors select-none"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-1.5">
                        Name
                        {sortConfig?.key === "title" ? (
                          sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                        )}
                      </div>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider px-4 py-4">Description</th>
                    <th 
                      className="text-left text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider px-4 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors select-none"
                      onClick={() => handleSort("productCount")}
                    >
                      <div className="flex items-center gap-1.5">
                        Products
                        {sortConfig?.key === "productCount" ? (
                          sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider px-4 py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors select-none"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1.5">
                        Created
                        {sortConfig?.key === "createdAt" ? (
                          sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 text-gray-400 dark:text-zinc-500" />
                        )}
                      </div>
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-600 dark:text-zinc-400 uppercase tracking-wider px-4 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {sortedCollections.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-4">
                        <Checkbox 
                          checked={selectedIds.has(c.id)}
                          onCheckedChange={(checked) => handleSelectOne(c.id, checked as boolean)}
                          className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white data-[state=checked]:border-black dark:data-[state=checked]:border-white"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{c.title}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-500 dark:text-zinc-400 text-sm truncate max-w-[200px] block" title={c.description}>
                          {c.description || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300">
                          {c.products?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-500 dark:text-zinc-400 text-sm">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                            onClick={() => openEditDialog(c)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1.5 text-gray-400 dark:text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            onClick={() => openDeleteDialog(c)}
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

      
      {/* Pagination - Simplified and moved near controls if needed, or kept separate */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-2">
             {/* ... (Kept simple or removed if minimal design prefers just load more/scroll) */}
             {/* Keeping basic pagination for now but hidden if not needed or could be part of footer */}
        </div>
      )}

      {/* Create Dialog - Cleaned up */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl">New Category</DialogTitle>
            <DialogDescription>
              Create a new category to organize your products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Summer Collection"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="border-gray-200 focus:ring-0 focus:border-black rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this category..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="border-gray-200 focus:ring-0 focus:border-black rounded-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              disabled={formLoading}
              className="hover:bg-gray-100 rounded-sm"
            >
              Cancel
            </Button>
            <Button 
                onClick={handleCreate} 
                disabled={formLoading || !formTitle.trim()}
                className="bg-black text-white hover:bg-gray-900 rounded-sm"
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-playfair text-2xl">Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
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
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditOpen(false)}
              disabled={formLoading}
              className="hover:bg-gray-100 rounded-sm"
            >
              Cancel
            </Button>
            <Button 
                onClick={handleEdit} 
                disabled={formLoading || !formTitle.trim()}
                 className="bg-black text-white hover:bg-gray-900 rounded-sm"
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-playfair">Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium text-black">&quot;{selectedCollection?.title}&quot;</span>.
              <br />
              Products in this category will not be deleted but will be uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={formLoading} className="rounded-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={formLoading}
              className="bg-red-600 hover:bg-red-700 text-white rounded-sm"
            >
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

