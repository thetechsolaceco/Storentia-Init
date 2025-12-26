"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";
import { selectStoreInfo } from "@/lib/store/storeSlice";

export function Footer() {
  const storeInfo = useAppSelector(selectStoreInfo);
  const storeName = storeInfo?.name || "Store";
  const social = storeInfo?.socialMediaUrls;

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold">{storeName}</h3>
            {storeInfo?.description && (
              <p className="text-sm text-muted-foreground max-w-xs">
                {storeInfo.description}
              </p>
            )}
            
            {/* Contact Info */}
            <div className="space-y-2 pt-2">
              {storeInfo?.contactEmail && (
                <a href={`mailto:${storeInfo.contactEmail}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <Mail className="h-4 w-4" />
                  {storeInfo.contactEmail}
                </a>
              )}
              {storeInfo?.mobile && (
                <a href={`tel:${storeInfo.mobile}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                  <Phone className="h-4 w-4" />
                  {storeInfo.mobile}
                </a>
              )}
              {storeInfo?.address && (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  {storeInfo.address}
                </p>
              )}
            </div>

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

            <p className="text-sm text-muted-foreground pt-4">
              &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              {storeInfo?.supportEmail && (
                <li>
                  <a href={`mailto:${storeInfo.supportEmail}`} className="text-muted-foreground hover:text-primary">
                    Email Support
                  </a>
                </li>
              )}
              {storeInfo?.whatsappNumber && (
                <li>
                  <a 
                    href={`https://wa.me/${storeInfo.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
