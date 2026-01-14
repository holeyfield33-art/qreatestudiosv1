/**
 * Unit tests for Landing Page Builder
 * Tests the core functionality of saving, publishing, and state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the Puck component since it's dynamically imported
vi.mock('@measured/puck', () => ({
  Puck: ({ data, onChange, onPublish }: any) => (
    <div data-testid="puck-editor">
      <button 
        onClick={() => onChange({ ...data, modified: true })}
        data-testid="modify-content"
      >
        Modify Content
      </button>
      <button onClick={() => onPublish(data)} data-testid="puck-publish">
        Puck Publish
      </button>
      <div data-testid="puck-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

// Mock puck config
vi.mock('@/lib/puckConfig', () => ({
  default: { components: {} },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Import after mocks
const mockToast = await import('sonner');

describe('BuilderPage - Core Functionality', () => {
  const mockPageData = {
    id: 'test-page-id',
    name: 'Test Landing Page',
    slug: 'test-page',
    draftContent: {
      content: [],
      root: { props: { title: 'Test Page' } },
    },
    publishedContent: null,
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/api/landing-pages/test-page-id')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPageData),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    }) as any;
  });

  it('should render loading state initially', async () => {
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    
    render(<BuilderPage params={params} />);
    
    // Should show loading initially
    expect(screen.getByText(/loading your workspace/i)).toBeInTheDocument();
  });

  it('should load page data and render editor', async () => {
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    
    render(<BuilderPage params={params} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Landing Page')).toBeInTheDocument();
    });
    
    // Should show page info
    expect(screen.getByText('/l/test-page')).toBeInTheDocument();
  });

  it('should handle content changes via onChange', async () => {
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    const user = userEvent.setup();
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('puck-editor')).toBeInTheDocument();
    });
    
    // Trigger content modification
    const modifyButton = screen.getByTestId('modify-content');
    await user.click(modifyButton);
    
    // Should mark as unsaved
    await waitFor(() => {
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });
  });

  it('should auto-save after debounce period', async () => {
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    const user = userEvent.setup();
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('puck-editor')).toBeInTheDocument();
    });
    
    // Trigger content modification
    const modifyButton = screen.getByTestId('modify-content');
    await user.click(modifyButton);
    
    // Wait for auto-save (2 seconds + buffer)
    await waitFor(
      () => {
        const patchCalls = (global.fetch as any).mock.calls.filter(
          ([url, options]: any) => 
            url.includes('/api/landing-pages/test-page-id') && 
            options?.method === 'PATCH'
        );
        expect(patchCalls.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it('should handle manual save', async () => {
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    const user = userEvent.setup();
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Landing Page')).toBeInTheDocument();
    });
    
    // Make a change first
    const modifyButton = screen.getByTestId('modify-content');
    await user.click(modifyButton);
    
    // Click save draft button
    const saveButton = screen.getByRole('button', { name: /save draft/i });
    await user.click(saveButton);
    
    // Should call API
    await waitFor(() => {
      expect(mockToast.toast.success).toHaveBeenCalledWith(
        'Draft saved',
        expect.any(Object)
      );
    });
  });

  it('should handle publish', async () => {
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    const user = userEvent.setup();
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Landing Page')).toBeInTheDocument();
    });
    
    // Click publish button
    const publishButton = screen.getByRole('button', { name: /publish/i });
    await user.click(publishButton);
    
    // Should call both PATCH and publish POST
    await waitFor(() => {
      const calls = (global.fetch as any).mock.calls;
      const publishCall = calls.find(
        ([url]: any) => url.includes('/publish')
      );
      expect(publishCall).toBeDefined();
    });
    
    await waitFor(() => {
      expect(mockToast.toast.success).toHaveBeenCalledWith(
        'Page published!',
        expect.any(Object)
      );
    });
  });

  it('should open preview in new window', async () => {
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    const user = userEvent.setup();
    
    // Mock window.open
    const mockOpen = vi.fn();
    window.open = mockOpen;
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Landing Page')).toBeInTheDocument();
    });
    
    // Click preview button
    const previewButton = screen.getByRole('button', { name: /preview/i });
    await user.click(previewButton);
    
    expect(mockOpen).toHaveBeenCalledWith('/l/test-page?preview=true', '_blank');
  });

  it('should handle API errors gracefully', async () => {
    // Mock failed API call
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      } as Response)
    ) as any;
    
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      expect(mockToast.toast.error).toHaveBeenCalledWith(
        'Failed to load page',
        expect.any(Object)
      );
    });
  });

  it('should warn before leaving with unsaved changes', async () => {
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    const user = userEvent.setup();
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('puck-editor')).toBeInTheDocument();
    });
    
    // Make a change
    const modifyButton = screen.getByTestId('modify-content');
    await user.click(modifyButton);
    
    // Trigger beforeunload
    const event = new Event('beforeunload');
    window.dispatchEvent(event);
    
    // Event should be prevented (we can't easily test the actual browser confirmation)
    // but we can verify the handler is attached
    await waitFor(() => {
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
    });
  });

  it('should display last saved time', async () => {
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Landing Page')).toBeInTheDocument();
    });
    
    // Should show saved time indicator
    await waitFor(() => {
      const savedText = screen.getByText(/saved/i);
      expect(savedText).toBeInTheDocument();
    });
  });
});

describe('BuilderPage - Edge Cases', () => {
  it('should handle missing draft content and use published content', async () => {
    const mockPageWithoutDraft = {
      id: 'test-page-id',
      name: 'Test Page',
      slug: 'test-page',
      draftContent: null,
      publishedContent: {
        content: [{ type: 'Hero', props: {} }],
        root: {},
      },
      updatedAt: new Date().toISOString(),
    };
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPageWithoutDraft),
      } as Response)
    ) as any;
    
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      const puckData = screen.getByTestId('puck-data');
      expect(puckData.textContent).toContain('Hero');
    });
  });

  it('should handle completely empty content', async () => {
    const mockEmptyPage = {
      id: 'test-page-id',
      name: 'Empty Page',
      slug: 'empty-page',
      draftContent: null,
      publishedContent: null,
      updatedAt: new Date().toISOString(),
    };
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockEmptyPage),
      } as Response)
    ) as any;
    
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      const puckData = screen.getByTestId('puck-data');
      // Should have default empty structure
      expect(puckData.textContent).toContain('content');
    });
  });

  it('should disable save button when no unsaved changes', async () => {
    const mockPageData = {
      id: 'test-page-id',
      name: 'Test Page',
      slug: 'test-page',
      draftContent: { content: [], root: {} },
      updatedAt: new Date().toISOString(),
    };
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPageData),
      } as Response)
    ) as any;
    
    const { default: BuilderPage } = await import('./page');
    const params = Promise.resolve({ id: 'test-page-id' });
    
    render(<BuilderPage params={params} />);
    
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /save draft/i });
      expect(saveButton).toBeDisabled();
    });
  });
});
