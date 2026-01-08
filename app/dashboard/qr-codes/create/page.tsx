'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import QRCodeDisplay from '@/components/qr/QRCodeDisplay';
import { generateShortCode } from '@/lib/utils/qr-download';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, Sparkles, Zap, Download, Globe, Printer, Eye, Check, ExternalLink, Copy, Package } from 'lucide-react';
import Link from 'next/link';
import { downloadQRCode } from '@/lib/utils/qr-download';

const QR_TYPES = [
  { id: 'URL', name: 'URL', icon: '', description: 'Website or link' },
  { id: 'VCARD', name: 'vCard', icon: '', description: 'Contact information' },
  { id: 'WIFI', name: 'WiFi', icon: '', description: 'Network credentials' },
  { id: 'EMAIL', name: 'Email', icon: '', description: 'Email address' },
  { id: 'SMS', name: 'SMS', icon: '', description: 'Text message' },
  { id: 'PHONE', name: 'Phone', icon: '', description: 'Phone number' },
  { id: 'TEXT', name: 'Text', icon: '', description: 'Plain text' },
  { id: 'PAYMENT_LINK', name: 'Payment', icon: '', description: 'Payment link' },
  { id: 'MENU', name: 'Menu', icon: '', description: 'Digital menu' },
  { id: 'LANDING_PAGE', name: 'Landing', icon: '', description: 'Landing page' },
  { id: 'LOCATION', name: 'Location', icon: '', description: 'GPS coordinates' },
];

const PAYMENT_PLATFORMS = [
  { id: 'cashapp', name: 'Cash App', prefix: '$' },
  { id: 'venmo', name: 'Venmo', prefix: '@' },
  { id: 'paypal', name: 'PayPal', prefix: '' },
  { id: 'zelle', name: 'Zelle', prefix: '' },
  { id: 'apple_pay', name: 'Apple Pay', prefix: '' },
  { id: 'google_pay', name: 'Google Pay', prefix: '' },
  { id: 'bitcoin', name: 'Bitcoin', prefix: 'bitcoin:' },
  { id: 'ethereum', name: 'Ethereum', prefix: '0x' },
];

const DOT_STYLES = [
  { id: 'square', name: 'Square', preview: '■' },
  { id: 'dots', name: 'Dots', preview: '●' },
  { id: 'rounded', name: 'Rounded', preview: '◆' },
  { id: 'classy', name: 'Classy', preview: '◇' },
  { id: 'extra-rounded', name: 'Extra Rounded', preview: '◉' },
];

const CORNER_STYLES = [
  { id: 'square', name: 'Square' },
  { id: 'dot', name: 'Dot' },
  { id: 'extra-rounded', name: 'Rounded' },
];

const FRAME_STYLES = [
  { id: 'none', name: 'None' },
  { id: 'simple', name: 'Simple Border' },
  { id: 'box', name: 'Box Frame' },
  { id: 'circular', name: 'Circular' },
  { id: 'banner', name: 'Banner' },
  { id: 'tooltip', name: 'Tooltip' },
];

