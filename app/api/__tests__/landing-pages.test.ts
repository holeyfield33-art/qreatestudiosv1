import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    landingPage: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock('@/lib/auth-helpers', () => ({
  requireAuth: vi.fn(),
}));

// Mock plan enforcement
vi.mock('@/lib/utils/plan-enforcement', () => ({
  canAccessLandingPage: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-helpers';
import { canAccessLandingPage } from '@/lib/utils/plan-enforcement';

describe('Landing Pages API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/landing-pages/[id]', () => {
    it('should return 401 when not authenticated', async () => {
      (requireAuth as any).mockResolvedValue({
        session: null,
        error: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }),
      });

      const { GET } = await import('@/app/api/landing-pages/[id]/route');
      const response = await GET(
        new Request('http://localhost/api/landing-pages/test-id'),
        { params: Promise.resolve({ id: 'test-id' }) }
      );

      expect(response.status).toBe(401);
    });

    it('should return 404 when page not found', async () => {
      (requireAuth as any).mockResolvedValue({
        session: { user: { id: 'user-1' } },
        error: null,
      });
      (prisma.landingPage.findUnique as any).mockResolvedValue(null);

      const { GET } = await import('@/app/api/landing-pages/[id]/route');
      const response = await GET(
        new Request('http://localhost/api/landing-pages/test-id'),
        { params: Promise.resolve({ id: 'test-id' }) }
      );

      expect(response.status).toBe(404);
    });

    it('should return 404 when page belongs to another user', async () => {
      (requireAuth as any).mockResolvedValue({
        session: { user: { id: 'user-1' } },
        error: null,
      });
      (prisma.landingPage.findUnique as any).mockResolvedValue({
        id: 'test-id',
        userId: 'user-2', // Different user
        name: 'Test Page',
      });
      (canAccessLandingPage as any).mockResolvedValue(false);

      const { GET } = await import('@/app/api/landing-pages/[id]/route');
      const response = await GET(
        new Request('http://localhost/api/landing-pages/test-id'),
        { params: Promise.resolve({ id: 'test-id' }) }
      );

      expect(response.status).toBe(404);
    });

    it('should return page data when authorized', async () => {
      (requireAuth as any).mockResolvedValue({
        session: { user: { id: 'user-1' } },
        error: null,
      });
      (prisma.landingPage.findUnique as any).mockResolvedValue({
        id: 'test-id',
        userId: 'user-1',
        name: 'Test Page',
        slug: 'test-page',
        isPublished: false,
      });
      (canAccessLandingPage as any).mockResolvedValue(true);

      const { GET } = await import('@/app/api/landing-pages/[id]/route');
      const response = await GET(
        new Request('http://localhost/api/landing-pages/test-id'),
        { params: Promise.resolve({ id: 'test-id' }) }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.landingPage.title).toBe('Test Page');
    });
  });

  describe('PATCH /api/landing-pages/[id]', () => {
    it('should reject invalid JSON body', async () => {
      (requireAuth as any).mockResolvedValue({
        session: { user: { id: 'user-1' } },
        error: null,
      });

      const { PATCH } = await import('@/app/api/landing-pages/[id]/route');
      const response = await PATCH(
        new Request('http://localhost/api/landing-pages/test-id', {
          method: 'PATCH',
          body: 'invalid json',
        }),
        { params: Promise.resolve({ id: 'test-id' }) }
      );

      expect(response.status).toBe(400);
    });

    it('should update page when authorized', async () => {
      (requireAuth as any).mockResolvedValue({
        session: { user: { id: 'user-1' } },
        error: null,
      });
      (prisma.landingPage.findUnique as any).mockResolvedValue({
        id: 'test-id',
        userId: 'user-1',
        isPublished: false,
      });
      (prisma.landingPage.update as any).mockResolvedValue({
        id: 'test-id',
        userId: 'user-1',
        name: 'Updated Page',
        isPublished: false,
      });

      const { PATCH } = await import('@/app/api/landing-pages/[id]/route');
      const response = await PATCH(
        new Request('http://localhost/api/landing-pages/test-id', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Updated Page' }),
        }),
        { params: Promise.resolve({ id: 'test-id' }) }
      );

      expect(response.status).toBe(200);
    });
  });
});
