'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, QrCode, Sparkles, X } from 'lucide-react';
import { getTemplateById, type QRTemplate } from '@/lib/templates/qr-templates';
import { validateQRCodeColors } from '@/lib/utils/color-contrast';

// Dynamic schema that adapts based on QR type
const createQRSchema = (type: string) => {
  const baseSchema = {
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: z.string().optional(),
    type: z.enum(['URL', 'VCARD', 'EMAIL', 'SMS', 'WIFI', 'TEXT', 'PHONE', 'MENU', 'PAYMENT', 'LANDING_PAGE', 'LOCATION']),
    maxScans: z.number().optional(),
  };

  switch (type) {
    case 'URL':
    case 'MENU':
    case 'LANDING_PAGE':
      return z.object({
        ...baseSchema,
        redirectUrl: z.string().url('Must be a valid URL'),
      });
    
    case 'VCARD':
      return z.object({
        ...baseSchema,
        vcardName: z.string().min(1, 'Name is required'),
        vcardPhone: z.string().optional(),
        vcardEmail: z.string().email('Invalid email').optional().or(z.literal('')),
        vcardOrganization: z.string().optional(),
        vcardWebsite: z.string().url('Invalid URL').optional().or(z.literal('')),
      });
    
    case 'WIFI':
      return z.object({
        ...baseSchema,
        wifiSSID: z.string().min(1, 'Network name is required'),
        wifiPassword: z.string().optional(),
        wifiEncryption: z.enum(['WPA', 'WEP', 'nopass']),
      });
    
    case 'EMAIL':
      return z.object({
        ...baseSchema,
        emailAddress: z.string().email('Invalid email address'),
        emailSubject: z.string().optional(),
        emailBody: z.string().optional(),
      });
    
    case 'SMS':
      return z.object({
        ...baseSchema,
        smsPhone: z.string().min(1, 'Phone number is required'),
        smsMessage: z.string().optional(),
      });
    
    case 'PHONE':
      return z.object({
        ...baseSchema,
        phoneNumber: z.string().min(1, 'Phone number is required'),
      });
    
    case 'LOCATION':
      return z.object({
        ...baseSchema,
        locationLat: z.string().min(1, 'Latitude is required'),
        locationLng: z.string().min(1, 'Longitude is required'),
        locationAddress: z.string().optional(),
      });
    
    case 'TEXT':
      return z.object({
        ...baseSchema,
        textContent: z.string().min(1, 'Text content is required'),
      });
    
    case 'PAYMENT':
      return z.object({
        ...baseSchema,
        paymentPlatform: z.enum(['cashapp', 'zelle', 'venmo', 'paypal']),
        paymentHandle: z.string().min(1, 'Username/handle is required'),
      });
    
    default:
      return z.object({
        ...baseSchema,
        redirectUrl: z.string().url('Must be a valid URL'),
      });
  }
};

type QRFormData = z.infer<ReturnType<typeof createQRSchema>>;

