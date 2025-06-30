# Production Deployment Guide

## Prerequisites

1. **Environment Variables**: Create a `.env` file based on `.env.example`
2. **API Keys**: Obtain your Tavus API key and replica ID
3. **Domain**: Secure a domain with HTTPS certificate
4. **Monitoring**: Set up error tracking (optional but recommended)

## Environment Configuration

### Required Variables
```bash
VITE_TAVUS_API_KEY=your_tavus_api_key_here
VITE_TAVUS_REPLICA_ID=your_replica_id_here
VITE_NODE_ENV=production
```

### Optional Variables
```bash
VITE_GOOGLE_ANALYTICS_ID=your_ga_id_here
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_DEBUG_LOGS=false
```

## Deployment Platforms

### Netlify (Recommended)

1. **Connect Repository**:
   - Link your GitHub/GitLab repository to Netlify
   - Set build command: `npm run build:production`
   - Set publish directory: `dist`

2. **Environment Variables**:
   - Add all required environment variables in Netlify dashboard
   - Go to Site Settings > Environment Variables

3. **Custom Domain**:
   - Add your custom domain in Site Settings > Domain Management
   - Configure DNS records as instructed
   - SSL certificate will be automatically provisioned

4. **Deploy**:
   - Push to your main branch to trigger automatic deployment
   - Monitor build logs for any issues

### Vercel

1. **Import Project**:
   - Import from GitHub/GitLab
   - Framework preset: React
   - Build command: `npm run build:production`
   - Output directory: `dist`

2. **Environment Variables**:
   - Add in Project Settings > Environment Variables
   - Make sure to set for Production environment

3. **Custom Domain**:
   - Add in Project Settings > Domains
   - Configure DNS as instructed

### AWS S3 + CloudFront

1. **Build Application**:
   ```bash
   npm run build:production
   ```

2. **S3 Setup**:
   - Create S3 bucket with static website hosting
   - Upload `dist` folder contents
   - Configure bucket policy for public read access

3. **CloudFront Setup**:
   - Create CloudFront distribution
   - Set S3 bucket as origin
   - Configure custom error pages for SPA routing
   - Add SSL certificate

## Security Checklist

### Pre-Deployment
- [ ] Remove all hardcoded API keys from source code
- [ ] Verify environment variables are properly configured
- [ ] Run security audit: `npm run security-audit`
- [ ] Test with production build locally: `npm run preview`
- [ ] Verify HTTPS is enforced
- [ ] Check Content Security Policy headers

### Post-Deployment
- [ ] Test all functionality in production environment
- [ ] Verify video calls work correctly
- [ ] Test error handling and fallbacks
- [ ] Monitor performance metrics
- [ ] Set up uptime monitoring
- [ ] Configure error tracking alerts

## Performance Optimization

### Build Optimization
```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npx depcheck

# Audit for vulnerabilities
npm run security-audit
```

### CDN Configuration
- Enable gzip/brotli compression
- Set appropriate cache headers
- Use HTTP/2 push for critical resources
- Optimize images and fonts

### Monitoring Setup

1. **Google Analytics** (Optional):
   - Set `VITE_ENABLE_ANALYTICS=true`
   - Add your GA tracking ID

2. **Error Tracking** (Optional):
   - Set up Sentry or similar service
   - Add DSN to environment variables
   - Set `VITE_ENABLE_ERROR_TRACKING=true`

3. **Performance Monitoring**:
   - Monitor Core Web Vitals
   - Set up uptime monitoring
   - Track API response times

## Health Checks

### Application Health
- Video call connectivity
- API endpoint availability
- Error rate monitoring
- Performance metrics

### Security Health
- SSL certificate validity
- Security headers verification
- Dependency vulnerability scanning
- Access log monitoring

## Troubleshooting

### Common Issues

1. **Video Calls Not Working**:
   - Check CORS configuration
   - Verify Daily.co/Tavus API connectivity
   - Ensure HTTPS is properly configured
   - Check browser permissions for camera/microphone

2. **Environment Variables Not Loading**:
   - Verify variable names start with `VITE_`
   - Check deployment platform configuration
   - Ensure variables are set for production environment

3. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review TypeScript compilation errors
   - Check for missing environment variables

4. **Performance Issues**:
   - Analyze bundle size with `npm run analyze`
   - Check for memory leaks in video components
   - Monitor network requests
   - Verify CDN configuration

### Support Resources
- [Tavus API Documentation](https://docs.tavus.io/)
- [Daily.co Documentation](https://docs.daily.co/)
- [React Performance Guide](https://react.dev/learn/render-and-commit)

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor security advisories
- [ ] Review error logs weekly
- [ ] Check performance metrics
- [ ] Backup configuration and data
- [ ] Test disaster recovery procedures

### Updates
- Test updates in staging environment first
- Use semantic versioning for releases
- Maintain changelog for deployments
- Have rollback plan ready

## Legal Compliance

### HIPAA Considerations
- Ensure end-to-end encryption
- Implement proper access controls
- Maintain audit logs
- Have data retention policies
- Consider Business Associate Agreements

### Privacy Compliance
- Implement privacy policy
- Handle user consent properly
- Provide data deletion mechanisms
- Comply with GDPR/CCPA if applicable

---

**Important**: This application handles sensitive mental health data. Always prioritize security, privacy, and compliance with relevant healthcare regulations in your deployment.