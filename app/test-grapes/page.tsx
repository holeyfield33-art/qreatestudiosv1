'use client';

import { useEffect, useRef, useState } from 'react';

export default function TestGrapesJS() {
  const editorRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import GrapesJS to avoid SSR issues
    import('grapesjs').then((grapesjs) => {
      if (editorRef.current) return; // Already initialized

      editorRef.current = grapesjs.default.init({
        container: '#gjs',
        height: '100vh',
        width: 'auto',
        storageManager: false,
        panels: { defaults: [] }, // Hide panels for minimal demo
        blockManager: {
          appendTo: '#blocks',
          blocks: [
            {
              id: 'section',
              label: '<div><svg viewBox="0 0 24 24" width="32" height="32"><path d="M2 20h20v2H2zM4 18h16c.6 0 1-.4 1-1V7c0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1v10c0 .6.4 1 1 1z"></path></svg><div>Section</div></div>',
              content: '<section style="padding: 50px 20px; text-align: center;"><h1>Section Title</h1><p>This is a section</p></section>',
              category: 'Basic',
            },
            {
              id: 'text',
              label: '<div><svg viewBox="0 0 24 24" width="32" height="32"><path d="M4 5h16v2H4zM4 11h16v2H4zM4 17h10v2H4z"></path></svg><div>Text</div></div>',
              content: '<div style="padding: 10px;">Insert your text here</div>',
              category: 'Basic',
            },
            {
              id: 'image',
              label: '<div><svg viewBox="0 0 24 24" width="32" height="32"><path d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3 3.5-4.5 4.5 6H5z"></path></svg><div>Image</div></div>',
              content: { 
                type: 'image',
                attributes: { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600' }
              },
              category: 'Media',
            },
            {
              id: 'button',
              label: '<div><svg viewBox="0 0 24 24" width="32" height="32"><rect x="4" y="8" width="16" height="8" rx="2"></rect></svg><div>Button</div></div>',
              content: '<a href="/pricing" style="display: inline-block; padding: 10px 20px; background: #0066ff; color: white; text-decoration: none; border-radius: 5px;">Click me</a>',
              category: 'Basic',
            },
          ],
        },
        layerManager: {
          appendTo: '#layers',
        },
        styleManager: {
          appendTo: '#styles',
          sectors: [
            {
              name: 'General',
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
              ],
            },
          ],
        },
      });

      // Add some initial content
      editorRef.current.setComponents(`
        <div style="padding: 50px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <h1 style="font-size: 48px; margin-bottom: 20px;">GrapesJS Demo</h1>
          <p style="font-size: 20px; margin-bottom: 30px;">Drag blocks from the left to build your page</p>
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400" 
               style="max-width: 100%; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);" 
               alt="Demo Image" />
        </div>
      `);

      setIsLoaded(true);
    });
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Blocks Panel */}
      <div
        id="blocks"
        style={{
          width: '200px',
          borderRight: '1px solid #ddd',
          overflowY: 'auto',
          padding: '10px',
          background: '#f8f9fa',
        }}
      >
        <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: 'bold' }}>Components</h3>
      </div>

      {/* Editor Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid #ddd',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px' }}>GrapesJS Test - Minimal Demo</h2>
          {isLoaded && (
            <span style={{ color: 'green', fontSize: '14px' }}>✓ Editor Loaded</span>
          )}
        </div>
        <div id="gjs" style={{ flex: 1 }}></div>
      </div>

      {/* Right Sidebar */}
      <div
        style={{
          width: '250px',
          borderLeft: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
          background: '#f8f9fa',
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Styles</h3>
          <div id="styles"></div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px', borderTop: '1px solid #ddd' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Layers</h3>
          <div id="layers"></div>
        </div>
      </div>
    </div>
  );
}
