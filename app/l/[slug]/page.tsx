import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export default async function PublicLandingPage({ params }: RouteContext) {
  const { slug } = await params;

  const landingPage = await prisma.landingPage.findUnique({
    where: { slug },
  });

  if (!landingPage || !landingPage.published) {
    notFound();
  }

  // Increment views (non-blocking)
  prisma.landingPage
    .update({
      where: { id: landingPage.id },
      data: { views: { increment: 1 } },
    })
    .catch(() => {}); // Don't fail if view count fails

  const content = landingPage.content as any;
  const theme = landingPage.theme as any;

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme?.backgroundColor || '#FFFFFF' }}>
      <main>
        {/* Render sections based on content.sections */}
        {content?.sections?.map((section: any, index: number) => (
          <section key={index} className="py-16 px-4">
            {section.type === 'hero' && <HeroSection config={section.config} />}
            {section.type === 'features' && <FeaturesSection config={section.config} />}
            {section.type === 'cta' && <CTASection config={section.config} />}
            {section.type === 'menu-display' && <MenuDisplaySection config={section.config} />}
            {section.type === 'contact' && <ContactSection config={section.config} />}
            {section.type === 'event-details' && <EventDetailsSection config={section.config} />}
            {section.type === 'registration-form' && <RegistrationFormSection config={section.config} />}
            {section.type === 'benefits' && <BenefitsSection config={section.config} />}
            {section.type === 'lead-form' && <LeadFormSection config={section.config} />}
            {section.type === 'services-list' && <ServicesListSection config={section.config} />}
            {section.type === 'email-capture' && <EmailCaptureSection config={section.config} />}
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t">
        <p>© {new Date().getFullYear()} {landingPage.title}. All rights reserved.</p>
        <p className="mt-2">
          <a href="https://qreatestudios.com" className="hover:underline" target="_blank" rel="noopener noreferrer">
            Powered by Qreate Studios
          </a>
        </p>
      </footer>
    </div>
  );
}

function HeroSection({ config }: { config: any }) {
  return (
    <div
      className="max-w-6xl mx-auto text-center py-20"
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
      }}
    >
      <h1 className="text-5xl font-bold mb-6">{config.headline}</h1>
      <p className="text-xl mb-8 max-w-3xl mx-auto">{config.subheadline}</p>
      <Button size="lg" asChild className="min-h-[44px]">
        <a href={config.ctaUrl}>{config.ctaText}</a>
      </Button>
    </div>
  );
}

function FeaturesSection({ config }: { config: any }) {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">{config.headline}</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {config.features?.map((feature: any, i: number) => (
          <Card key={i} className="p-6 text-center">
            <div className="text-4xl mb-4" role="img" aria-label={feature.title}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CTASection({ config }: { config: any }) {
  return (
    <div className="max-w-4xl mx-auto text-center bg-blue-600 text-white p-16 rounded-lg">
      <h2 className="text-4xl font-bold mb-6">{config.headline}</h2>
      <Button size="lg" variant="secondary" asChild className="min-h-[44px]">
        <a href={config.buttonUrl}>{config.buttonText}</a>
      </Button>
    </div>
  );
}

function MenuDisplaySection({ config }: { config: any }) {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">{config.headline}</h2>
      <p className="text-center text-muted-foreground">
        Menu integration coming soon. Configure your menu in the editor.
      </p>
    </div>
  );
}

function ContactSection({ config }: { config: any }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">{config.headline}</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {config.showMap && (
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Map placeholder</p>
          </div>
        )}
        {config.showHours && (
          <div>
            <h3 className="font-semibold mb-4">Business Hours</h3>
            <p className="text-muted-foreground">Configure hours in editor</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EventDetailsSection({ config }: { config: any }) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Event Details</h2>
        <div className="space-y-4">
          <div>
            <strong>Date:</strong> {new Date(config.date).toLocaleDateString()}
          </div>
          <div>
            <strong>Time:</strong> {config.time}
          </div>
          <div>
            <strong>Location:</strong> {config.location}
          </div>
        </div>
      </Card>
    </div>
  );
}

function RegistrationFormSection({ config }: { config: any }) {
  return (
    <div className="max-w-md mx-auto">
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        <form className="space-y-4">
          {config.fields?.map((field: string, i: number) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-2 capitalize">
                {field}
              </label>
              <Input type={field === 'email' ? 'email' : 'text'} required />
            </div>
          ))}
          <Button type="submit" className="w-full min-h-[44px]">
            Submit Registration
          </Button>
        </form>
      </Card>
    </div>
  );
}

function BenefitsSection({ config }: { config: any }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">{config.headline}</h2>
      <ul className="space-y-4">
        {config.benefits?.map((benefit: string, i: number) => (
          <li key={i} className="flex items-start gap-3">
            <span className="text-green-600 text-xl flex-shrink-0" aria-hidden="true">✓</span>
            <span className="text-lg">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeadFormSection({ config }: { config: any }) {
  return (
    <div className="max-w-md mx-auto">
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6">{config.headline}</h2>
        <form className="space-y-4">
          {config.fields?.map((field: string, i: number) => (
            <div key={i}>
              <label className="block text-sm font-medium mb-2 capitalize">
                {field}
              </label>
              <Input type={field === 'email' ? 'email' : 'text'} required />
            </div>
          ))}
          <Button type="submit" className="w-full min-h-[44px]">
            {config.submitText || 'Submit'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function ServicesListSection({ config }: { config: any }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        {config.services?.map((service: any, i: number) => (
          <Card key={i} className="p-6">
            <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
            <p className="text-muted-foreground">{service.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmailCaptureSection({ config }: { config: any }) {
  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-6">{config.headline}</h2>
      <form className="flex gap-2">
        <Input
          type="email"
          placeholder={config.placeholder || 'Enter your email'}
          className="flex-1"
          required
        />
        <Button type="submit" className="min-h-[44px]">
          {config.submitText || 'Submit'}
        </Button>
      </form>
    </div>
  );
}
