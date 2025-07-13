import type { NextApiRequest, NextApiResponse } from 'next';
import { ContactRequest, ContactResponse, ApiResponse } from '@/types/api';
import { validateEmail } from '@/utils/validation';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/utils/constants';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT = {
  maxRequests: 5, // 5 requests per window
  windowMs: 15 * 60 * 1000, // 15 minutes
};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = `contact_${ip}`;
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    });
    return true;
  }

  if (current.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  current.count++;
  return true;
}

function validateContactRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate required fields
  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters long');
  }

  if (!data.email || typeof data.email !== 'string' || !validateEmail(data.email)) {
    errors.push('Valid email address is required');
  }

  if (!data.purpose || typeof data.purpose !== 'string' || data.purpose.trim().length === 0) {
    errors.push('Purpose of contact is required');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }

  // Validate field lengths
  if (data.firstName && data.firstName.length > 50) {
    errors.push('First name must be less than 50 characters');
  }

  if (data.email && data.email.length > 255) {
    errors.push('Email address is too long');
  }

  if (data.message && data.message.length > 1000) {
    errors.push('Message must be less than 1000 characters');
  }

  // Basic spam detection
  const spamKeywords = ['bitcoin', 'crypto scam', 'free money', 'click here', 'limited time'];
  const messageText = data.message?.toLowerCase() || '';
  const hasSpamKeywords = spamKeywords.some(keyword => messageText.includes(keyword));

  if (hasSpamKeywords) {
    errors.push('Message contains prohibited content');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

async function sendNotificationEmail(contactData: ContactRequest): Promise<void> {
  // TODO: Implement email sending logic
  // This could use SendGrid, AWS SES, Mailgun, etc.
  
  const emailContent = `
    New contact form submission from White Fin Capital website:
    
    Name: ${contactData.firstName}
    Email: ${contactData.email}
    Purpose: ${contactData.purpose}
    Message: ${contactData.message}
    Source: ${contactData.source || 'Website'}
    Timestamp: ${new Date().toISOString()}
  `;

  console.log('Email would be sent:', emailContent);
  
  // Example with a hypothetical email service:
  // await emailService.send({
  //   to: 'info@whitefincapital.com',
  //   subject: `New Contact: ${contactData.purpose}`,
  //   text: emailContent,
  // });
}

async function saveToDatabase(contactData: ContactRequest): Promise<ContactResponse> {
  // TODO: Implement database saving logic
  // This could use Prisma, MongoDB, PostgreSQL, etc.
  
  const contactRecord = {
    id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...contactData,
    createdAt: new Date(),
    status: 'new' as const,
    ipAddress: contactData.source, // In real implementation, get from request
  };

  console.log('Contact record would be saved:', contactRecord);

  // Example with a hypothetical database:
  // const result = await db.contacts.create({
  //   data: contactRecord,
  // });

  return {
    id: contactRecord.id,
    status: 'sent',
    timestamp: contactRecord.createdAt,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ContactResponse>>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Get client IP for rate limiting
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const clientIP = Array.isArray(ip) ? ip[0] : ip;

    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({
        success: false,
        error: ERROR_MESSAGES.rateLimit,
      });
    }

    // Validate request body
    const validation = validateContactRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(', '),
      });
    }

    // Sanitize input data
    const contactData: ContactRequest = {
      firstName: sanitizeInput(req.body.firstName),
      email: sanitizeInput(req.body.email).toLowerCase(),
      purpose: sanitizeInput(req.body.purpose),
      message: sanitizeInput(req.body.message),
      source: 'Website Contact Form',
    };

    // Save to database
    const contactResponse = await saveToDatabase(contactData);

    // Send notification email
    try {
      await sendNotificationEmail(contactData);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email sending fails
    }

    // Return success response
    res.status(200).json({
      success: true,
      data: contactResponse,
      message: SUCCESS_MESSAGES.contactSubmitted,
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    res.status(500).json({
      success: false,
      error: ERROR_MESSAGES.server,
    });
  }
}

// Configure body parser
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};