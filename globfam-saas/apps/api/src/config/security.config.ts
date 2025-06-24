import crypto from 'crypto';

export class SecurityConfig {
  private static algorithm = 'aes-256-gcm';
  
  /**
   * Encrypt sensitive data like API keys
   */
  static encrypt(text: string, masterKey?: string): { encrypted: string; iv: string; tag: string } {
    const key = Buffer.from(
      masterKey || process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!',
      'utf8'
    ).slice(0, 32);
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
  
  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, masterKey?: string): string {
    const key = Buffer.from(
      masterKey || process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!',
      'utf8'
    ).slice(0, 32);
    
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Rate limiting configuration for AI endpoints
   */
  static getAIRateLimits() {
    return {
      categorization: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // 100 categorization requests per window
        message: 'Too many AI categorization requests, please try again later'
      },
      insights: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10, // 10 insight generation requests per hour
        message: 'Too many AI insight requests, please try again later'
      }
    };
  }
  
  /**
   * Check if request should be allowed based on user's plan
   */
  static async checkAIQuota(userId: string, organizationId: string, prisma: any): Promise<boolean> {
    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId,
        status: 'active'
      }
    });
    
    // Define quotas by plan
    const quotas = {
      STARTER: 100,     // 100 AI categorizations per month
      FAMILY: 500,      // 500 AI categorizations per month
      PREMIUM: 2000,    // 2000 AI categorizations per month
      ENTERPRISE: -1    // Unlimited
    };
    
    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const aiUsage = await prisma.aICategorizationHistory.count({
      where: {
        userId,
        createdAt: {
          gte: startOfMonth
        }
      }
    });
    
    const plan = subscription?.stripePriceId || 'STARTER';
    const quota = quotas[plan as keyof typeof quotas] || quotas.STARTER;
    
    // Check if within quota (-1 means unlimited)
    return quota === -1 || aiUsage < quota;
  }
  
  /**
   * Sanitize and validate OpenAI responses
   */
  static sanitizeAIResponse(response: any): any {
    // Remove any potential prompt injection attempts
    if (typeof response === 'string') {
      // Remove potential malicious patterns
      return response
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    
    return response;
  }
  
  /**
   * Generate a secure API key for internal use
   */
  static generateAPIKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}