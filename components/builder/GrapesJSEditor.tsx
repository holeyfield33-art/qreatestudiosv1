// @ts-nocheck
'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

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
          // Make components immediately selectable with single click
          canvas: {
            scripts: [],
            styles: [],
          },
          // Enable protectedCss to ensure images and styles work properly
          protectedCss: '',
          // Allow all tags and attributes for proper rendering
          allowScripts: 1,
          // Improve selection and hover behavior
          multipleSelection: true,
          // Enable select on hover for easier editing
          selectOnHover: false,
          // Improve selection behavior
          deviceManager: {
            devices: [
              {
                name: 'Desktop',
                width: '',
              },
              {
                name: 'Tablet',
                width: '768px',
                widthMedia: '768px',
              },
              {
                name: 'Mobile',
                width: '320px',
                widthMedia: '480px',
              },
            ],
          },
          // Asset Manager for image uploads and selection
          assetManager: {
            upload: '/api/upload',
            uploadText: 'Drop files here or click to upload',
            multiUpload: true,
            autoAdd: true as any,
            assets: [
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920',
              'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920',
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
              'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
            ],
            uploadFile: (async (e: any) => {
              const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
              const uploads = await Promise.all(
                Array.from(files).map(async (file: File) => {
                  try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch('/api/upload', {
                      method: 'POST',
                      body: formData,
                      credentials: 'include',
                    });

                    if (!response.ok) {
                      throw new Error('Upload failed');
                    }

                    const data = await response.json();
                    if (!data.url) {
                      return null;
                    }

                    return {
                      src: data.url,
                      name: file.name,
                      type: file.type,
                    };
                  } catch (error) {
                    console.error('Upload error:', error);
                    return null;
                  }
                })
              );

              const assets = uploads.filter(Boolean);
              return { data: assets };
            }) as any,
          },
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
                      <a href="/pricing" style="display: inline-block; padding: 16px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Menu</a>
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
                content: `<img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" alt="Image" style="max-width: 100%; height: auto; display: block; border-radius: 8px;" data-gjs-type="image" />`,
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
                content: '<a href="/auth/signup" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Click me</a>',
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
              {
                id: 'features-grid',
                label: `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path fill="currentColor" d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/>
                  </svg>
                  <div style="font-size: 11px; margin-top: 4px;">Features</div>
                `,
                content: `
                  <section style="padding: 80px 20px; background: #f9fafb;">
                    <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
                      <h2 style="font-size: 42px; margin-bottom: 16px; font-weight: bold;">Our Features</h2>
                      <p style="font-size: 18px; color: #6b7280; margin-bottom: 48px;">Everything you need to succeed</p>
                      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
                        <div style="padding: 32px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                          <h3 style="font-size: 24px; margin-bottom: 12px; font-weight: 600;">Fast</h3>
                          <p style="color: #6b7280; line-height: 1.6;">Lightning fast performance</p>
                        </div>
                        <div style="padding: 32px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                          <h3 style="font-size: 24px; margin-bottom: 12px; font-weight: 600;">Secure</h3>
                          <p style="color: #6b7280; line-height: 1.6;">Enterprise-grade security</p>
                        </div>
                        <div style="padding: 32px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                          <h3 style="font-size: 24px; margin-bottom: 12px; font-weight: 600;">Reliable</h3>
                          <p style="color: #6b7280; line-height: 1.6;">99.9% uptime guarantee</p>
                        </div>
                      </div>
                    </div>
                  </section>
                `,
                category: 'Sections',
              },
              {
                id: 'gallery',
                label: `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path fill="currentColor" d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/>
                  </svg>
                  <div style="font-size: 11px; margin-top: 4px;">Gallery</div>
                `,
                content: `
                  <section style="padding: 80px 20px; background: white;">
                    <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
                      <h2 style="font-size: 42px; margin-bottom: 16px; font-weight: bold;">Gallery</h2>
                      <p style="font-size: 18px; color: #6b7280; margin-bottom: 48px;">Browse our collection</p>
                      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                        <div style="position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
                          <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" alt="Gallery 1" style="width: 100%; height: 100%; object-fit: cover; display: block;" data-gjs-type="image" />
                        </div>
                        <div style="position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
                          <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800" alt="Gallery 2" style="width: 100%; height: 100%; object-fit: cover; display: block;" data-gjs-type="image" />
                        </div>
                        <div style="position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
                          <img src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800" alt="Gallery 3" style="width: 100%; height: 100%; object-fit: cover; display: block;" data-gjs-type="image" />
                        </div>
                      </div>
                    </div>
                  </section>
                `,
                category: 'Sections',
              },
              {
                id: 'cta',
                label: `
                  <svg viewBox="0 0 24 24" width="32" height="32">
                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <div style="font-size: 11px; margin-top: 4px;">Call to Action</div>
                `,
                content: `
                  <section style="padding: 100px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
                    <div style="max-width: 800px; margin: 0 auto;">
                      <h2 style="font-size: 48px; margin-bottom: 24px; font-weight: bold;">Ready to Get Started?</h2>
                      <p style="font-size: 20px; margin-bottom: 40px; line-height: 1.6;">Join thousands of satisfied customers today</p>
                      <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
                        <a href="/auth/signup" style="display: inline-block; padding: 16px 32px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Get Started</a>
                        <a href="/pricing" style="display: inline-block; padding: 16px 32px; background: transparent; color: white; text-decoration: none; border: 2px solid white; border-radius: 8px; font-weight: 600; font-size: 16px;">Learn More</a>
                      </div>
                    </div>
                  </section>
                `,
                category: 'Sections',
              },
            ],
          },
          layerManager: {
            appendTo: '#layers-container',
          },
          traitManager: {
            appendTo: '#traits-container',
          },
          styleManager: {
            appendTo: '#styles-container',
            sectors: [
              {
                name: 'Typography',
                open: true,
                buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration', 'text-transform'],
                properties: [
                  {
                    name: 'Font Family',
                    property: 'font-family',
                    type: 'select',
                    defaults: 'Arial, sans-serif',
                    options: [
                      { value: 'Arial, sans-serif', name: 'Arial' },
                      { value: 'Georgia, serif', name: 'Georgia' },
                      { value: '"Times New Roman", serif', name: 'Times New Roman' },
                      { value: '"Courier New", monospace', name: 'Courier New' },
                      { value: 'Verdana, sans-serif', name: 'Verdana' },
                      { value: '"Trebuchet MS", sans-serif', name: 'Trebuchet' },
                      { value: 'Impact, sans-serif', name: 'Impact' },
                      { value: '"Comic Sans MS", cursive', name: 'Comic Sans' },
                    ],
                  },
                  {
                    name: 'Font Size',
                    property: 'font-size',
                    type: 'slider',
                    defaults: '16px',
                    min: 8,
                    max: 100,
                    units: ['px', 'em', 'rem', '%'],
                  },
                  {
                    name: 'Font Weight',
                    property: 'font-weight',
                    type: 'select',
                    defaults: '400',
                    options: [
                      { value: '100', name: 'Thin' },
                      { value: '300', name: 'Light' },
                      { value: '400', name: 'Normal' },
                      { value: '600', name: 'Semi-Bold' },
                      { value: '700', name: 'Bold' },
                      { value: '900', name: 'Black' },
                    ],
                  },
                  {
                    name: 'Color',
                    property: 'color',
                    type: 'color',
                  },
                  {
                    name: 'Text Align',
                    property: 'text-align',
                    type: 'radio',
                    defaults: 'left',
                    options: [
                      { value: 'left', name: 'Left', className: 'fa fa-align-left' },
                      { value: 'center', name: 'Center', className: 'fa fa-align-center' },
                      { value: 'right', name: 'Right', className: 'fa fa-align-right' },
                      { value: 'justify', name: 'Justify', className: 'fa fa-align-justify' },
                    ],
                  },
                  {
                    name: 'Line Height',
                    property: 'line-height',
                    type: 'slider',
                    defaults: '1.5',
                    min: 0.5,
                    max: 3,
                    step: 0.1,
                    units: ['', 'px', 'em'],
                  },
                  {
                    name: 'Letter Spacing',
                    property: 'letter-spacing',
                    type: 'slider',
                    defaults: '0',
                    min: -5,
                    max: 10,
                    step: 0.5,
                    units: ['px', 'em'],
                  },
                  {
                    name: 'Text Decoration',
                    property: 'text-decoration',
                    type: 'radio',
                    defaults: 'none',
                    options: [
                      { value: 'none', name: 'None' },
                      { value: 'underline', name: 'Underline' },
                      { value: 'line-through', name: 'Strike' },
                    ],
                  },
                  {
                    name: 'Text Transform',
                    property: 'text-transform',
                    type: 'radio',
                    defaults: 'none',
                    options: [
                      { value: 'none', name: 'None' },
                      { value: 'uppercase', name: 'UPPER' },
                      { value: 'lowercase', name: 'lower' },
                      { value: 'capitalize', name: 'Capitalize' },
                    ],
                  },
                ],
              },
              {
                name: 'Decorations',
                open: true,
                buildProps: ['background-color', 'background', 'border-radius', 'border', 'box-shadow', 'opacity'],
                properties: [
                  {
                    name: 'Background Color',
                    property: 'background-color',
                    type: 'color',
                  },
                  {
                    name: 'Background Image',
                    property: 'background',
                    type: 'stack',
                    layerLabel: (layer: any, { values, property }: any) => {
                      const bg = values['background-image'] || '';
                      return bg.includes('url') ? 'Image' : 'Color';
                    },
                    properties: [
                      {
                        name: 'Image',
                        property: 'background-image',
                        type: 'file',
                        functionName: 'url',
                      },
                      {
                        name: 'Repeat',
                        property: 'background-repeat',
                        type: 'select',
                        defaults: 'no-repeat',
                        options: [
                          { value: 'repeat', name: 'Repeat' },
                          { value: 'repeat-x', name: 'Repeat X' },
                          { value: 'repeat-y', name: 'Repeat Y' },
                          { value: 'no-repeat', name: 'No Repeat' },
                        ],
                      },
                      {
                        name: 'Position',
                        property: 'background-position',
                        type: 'select',
                        defaults: 'center center',
                        options: [
                          { value: 'left top', name: 'Left Top' },
                          { value: 'center top', name: 'Center Top' },
                          { value: 'right top', name: 'Right Top' },
                          { value: 'left center', name: 'Left Center' },
                          { value: 'center center', name: 'Center' },
                          { value: 'right center', name: 'Right Center' },
                          { value: 'left bottom', name: 'Left Bottom' },
                          { value: 'center bottom', name: 'Center Bottom' },
                          { value: 'right bottom', name: 'Right Bottom' },
                        ],
                      },
                      {
                        name: 'Size',
                        property: 'background-size',
                        type: 'select',
                        defaults: 'cover',
                        options: [
                          { value: 'auto', name: 'Auto' },
                          { value: 'cover', name: 'Cover' },
                          { value: 'contain', name: 'Contain' },
                        ],
                      },
                    ],
                  },
                  {
                    name: 'Border Radius',
                    property: 'border-radius',
                    type: 'slider',
                    defaults: '0',
                    min: 0,
                    max: 100,
                    units: ['px', '%'],
                  },
                  {
                    name: 'Border',
                    property: 'border',
                    type: 'composite',
                    properties: [
                      {
                        name: 'Width',
                        property: 'border-width',
                        type: 'slider',
                        defaults: '0',
                        min: 0,
                        max: 20,
                        units: ['px'],
                      },
                      {
                        name: 'Style',
                        property: 'border-style',
                        type: 'select',
                        defaults: 'solid',
                        options: [
                          { value: 'none', name: 'None' },
                          { value: 'solid', name: 'Solid' },
                          { value: 'dashed', name: 'Dashed' },
                          { value: 'dotted', name: 'Dotted' },
                        ],
                      },
                      {
                        name: 'Color',
                        property: 'border-color',
                        type: 'color',
                      },
                    ],
                  },
                  {
                    name: 'Box Shadow',
                    property: 'box-shadow',
                    type: 'stack',
                    properties: [
                      {
                        property: 'box-shadow-h',
                        type: 'slider',
                        defaults: '0',
                        min: -50,
                        max: 50,
                        units: ['px'],
                      },
                      {
                        property: 'box-shadow-v',
                        type: 'slider',
                        defaults: '0',
                        min: -50,
                        max: 50,
                        units: ['px'],
                      },
                      {
                        property: 'box-shadow-blur',
                        type: 'slider',
                        defaults: '5',
                        min: 0,
                        max: 50,
                        units: ['px'],
                      },
                      {
                        property: 'box-shadow-spread',
                        type: 'slider',
                        defaults: '0',
                        min: -50,
                        max: 50,
                        units: ['px'],
                      },
                      {
                        property: 'box-shadow-color',
                        type: 'color',
                        defaults: 'rgba(0,0,0,0.2)',
                      },
                    ],
                  },
                  {
                    name: 'Opacity',
                    property: 'opacity',
                    type: 'slider',
                    defaults: '1',
                    min: 0,
                    max: 1,
                    step: 0.01,
                  },
                ],
              },
              {
                name: 'Dimension',
                open: false,
                buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
                properties: [
                  {
                    property: 'width',
                    type: 'slider',
                    units: ['px', '%', 'vw'],
                    min: 0,
                    max: 1000,
                  },
                  {
                    property: 'height',
                    type: 'slider',
                    units: ['px', '%', 'vh'],
                    min: 0,
                    max: 1000,
                  },
                  {
                    property: 'max-width',
                    type: 'slider',
                    units: ['px', '%'],
                    min: 0,
                    max: 2000,
                  },
                  {
                    property: 'min-height',
                    type: 'slider',
                    units: ['px', '%', 'vh'],
                    min: 0,
                    max: 1000,
                  },
                  'margin',
                  'padding',
                ],
              },
              {
                name: 'General',
                open: false,
                buildProps: ['display', 'position', 'top', 'right', 'left', 'bottom', 'z-index'],
                properties: [
                  'display',
                  'position',
                  'top',
                  'right',
                  'left',
                  'bottom',
                  'z-index',
                ],
              },
            ],
          },
        });

        // Enhanced image component with better editing capabilities
        const imageType = editorRef.current.DomComponents.getType('image');
        editorRef.current.DomComponents.addType('image', {
          model: {
            defaults: {
              ...imageType.model.prototype.defaults,
              // Ensure images are always visible and draggable
              draggable: true,
              droppable: false,
              stylable: true,
              resizable: true,
              editable: false,
              // Add default styles to ensure visibility
              style: {
                'max-width': '100%',
                'height': 'auto',
                'display': 'block',
              },
              traits: [
                {
                  type: 'text',
                  label: 'Source (URL)',
                  name: 'src',
                  changeProp: 1,
                },
                {
                  type: 'text',
                  label: 'Alt Text',
                  name: 'alt',
                },
              ],
            },
          },
          view: {
            onRender() {
              // Ensure the image element has proper attributes
              const imgEl = this.el;
              if (imgEl && imgEl.tagName === 'IMG') {
                const src = this.model.get('src') || this.model.getAttributes().src;
                if (src) {
                  // Force reload if not loaded properly
                  imgEl.src = src;
                  imgEl.onerror = function() {
                    console.error('Failed to load image:', src);
                  };
                }
                // Ensure image is visible with explicit styles
                imgEl.style.display = 'block';
                imgEl.style.maxWidth = '100%';
                imgEl.style.height = 'auto';
              }
            },
          },
        });

        // Make text components easily editable
        const textType = editorRef.current.DomComponents.getType('text');
        editorRef.current.DomComponents.addType('text', {
          model: {
            defaults: {
              ...textType.model.prototype.defaults,
              editable: true,
            },
          },
        });

        // Load initial data if provided
        if (initialData) {
          if (initialData.json) {
            editorRef.current.loadProjectData(initialData.json);
          } else if (initialData.html) {
            editorRef.current.setComponents(initialData.html);
          }
          if (initialData.css) {
            editorRef.current.setStyle(initialData.css);
          }
        }

        // Enable click to select any component in the canvas
        editorRef.current.on('load', () => {
          const canvas = editorRef.current.Canvas;
          const frameEl = canvas.getFrameEl();
          
          if (frameEl && frameEl.contentDocument) {
            frameEl.contentDocument.addEventListener('click', (e: any) => {
              e.stopPropagation();
            });
          }
        });

        // Auto-open style manager when component is selected
        editorRef.current.on('component:selected', (component: any) => {
          // Automatically show the style panel
          const stylesPanel = editorRef.current.Panels.getPanel('views-container');
          if (stylesPanel) {
            stylesPanel.set('active', true);
          }
        });

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

    useEffect(() => {
      if (!editorRef.current || !initialData) return;

      if (initialData.json) {
        editorRef.current.loadProjectData(initialData.json);
      } else if (initialData.html) {
        editorRef.current.setComponents(initialData.html);
      }

      if (initialData.css) {
        editorRef.current.setStyle(initialData.css);
      }
    }, [initialData]);

    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="panel__basic-actions" style={{ padding: '10px', borderBottom: '1px solid #ddd', background: '#fff', display: 'flex', gap: '8px' }}></div>
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Blocks Panel */}
          <div id="blocks" style={{ width: '250px', borderRight: '1px solid #ddd', overflowY: 'auto', background: '#f8f9fa', padding: '10px' }}></div>

          {/* Main Editor - Centered Canvas */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', background: 'linear-gradient(to bottom, hsl(210 40% 98%), hsl(214.3 31.8% 96%))' }}>
            <div id="gjs-editor" style={{ width: '100%', maxWidth: '1400px', height: '100%', overflow: 'auto' }}></div>
          </div>

          {/* Right Sidebar */}
          <div style={{ width: '300px', borderLeft: '1px solid #ddd', background: '#fff', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ borderBottom: '1px solid #ddd', padding: '10px', background: '#f8f9fa' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Layers</h3>
            </div>
            <div id="layers-container" style={{ flex: '0 0 150px', overflowY: 'auto', padding: '10px' }}></div>

            <div style={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '10px', background: '#f8f9fa' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Settings</h3>
            </div>
            <div id="traits-container" style={{ flex: '0 0 auto', maxHeight: '200px', overflowY: 'auto', padding: '10px', borderBottom: '1px solid #ddd' }}></div>

            <div style={{ borderBottom: '1px solid #ddd', padding: '10px', background: '#f8f9fa' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Styles</h3>
            </div>
            <div id="styles-container" style={{ flex: 1, overflowY: 'auto', padding: '10px' }}></div>
          </div>
        </div>
      </div>
    );
  }
);

GrapesJSEditor.displayName = 'GrapesJSEditor';

export default GrapesJSEditor;
