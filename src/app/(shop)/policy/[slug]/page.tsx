"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { getContentBySlug, POLICY_KEYS, type ContentItem } from "@/lib/apiClients";
import { Skeleton } from "@/components/ui/skeleton";

// Valid policy slugs
const VALID_SLUGS = Object.values(POLICY_KEYS);

export default function PolicyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!VALID_SLUGS.includes(slug as typeof POLICY_KEYS[keyof typeof POLICY_KEYS])) {
        setError("Page not found");
        setLoading(false);
        return;
      }

      const result = await getContentBySlug(slug);
      if (result.success && result.data) {
        setContent(result.data);
      } else {
        setError(result.message || "Content not found");
      }
      setLoading(false);
    };

    fetchContent();
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-12 max-w-4xl">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="container py-12 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground">The requested policy page could not be found.</p>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">{content.file_data.title}</h1>
      {content.file_data.lastUpdated && (
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {new Date(content.file_data.lastUpdated).toLocaleDateString()}
        </p>
      )}
      <div 
        className="prose prose-neutral dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content.file_data.content }}
      />
    </div>
  );
}
