'use client';

import { useState } from 'react';
import { SmartImage } from '@/components/ui/SmartImage';
import { DIETARY_BADGES, SPICE_LEVELS, type MenuItem, type MenuCategory, type RestaurantMenu, type DietaryInfoType, type SpiceLevelType } from '@/lib/schemas/menu';
import { Star } from 'lucide-react';

export interface MenuSectionProps {
  menu?: RestaurantMenu;
  displayStyle?: 'tabs' | 'grid' | 'list';
}

export function MenuSection({ menu, displayStyle = 'tabs' }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState(menu?.categories[0]?.id);
  
  if (!menu || !menu.categories || menu.categories.length === 0) {
    return (
      <section className="py-16 px-4 bg-white text-center">
        <p className="text-gray-500">Menu data will be loaded when available</p>
      </section>
    );
  }
  
  const settings = menu.settings || {
    showPrices: true,
    showImages: true,
    showDietaryIcons: true,
    showAllergens: true,
    showSpiceLevel: true,
  };

  const activeMenuCategory = menu.categories.find((c) => c.id === activeCategory);

  return (
    <section id="menu" className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Menu Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {menu.name}
          </h2>
          {menu.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {menu.description}
            </p>
          )}
        </div>

        {/* Category Navigation */}
        {menu.categories.length > 1 && (
          <nav className="flex gap-2 overflow-x-auto pb-4 mb-8 border-b scrollbar-hide">
            {menu.categories
              .filter((cat) => cat.visible)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                    activeCategory === category.id
                      ? 'bg-black text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
          </nav>
        )}

        {/* Menu Items */}
        {activeMenuCategory && (
          <MenuCategoryDisplay
            category={activeMenuCategory}
            displayStyle={displayStyle}
            settings={settings}
            currencySymbol={menu.currencySymbol}
          />
        )}
      </div>
    </section>
  );
}

function MenuCategoryDisplay({
  category,
  displayStyle,
  settings,
  currencySymbol,
}: {
  category: MenuCategory;
  displayStyle: 'tabs' | 'grid' | 'list';
  settings: any;
  currencySymbol: string;
}) {
  const sortedItems = [...category.items].sort((a, b) => a.sortOrder - b.sortOrder);

  if (displayStyle === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            settings={settings}
            currencySymbol={currencySymbol}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {sortedItems.map((item) => (
        <MenuItemRow
          key={item.id}
          item={item}
          settings={settings}
          currencySymbol={currencySymbol}
        />
      ))}
    </div>
  );
}

function MenuItemCard({
  item,
  settings,
  currencySymbol,
}: {
  item: MenuItem;
  settings: any;
  currencySymbol: string;
}) {
  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      {/* Image */}
      {settings.showImages && (
        <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
          {item.image?.url ? (
            <SmartImage
              src={item.image.url}
              alt={item.image.alt}
              blurhash={item.image.blurhash}
              category="food"
              fill
              objectFit="cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="group-hover:scale-105 transition-transform duration-300"
            />
          ) : null}
          {item.featured && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Featured
            </span>
          )}
          {item.popular && !item.featured && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Popular
            </span>
          )}
          {item.soldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-lg font-bold">Sold Out</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold text-lg text-gray-900 flex-1">
            {item.name}
          </h3>
          {settings.showPrices && (
            <span className="font-bold text-primary whitespace-nowrap">
              {currencySymbol}{item.price.toFixed(2)}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Dietary Badges & Spice Level */}
        <div className="flex items-center gap-2 flex-wrap">
          {settings.showDietaryIcons &&
            item.dietaryInfo.map((diet) => (
              <DietaryBadge key={diet} type={diet as DietaryInfoType} />
            ))}
          {settings.showSpiceLevel &&
            item.spiceLevel &&
            item.spiceLevel !== 'none' && (
              <SpiceBadge level={item.spiceLevel as SpiceLevelType} />
            )}
        </div>

        {/* Allergens */}
        {settings.showAllergens && item.allergens.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Allergens: {item.allergens.join(', ')}
          </p>
        )}

        {/* Price Variants */}
        {item.priceVariants && item.priceVariants.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-1">Sizes:</p>
            <div className="space-y-1">
              {item.priceVariants.map((variant, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{variant.name}</span>
                  <span className="font-medium">
                    {currencySymbol}{variant.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItemRow({
  item,
  settings,
  currencySymbol,
}: {
  item: MenuItem;
  settings: any;
  currencySymbol: string;
}) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 last:border-b-0">
      {/* Image (optional) */}
      {settings.showImages && item.image?.url && (
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <SmartImage
            src={item.image.url}
            alt={item.image.alt}
            blurhash={item.image.blurhash}
            category="food"
            fill
            objectFit="cover"
            sizes="96px"
          />
          {item.soldOut && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xs font-bold">Sold Out</span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-4 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-lg text-gray-900">
              {item.name}
            </h3>
            {item.featured && (
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            )}
            {item.popular && !item.featured && (
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
          </div>
          {settings.showPrices && (
            <span className="font-bold text-primary text-lg whitespace-nowrap">
              {currencySymbol}{item.price.toFixed(2)}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-gray-600 text-sm mb-2">
            {item.description}
          </p>
        )}

        {/* Dietary Badges & Spice Level */}
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {settings.showDietaryIcons &&
            item.dietaryInfo.map((diet) => (
              <DietaryBadge key={diet} type={diet as DietaryInfoType} />
            ))}
          {settings.showSpiceLevel &&
            item.spiceLevel &&
            item.spiceLevel !== 'none' && (
              <SpiceBadge level={item.spiceLevel as SpiceLevelType} />
            )}
        </div>

        {/* Allergens */}
        {settings.showAllergens && item.allergens.length > 0 && (
          <p className="text-xs text-gray-500">
            Allergens: {item.allergens.join(', ')}
          </p>
        )}

        {/* Price Variants */}
        {item.priceVariants && item.priceVariants.length > 0 && (
          <div className="mt-2 flex gap-4 flex-wrap">
            {item.priceVariants.map((variant, idx) => (
              <span key={idx} className="text-sm text-gray-600">
                {variant.name}: {currencySymbol}{variant.price.toFixed(2)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DietaryBadge({ type }: { type: DietaryInfoType }) {
  const badge = DIETARY_BADGES[type];
  if (!badge) return null;

  return (
    <span
      className="inline-flex items-center justify-center min-w-[24px] h-6 px-1 rounded-full text-xs font-bold text-white"
      style={{ backgroundColor: badge.color }}
      title={badge.label}
    >
      {badge.icon}
    </span>
  );
}

function SpiceBadge({ level }: { level: SpiceLevelType }) {
  const spice = SPICE_LEVELS[level];
  if (!spice) return null;

  return (
    <span
      className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${spice.color}20`, color: spice.color }}
      title={spice.label}
    >
      {spice.emoji}
    </span>
  );
}

MenuSection.defaultProps = {
  displayStyle: 'tabs',
};
