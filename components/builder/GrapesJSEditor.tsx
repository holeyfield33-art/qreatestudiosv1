'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';

interface GrapesJSEditorProps {
  initialData?: {
    html?: string;
    css?: string;
    json?: Record<string, unknown> | null;
  };
  onChange?: (data: { html: string; css: string; json: Record<string, unknown> }) => void;
  onLoad?: () => void;
}

export interface GrapesJSEditorRef {
  getHtml: () => string;
  getCss: () => string;
  getJson: () => Record<string, unknown> | null;
  setContent: (html: string, css?: string) => void;
}

const GrapesJSEditor = forwardRef<GrapesJSEditorRef, GrapesJSEditorProps>(
  ({ initialData, onChange, onLoad }, ref) => {
    const editorRef = useRef<any>(null);
    const initialDataRef = useRef(initialData);
    const onChangeRef = useRef(onChange);
    const changeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isInitializedRef = useRef(false);

    onChangeRef.current = onChange;

    useImperativeHandle(ref, () => ({
      getHtml: () => editorRef.current?.getHtml() ?? '',
      getCss: () => editorRef.current?.getCss() ?? '',
      getJson: () => editorRef.current?.getProjectData() ?? null,
      setContent: (html: string, css?: string) => {
        if (!editorRef.current) return;
        editorRef.current.setComponents(html);
        if (css) editorRef.current.setStyle(css);
      },
    }));

    const emitChange = useCallback(() => {
      if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
      changeTimerRef.current = setTimeout(() => {
        if (!editorRef.current || !onChangeRef.current) return;
        onChangeRef.current({
          html: editorRef.current.getHtml(),
          css: editorRef.current.getCss(),
          json: editorRef.current.getProjectData(),
        });
      }, 500);
    }, []);

    useEffect(() => {
      if (isInitializedRef.current) return;
      let destroyed = false;

      import('grapesjs').then((grapesjs) => {
        if (destroyed || editorRef.current) return;

        // Ensure container exists in DOM before init
        const container = document.getElementById('gjs-editor');
        if (!container) {
          console.error('GrapesJS: #gjs-editor container not found in DOM');
          return;
        }

        isInitializedRef.current = true;

        const editor = grapesjs.default.init({
          container: '#gjs-editor',
          height: '100%',
          width: '100%',
          storageManager: false,
          noticeOnUnload: false,
          canvas: { scripts: [], styles: [] },
          canvasCss: `
            * { box-sizing: border-box; }
            body { margin: 0; }
            .gjs-selected { outline: 2px solid #3b82f6 !important; outline-offset: -2px; }
            .gjs-hovered { outline: 1px dashed #93c5fd !important; }
            section, div, header, footer, article, aside, main, nav { min-height: 20px; }
            img { pointer-events: all; }
          `,
          protectedCss: '',
          multipleSelection: true,
          deviceManager: {
            devices: [
              { name: 'Desktop', width: '' },
              { name: 'Tablet', width: '768px', widthMedia: '768px' },
              { name: 'Mobile', width: '375px', widthMedia: '480px' },
            ],
          },
          assetManager: {
            upload: '/api/upload',
            multiUpload: true,
            autoAdd: true as any,
            assets: [
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920',
              'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920',
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
            ],
            uploadFile: (async (e: any) => {
              const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
              const uploads = await Promise.all(
                Array.from(files as FileList).map(async (file: any) => {
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await fetch('/api/upload', { method: 'POST', body: formData, credentials: 'include' });
                    if (!response.ok) throw new Error('Upload failed');
                    const data = await response.json();
                    return data.url ? { src: data.url, name: file.name, type: file.type } : null;
                  } catch (error) { console.error('Upload error:', error); return null; }
                })
              );
              return { data: uploads.filter(Boolean) };
            }) as any,
          },
          panels: {
            defaults: [{
              id: 'basic-actions',
              el: '.panel__basic-actions',
              buttons: [
                { id: 'visibility', active: true, className: 'btn-toggle-borders', label: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>', command: 'sw-visibility', attributes: { title: 'Toggle borders' } },
                { id: 'preview', className: 'btn-preview', label: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>', command: 'preview', attributes: { title: 'Preview' } },
                { id: 'fullscreen', className: 'btn-fullscreen', label: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>', command: 'fullscreen', attributes: { title: 'Fullscreen' } },
                { id: 'undo', className: 'btn-undo', label: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>', command: 'undo', attributes: { title: 'Undo (Ctrl+Z)' } },
                { id: 'redo', className: 'btn-redo', label: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>', command: 'redo', attributes: { title: 'Redo (Ctrl+Shift+Z)' } },
              ],
            }],
          },
          blockManager: {
            appendTo: '#blocks',
            blocks: [
              { id: 'section', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M2 20h20v2H2zM4 18h16c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1v10c0 .6.4 1 1 1z"/></svg><div style="font-size:11px;margin-top:4px">Section</div>', content: '<section style="padding:80px 20px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white"><div style="max-width:1200px;margin:0 auto"><h1 style="font-size:48px;margin-bottom:20px;font-weight:bold">Your Section Title</h1><p style="font-size:18px;line-height:1.6">Add your content here.</p></div></section>', category: 'Sections' },
              { id: 'hero', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"/></svg><div style="font-size:11px;margin-top:4px">Hero</div>', content: '<section style="min-height:70vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(\'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920\') center/cover;color:white;text-align:center;padding:40px 20px"><div style="max-width:800px"><h1 style="font-size:56px;margin-bottom:24px;font-weight:bold">Welcome</h1><p style="font-size:20px;margin-bottom:32px;line-height:1.6">Your subtitle here</p><a href="#" style="display:inline-block;padding:16px 32px;background:#3b82f6;color:white;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">Get Started</a></div></section>', category: 'Sections' },
              { id: 'text', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M4 5h16v2H4zM4 11h16v2H4zM4 17h10v2H4z"/></svg><div style="font-size:11px;margin-top:4px">Text</div>', content: '<div data-gjs-type="text" style="padding:10px;font-size:16px;line-height:1.6">Insert your text here. Double-click to edit.</div>', category: 'Basic' },
              { id: 'image', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"/></svg><div style="font-size:11px;margin-top:4px">Image</div>', content: { type: 'image', style: { 'max-width': '100%', height: 'auto', display: 'block', 'border-radius': '8px' }, attributes: { src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800', alt: 'Image' } }, category: 'Media' },
              { id: 'button', label: '<svg viewBox="0 0 24 24" width="32" height="32"><rect fill="currentColor" x="4" y="8" width="16" height="8" rx="2"/></svg><div style="font-size:11px;margin-top:4px">Button</div>', content: '<a href="#" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:6px;font-weight:600;text-align:center">Click me</a>', category: 'Basic' },
              { id: 'divider', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M4 11h16v2H4z"/></svg><div style="font-size:11px;margin-top:4px">Divider</div>', content: '<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0" />', category: 'Basic' },
              { id: '2-columns', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M11 3H3v18h8V3zm10 0h-8v18h8V3z"/></svg><div style="font-size:11px;margin-top:4px">2 Columns</div>', content: '<div style="display:flex;gap:20px;padding:20px;flex-wrap:wrap"><div style="flex:1;min-width:250px;padding:20px;background:#f3f4f6;border-radius:8px"><h3 style="margin-bottom:12px">Column 1</h3><p>Your content here</p></div><div style="flex:1;min-width:250px;padding:20px;background:#f3f4f6;border-radius:8px"><h3 style="margin-bottom:12px">Column 2</h3><p>Your content here</p></div></div>', category: 'Layout' },
              { id: '3-columns', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M8 3H3v18h5V3zm7 0H9v18h6V3zm7 0h-5v18h5V3z"/></svg><div style="font-size:11px;margin-top:4px">3 Columns</div>', content: '<div style="display:flex;gap:20px;padding:20px;flex-wrap:wrap"><div style="flex:1;min-width:200px;padding:20px;background:#f3f4f6;border-radius:8px;text-align:center"><h3 style="margin-bottom:12px">Feature 1</h3><p>Description</p></div><div style="flex:1;min-width:200px;padding:20px;background:#f3f4f6;border-radius:8px;text-align:center"><h3 style="margin-bottom:12px">Feature 2</h3><p>Description</p></div><div style="flex:1;min-width:200px;padding:20px;background:#f3f4f6;border-radius:8px;text-align:center"><h3 style="margin-bottom:12px">Feature 3</h3><p>Description</p></div></div>', category: 'Layout' },
              { id: 'features-grid', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/></svg><div style="font-size:11px;margin-top:4px">Features</div>', content: '<section style="padding:80px 20px;background:#f9fafb"><div style="max-width:1200px;margin:0 auto;text-align:center"><h2 style="font-size:42px;margin-bottom:16px;font-weight:bold">Our Features</h2><p style="font-size:18px;color:#6b7280;margin-bottom:48px">Everything you need</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px"><div style="padding:32px;background:white;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1)"><h3 style="font-size:24px;margin-bottom:12px;font-weight:600">Fast</h3><p style="color:#6b7280;line-height:1.6">Lightning fast performance</p></div><div style="padding:32px;background:white;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1)"><h3 style="font-size:24px;margin-bottom:12px;font-weight:600">Secure</h3><p style="color:#6b7280;line-height:1.6">Enterprise-grade security</p></div><div style="padding:32px;background:white;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1)"><h3 style="font-size:24px;margin-bottom:12px;font-weight:600">Reliable</h3><p style="color:#6b7280;line-height:1.6">99.9% uptime guarantee</p></div></div></div></section>', category: 'Sections' },
              { id: 'gallery', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg><div style="font-size:11px;margin-top:4px">Gallery</div>', content: '<section style="padding:80px 20px;background:white"><div style="max-width:1200px;margin:0 auto;text-align:center"><h2 style="font-size:42px;margin-bottom:48px;font-weight:bold">Gallery</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px"><div style="aspect-ratio:1;border-radius:12px;overflow:hidden"><img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" alt="Gallery 1" style="width:100%;height:100%;object-fit:cover;display:block" /></div><div style="aspect-ratio:1;border-radius:12px;overflow:hidden"><img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800" alt="Gallery 2" style="width:100%;height:100%;object-fit:cover;display:block" /></div><div style="aspect-ratio:1;border-radius:12px;overflow:hidden"><img src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800" alt="Gallery 3" style="width:100%;height:100%;object-fit:cover;display:block" /></div></div></div></section>', category: 'Sections' },
              { id: 'cta', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><div style="font-size:11px;margin-top:4px">CTA</div>', content: '<section style="padding:100px 20px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;text-align:center"><div style="max-width:800px;margin:0 auto"><h2 style="font-size:48px;margin-bottom:24px;font-weight:bold">Ready to Get Started?</h2><p style="font-size:20px;margin-bottom:40px;line-height:1.6">Join thousands of customers today</p><div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap"><a href="#" style="display:inline-block;padding:16px 32px;background:white;color:#667eea;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px">Get Started</a><a href="#" style="display:inline-block;padding:16px 32px;background:transparent;color:white;text-decoration:none;border:2px solid white;border-radius:8px;font-weight:600;font-size:16px">Learn More</a></div></div></section>', category: 'Sections' },
              { id: 'testimonial', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg><div style="font-size:11px;margin-top:4px">Testimonial</div>', content: '<section style="padding:60px 20px;background:#f9fafb"><div style="max-width:600px;margin:0 auto;text-align:center"><p style="font-size:20px;font-style:italic;line-height:1.6;color:#374151;margin-bottom:24px">"This is the best service I\'ve ever used."</p><p style="font-weight:600;color:#111827">John Doe</p><p style="color:#6b7280;font-size:14px">CEO, Company Inc.</p></div></section>', category: 'Sections' },
              { id: 'contact', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg><div style="font-size:11px;margin-top:4px">Contact</div>', content: '<section style="padding:80px 20px;background:white"><div style="max-width:600px;margin:0 auto;text-align:center"><h2 style="font-size:36px;margin-bottom:32px;font-weight:bold">Get In Touch</h2><div style="text-align:left"><div style="margin-bottom:16px"><label style="display:block;font-weight:500;margin-bottom:4px">Name</label><input type="text" placeholder="Your name" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:16px" /></div><div style="margin-bottom:16px"><label style="display:block;font-weight:500;margin-bottom:4px">Email</label><input type="email" placeholder="you@example.com" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:16px" /></div><div style="margin-bottom:16px"><label style="display:block;font-weight:500;margin-bottom:4px">Message</label><textarea rows="4" placeholder="Your message" style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:16px;resize:vertical"></textarea></div><button style="width:100%;padding:12px;background:#3b82f6;color:white;border:none;border-radius:6px;font-size:16px;font-weight:600;cursor:pointer">Send Message</button></div></div></section>', category: 'Sections' },
              { id: 'footer', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M2 20h20V4H2v16zm2-2V6h16v12H4z"/></svg><div style="font-size:11px;margin-top:4px">Footer</div>', content: '<footer style="padding:40px 20px;background:#1f2937;color:#9ca3af"><div style="max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;flex-wrap:wrap;gap:40px"><div><h3 style="color:white;font-size:18px;margin-bottom:16px">Your Brand</h3><p style="max-width:300px;line-height:1.6">Building the future, one click at a time.</p></div><div><h4 style="color:white;font-size:14px;margin-bottom:12px">Links</h4><ul style="list-style:none;padding:0;margin:0"><li style="margin-bottom:8px"><a href="#" style="color:#9ca3af;text-decoration:none">About</a></li><li style="margin-bottom:8px"><a href="#" style="color:#9ca3af;text-decoration:none">Services</a></li><li><a href="#" style="color:#9ca3af;text-decoration:none">Contact</a></li></ul></div></div><div style="max-width:1200px;margin:24px auto 0;padding-top:24px;border-top:1px solid #374151;text-align:center"><p>&copy; 2026 Your Brand. All rights reserved.</p></div></footer>', category: 'Sections' },
              { id: 'video', label: '<svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg><div style="font-size:11px;margin-top:4px">Video</div>', content: { type: 'video', style: { width: '100%', 'max-width': '640px', margin: '0 auto', display: 'block' } }, category: 'Media' },
            ],
          },
          layerManager: { appendTo: '#layers-container' },
          traitManager: { appendTo: '#traits-container' },
          styleManager: {
            appendTo: '#styles-container',
            sectors: [
              { name: 'Typography', open: true, buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-transform'], properties: [{ name: 'Font', property: 'font-family', type: 'select', defaults: 'Arial, sans-serif', options: [{ id: 'arial', value: 'Arial, sans-serif', name: 'Arial' }, { id: 'georgia', value: 'Georgia, serif', name: 'Georgia' }, { id: 'verdana', value: 'Verdana, sans-serif', name: 'Verdana' }, { id: 'system', value: 'system-ui, sans-serif', name: 'System UI' }] }, { name: 'Size', property: 'font-size', type: 'slider', defaults: '16px', min: 8, max: 100, units: ['px', 'em', 'rem'] }, { name: 'Weight', property: 'font-weight', type: 'select', defaults: '400', options: [{ id: 'light', value: '300', name: 'Light' }, { id: 'normal', value: '400', name: 'Normal' }, { id: 'semibold', value: '600', name: 'Semi-Bold' }, { id: 'bold', value: '700', name: 'Bold' }] }, { name: 'Color', property: 'color', type: 'color' }, { name: 'Align', property: 'text-align', type: 'radio', defaults: 'left', options: [{ id: 'left', value: 'left', name: 'Left' }, { id: 'center', value: 'center', name: 'Center' }, { id: 'right', value: 'right', name: 'Right' }, { id: 'justify', value: 'justify', name: 'Justify' }] }, { name: 'Line Height', property: 'line-height', type: 'slider', defaults: '1.5', min: 0.5, max: 3, step: 0.1, units: ['', 'px'] }] },
              { name: 'Decorations', open: true, buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'opacity'], properties: [{ name: 'Bg Color', property: 'background-color', type: 'color' }, { name: 'Radius', property: 'border-radius', type: 'slider', defaults: '0', min: 0, max: 100, units: ['px', '%'] }, { name: 'Opacity', property: 'opacity', type: 'slider', defaults: '1', min: 0, max: 1, step: 0.01 }] },
              { name: 'Dimension', open: false, buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'], properties: [{ property: 'width', type: 'slider', units: ['px', '%', 'vw'], min: 0, max: 1200 }, { property: 'height', type: 'slider', units: ['px', '%', 'vh'], min: 0, max: 1000 }, { property: 'max-width', type: 'slider', units: ['px', '%'], min: 0, max: 2000 }, { property: 'min-height', type: 'slider', units: ['px', '%', 'vh'], min: 0, max: 1000 }, 'margin', 'padding'] },
              { name: 'Layout', open: false, buildProps: ['display', 'flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'gap'], properties: [{ property: 'display', type: 'select', defaults: 'block', options: [{ id: 'block', value: 'block', name: 'Block' }, { id: 'flex', value: 'flex', name: 'Flex' }, { id: 'grid', value: 'grid', name: 'Grid' }, { id: 'inline', value: 'inline-block', name: 'Inline' }, { id: 'none', value: 'none', name: 'None' }] }, { property: 'flex-direction', type: 'select', defaults: 'row', options: [{ id: 'row', value: 'row', name: 'Row' }, { id: 'col', value: 'column', name: 'Column' }] }, { property: 'justify-content', type: 'select', defaults: 'flex-start', options: [{ id: 'jc-start', value: 'flex-start', name: 'Start' }, { id: 'jc-center', value: 'center', name: 'Center' }, { id: 'jc-end', value: 'flex-end', name: 'End' }, { id: 'jc-between', value: 'space-between', name: 'Between' }] }, { property: 'align-items', type: 'select', defaults: 'stretch', options: [{ id: 'ai-stretch', value: 'stretch', name: 'Stretch' }, { id: 'ai-start', value: 'flex-start', name: 'Start' }, { id: 'ai-center', value: 'center', name: 'Center' }, { id: 'ai-end', value: 'flex-end', name: 'End' }] }, { property: 'gap', type: 'slider', units: ['px', 'rem'], min: 0, max: 100 }] },
              { name: 'Position', open: false, buildProps: ['position', 'top', 'right', 'left', 'bottom', 'z-index'] },
            ],
          },
        });

        editorRef.current = editor;

        // Enhanced image component with resizing
        const imageType = editor.DomComponents.getType('image');
        editor.DomComponents.addType('image', {
          model: { defaults: { ...imageType?.model?.prototype?.defaults, draggable: true, droppable: false, stylable: true, resizable: { tl: 0, tc: 0, tr: 0, cl: 0, cr: 1, bl: 0, bc: 0, br: 1, keyWidth: 'width', keyHeight: 'height', currentUnit: 1, minDim: 50, step: 1 }, style: { 'max-width': '100%', height: 'auto', display: 'block' }, traits: [{ type: 'text', label: 'Source', name: 'src', changeProp: 1 as any }, { type: 'text', label: 'Alt', name: 'alt' }] } },
          view: { onRender() { const el = this.el as HTMLImageElement; if (el?.tagName === 'IMG') { el.style.display = 'block'; el.style.maxWidth = '100%'; el.onerror = () => { el.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" fill="%23ccc"%3E%3Crect width="200" height="150"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14" fill="%23999"%3EImage not found%3C/text%3E%3C/svg%3E'; }; } } },
        });

        // Make text editable on double-click
        const textType = editor.DomComponents.getType('text');
        editor.DomComponents.addType('text', { model: { defaults: { ...textType?.model?.prototype?.defaults, editable: true, draggable: true } } });

        // Load initial data
        const data = initialDataRef.current;
        if (data) {
          if (data.json) { editor.loadProjectData(data.json as any); }
          else if (data.html) { editor.setComponents(data.html); }
          if (data.css) { editor.setStyle(data.css); }
        }

        // Keyboard shortcuts
        editor.on('load', () => {
          const doc = editor.Canvas.getDocument();
          if (doc) {
            doc.addEventListener('keydown', (e: KeyboardEvent) => {
              if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
                const sel = editor.getSelected();
                if (sel && !(sel as any).get?.('editable')) { sel.remove(); e.preventDefault(); }
              }
              if ((e.ctrlKey || e.metaKey) && e.key === 'z') { editor.runCommand(e.shiftKey ? 'redo' : 'undo'); e.preventDefault(); }
              if ((e.ctrlKey || e.metaKey) && e.key === 'd') { const sel = editor.getSelected(); if (sel) { const c = sel.clone(); sel.parent()?.append(c, { at: sel.index() + 1 }); editor.select(c); } e.preventDefault(); }
            });
          }
        });

        // Debounced change events
        let cdbTimer: ReturnType<typeof setTimeout> | undefined;
        const dbc = () => { if (cdbTimer) clearTimeout(cdbTimer); cdbTimer = setTimeout(emitChange, 500); };
        editor.on('component:add', dbc);
        editor.on('component:remove', dbc);
        editor.on('component:update', dbc);
        editor.on('component:styleUpdate', dbc);
        editor.on('style:change', dbc);

        if (onLoad) onLoad();
      }).catch((err) => {
        console.error('GrapesJS: Failed to load module', err);
      });

      return () => {
        destroyed = true;
        if (changeTimerRef.current) clearTimeout(changeTimerRef.current);
        if (editorRef.current) { editorRef.current.destroy(); editorRef.current = null; isInitializedRef.current = false; }
      };
    }, [emitChange, onLoad]);

    return (
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
        <div className="panel__basic-actions" style={{ padding: '10px', borderBottom: '1px solid #ddd', background: '#fff', display: 'flex', gap: '8px', alignItems: 'center', minHeight: '48px', flexShrink: 0 }} />
        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div id="blocks" style={{ width: '250px', borderRight: '1px solid #ddd', overflowY: 'auto', background: '#f8f9fa', padding: '10px', flexShrink: 0 }} />
          <div style={{ flex: 1, minHeight: 0, minWidth: 0, position: 'relative', background: 'linear-gradient(to bottom, hsl(210 40% 98%), hsl(214.3 31.8% 96%))' }}>
            <div id="gjs-editor" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          </div>
          <div style={{ width: '300px', borderLeft: '1px solid #ddd', background: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ borderBottom: '1px solid #ddd', padding: '10px', background: '#f8f9fa' }}><h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Layers</h3></div>
            <div id="layers-container" style={{ flex: '0 0 150px', overflowY: 'auto', padding: '10px' }} />
            <div style={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '10px', background: '#f8f9fa' }}><h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Settings</h3></div>
            <div id="traits-container" style={{ flex: '0 0 auto', maxHeight: '200px', overflowY: 'auto', padding: '10px', borderBottom: '1px solid #ddd' }} />
            <div style={{ borderBottom: '1px solid #ddd', padding: '10px', background: '#f8f9fa' }}><h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Styles</h3></div>
            <div id="styles-container" style={{ flex: 1, overflowY: 'auto', padding: '10px' }} />
          </div>
        </div>
      </div>
    );
  }
);

GrapesJSEditor.displayName = 'GrapesJSEditor';

export default GrapesJSEditor;