export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground mb-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices, updates, security alerts, and support messages</li>
          <li>Respond to your comments, questions, and customer service requests</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information Sharing</h2>
        <p>
          We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect the security of your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to our use of your data</li>
          <li>Request portability of your data</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at privacy@globfam.io.
        </p>
      </div>
    </div>
  )
}