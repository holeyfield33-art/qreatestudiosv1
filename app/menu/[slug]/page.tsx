import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PublicMenuPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenuPage({ params }: PublicMenuPageProps) {
  const { slug } = await params;

  const menu = await prisma.menu.findUnique({
    where: { slug },
    include: {
      MenuCategory: {
        where: { MenuItem: { some: {} } }, // Only categories with items
        include: {
          MenuItem: {
            where: { isAvailable: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!menu || !menu.isActive) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: menu.currency,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Link */}
      <a
        href="#menu-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
      >
        Skip to menu
      </a>

      {/* Business Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {menu.businessName && (
            <h1 className="text-3xl font-bold mb-4">{menu.businessName}</h1>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            {menu.businessAddress && (
              <div className="flex items-start gap-2">
                <span aria-hidden="true">📍</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${menu.businessAddress}, ${menu.businessCity}, ${menu.businessState} ${menu.businessZip}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 underline"
                  aria-label="View location on Google Maps"
                >
                  {menu.businessAddress}
                  {menu.businessCity && `, ${menu.businessCity}`}
                  {menu.businessState && `, ${menu.businessState}`}
                  {menu.businessZip && ` ${menu.businessZip}`}
                </a>
              </div>
            )}

            {menu.businessPhone && (
              <div className="flex items-center gap-2">
                <span aria-hidden="true">📞</span>
                <a
                  href={`tel:${menu.businessPhone}`}
                  className="hover:text-blue-600 underline"
                  aria-label={`Call ${menu.businessPhone}`}
                >
                  {menu.businessPhone}
                </a>
              </div>
            )}

            {menu.businessEmail && (
              <div className="flex items-center gap-2">
                <span aria-hidden="true">📧</span>
                <a
                  href={`mailto:${menu.businessEmail}`}
                  className="hover:text-blue-600 underline"
                  aria-label={`Email ${menu.businessEmail}`}
                >
                  {menu.businessEmail}
                </a>
              </div>
            )}

            {menu.businessWebsite && (
              <div className="flex items-center gap-2">
                <span aria-hidden="true">🌐</span>
                <a
                  href={menu.businessWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 underline"
                  aria-label="Visit website"
                >
                  Website
                </a>
              </div>
            )}
          </div>

          <div className="mt-4">
            <Badge variant="outline" className="bg-green-50 text-green-700">
              ✓ Verified Menu
            </Badge>
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main id="menu-content" className="max-w-4xl mx-auto px-4 py-8">
        {menu.MenuCategory.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No menu items available at this time.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {menu.MenuCategory.map((category) => (
              <section key={category.id} className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
                {category.description && (
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                )}

                <div className="space-y-4">
                  {category.MenuItem.map((item) => (
                    <article
                      key={item.id}
                      className="flex justify-between items-start gap-4 pb-4 border-b last:border-b-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                          </p>
                        )}
                        {item.dietaryTags && (
                          <div className="flex gap-1 mt-2 flex-wrap" role="list">
                            {(item.dietaryTags as string[]).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs" role="listitem">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg">{formatPrice(item.price)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <Button variant="outline" size="sm" className="min-w-[44px] min-h-[44px]">
          Report Issue
        </Button>
        <p className="mt-2">Powered by Qreate Studios</p>
      </footer>

      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Restaurant',
            name: menu.businessName,
            address: menu.businessAddress ? {
              '@type': 'PostalAddress',
              streetAddress: menu.businessAddress,
              addressLocality: menu.businessCity,
              addressRegion: menu.businessState,
              postalCode: menu.businessZip,
            } : undefined,
            telephone: menu.businessPhone,
            url: menu.businessWebsite,
            hasMenu: {
              '@type': 'Menu',
              name: menu.name,
              description: menu.description,
              hasMenuSection: menu.MenuCategory.map((cat) => ({
                '@type': 'MenuSection',
                name: cat.name,
                description: cat.description,
                hasMenuItem: cat.MenuItem.map((item) => ({
                  '@type': 'MenuItem',
                  name: item.name,
                  description: item.description,
                  offers: {
                    '@type': 'Offer',
                    price: item.price,
                    priceCurrency: menu.currency,
                  },
                })),
              })),
            },
          }),
        }}
      />
    </div>
  );
}