export default function CreateQRPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate | null>(null);
  const [qrStyle, setQrStyle] = useState<any>(null);
  const [contrastValidation, setContrastValidation] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('URL');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Load template from URL parameter
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (templateId) {
      const template = getTemplateById(templateId);
      if (template) {
        setSelectedTemplate(template);
        setQrStyle(template.style);
        
        // Validate colors
        const validation = validateQRCodeColors(
          template.style.foregroundColor,
          template.style.backgroundColor
        );
        setContrastValidation(validation);
      }
    }
  }, [searchParams]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<any>({
    resolver: zodResolver(createQRSchema(selectedType)),
    defaultValues: {
      name: '',
      description: '',
      type: 'URL',
      redirectUrl: '',
    },
  });

  // Watch the type field for changes
  const typeValue = watch('type');
  
  // Update selected type and focus first field when type changes
  useEffect(() => {
    if (typeValue && typeValue !== selectedType) {
      setSelectedType(typeValue);
      // Announce change to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.className = 'sr-only';
      announcement.textContent = `QR code type changed to ${typeValue}. Form fields updated.`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
      
      // Focus first field after a short delay
      setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 100);
    }
  }, [typeValue, selectedType]);

  async function onSubmit(data: any) {
    setLoading(true);
    try {
      // Build the appropriate data structure based on type
      let qrData: any = {
        name: data.name,
        description: data.description,
        type: data.type,
        maxScans: data.maxScans,
      };

      // Add type-specific data
      switch (data.type) {
        case 'URL':
        case 'MENU':
        case 'LANDING_PAGE':
          qrData.redirectUrl = data.redirectUrl;
          break;
        case 'VCARD':
          qrData.content = JSON.stringify({
            name: data.vcardName,
            phone: data.vcardPhone,
            email: data.vcardEmail,
            organization: data.vcardOrganization,
            website: data.vcardWebsite,
          });
          break;
        case 'WIFI':
          qrData.content = JSON.stringify({
            ssid: data.wifiSSID,
            password: data.wifiPassword,
            encryption: data.wifiEncryption,
          });
          break;
        case 'EMAIL':
          qrData.content = JSON.stringify({
            email: data.emailAddress,
            subject: data.emailSubject,
            body: data.emailBody,
          });
          break;
        case 'SMS':
          qrData.content = JSON.stringify({
            phone: data.smsPhone,
            message: data.smsMessage,
          });
          break;
        case 'PHONE':
          qrData.content = JSON.stringify({
            phone: data.phoneNumber,
          });
          break;
        case 'LOCATION':
          qrData.content = JSON.stringify({
            lat: data.locationLat,
            lng: data.locationLng,
            address: data.locationAddress,
          });
          break;
        case 'TEXT':
          qrData.content = data.textContent;
          break;
        case 'PAYMENT':
          qrData.content = JSON.stringify({
            platform: data.paymentPlatform,
            handle: data.paymentHandle,
          });
          break;
      }

      // Include template style if selected
      const payload = {
        ...qrData,
        style: selectedTemplate ? qrStyle : undefined,
        frame: selectedTemplate?.frame,
        templateId: selectedTemplate?.id,
      };

      const res = await fetch('/api/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('QR code created successfully!');
        router.push(`/dashboard/qr-codes/${result.qrCode.id}`);
      } else {
        toast.error(result.error || 'Failed to create QR code');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Create QR Code</h1>
          <p className="text-muted-foreground">Generate a new QR code</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/templates')}
          aria-label="Browse templates"
        >
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          Browse Templates
        </Button>
      </div>

      {/* Template Banner */}
      {selectedTemplate && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h3 className="font-semibold text-lg">Using Template: {selectedTemplate.name}</h3>
                {selectedTemplate.isPremium && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    ⭐ Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">{selectedTemplate.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{selectedTemplate.category}</Badge>
                <Badge variant="outline">{selectedTemplate.style.dotStyle} dots</Badge>
                <Badge variant="outline">Error correction: {selectedTemplate.style.errorCorrectionLevel}</Badge>
              </div>
              
              {/* Color Contrast Validation */}
              {contrastValidation && (
                <div className={`mt-3 p-2 rounded text-sm ${
                  contrastValidation.ratio >= 4.5 
                    ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' 
                    : contrastValidation.ratio >= 3
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                }`}>
                  <strong>Contrast Ratio: {contrastValidation.ratio}:1</strong>
                  <br />
                  {contrastValidation.message}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSelectedTemplate(null);
                setQrStyle(null);
                setContrastValidation(null);
                router.push('/dashboard/qr-codes/create');
              }}
              aria-label="Clear template"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive" aria-label="required">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="My QR Code"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive" role="alert">
                {errors.name?.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional description for internal use"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Type <span className="text-destructive" aria-label="required">*</span>
            </Label>
            <select
              id="type"
              {...register('type')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer transition-all duration-200 hover:border-accent-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:border-blue-500 focus-visible:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              aria-required="true"
            >
              <option value="URL">URL - Website Link</option>
              <option value="VCARD">vCard - Contact Information</option>
              <option value="EMAIL">Email Address</option>
              <option value="SMS">SMS Message</option>
              <option value="WIFI">WiFi Network</option>
              <option value="TEXT">Plain Text</option>
              <option value="PHONE">Phone Number</option>
              <option value="LOCATION">Location/GPS Coordinates</option>
              <option value="PAYMENT">Payment Link</option>
              <option value="MENU">Digital Menu</option>
              <option value="LANDING_PAGE">Landing Page</option>
            </select>
          </div>

          {/* Dynamic Fields Based on Type */}
          <div 
            className="space-y-6 transition-opacity duration-300"
            role="region"
            aria-live="polite"
            aria-label="Type-specific fields"
          >
            {/* URL Type */}
            {(selectedType === 'URL' || selectedType === 'MENU' || selectedType === 'LANDING_PAGE') && (
              <div className="space-y-2 animate-in fade-in-50 duration-300">
                <Label htmlFor="redirectUrl">
                  Destination URL <span className="text-destructive" aria-label="required">*</span>
                </Label>
                <Input
                  id="redirectUrl"
                  {...register('redirectUrl')}
                  ref={firstFieldRef}
                  placeholder="https://example.com"
                  type="url"
                  aria-required="true"
                  aria-invalid={!!errors.redirectUrl}
                  aria-describedby={errors.redirectUrl ? 'url-error' : undefined}
                />
                {errors.redirectUrl && (
                  <p id="url-error" className="text-sm text-destructive" role="alert">
                    {errors.redirectUrl?.message as string}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  This is where your QR code will redirect when scanned
                </p>
              </div>
            )}

            {/* vCard Type */}
            {selectedType === 'VCARD' && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="vcardName">
                    Full Name <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Input
                    id="vcardName"
                    {...register('vcardName')}
                    ref={firstFieldRef}
                    placeholder="John Doe"
                    aria-required="true"
                    aria-invalid={!!errors.vcardName}
                  />
                  {errors.vcardName && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.vcardName?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vcardPhone">Phone Number</Label>
                  <Input
                    id="vcardPhone"
                    {...register('vcardPhone')}
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vcardEmail">Email</Label>
                  <Input
                    id="vcardEmail"
                    {...register('vcardEmail')}
                    placeholder="john@example.com"
                    type="email"
                    aria-invalid={!!errors.vcardEmail}
                  />
                  {errors.vcardEmail && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.vcardEmail?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vcardOrganization">Organization</Label>
                  <Input
                    id="vcardOrganization"
                    {...register('vcardOrganization')}
                    placeholder="Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vcardWebsite">Website</Label>
                  <Input
                    id="vcardWebsite"
                    {...register('vcardWebsite')}
                    placeholder="https://example.com"
                    type="url"
                    aria-invalid={!!errors.vcardWebsite}
                  />
                  {errors.vcardWebsite && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.vcardWebsite?.message as string}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* WiFi Type */}
            {selectedType === 'WIFI' && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="wifiSSID">
                    Network Name (SSID) <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Input
                    id="wifiSSID"
                    {...register('wifiSSID')}
                    ref={firstFieldRef}
                    placeholder="MyWiFiNetwork"
                    aria-required="true"
                    aria-invalid={!!errors.wifiSSID}
                  />
                  {errors.wifiSSID && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.wifiSSID?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wifiPassword">Password</Label>
                  <Input
                    id="wifiPassword"
                    {...register('wifiPassword')}
                    placeholder="Enter WiFi password"
                    type="password"
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty if network is open
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wifiEncryption">
                    Encryption Type <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <select
                    id="wifiEncryption"
                    {...register('wifiEncryption')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer transition-all duration-200 hover:border-accent-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    aria-required="true"
                  >
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">No Password</option>
                  </select>
                </div>
              </div>
            )}

            {/* Email Type */}
            {selectedType === 'EMAIL' && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="emailAddress">
                    Email Address <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Input
                    id="emailAddress"
                    {...register('emailAddress')}
                    ref={firstFieldRef}
                    placeholder="contact@example.com"
                    type="email"
                    aria-required="true"
                    aria-invalid={!!errors.emailAddress}
                  />
                  {errors.emailAddress && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.emailAddress?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailSubject">Subject</Label>
                  <Input
                    id="emailSubject"
                    {...register('emailSubject')}
                    placeholder="Email subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailBody">Message</Label>
                  <Textarea
                    id="emailBody"
                    {...register('emailBody')}
                    placeholder="Pre-filled email message"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* SMS Type */}
            {selectedType === 'SMS' && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="smsPhone">
                    Phone Number <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Input
                    id="smsPhone"
                    {...register('smsPhone')}
                    ref={firstFieldRef}
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                    aria-required="true"
                    aria-invalid={!!errors.smsPhone}
                  />
                  {errors.smsPhone && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.smsPhone?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smsMessage">Message</Label>
                  <Textarea
                    id="smsMessage"
                    {...register('smsMessage')}
                    placeholder="Pre-filled SMS message"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Phone Type */}
            {selectedType === 'PHONE' && (
              <div className="space-y-2 animate-in fade-in-50 duration-300">
                <Label htmlFor="phoneNumber">
                  Phone Number <span className="text-destructive" aria-label="required">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  {...register('phoneNumber')}
                  ref={firstFieldRef}
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                  aria-required="true"
                  aria-invalid={!!errors.phoneNumber}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.phoneNumber?.message as string}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Scanning will prompt to call this number
                </p>
              </div>
            )}

            {/* Location Type */}
            {selectedType === 'LOCATION' && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="locationLat">
                    Latitude <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Input
                    id="locationLat"
                    {...register('locationLat')}
                    ref={firstFieldRef}
                    placeholder="37.7749"
                    aria-required="true"
                    aria-invalid={!!errors.locationLat}
                  />
                  {errors.locationLat && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.locationLat?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationLng">
                    Longitude <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Input
                    id="locationLng"
                    {...register('locationLng')}
                    placeholder="-122.4194"
                    aria-required="true"
                    aria-invalid={!!errors.locationLng}
                  />
                  {errors.locationLng && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.locationLng?.message as string}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationAddress">Address (Optional)</Label>
                  <Input
                    id="locationAddress"
                    {...register('locationAddress')}
                    placeholder="123 Main St, City, State"
                  />
                  <p className="text-sm text-muted-foreground">
                    Descriptive address or place name
                  </p>
                </div>
              </div>
            )}

            {/* Text Type */}
            {selectedType === 'TEXT' && (
              <div className="space-y-2 animate-in fade-in-50 duration-300">
                <Label htmlFor="textContent">
                  Text Content <span className="text-destructive" aria-label="required">*</span>
                </Label>
                <Textarea
                  id="textContent"
                  {...register('textContent')}
                  ref={firstFieldRef as any}
                  placeholder="Enter any text content"
                  rows={6}
                  aria-required="true"
                  aria-invalid={!!errors.textContent}
                />
                {errors.textContent && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.textContent?.message as string}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Plain text that will be displayed when scanned
                </p>
              </div>
            )}

            {/* Payment Type */}
            {selectedType === 'PAYMENT' && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="paymentPlatform">
                    Payment Platform <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <select
                    id="paymentPlatform"
                    {...register('paymentPlatform')}
                    ref={firstFieldRef as any}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer transition-all duration-200 hover:border-accent-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    aria-required="true"
                  >
                    <option value="cashapp">Cash App</option>
                    <option value="zelle">Zelle</option>
                    <option value="venmo">Venmo</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentHandle">
                    Username/Handle <span className="text-destructive" aria-label="required">*</span>
                  </Label>
                  <Input
                    id="paymentHandle"
                    {...register('paymentHandle')}
                    placeholder="$username or email"
                    aria-required="true"
                    aria-invalid={!!errors.paymentHandle}
                  />
                  {errors.paymentHandle && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.paymentHandle?.message as string}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Your payment username, cashtag, or email
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxScans">Max Scans (Optional)</Label>
            <Input
              id="maxScans"
              {...register('maxScans', { valueAsNumber: true })}
              type="number"
              min="1"
              placeholder="Unlimited"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty for unlimited scans
            </p>
          </div>

          <div className="flex gap-4 pt-4" role="group" aria-label="Form actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              aria-label="Cancel and go back"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
              aria-label={loading ? 'Creating QR code...' : 'Create QR code'}
            >
              {!loading && <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />}
              {loading ? 'Creating...' : 'Create QR Code'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
