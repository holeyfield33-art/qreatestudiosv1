/**
 * Builder layout - bypasses the default dashboard layout chrome
 * (no sidebar, no header, no dark background) so the GrapesJS editor
 * gets full viewport control.
 */
export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      {children}
    </div>
  );
}
