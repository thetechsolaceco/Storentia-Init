"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppSelector } from "@/lib/store/hooks";
import { selectStoreInfo, selectStoreLoading } from "@/lib/store/storeSlice";
import { submitContactForm } from "@/lib/apiClients";

export default function ContactPage() {
  const storeInfo = useAppSelector(selectStoreInfo);
  const loading = useAppSelector(selectStoreLoading);
  const storeName = storeInfo?.name || "Store";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await submitContactForm(formData);

    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } else {
      setError(result.error || "Failed to send message");
    }
  };

  if (loading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-3">Contact Us</h1>
        <p className="text-muted-foreground">
          Have questions? We&apos;d love to hear from you. Get in touch with {storeName}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground mb-4">
                    Thank you for reaching out. We&apos;ll get back to you soon.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your message..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-4">
          {storeInfo?.contactEmail && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href={`mailto:${storeInfo.contactEmail}`}
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {storeInfo.contactEmail}
                    </a>
                    {storeInfo.supportEmail && storeInfo.supportEmail !== storeInfo.contactEmail && (
                      <div className="mt-1">
                        <a 
                          href={`mailto:${storeInfo.supportEmail}`}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {storeInfo.supportEmail} (Support)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(storeInfo?.mobile || storeInfo?.landline) && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    {storeInfo.mobile && (
                      <a 
                        href={`tel:${storeInfo.mobile}`}
                        className="text-sm text-muted-foreground hover:text-primary block"
                      >
                        {storeInfo.mobile}
                      </a>
                    )}
                    {storeInfo.landline && (
                      <a 
                        href={`tel:${storeInfo.landline}`}
                        className="text-sm text-muted-foreground hover:text-primary block"
                      >
                        {storeInfo.landline}
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {storeInfo?.whatsappNumber && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <a 
                      href={`https://wa.me/${storeInfo.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Chat with us
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {storeInfo?.address && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {storeInfo.address}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!storeInfo?.contactEmail && !storeInfo?.mobile && !storeInfo?.whatsappNumber && !storeInfo?.address && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Contact details coming soon
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
