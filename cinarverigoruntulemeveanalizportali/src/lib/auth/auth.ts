import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { cache } from 'react';

// JWT Secret - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// User type for JWT token payload
interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

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
export function generateToken(payload: UserPayload): string {
  return sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Function to verify a JWT token
export function verifyToken(token: string): UserPayload | null {
  try {
    return verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

// Get current user from cookies using React's cache to avoid repeated calls
export const getCurrentUser = cache(
  async (): Promise<UserPayload | null> => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      
      if (!token) {
        return null;
      }
      
      return verifyToken(token);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
);

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && user.role === 'ADMIN';
} 