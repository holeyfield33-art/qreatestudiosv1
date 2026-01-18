'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import 'grapesjs/dist/css/grapes.min.css';

interface GrapesJSEditorProps {
  initialData?: any;
  onChange?: (data: { html: string; css: string; json: any }) => void;
  onLoad?: () => void;
}

export interface GrapesJSEditorRef {
  getHtml: () => string;
  getCss: () => string;
  getJson: () => any;
  setContent: (html: string, css?: string) => void;
}

const GrapesJSEditor = forwardRef<GrapesJSEditorRef, GrapesJSEditorProps>(
  ({ initialData, onChange, onLoad }, ref) => {
    const editorRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      getHtml: () => {
        if (editorRef.current) {
          return editorRef.current.getHtml();
        }
        return '';
      },
      getCss: () => {
        if (editorRef.current) {
          return editorRef.current.getCss();
        }
        return '';
      },
      getJson: () => {
        if (editorRef.current) {
          return editorRef.current.getProjectData();
        }
        return null;
      },
      setContent: (html: string, css?: string) => {
        if (editorRef.current) {
          editorRef.current.setComponents(html);
          if (css) {
            editorRef.current.setStyle(css);
          }
        }
      },
    }));

    useEffect(() => {
      import('grapesjs').then((grapesjs) => {
        if (editorRef.current) return;

        editorRef.current = grapesjs.default.init({
          container: '#gjs-editor',
          height: '100%',
          width: 'auto',
          storageManager: false,
          panels: {
            defaults: [
              {
                id: 'basic-actions',
                el: '.panel__basic-actions',
                buttons: [
                  {
                    id: 'visibility',
                    active: true,
                    className: 'btn-toggle-borders',
                    label: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
                    command: 'sw-visibility',
                    attributes: { title: 'Toggle borders' },
                  },
                  {
                    id: 'preview',
                    className: 'btn-preview',
                    label: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
                    command: 'preview',
                    attributes: { title: 'Preview' },
                  },
                  {
                    id: 'fullscreen',
                    className: 'btn-fullscreen',
                    label: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
                    command: 'fullscreen',
                    attributes: { title: 'Fullscreen' },
                  },
                  {
                    id: 'undo',
                    className: 'btn-undo',
                    label: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>',
                    command: 'undo',
                    attributes: { title: 'Undo' },
                  },
                  {
                    id: 'redo',
                    className: 'btn-redo',
                    label: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>',
                    command: 'redo',
                    attributes: { title: 'Redo' },
                  },
                ],
              },
            ],
          },
          blockManager: {
            appendTo: '#blocks',
            blocks: [
              {
                id: 'section',
                label: `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path fill="currentColor" d="M2 20h20v2H2zM4 18h16c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1v10c0 .6.4 1 1 1z"/>
                  </svg>
                  <div style="font-size: 11px; margin-top: 4px;">Section</div>
                `,
                content: `
                  <section style="padding: 80px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <div style="max-width: 1200px; margin: 0 auto;">
                      <h1 style="font-size: 48px; margin-bottom: 20px; font-weight: bold;">Your Section Title</h1>
                      <p style="font-size: 18px; line-height: 1.6;">Add your content here. This is a customizable section.</p>
                    </div>
                  </section>
                `,
                category: 'Sections',
              },
              {
                id: 'hero',
                label: `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path fill="currentColor" d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"/>
                  </svg>
                  <div style="font-size: 11px; margin-top: 4px;">Hero</div>
                `,
                content: `
                  <section style="min-height: 70vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920') center/cover; color: white; text-align: center; padding: 40px 20px;">
                    <div style="max-width: 800px;">
                      <h1 style="font-size: 56px; margin-bottom: 24px; font-weight: bold;">Welcome to Our Restaurant</h1>
                      <p style="font-size: 20px; margin-bottom: 32px; line-height: 1.6;">Fresh ingredients, unforgettable flavors</p>
                      <a href="#" style="display: inline-block; padding: 16px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Menu</a>
                    </div>
                  </section>
                `,
                category: 'Sections',
              },
              {
                id: 'text',
                label: `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path fill="currentColor" d="M4 5h16v2H4zM4 11h16v2H4zM4 17h10v2H4z"/>
                  </svg>
                  <div style="font-size: 11px; margin-top: 4px;">Text</div>
                `,
                content: '<p style="padding: 10px; font-size: 16px; line-height: 1.6;">Insert your text here</p>',
                category: 'Basic',
              },
              {
                id: 'image',
                label: `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path fill="currentColor" d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"/>
                  </svg>
                  <div style="font-size: 11px; margin-top: 4px;">Image</div>
                `,
                content: {
                  type: 'image',
                  attributes: { 
                    src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
                    style: 'max-width: 100%; height: auto; border-radius: 8px;'
                  },
                },
                category: 'Media',
              },
              {
                id: 'button',
                label: `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <rect fill="currentColor" x="4" y="8" width="16" height="8" rx="2"/>
                  </svg>
                  <div style="font-size: 11px; margin-top: 4px;">Button</div>
                `,
                content: '<a href="#" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Click me</a>',
                category: 'Basic',
              },
              {
                id: '2-columns',
                label: `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path fill="currentColor" d="M11 3H3v18h8V3zm10 0h-8v18h8V3z"/>
                  </svg>
                  <div style="font-size: 11px; margin-top: 4px;">2 Columns</div>
                `,
                content: `
                  <div style="display: flex; gap: 20px; padding: 20px;">
                    <div style="flex: 1; padding: 20px; background: #f3f4f6; border-radius: 8px;">
                      <h3 style="margin-bottom: 12px;">Column 1</h3>
                      <p>Your content here</p>
                    </div>
                    <div style="flex: 1; padding: 20px; background: #f3f4f6; border-radius: 8px;">
                      <h3 style="margin-bottom: 12px;">Column 2</h3>
                      <p>Your content here</p>
                    </div>
                  </div>
                `,
                category: 'Layout',
              },
              {
                id: '3-columns',
                label: `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path fill="currentColor" d="M8 3H3v18h5V3zm7 0H9v18h6V3zm7 0h-5v18h5V3z"/>
                  </svg>
                  <div style="font-size: 11px; margin-top: 4px;">3 Columns</div>
                `,
                content: `
                  <div style="display: flex; gap: 20px; padding: 20px;">
                    <div style="flex: 1; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center;">
                      <h3 style="margin-bottom: 12px;">Feature 1</h3>
                      <p>Description here</p>
                    </div>
                    <div style="flex: 1; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center;">
                      <h3 style="margin-bottom: 12px;">Feature 2</h3>
                      <p>Description here</p>
                    </div>
                    <div style="flex: 1; padding: 20px; background: #f3f4f6; border-radius: 8px; text-align: center;">
                      <h3 style="margin-bottom: 12px;">Feature 3</h3>
                      <p>Description here</p>
                    </div>
                  </div>
                `,
                category: 'Layout',
              },
            ],
          },
          layerManager: {
            appendTo: '#layers-container',
          },
          styleManager: {
            appendTo: '#styles-container',
            sectors: [
              {
                name: 'General',
                open: false,
                properties: [
                  'display',
                  'position',
                  'top',
                  'right',
                  'left',
                  'bottom',
                ],
              },
              {
                name: 'Dimension',
                open: false,
                properties: [
                  'width',
                  'height',
                  'max-width',
                  'min-height',
                  'margin',
                  'padding',
                ],
              },
              {
                name: 'Typography',
                open: false,
                properties: [
                  'font-family',
                  'font-size',
                  'font-weight',
                  'letter-spacing',
                  'color',
                  'line-height',
                  'text-align',
                ],
              },
              {
                name: 'Decorations',
                open: false,
                properties: [
                  'background-color',
                  'border-radius',
                  'border',
                  'box-shadow',
                  'background',
                ],
              },
            ],
          },
        });

        // Load initial data if provided
        if (initialData) {
          if (initialData.html) {
            editorRef.current.setComponents(initialData.html);
          }
          if (initialData.css) {
            editorRef.current.setStyle(initialData.css);
          }
        }

        // Listen for changes
        if (onChange) {
          editorRef.current.on('update', () => {
            const html = editorRef.current.getHtml();
            const css = editorRef.current.getCss();
            const json = editorRef.current.getProjectData();
            onChange({ html, css, json });
          });
        }

        if (onLoad) {
          onLoad();
        }
      });

      return () => {
        if (editorRef.current) {
          editorRef.current.destroy();
          editorRef.current = null;
        }
      };
    }, []);

    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="panel__basic-actions" style={{ padding: '10px', borderBottom: '1px solid #ddd', background: '#fff', display: 'flex', gap: '8px' }}></div>
        <div id="gjs-editor" style={{ flex: 1, overflow: 'hidden' }}></div>
      </div>
    );
  }
);

GrapesJSEditor.displayName = 'GrapesJSEditor';

export default GrapesJSEditor;
