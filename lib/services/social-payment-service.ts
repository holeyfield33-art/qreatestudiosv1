export interface SocialPaymentLink {
  platform: 'instagram' | 'tiktok' | 'whatsapp' | 'sms' | 'facebook' | 'twitter';
  username?: string;
  phoneNumber?: string;
  message?: string;
  amount?: number;
}

export function generateSocialPaymentUrl(config: SocialPaymentLink, paymentUrl: string): string {
  switch (config.platform) {
    case 'instagram':
      // Instagram bio link - just use the payment URL directly
      // Users add this to their Instagram bio
      return paymentUrl;

    case 'tiktok':
      // TikTok bio link - same as Instagram
      return paymentUrl;

    case 'whatsapp':
      // WhatsApp click-to-chat with pre-filled message
      const phone = config.phoneNumber?.replace(/[^0-9]/g, '');
      const message = encodeURIComponent(
        config.message || `Hi! I'd like to send you a payment: ${paymentUrl}`
      );
      return `https://wa.me/${phone}?text=${message}`;

    case 'sms':
      // SMS link with pre-filled message
      const smsPhone = config.phoneNumber?.replace(/[^0-9]/g, '');
      const smsMessage = encodeURIComponent(
        config.message || `Payment link: ${paymentUrl}`
      );
      return `sms:${smsPhone}?body=${smsMessage}`;

    case 'facebook':
      // Facebook Messenger link
      const fbUsername = config.username;
      return `https://m.me/${fbUsername}`;

    case 'twitter':
      // Twitter DM link
      const tweet = encodeURIComponent(
        config.message || `Send payment: ${paymentUrl}`
      );
      return `https://twitter.com/intent/tweet?text=${tweet}`;

    default:
      return paymentUrl;
  }
}

export function getSocialPlatformInstructions(platform: string): string {
  switch (platform) {
    case 'instagram':
      return 'Add this link to your Instagram bio to receive payments from followers.';
    case 'tiktok':
      return 'Add this link to your TikTok bio to receive payments from fans.';
    case 'whatsapp':
      return 'Share this WhatsApp link to start conversations with pre-filled payment message.';
    case 'sms':
      return 'This SMS link will open a text message with the payment link pre-filled.';
    case 'facebook':
      return 'Share this link to receive payments via Facebook Messenger.';
    case 'twitter':
      return 'Tweet this link to share your payment information with followers.';
    default:
      return 'Use this link to receive payments on social media.';
  }
}
