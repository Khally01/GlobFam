# Security Guide for GlobFam AI Features

## OpenAI API Key Security

### Current Security Measures

1. **Server-Side Only**: API keys are never exposed to the frontend
2. **Environment Variables**: Keys stored in `.env` files (not in code)
3. **Rate Limiting**: Prevents abuse and excessive API usage
4. **User Quotas**: Monthly limits based on subscription plans
5. **Input Sanitization**: All AI responses are sanitized before use

### Best Practices for API Key Security

#### 1. Environment Setup
```bash
# .env file (NEVER commit this to git)
OPENAI_API_KEY=sk-...your-key-here...
ENCRYPTION_KEY=your-32-character-encryption-key-here!!

# Generate a secure encryption key
openssl rand -hex 32
```

#### 2. Additional Security Measures

**Option A: Use Environment Variables (Current - Good for Small Teams)**
- ✅ Simple to implement
- ✅ Works well for personal projects
- ⚠️ Keys visible to anyone with server access

**Option B: Encrypted Storage (Recommended for Production)**
```typescript
// Store encrypted keys in database
const encrypted = SecurityConfig.encrypt(openaiKey);
await prisma.settings.create({
  data: {
    key: 'openai_api_key',
    value: encrypted.encrypted,
    iv: encrypted.iv
  }
});
```

**Option C: Key Management Service (Enterprise)**
- Use AWS KMS, Azure Key Vault, or HashiCorp Vault
- Rotate keys regularly
- Audit key usage

### Rate Limiting Configuration

The system implements multiple layers of protection:

1. **Per-User Rate Limits**:
   - 100 categorization requests per 15 minutes
   - 10 insight generation requests per hour

2. **Subscription-Based Quotas**:
   - Starter: 100 AI categorizations/month
   - Family: 500 AI categorizations/month  
   - Premium: 2000 AI categorizations/month
   - Enterprise: Unlimited

3. **Cost Protection**:
   - Average cost: $0.001-0.002 per 100 transactions
   - Monthly cost estimate: $0.10-2.00 for typical usage

### Monitoring and Alerts

1. **Track Usage**:
```sql
-- Check monthly AI usage by organization
SELECT 
  o.name,
  COUNT(*) as ai_calls,
  DATE_TRUNC('month', a.createdAt) as month
FROM "AICategorizationHistory" a
JOIN "Organization" o ON o.id = a.organizationId
GROUP BY o.id, month
ORDER BY month DESC, ai_calls DESC;
```

2. **Set Up Alerts**:
- Monitor for unusual spikes in API usage
- Alert when approaching quota limits
- Track failed API calls

### Security Checklist

- [ ] Store API keys in environment variables
- [ ] Add `.env` to `.gitignore`
- [ ] Enable rate limiting on AI endpoints
- [ ] Implement user quotas based on plans
- [ ] Set up usage monitoring
- [ ] Use HTTPS for all API calls
- [ ] Rotate API keys regularly (every 90 days)
- [ ] Audit logs for API usage
- [ ] Implement retry logic with exponential backoff
- [ ] Set timeout limits on API calls

### Incident Response

If you suspect your API key has been compromised:

1. **Immediately**:
   - Revoke the compromised key in OpenAI dashboard
   - Generate a new key
   - Update your environment variables

2. **Investigation**:
   - Check OpenAI usage dashboard for unusual activity
   - Review server logs for unauthorized access
   - Audit recent deployments and access logs

3. **Prevention**:
   - Implement key rotation policy
   - Use separate keys for dev/staging/production
   - Consider implementing OAuth flow for team members

### Cost Management

To keep OpenAI costs under control:

1. **Caching**: Transaction categorizations are cached to avoid duplicate API calls
2. **Batch Processing**: Process multiple transactions in single requests where possible
3. **Fallback Logic**: Use rule-based categorization when AI isn't needed
4. **Usage Limits**: Enforce monthly quotas per user/organization

### Alternative: Bring Your Own Key (BYOK)

For maximum security, consider allowing users to use their own OpenAI keys:

```typescript
// User provides their own encrypted key
const userApiKey = await getUserApiKey(userId);
const openai = new OpenAI({ 
  apiKey: SecurityConfig.decrypt(userApiKey) 
});
```

Benefits:
- Users control their own costs
- No liability for key management
- Users can revoke access anytime

## Summary

Your current implementation is secure for personal use. For production:

1. **Minimum**: Use environment variables + rate limiting ✅ (already implemented)
2. **Recommended**: Add encryption + monitoring + quotas
3. **Enterprise**: Use KMS + BYOK + audit trails

The fallback to rule-based categorization means the system works even without OpenAI, making it resilient and cost-effective.