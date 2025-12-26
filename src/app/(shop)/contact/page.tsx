"use client";

import { Mail, Phone, MapPin, MessageCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/store/hooks";
import { selectStoreInfo, selectStoreLoading } from "@/lib/store/storeSlice";
import { Loader2 } from "lucide-react";

export default function ContactPage() {
  const storeInfo = useAppSelector(selectStoreInfo);
  const loading = useAppSelector(selectStoreLoading);
  const storeName = storeInfo?.name || "Store";

  if (loading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Contact Us</h1>
        <p className="text-muted-foreground">
          Have questions? We&apos;d love to hear from you. Get in touch with {storeName}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        {storeInfo?.contactEmail && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-primary" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">Send us an email anytime</p>
              <a 
                href={`mailto:${storeInfo.contactEmail}`}
                className="text-primary hover:underline font-medium"
              >
                {storeInfo.contactEmail}
              </a>
              {storeInfo.supportEmail && storeInfo.supportEmail !== storeInfo.contactEmail && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">For support:</p>
                  <a 
                    href={`mailto:${storeInfo.supportEmail}`}
                    className="text-primary hover:underline text-sm"
                  >
                    {storeInfo.supportEmail}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Phone */}
        {(storeInfo?.mobile || storeInfo?.landline) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-primary" />
                Phone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">Give us a call</p>
              {storeInfo.mobile && (
                <a 
                  href={`tel:${storeInfo.mobile}`}
                  className="text-primary hover:underline font-medium block"
                >
                  {storeInfo.mobile}
                </a>
              )}
              {storeInfo.landline && (
                <a 
                  href={`tel:${storeInfo.landline}`}
                  className="text-muted-foreground hover:text-primary text-sm block mt-1"
                >
                  {storeInfo.landline} (Landline)
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* WhatsApp */}
        {storeInfo?.whatsappNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">Chat with us on WhatsApp</p>
              <Button asChild>
                <a 
                  href={`https://wa.me/${storeInfo.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Start Chat
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Address */}
        {storeInfo?.address && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">Visit our store</p>
              <p className="font-medium">{storeInfo.address}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No contact info fallback */}
      {!storeInfo?.contactEmail && !storeInfo?.mobile && !storeInfo?.whatsappNumber && !storeInfo?.address && (
        <Card className="text-center py-10">
          <CardContent>
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Contact information coming soon.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
