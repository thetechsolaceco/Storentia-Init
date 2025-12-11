"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Image as ImageIcon, Trash2, ExternalLink } from "lucide-react";
import { banners } from "@/data/admin-mock";
import Image from "next/image";

export default function BannersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="relative aspect-video bg-muted">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge
                  variant={banner.status === "active" ? "default" : "secondary"}
                >
                  {banner.status}
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-1">{banner.title}</h3>
              <p className="text-sm text-muted-foreground truncate">
                Link: {banner.link}
              </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <ImageIcon className="mr-2 h-4 w-4" />
                Change Image
              </Button>
              <Button variant="destructive" size="icon" className="h-9 w-9">
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        <div className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer min-h-[200px]">
          <Plus className="h-8 w-8 mb-2" />
          <p className="font-medium">Add New Banner</p>
        </div>
      </div>
    </div>
  );
}
