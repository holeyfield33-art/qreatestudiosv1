import QRCode from 'qrcode';
import sharp from 'sharp';

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  type?: 'image/png' | 'image/jpeg' | 'svg';
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface QRCodeResult {
  dataUrl: string;
  buffer: Buffer;
}

export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<QRCodeResult> {
  const opts = {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    type: options.type || 'image/png',
    width: options.width || 400,
    margin: options.margin || 2,
    color: {
      dark: options.color?.dark || '#000000',
      light: options.color?.light || '#FFFFFF',
    },
  };

  if (opts.type === 'svg') {
    const svg = await QRCode.toString(data, {
      errorCorrectionLevel: opts.errorCorrectionLevel,
      width: opts.width,
      margin: opts.margin,
      color: opts.color,
      type: 'svg',
    });
    return {
      dataUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      buffer: Buffer.from(svg),
    };
  }

  const buffer = await QRCode.toBuffer(data, {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    width: opts.width,
    margin: opts.margin,
    color: opts.color,
    type: 'png',
  });
  
  const dataUrl = await QRCode.toDataURL(data, {
    errorCorrectionLevel: opts.errorCorrectionLevel,
    width: opts.width,
    margin: opts.margin,
    color: opts.color,
  });

  return { dataUrl, buffer };
}

export async function generateStyledQRCode(
  data: string,
  style: any,
  logoUrl?: string
): Promise<QRCodeResult> {
  const options: QRCodeOptions = {
    width: style?.width || 400,
    margin: style?.margin || 2,
    color: {
      dark: style?.darkColor || '#000000',
      light: style?.lightColor || '#FFFFFF',
    },
  };

  const qr = await generateQRCode(data, options);

  // If logo provided, embed it (simplified - just overlay in center)
  if (logoUrl) {
    try {
      const qrImage = sharp(qr.buffer);
      const metadata = await qrImage.metadata();
      const logoSize = Math.floor((metadata.width || 400) * 0.2);

      // Download and resize logo
      // For now, return base QR - logo embedding can be enhanced later
      return qr;
    } catch (error) {
      console.error('Logo embedding failed:', error);
      return qr;
    }
  }

  return qr;
}

export function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function isShortCodeUnique(code: string, prisma: any): Promise<boolean> {
  const existing = await prisma.qRCode.findUnique({
    where: { shortCode: code },
  });
  return !existing;
}

export async function generateUniqueShortCode(prisma: any): Promise<string> {
  let code = generateShortCode();
  let attempts = 0;
  while (!(await isShortCodeUnique(code, prisma)) && attempts < 10) {
    code = generateShortCode();
    attempts++;
  }
  if (attempts >= 10) {
    code = generateShortCode(8); // Use longer code if collision
  }
  return code;
}
