import type { Config } from '@measured/puck';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CTASection } from '@/components/sections/CTASection';
import { GallerySection } from '@/components/sections/GallerySection';
import { ContactSection } from '@/components/sections/ContactSection';
import { MenuSection } from '@/components/sections/MenuSection';
import { QRCodeSection } from '@/components/sections/QRCodeSection';
import { ImageField } from '@/components/puck/ImageField';
import { ImageArrayField } from '@/components/puck/ImageArrayField';

/**
 * Puck configuration for restaurant landing page builder
 * Defines all available sections and their field schemas
 *
 * NOTE: This config includes custom field renderers and should ONLY be used
 * in the editor (Client Components). For rendering published pages in Server Components,
 * use `puckRenderConfig` instead.
 */
export const puckConfig: Config = {
  components: {
    HeroSection: {
      fields: {
        headline: {
          type: 'text',
          label: 'Headline',
        },
        subheadline: {
          type: 'textarea',
          label: 'Subheadline',
        },
        backgroundImage: {
          type: 'custom',
          label: 'Background Image',
          render: ({ value, onChange }) => (
            <ImageField value={value} onChange={onChange} category="restaurant" />
          ),
        },
        ctaText: {
          type: 'text',
          label: 'Button Text',
        },
        ctaLink: {
          type: 'text',
          label: 'Button Link',
        },
        ctaStyle: {
          type: 'select',
          label: 'Button Style',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
          ],
        },
        overlay: {
          type: 'radio',
          label: 'Show Overlay',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
        },
        overlayOpacity: {
          type: 'number',
          label: 'Overlay Opacity (%)',
          min: 0,
          max: 100,
        },
        textAlign: {
          type: 'radio',
          label: 'Text Alignment',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        minHeight: {
          type: 'text',
          label: 'Minimum Height',
        },
      },
      defaultProps: {
        headline: 'Welcome to Our Restaurant',
        subheadline: 'Fresh ingredients, unforgettable flavors',
        backgroundImage: {
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
          alt: 'Restaurant interior',
        },
        ctaText: 'View Our Menu',
        ctaLink: '/pricing',
        ctaStyle: 'primary',
        overlay: true,
        overlayOpacity: 50,
        textAlign: 'center',
        minHeight: '70vh',
      },
      render: ({ _id, ...props }) => {
        // Ensure backgroundImage is properly passed and not undefined
        const finalProps = {
          ...props,
          backgroundImage: props.backgroundImage || {
            url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
            alt: 'Restaurant interior',
          },
        };
        return <HeroSection {...finalProps} />;
      },
    },

    FeaturesSection: {
      fields: {
        title: {
          type: 'text',
          label: 'Section Title',
        },
        subtitle: {
          type: 'textarea',
          label: 'Subtitle',
        },
        features: {
          type: 'array',
          label: 'Features',
          arrayFields: {
            id: { type: 'text', label: 'ID' },
            icon: { type: 'text', label: 'Icon Name (Lucide)' },
            title: { type: 'text', label: 'Title' },
            description: { type: 'textarea', label: 'Description' },
          },
        },
        columns: {
          type: 'radio',
          label: 'Columns',
          options: [
            { label: '2', value: 2 },
            { label: '3', value: 3 },
            { label: '4', value: 4 },
          ],
        },
        style: {
          type: 'radio',
          label: 'Card Style',
          options: [
            { label: 'Cards', value: 'cards' },
            { label: 'Minimal', value: 'minimal' },
            { label: 'Bordered', value: 'bordered' },
          ],
        },
      },
      defaultProps: {
        title: 'Why Choose Us',
        subtitle: 'Discover what makes us special',
        features: [
          {
            id: '1',
            icon: 'Utensils',
            title: 'Fresh Ingredients',
            description: 'We source the finest ingredients daily from local farmers',
          },
          {
            id: '2',
            icon: 'ChefHat',
            title: 'Expert Chefs',
            description: 'Our culinary team has decades of combined experience',
          },
          {
            id: '3',
            icon: 'Heart',
            title: 'Made with Love',
            description: 'Every dish is prepared with passion and attention to detail',
          },
        ],
        columns: 3,
        style: 'cards',
      },
      render: ({ _id, ...props }) => {
        return <FeaturesSection {...props} />;
      },
    },

    MenuSection: {
      fields: {
        displayStyle: {
          type: 'radio',
          label: 'Display Style',
          options: [
            { label: 'Tabs', value: 'tabs' },
            { label: 'Grid', value: 'grid' },
            { label: 'List', value: 'list' },
          ],
        },
      },
      defaultProps: {
        displayStyle: 'tabs',
      },
      render: ({ _id, ...props }) => <MenuSection {...props} />,
    },

    QRCodeSection: {
      fields: {
        title: {
          type: 'text',
          label: 'Title',
        },
        subtitle: {
          type: 'textarea',
          label: 'Subtitle',
        },
        qrCodeUrl: {
          type: 'text',
          label: 'QR Code Image URL',
        },
        destinationUrl: {
          type: 'text',
          label: 'Destination URL',
        },
        qrStyle: {
          type: 'radio',
          label: 'QR Style',
          options: [
            { label: 'Minimal', value: 'minimal' },
            { label: 'Framed', value: 'framed' },
            { label: 'Branded', value: 'branded' },
          ],
        },
        instructions: {
          type: 'array',
          label: 'Instructions',
          arrayFields: {
            text: { type: 'text', label: 'Instruction' },
          },
        },
        showDeviceIcons: {
          type: 'radio',
          label: 'Show Device Icons',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
        },
      },
      defaultProps: {
        title: 'Scan to Order',
        subtitle: 'View our menu and place orders directly from your phone',
        qrStyle: 'branded',
        instructions: ['Point your camera to scan', 'No app required'],
        showDeviceIcons: true,
      },
      render: ({ _id, ...props }) => <QRCodeSection {...props} />,
    },

    GallerySection: {
      fields: {
        title: {
          type: 'text',
          label: 'Section Title',
        },
        subtitle: {
          type: 'textarea',
          label: 'Subtitle',
        },
        images: {
          type: 'custom',
          label: 'Images',
          render: ({ value, onChange }) => (
            <ImageArrayField value={value} onChange={onChange} category="restaurant" />
          ),
        },
        columns: {
          type: 'radio',
          label: 'Columns',
          options: [
            { label: '2', value: 2 },
            { label: '3', value: 3 },
            { label: '4', value: 4 },
          ],
        },
        aspectRatio: {
          type: 'radio',
          label: 'Aspect Ratio',
          options: [
            { label: 'Square', value: 'square' },
            { label: 'Landscape', value: 'landscape' },
            { label: 'Portrait', value: 'portrait' },
          ],
        },
        lightbox: {
          type: 'radio',
          label: 'Enable Lightbox',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
        },
      },
      defaultProps: {
        title: 'Our Gallery',
        subtitle: 'A glimpse into our culinary creations',
        images: [
          {
            id: '1',
            url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
            alt: 'Gourmet appetizer',
            caption: 'Seasonal Appetizer',
          },
          {
            id: '2',
            url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
            alt: 'Signature main course',
            caption: 'Signature Entrée',
          },
          {
            id: '3',
            url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
            alt: 'Artisan dessert',
            caption: 'Artisan Dessert',
          },
        ],
        columns: 3,
        aspectRatio: 'square',
        lightbox: true,
      },
      render: ({ _id, ...props }) => {
        // Ensure images array is properly passed
        const finalProps = {
          ...props,
          images: props.images && props.images.length > 0 ? props.images : [
            {
              id: '1',
              url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
              alt: 'Gourmet appetizer',
              title: 'Seasonal Appetizer',
            },
            {
              id: '2',
              url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
              alt: 'Signature main course',
              title: 'Signature Entrée',
            },
            {
              id: '3',
              url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
              alt: 'Artisan dessert',
              title: 'Artisan Dessert',
            },
          ],
        };
        return <GallerySection {...finalProps} />;
      },
    },

    CTASection: {
      fields: {
        title: {
          type: 'text',
          label: 'Title',
        },
        description: {
          type: 'textarea',
          label: 'Description',
        },
        primaryCta: {
          type: 'object',
          label: 'Primary Button',
          objectFields: {
            text: { type: 'text', label: 'Text' },
            link: { type: 'text', label: 'Link' },
          },
        },
        secondaryCta: {
          type: 'object',
          label: 'Secondary Button',
          objectFields: {
            text: { type: 'text', label: 'Text' },
            link: { type: 'text', label: 'Link' },
          },
        },
        backgroundImage: {
          type: 'custom',
          label: 'Background Image',
          render: ({ value, onChange }) => (
            <ImageField value={value} onChange={onChange} category="restaurant" />
          ),
        },
        backgroundColor: {
          type: 'text',
          label: 'Background Color',
        },
        style: {
          type: 'radio',
          label: 'Layout Style',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Centered', value: 'centered' },
            { label: 'Split', value: 'split' },
          ],
        },
      },
      defaultProps: {
        title: 'Ready to Experience Amazing Food?',
        description: 'Visit us today or order online for pickup and delivery',
        primaryCta: {
          text: 'Order Now',
          link: '/auth/signup',
        },
        secondaryCta: {
          text: 'View Menu',
          link: '/pricing',
        },
        backgroundImage: {
          url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80',
          alt: 'Restaurant ambiance',
        },
        backgroundColor: '#000000',
        style: 'centered',
      },
      render: ({ _id, ...props }) => <CTASection {...props} />,
    },

    ContactSection: {
      fields: {
        title: {
          type: 'text',
          label: 'Section Title',
        },
        subtitle: {
          type: 'textarea',
          label: 'Subtitle',
        },
        address: {
          type: 'textarea',
          label: 'Address',
        },
        phone: {
          type: 'text',
          label: 'Phone',
        },
        email: {
          type: 'text',
          label: 'Email',
        },
        hours: {
          type: 'array',
          label: 'Hours',
          arrayFields: {
            text: { type: 'text', label: 'Hours Text' },
          },
        },
        mapEmbed: {
          type: 'textarea',
          label: 'Map Embed URL',
        },
        showMap: {
          type: 'radio',
          label: 'Show Map',
          options: [
            { label: 'Yes', value: true },
            { label: 'No', value: false },
          ],
        },
      },
      defaultProps: {
        title: 'Visit Us',
        subtitle: 'Find us at our location',
        hours: [
          'Monday - Friday: 11:00 AM - 10:00 PM',
          'Saturday - Sunday: 10:00 AM - 11:00 PM',
        ],
        showMap: true,
      },
      render: ({ _id, ...props }) => <ContactSection {...props} />,
    },
    LegacyHTML: {
      fields: {},
      defaultProps: {
        html: '',
        templateId: undefined,
      },
      render: (props: any) => {
        return (
          <div
            dangerouslySetInnerHTML={{ __html: props.html || '' }}
            className="legacy-html-content"
          />
        );
      },
    },
    GrapesJSSection: {
      fields: {},
      defaultProps: {
        html: '',
        css: '',
        json: null,
      },
      render: (props: any) => {
        return (
          <>
            {props.css && (
              <style dangerouslySetInnerHTML={{ __html: props.css }} />
            )}
            <div
              dangerouslySetInnerHTML={{ __html: props.html || '' }}
              className="grapesjs-content"
            />
          </>
        );
      },
    },
  },

  categories: {
    headers: {
      title: 'Headers',
      components: ['HeroSection'],
    },
    content: {
      title: 'Content',
      components: ['FeaturesSection', 'MenuSection', 'GallerySection'],
    },
    conversion: {
      title: 'Actions',
      components: ['QRCodeSection', 'CTASection', 'ContactSection'],
    },
  },
};

