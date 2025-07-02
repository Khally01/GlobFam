export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using GlobFam, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use License</h2>
        <p>
          Permission is granted to temporarily use GlobFam for personal, non-commercial transitory viewing only.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Disclaimer</h2>
        <p>
          The materials on GlobFam are provided on an 'as is' basis. GlobFam makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitations</h2>
        <p>
          In no event shall GlobFam or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use GlobFam, even if GlobFam or a GlobFam authorized representative has been notified orally or in writing of the possibility of such damage.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Privacy</h2>
        <p>
          Your use of GlobFam is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at support@globfam.io.
        </p>
      </div>
    </div>
  )
}