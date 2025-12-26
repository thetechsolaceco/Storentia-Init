"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import { selectStoreInfo } from "@/lib/store/storeSlice";
import { getPublicContent, POLICY_KEYS, type ContentItem } from "@/lib/apiClients";

// Predefined policy keys to show in footer (excluding about-us)
const FOOTER_POLICY_KEYS: string[] = [
  POLICY_KEYS.PRIVACY,
  POLICY_KEYS.TERMS,
  POLICY_KEYS.SHIPPING,
  POLICY_KEYS.REFUND,
];

export function Footer() {
  const storeInfo = useAppSelector(selectStoreInfo);
  const storeName = storeInfo?.name || "Store";
  const social = storeInfo?.socialMediaUrls;
  const [policies, setPolicies] = useState<ContentItem[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      const result = await getPublicContent();
      if (result.success && result.data) {
        // Filter to only show predefined policy keys that exist
        setPolicies(
          result.data.filter((item) => FOOTER_POLICY_KEYS.includes(item.file_key))
        );
      }
    };
    fetchContent();
  }, []);

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-lg font-bold">{storeName}</h3>
            {storeInfo?.description && (
              <p className="text-sm text-muted-foreground">
                {storeInfo.description.length > 120
                  ? storeInfo.description.slice(0, 120) + "..."
                  : storeInfo.description}
              </p>
            )}
            
            {/* Social Links */}
            {social && (
              <div className="flex items-center gap-3 pt-2">
                {social.facebook && (
                  <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {social.instagram && (
                  <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {social.twitter && (
                  <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {social.youtube && (
                  <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
                {social.linkedin && (
                  <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">Home</Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary">All Products</Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          {policies.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Policies</h3>
              <ul className="space-y-2 text-sm">
                {policies.map((policy) => (
                  <li key={policy.id}>
                    <Link 
                      href={`/policy/${policy.file_key}`} 
                      className="text-muted-foreground hover:text-primary"
                    >
                      {policy.file_data.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 text-sm">
              {storeInfo?.contactEmail && (
                <li>
                  <a href={`mailto:${storeInfo.contactEmail}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <Mail className="h-4 w-4" />
                    {storeInfo.contactEmail}
                  </a>
                </li>
              )}
              {storeInfo?.mobile && (
                <li>
                  <a href={`tel:${storeInfo.mobile}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                    <Phone className="h-4 w-4" />
                    {storeInfo.mobile}
                  </a>
                </li>
              )}
              {storeInfo?.address && (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="text-xs">{storeInfo.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
