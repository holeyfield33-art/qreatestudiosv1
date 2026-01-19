import { hash, compare } from 'bcryptjs';

/**
 * Hash a QR code password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashQRPassword(password: string): Promise<string> {
  // Use 10 rounds for QR passwords (slightly less than user passwords for performance)
  return await hash(password, 10);
}

/**
 * Verify a QR code password against the hashed version
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password from database
 * @returns true if password matches, false otherwise
 */
export async function verifyQRPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}
