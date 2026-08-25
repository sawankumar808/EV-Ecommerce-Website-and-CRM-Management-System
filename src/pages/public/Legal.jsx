export function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Terms & Conditions</h1>
      <div className="prose prose-sm text-muted space-y-4 leading-relaxed">
        <p>By registering as a vendor or using this website, you agree to the following terms.</p>
        <p><strong className="text-ink">1. Vendor Approval —</strong> All vendor accounts are subject to review and approval by the CRM Admin. Access to pricing is granted only after approval.</p>
        <p><strong className="text-ink">2. Pricing —</strong> Prices shown to approved vendors may be vendor-specific and are confidential; sharing pricing with third parties is not permitted.</p>
        <p><strong className="text-ink">3. Battery Warranty —</strong> Warranty periods are set per battery batch and begin from the recorded installation date.</p>
        <p><strong className="text-ink">4. Account Suspension —</strong> Voltra Mobility reserves the right to suspend or deactivate any vendor account for policy violations.</p>
        <p><strong className="text-ink">5. Changes —</strong> These terms may be updated periodically; continued use of the platform constitutes acceptance of the revised terms.</p>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-display text-3xl font-semibold text-ink mb-6">Privacy Policy</h1>
      <div className="prose prose-sm text-muted space-y-4 leading-relaxed">
        <p>This policy explains how Voltra Mobility collects and uses your information.</p>
        <p><strong className="text-ink">Information We Collect —</strong> Business details, contact information, GST/PAN numbers and documents submitted during vendor registration.</p>
        <p><strong className="text-ink">How We Use It —</strong> To verify vendor eligibility, process orders, manage battery/scooter records, and provide customer support.</p>
        <p><strong className="text-ink">Data Sharing —</strong> We do not sell vendor or customer data. Information is shared only with sales team members assigned to your account.</p>
        <p><strong className="text-ink">Data Security —</strong> Access to the CRM is role-based and authenticated; vendors can only see their own account information.</p>
        <p><strong className="text-ink">Contact —</strong> For any privacy-related questions, reach us at vendors@voltramobility.com.</p>
      </div>
    </div>
  );
}
