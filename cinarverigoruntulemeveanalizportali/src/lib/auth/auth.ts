import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

// JWT Secret - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Function to hash a password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

// Function to compare a password with its hash
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Function to generate a JWT token
export function generateToken(payload: any): string {
  return sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Function to verify a JWT token
export function verifyToken(token: string): any {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get current user from cookies
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  return (await getCurrentUser()) !== null;
}

// Check if user is admin
export async function isAdmin() {
  const user = await getCurrentUser();
  return user && user.role === 'ADMIN';
} 