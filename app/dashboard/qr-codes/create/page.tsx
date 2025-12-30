'use client';

import { useState, useEffect } from 'react';
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

const qrSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  type: z.enum(['URL', 'VCARD', 'EMAIL', 'SMS', 'WIFI', 'TEXT', 'PHONE', 'MENU', 'PAYMENT', 'LANDING_PAGE']),
  redirectUrl: z.string().url('Must be a valid URL'),
  maxScans: z.number().optional(),
});

type QRFormData = z.infer<typeof qrSchema>;

export default function CreateQRPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QRTemplate | null>(null);
  const [qrStyle, setQrStyle] = useState<any>(null);
  const [contrastValidation, setContrastValidation] = useState<any>(null);

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
  } = useForm<QRFormData>({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'URL',
      redirectUrl: '',
    },
  });

  async function onSubmit(data: QRFormData) {
    setLoading(true);
    try {
      // Include template style if selected
      const payload = {
        ...data,
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
                {errors.name.message}
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
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-required="true"
            >
              <option value="URL">URL - Website Link</option>
              <option value="VCARD">vCard - Contact Information</option>
              <option value="EMAIL">Email Address</option>
              <option value="SMS">SMS Message</option>
              <option value="WIFI">WiFi Network</option>
              <option value="TEXT">Plain Text</option>
              <option value="PHONE">Phone Number</option>
              <option value="MENU">Digital Menu</option>
              <option value="PAYMENT">Payment Link</option>
              <option value="LANDING_PAGE">Landing Page</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="redirectUrl">
              Destination URL <span className="text-destructive" aria-label="required">*</span>
            </Label>
            <Input
              id="redirectUrl"
              {...register('redirectUrl')}
              placeholder="https://example.com"
              type="url"
              aria-required="true"
              aria-invalid={!!errors.redirectUrl}
              aria-describedby={errors.redirectUrl ? 'url-error' : undefined}
            />
            {errors.redirectUrl && (
              <p id="url-error" className="text-sm text-destructive" role="alert">
                {errors.redirectUrl.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              This is where your QR code will redirect when scanned
            </p>
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
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <QrCode className="mr-2 h-4 w-4" aria-hidden="true" />
              {loading ? 'Creating...' : 'Create QR Code'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
