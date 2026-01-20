'use client';

import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export interface ContactSectionProps {
  title?: string;
  subtitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  hours?: (string | { text: string })[];
  mapEmbed?: string; // Google Maps or Mapbox embed URL
  showMap?: boolean;
}

export function ContactSection({
  title,
  subtitle,
  address,
  phone,
  email,
  hours = [],
  mapEmbed,
  showMap = true,
}: ContactSectionProps) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {address && (
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Address</h3>
                  <p className="text-gray-600 whitespace-pre-line">{address}</p>
                </div>
              </div>
            )}

            {phone && (
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Phone</h3>
                  <a
                    href={`tel:${phone}`}
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {email && (
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email</h3>
                  <a
                    href={`mailto:${email}`}
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    {email}
                  </a>
                </div>
              </div>
            )}

            {hours.length > 0 && (
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Hours</h3>
                  <div className="space-y-1">
                    {hours.map((hour, index) => {
                      const text = typeof hour === 'string' ? hour : hour.text;
                      return (
                        <p key={`hour-${index}-${text}`} className="text-gray-600">
                          {text}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          {showMap && mapEmbed && (
            <div className="rounded-xl overflow-hidden shadow-lg h-[400px]">
              <iframe
                src={mapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location map"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

ContactSection.defaultProps = {
  title: 'Visit Us',
  subtitle: 'Find us at our location',
  hours: [
    'Monday - Friday: 11:00 AM - 10:00 PM',
    'Saturday - Sunday: 10:00 AM - 11:00 PM',
  ],
  showMap: true,
};
