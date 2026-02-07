export function PaymentExamples() {
  const examples = [
    {
      platform: 'Venmo',
      icon: '💸',
      handle: '@username',
      example: '@johndoe',
      note: 'Your Venmo username (with or without @)',
    },
    {
      platform: 'Cash App',
      icon: '💵',
      handle: '$cashtag',
      example: '$johndoe',
      note: 'Your Cash App cashtag (with or without $)',
    },
    {
      platform: 'Zelle',
      icon: '🏦',
      handle: 'email or phone',
      example: 'john@example.com',
      note: 'Email address or phone number linked to Zelle',
    },
    {
      platform: 'PayPal',
      icon: '💙',
      handle: 'PayPal.me username',
      example: 'johndoe',
      note: 'Your PayPal.me username (no special characters)',
    },
    {
      platform: 'Bitcoin',
      icon: '₿',
      handle: 'Bitcoin address',
      example: 'bc1q...',
      note: 'Your Bitcoin wallet address (starts with 1, 3, or bc1)',
    },
    {
      platform: 'Ethereum',
      icon: '⟠',
      handle: 'Ethereum address',
      example: '0x742d35...',
      note: 'Your Ethereum wallet address (starts with 0x)',
    },
  ];

  return (
    <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-sm mb-3 text-gray-900">Payment Format Examples</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {examples.map((ex) => (
          <div key={ex.platform} className="p-3 bg-white rounded-lg border shadow-sm text-xs">
            <div className="font-semibold mb-1 text-gray-900">
              {ex.icon} {ex.platform}
            </div>
            <div className="text-muted-foreground mb-1">
              Format: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{ex.handle}</code>
            </div>
            <div className="text-muted-foreground mb-2">
              Example: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{ex.example}</code>
            </div>
            <div className="text-xs text-gray-600 italic">
              {ex.note}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-200">
        <p className="text-xs text-amber-900">
          <strong>💡 Tip:</strong> Most payment apps must be installed on the user&apos;s device. 
          For Venmo and Cash App, the QR code will open the app directly. For Zelle, it opens 
          email/SMS since Zelle doesn&apos;t have a direct URL scheme.
        </p>
      </div>
    </div>
  );
}