/**
 * Render-only configuration for Puck
 *
 * This config is safe to use in Server Components because it DOES NOT contain
 * custom field render functions (which cannot be serialized). It only includes
 * the component render functions needed to display the sections.
 *
 * Use this config for:
 * - Rendering published landing pages in Server Components
 * - SSR/SSG contexts
 *
 * Do NOT use this for:
 * - The Puck editor (use puckConfig instead)
 */
export const puckRenderConfig: Config = {
  components: {
    HeroSection: {
      defaultProps: puckConfig.components.HeroSection.defaultProps,
      render: puckConfig.components.HeroSection.render,
    },
    FeaturesSection: {
      defaultProps: puckConfig.components.FeaturesSection.defaultProps,
      render: puckConfig.components.FeaturesSection.render,
    },
    MenuSection: {
      defaultProps: puckConfig.components.MenuSection.defaultProps,
      render: puckConfig.components.MenuSection.render,
    },
    QRCodeSection: {
      defaultProps: puckConfig.components.QRCodeSection.defaultProps,
      render: puckConfig.components.QRCodeSection.render,
    },
    GallerySection: {
      defaultProps: puckConfig.components.GallerySection.defaultProps,
      render: puckConfig.components.GallerySection.render,
    },
    CTASection: {
      defaultProps: puckConfig.components.CTASection.defaultProps,
      render: puckConfig.components.CTASection.render,
    },
    ContactSection: {
      defaultProps: puckConfig.components.ContactSection.defaultProps,
      render: puckConfig.components.ContactSection.render,
    },
    LegacyHTML: {
      defaultProps: {
        html: '',
        templateId: undefined,
      },
      render: (props: any) => {
        return (
          <div
            dangerouslySetInnerHTML={{ __html: props.html || '' }}
            className="legacy-html-content"
          />
        );
      },
    },
    GrapesJSSection: {
      defaultProps: {
        html: '',
        css: '',
        json: null,
      },
      render: (props: any) => {
        return (
          <>
            {props.css && (
              <style dangerouslySetInnerHTML={{ __html: props.css }} />
            )}
            <div
              dangerouslySetInnerHTML={{ __html: props.html || '' }}
              className="grapesjs-content"
            />
          </>
        );
      },
    },
  },
};

export default puckConfig;