export default function CreateQRCodePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qrType, setQrType] = useState('URL');
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [createdQR, setCreatedQR] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    fullName: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    address: '',
    ssid: '',
    password: '',
    encryption: 'WPA',
    emailSubject: '',
    emailBody: '',
    smsMessage: '',
    textContent: '',
    paymentPlatform: 'cashapp',
    paymentHandle: '',
    paymentAmount: '',
    paymentNote: '',
    locationLat: '',
    locationLng: '',
    locationAddress: '',
    redirectUrl: '',
    maxScans: '',
  });
  
  const [qrValue, setQrValue] = useState('');
  const [qrStyle, setQrStyle] = useState({
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    size: 300,
    dotStyle: 'square',
    cornerStyle: 'square',
    errorCorrectionLevel: 'M' as 'L' | 'M' | 'Q' | 'H',
  });

  const [logo, setLogo] = useState<{
    url: string;
    size: number;
    excavate: boolean;
  } | null>(null);

  const [frame, setFrame] = useState({
    style: 'none',
    color: '#000000',
    text: '',
    textColor: '#000000',
  });

  useEffect(() => {
    const newQrValue = generateQRValueFromData(formData);
    setQrValue(newQrValue);
  }, [formData, qrType]);

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function generateQRValueFromData(data: typeof formData) {
    switch (qrType) {
      case 'URL':
        return data.url;
      
      case 'VCARD':
        if (!data.fullName) return '';
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${data.fullName}\nTEL:${data.phone}\nEMAIL:${data.email}\nORG:${data.company}\nURL:${data.website}\nADR:${data.address}\nEND:VCARD`;
      
      case 'WIFI':
        if (!data.ssid) return '';
        return `WIFI:T:${data.encryption};S:${data.ssid};P:${data.password};;`;
      
      case 'EMAIL':
        if (!data.email) return '';
        return `mailto:${data.email}?subject=${encodeURIComponent(data.emailSubject)}&body=${encodeURIComponent(data.emailBody)}`;
      
      case 'SMS':
        if (!data.phone) return '';
        return `sms:${data.phone}?body=${encodeURIComponent(data.smsMessage)}`;
      
      case 'PHONE':
        return `tel:${data.phone}`;
      
      case 'TEXT':
        return data.textContent;
      
      case 'PAYMENT_LINK':
        const platform = PAYMENT_PLATFORMS.find(p => p.id === data.paymentPlatform);
        if (!data.paymentHandle) return '';
        if (data.paymentPlatform === 'bitcoin') {
          return `bitcoin:${data.paymentHandle}${data.paymentAmount ? `?amount=${data.paymentAmount}` : ''}`;
        } else if (data.paymentPlatform === 'ethereum') {
          return `ethereum:${data.paymentHandle}${data.paymentAmount ? `?value=${data.paymentAmount}` : ''}`;
        }
        return `${platform?.prefix || ''}${data.paymentHandle}`;
      
      case 'LOCATION':
        if (!data.locationLat || !data.locationLng) return '';
        return `geo:${data.locationLat},${data.locationLng}${data.locationAddress ? `?q=${encodeURIComponent(data.locationAddress)}` : ''}`;
      
      case 'MENU':
      case 'LANDING_PAGE':
        return data.redirectUrl;
      
      default:
        return data.url;
    }
  }

  async function handleAIOptimization() {
    if (!qrValue) {
      toast.error('Please fill in QR data first');
      return;
    }

    setAiOptimizing(true);
    try {
      const response = await fetch('/api/ai/optimize-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrType,
          currentData: formData,
          currentStyle: qrStyle,
        }),
      });

      if (!response.ok) throw new Error('AI optimization failed');

      const data = await response.json();
      
      if (data.suggestions) {
        if (data.suggestions.colors) {
          setQrStyle(prev => ({
            ...prev,
            fgColor: data.suggestions.colors.foreground || prev.fgColor,
            bgColor: data.suggestions.colors.background || prev.bgColor,
          }));
        }
        if (data.suggestions.style) {
          setQrStyle(prev => ({
            ...prev,
            dotStyle: data.suggestions.style.dotStyle || prev.dotStyle,
            cornerStyle: data.suggestions.style.cornerStyle || prev.cornerStyle,
          }));
        }
        toast.success('AI optimization applied!');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('AI optimization error:', error);
      }
      toast.error('AI optimization unavailable');
    } finally {
      setAiOptimizing(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setLogo({
          url,
          size: 60,
          excavate: true,
        });
        toast.success('Logo uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Logo upload error:', error);
      }
      toast.error('Failed to upload logo');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!qrValue) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);

    try {
      const shortCode = generateShortCode(8);
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const shortUrl = `${baseUrl}/s/${shortCode}`;

      const styleData = {
        fgColor: qrStyle.fgColor,
        bgColor: qrStyle.bgColor,
        dotStyle: qrStyle.dotStyle,
        cornerStyle: qrStyle.cornerStyle,
        errorCorrectionLevel: qrStyle.errorCorrectionLevel,
        logo: logo,
        frame: frame.style !== 'none' ? frame : null,
      };

      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || `${qrType} QR Code`,
          description: formData.description,
          type: qrType,
          destinationUrl: qrValue,
          shortCode,
          shortUrl,
          style: styleData,
          maxScans: formData.maxScans ? parseInt(formData.maxScans) : null,
          content: JSON.stringify(formData),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create QR code');
      }

      const data = await response.json();

      // Show success modal instead of redirecting
      setCreatedQR(data);
      setShowSuccessModal(true);
      toast.success('QR code created successfully!');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating QR code:', error);
      }
      toast.error(error instanceof Error ? error.message : 'Failed to create QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/dashboard/qr-codes">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to QR Codes
          </Button>
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Create Premium QR Code</h1>
            <p className="text-muted-foreground">Generate a fully customizable QR code with advanced features</p>
          </div>
          <Button
            variant="outline"
            onClick={handleAIOptimization}
            disabled={!qrValue || aiOptimizing}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {aiOptimizing ? 'Optimizing...' : 'AI Optimize'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* QR Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>1. Select Type</CardTitle>
              <CardDescription>Choose what your QR code will link to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QR_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setQrType(type.id);
                      setQrValue('');
                    }}
                    className={`p-4 rounded-lg border-2 transition-all hover:border-blue-500 ${
                      qrType === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-semibold text-sm">{type.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {type.description}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Fields */}
          <Card>
            <CardHeader>
              <CardTitle>2. Enter Details</CardTitle>
              <CardDescription>Fill in your QR code information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">QR Code Name (Optional)</Label>
                  <Input
                    id="name"
                    placeholder="My QR Code"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a description for internal use"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={2}
                  />
                </div>

                {/* URL Type */}
                {qrType === 'URL' && (
                  <div>
                    <Label htmlFor="url">Destination URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* vCard Type */}
                {qrType === 'VCARD' && (
                  <>
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        placeholder="Acme Inc"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://company.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St, City, State"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* WiFi Type */}
                {qrType === 'WIFI' && (
                  <>
                    <div>
                      <Label htmlFor="ssid">Network Name (SSID) *</Label>
                      <Input
                        id="ssid"
                        placeholder="MyWiFi"
                        value={formData.ssid}
                        onChange={(e) => handleInputChange('ssid', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="password123"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="encryption">Encryption</Label>
                      <Select value={formData.encryption} onValueChange={(value) => handleInputChange('encryption', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WPA">WPA/WPA2</SelectItem>
                          <SelectItem value="WEP">WEP</SelectItem>
                          <SelectItem value="nopass">No Password</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Email Type */}
                {qrType === 'EMAIL' && (
                  <>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailSubject">Subject</Label>
                      <Input
                        id="emailSubject"
                        placeholder="Email subject"
                        value={formData.emailSubject}
                        onChange={(e) => handleInputChange('emailSubject', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emailBody">Message</Label>
                      <Textarea
                        id="emailBody"
                        placeholder="Pre-filled email message"
                        value={formData.emailBody}
                        onChange={(e) => handleInputChange('emailBody', e.target.value)}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                {/* SMS Type */}
                {qrType === 'SMS' && (
                  <>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="smsMessage">Message</Label>
                      <Textarea
                        id="smsMessage"
                        placeholder="Pre-filled SMS message"
                        value={formData.smsMessage}
                        onChange={(e) => handleInputChange('smsMessage', e.target.value)}
                        rows={4}
                      />
                    </div>
                  </>
                )}

                {/* Phone Type */}
                {qrType === 'PHONE' && (
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Text Type */}
                {qrType === 'TEXT' && (
                  <div>
                    <Label htmlFor="textContent">Text Content *</Label>
                    <Textarea
                      id="textContent"
                      placeholder="Enter any text content"
                      value={formData.textContent}
                      onChange={(e) => handleInputChange('textContent', e.target.value)}
                      rows={6}
                      required
                    />
                  </div>
                )}

                {/* Payment Type */}
                {qrType === 'PAYMENT_LINK' && (
                  <>
                    <div>
                      <Label htmlFor="paymentPlatform">Payment Platform *</Label>
                      <Select value={formData.paymentPlatform} onValueChange={(value) => handleInputChange('paymentPlatform', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_PLATFORMS.map(platform => (
                            <SelectItem key={platform.id} value={platform.id}>
                              {platform.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="paymentHandle">
                        {PAYMENT_PLATFORMS.find(p => p.id === formData.paymentPlatform)?.name} Handle *
                      </Label>
                      <Input
                        id="paymentHandle"
                        placeholder={`${PAYMENT_PLATFORMS.find(p => p.id === formData.paymentPlatform)?.prefix}username`}
                        value={formData.paymentHandle}
                        onChange={(e) => handleInputChange('paymentHandle', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentAmount">Amount (Optional)</Label>
                      <Input
                        id="paymentAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.paymentAmount}
                        onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentNote">Note (Optional)</Label>
                      <Input
                        id="paymentNote"
                        placeholder="Payment note"
                        value={formData.paymentNote}
                        onChange={(e) => handleInputChange('paymentNote', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Location Type */}
                {qrType === 'LOCATION' && (
                  <>
                    <div>
                      <Label htmlFor="locationLat">Latitude *</Label>
                      <Input
                        id="locationLat"
                        placeholder="37.7749"
                        value={formData.locationLat}
                        onChange={(e) => handleInputChange('locationLat', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationLng">Longitude *</Label>
                      <Input
                        id="locationLng"
                        placeholder="-122.4194"
                        value={formData.locationLng}
                        onChange={(e) => handleInputChange('locationLng', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationAddress">Address (Optional)</Label>
                      <Input
                        id="locationAddress"
                        placeholder="123 Main St, City, State"
                        value={formData.locationAddress}
                        onChange={(e) => handleInputChange('locationAddress', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Menu/Landing Page Type */}
                {(qrType === 'MENU' || qrType === 'LANDING_PAGE') && (
                  <div>
                    <Label htmlFor="redirectUrl">Destination URL *</Label>
                    <Input
                      id="redirectUrl"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.redirectUrl}
                      onChange={(e) => handleInputChange('redirectUrl', e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="maxScans">Max Scans (Optional)</Label>
                  <Input
                    id="maxScans"
                    type="number"
                    placeholder="Unlimited"
                    value={formData.maxScans}
                    onChange={(e) => handleInputChange('maxScans', e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || !qrValue}>
                  {loading ? 'Creating...' : 'Create QR Code'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card>
            <CardHeader>
              <CardTitle>3. Customize Design</CardTitle>
              <CardDescription>Make your QR code unique</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="colors">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="logo">Logo</TabsTrigger>
                  <TabsTrigger value="frame">Frame</TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-4 mt-4">
                  <div>
                    <Label>Foreground Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={qrStyle.fgColor}
                        onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={qrStyle.fgColor}
                        onChange={(e) => setQrStyle({ ...qrStyle, fgColor: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Background Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={qrStyle.bgColor}
                        onChange={(e) => setQrStyle({ ...qrStyle, bgColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={qrStyle.bgColor}
                        onChange={(e) => setQrStyle({ ...qrStyle, bgColor: e.target.value })}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="space-y-4 mt-4">
                  <div>
                    <Label>Dot Style</Label>
                    <Select value={qrStyle.dotStyle} onValueChange={(value) => setQrStyle({ ...qrStyle, dotStyle: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DOT_STYLES.map(style => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.preview} {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Corner Style</Label>
                    <Select value={qrStyle.cornerStyle} onValueChange={(value) => setQrStyle({ ...qrStyle, cornerStyle: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CORNER_STYLES.map(style => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Error Correction</Label>
                    <Select value={qrStyle.errorCorrectionLevel} onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setQrStyle({ ...qrStyle, errorCorrectionLevel: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="logo" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="logo-upload">Upload Logo</Label>
                    <div className="mt-2">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="cursor-pointer"
                      />
                    </div>
                    {logo && (
                      <>
                        <div className="mt-4">
                          <img src={logo.url} alt="Logo preview" className="w-20 h-20 object-contain border rounded" />
                        </div>
                        <div className="mt-4">
                          <Label>Logo Size</Label>
                          <Input
                            type="range"
                            min="40"
                            max="100"
                            value={logo.size}
                            onChange={(e) => setLogo({ ...logo, size: parseInt(e.target.value) })}
                            className="mt-2"
                          />
                          <span className="text-sm text-muted-foreground">{logo.size}px</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            id="excavate"
                            checked={logo.excavate}
                            onChange={(e) => setLogo({ ...logo, excavate: e.target.checked })}
                          />
                          <Label htmlFor="excavate">Clear background behind logo</Label>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLogo(null)}
                          className="mt-2"
                        >
                          Remove Logo
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="frame" className="space-y-4 mt-4">
                  <div>
                    <Label>Frame Style</Label>
                    <Select value={frame.style} onValueChange={(value) => setFrame({ ...frame, style: value })}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FRAME_STYLES.map(style => (
                          <SelectItem key={style.id} value={style.id}>
                            {style.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {frame.style !== 'none' && (
                    <>
                      <div>
                        <Label>Frame Color</Label>
                        <Input
                          type="color"
                          value={frame.color}
                          onChange={(e) => setFrame({ ...frame, color: e.target.value })}
                          className="w-20 h-10 mt-2"
                        />
                      </div>
                      <div>
                        <Label>Frame Text</Label>
                        <Input
                          placeholder="Scan Me!"
                          value={frame.text}
                          onChange={(e) => setFrame({ ...frame, text: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Text Color</Label>
                        <Input
                          type="color"
                          value={frame.textColor}
                          onChange={(e) => setFrame({ ...frame, textColor: e.target.value })}
                          className="w-20 h-10 mt-2"
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:sticky lg:top-8 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>Your QR code will look like this</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative" key={`${qrValue}-${qrStyle.fgColor}-${qrStyle.bgColor}-${qrStyle.dotStyle}`}>
                <QRCodeDisplay
                  value={qrValue || 'https://qreatestudios.com'}
                  size={qrStyle.size}
                  fgColor={qrStyle.fgColor}
                  bgColor={qrStyle.bgColor}
                  level={qrStyle.errorCorrectionLevel}
                  includeMargin={true}
                  dotStyle={qrStyle.dotStyle}
                  cornerStyle={qrStyle.cornerStyle}
                  imageSettings={logo ? {
                    src: logo.url,
                    height: logo.size,
                    width: logo.size,
                    excavate: logo.excavate,
                  } : undefined}
                />
                {frame.style !== 'none' && frame.text && (
                  <div 
                    className="mt-2 text-center font-semibold"
                    style={{ color: frame.textColor }}
                  >
                    {frame.text}
                  </div>
                )}
              </div>
              
              {qrValue && (
                <div className="mt-4 text-center w-full">
                  <p className="text-sm text-muted-foreground mb-2">
                    ✅ Ready to scan • Test with your phone camera
                  </p>
                  <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
                    {qrType} QR Code
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && createdQR && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="text-center space-y-4 pb-6 bg-gradient-to-b from-green-50 to-white">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  QR Code Created Successfully
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Your QR code is ready to use. What would you like to do next?
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* QR Preview */}
              <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-blue-100">
                <div className="bg-white rounded-xl p-6 shadow-lg mx-auto max-w-fit qr-code-container">
                  <QRCodeDisplay
                    value={qrValue}
                    size={220}
                    fgColor={qrStyle.fgColor}
                    bgColor={qrStyle.bgColor}
                    level="M"
                    includeMargin={true}
                  />
                  <p className="text-sm font-semibold text-gray-700 mt-4 text-center">
                    {createdQR.name}
                  </p>
                </div>
              </div>

              {/* Short URL */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                <Label className="text-sm font-bold text-blue-900 mb-2 block">
                  📎 Short URL
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={createdQR.shortUrl}
                    readOnly
                    className="font-mono text-sm bg-white border-blue-200"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-300 hover:bg-blue-100"
                    onClick={() => {
                      navigator.clipboard.writeText(createdQR.shortUrl);
                      toast.success('Copied to clipboard!');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 p-0 h-auto text-xs text-blue-600"
                  onClick={() => window.open(createdQR.shortUrl, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Test QR Code
                </Button>
              </div>

              {/* Download Section */}
              <div className="space-y-3">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Download className="w-5 h-5 text-purple-600" />
                  Download Your QR Code
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-auto py-6 flex flex-col gap-3 border-2 hover:border-blue-400 hover:bg-blue-50 transition-all"
                    onClick={async () => {
                      try {
                        await downloadQRCode('.qr-code-container', `qr-${createdQR.id}`, 'png', 2048);
                        toast.success('✅ Downloaded PNG (2048x2048)!');
                      } catch (error) {
                        toast.error('Download failed. Please try again.');
                      }
                    }}
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Download className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold">PNG Image</div>
                      <div className="text-xs text-muted-foreground">High Quality • 2048x2048</div>
                    </div>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="h-auto py-6 flex flex-col gap-3 border-2 hover:border-purple-400 hover:bg-purple-50 transition-all"
                    onClick={async () => {
                      try {
                        await downloadQRCode('.qr-code-container', `qr-${createdQR.id}`, 'svg');
                        toast.success('✅ Downloaded SVG (Vector)!');
                      } catch (error) {
                        toast.error('Download failed. Please try again.');
                      }
                    }}
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Download className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold">SVG Vector</div>
                      <div className="text-xs text-muted-foreground">Scalable • Print-Ready</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-lg">What's Next?</h3>
                
                <Button
                  size="lg"
                  className="w-full h-auto py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                  onClick={() => {
                    router.push(`/dashboard/landing-pages/create?qrId=${createdQR.id}`);
                  }}
                >
                  <Globe className="w-6 h-6 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-bold text-base">Create Landing Page</div>
                    <div className="text-xs opacity-90">Build a custom page for this QR code</div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-auto py-5 border-2 hover:bg-orange-50 hover:border-orange-300 transition-all"
                  onClick={() => {
                    router.push(`/dashboard/print-orders/new?qrId=${createdQR.id}`);
                  }}
                >
                  <Printer className="w-6 h-6 mr-3 text-orange-600" />
                  <div className="text-left flex-1">
                    <div className="font-bold text-base">Order Physical Products</div>
                    <div className="text-xs text-muted-foreground">NFC cards, stickers, flyers & more</div>
                  </div>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-2"
                  onClick={() => {
                    router.push(`/dashboard/qr-codes/${createdQR.id}`);
                  }}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Details & Analytics
                </Button>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t space-y-2">
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setShowSuccessModal(false);
                    setCreatedQR(null);
                    window.location.reload();
                  }}
                >
                  ← Create Another QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
