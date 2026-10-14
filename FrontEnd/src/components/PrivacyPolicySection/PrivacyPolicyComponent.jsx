import React, { useState } from "react";
import "./PrivacyPolicy.css";

const PrivacyPolicyComponent = () => {
  

  return (
    <div className="privacy-policy-container">

      <h1>Privacy Policy</h1>

      <p className="disclaimer">
        In case of any discrepancy, the English version of this Privacy Policy
        shall prevail.
      </p>
  <section>
      <p>
  This Privacy Policy explains how Aestheticommerce (“we”, “our”, or “us”) collects, uses, 
  shares, and protects personal information when you access or use our website 
   and related services (collectively, the “Services”).
</p>

<p>
  We are committed to safeguarding your privacy and handling your information in a transparent, 
  responsible, and secure manner.
</p>

<p>
  This policy is based on reference documents provided to us and has been tailored specifically 
  for the Aestheticommerce e‑commerce platform.
</p>
</section>
      {/* Information Collection */}
   
  
 
   <section>
  <h2>1. Information We Collect and Receive</h2>

  <p>
    To provide a seamless shopping and selling experience, Aestheticommerce gathers 
    information provided directly by you and through indirect interactions with our platform.
  </p>

  {/* Section A: Buyers */}
  <h3>A. Information Provided by Buyers</h3>
  <p>When you register as a Buyer or use our Services, we collect the following:</p>

  <ul>
    <li>
      <strong>Account Credentials:</strong> Full name, email address, and mobile number.
    </li>
    <li>
      <strong>Financial Information:</strong> Billing address and payment-related data 
      (e.g., UPI credentials, card details, net banking, or digital wallet information). 
      <em>Note: All payment processing is conducted via secure, encrypted gateways.</em>
    </li>
    <li>
      <strong>Logistics Details:</strong> Delivery address, recipient name, and contact information.
    </li>
    <li>
      <strong>Preferences:</strong> Country, preferred language, and currency settings.
    </li>
    <li>
      <strong>Public Profile:</strong> Any information you choose to display publicly, 
      such as your bio, profile image, gender, "Favourites," or "Collections."
    </li>
  </ul>

  {/* Section B: Sellers */}
  <h3>B. Information Provided by Sellers</h3>
  <p>To maintain a secure marketplace, Sellers are required to provide comprehensive data:</p>

  <ul>
    <li>
      <strong>Identity & Contact:</strong> Name, residential address, phone number, and date of birth.
    </li>
    <li>
      <strong>Business Details:</strong> Shop name, legal entity name (for registered businesses), 
      registered address, and details of beneficial owners.
    </li>
    <li>
      <strong>Regulatory & Tax Data:</strong> PAN, GSTIN, and other business identifiers required under Indian KYC and tax laws.
    </li>
    <li>
      <strong>Financial Records:</strong> Bank account details for payouts and associated billing information.
    </li>
    <li>
      <strong>Shop Profile:</strong> Public-facing details including shop photos, bio, holiday mode status, 
      and linked social media accounts.
    </li>
  </ul>

  {/* Section C: Identity Verification */}
  <h3>C. Identity Verification & Fraud Prevention</h3>
  <p>
    To comply with the Information Technology Rules, 2021 and Consumer Protection (E-Commerce) Rules, 2020, 
    we perform mandatory due diligence:
  </p>

  <ul>
    <li>
      <strong>Verification Documents:</strong> Government-issued IDs (Aadhaar, PAN, Passport, Voter ID, or Driver’s License).
    </li>
    <li>
      <strong>Biometric Data:</strong> Where legally permitted, we may use a "live selfie" to extract facial geometry 
      or biometric markers solely for identity verification and to prevent fraudulent account creation.
    </li>
  </ul>

  {/* Section D: Transactional & Interaction Data */}
  <h3>D. Transactional & Interaction Data</h3>
  <ul>
    <li>
      <strong>Guest Checkout:</strong> For users who purchase without an account, we collect essential delivery, 
      contact, and payment information to fulfill the order.
    </li>
    <li>
      <strong>Transaction History:</strong> Records of items bought/sold, transaction dates, amounts, and order history.
    </li>
    <li>
      <strong>Multimedia Content:</strong> Photos or videos uploaded for reviews, shop listings, or profile customization. 
      By uploading, you grant us the necessary permissions to display this content across our Services.
    </li>
    <li>
      <strong>Communications:</strong> Content and metadata (timestamps, technical details) of messages sent 
      between Buyers and Sellers or via our community forums.
    </li>
  </ul>

  {/* Section E: Support & Research */}
  <h3>E. Support & Research</h3>
  <ul>
    <li>
      <strong>Customer Support:</strong> We retain records of your interactions with our support team 
      (email, chat, or phone) and technical data (IP address/device info) to resolve issues.
    </li>
    <li>
      <strong>Surveys & Promotions:</strong> Participation in contests or market research is voluntary. 
      We may collect demographic data (age, gender, work status) and business insights to improve our platform.
    </li>
  </ul>
</section>

<section>
  <h2>2. Information Collected Automatically</h2>

  <p>
    To ensure our platform remains secure and optimized, Aestheticommerce automatically gathers 
    specific technical data whenever you interact with our Site or Apps, regardless of whether you are logged into an account.
  </p>

  {/* Section A: Technical Device & Browser Data */}
  <h3>A. Technical Device & Browser Data</h3>
  <p>We receive and log technical information from your browser or mobile device, including:</p>
  <ul>
    <li>
      <strong>Identifiers:</strong> IP address, unique device identifiers (UDID), and hardware model.
    </li>
    <li>
      <strong>System Details:</strong> Operating system version, browser type, language settings, and regional configurations.
    </li>
    <li>
      <strong>App Diagnostics:</strong> App versioning, usage logs, debugging data, and crash reports to ensure platform stability.
    </li>
  </ul>

  {/* Section B: Usage Analytics & Interaction */}
  <h3>B. Usage Analytics & Interaction</h3>
  <p>We monitor how you navigate Aestheticommerce to improve user experience and site performance:</p>
  <ul>
    <li>
      <strong>Engagement Metrics:</strong> Frequency of visits, pages viewed, specific listings interacted with, and search queries.
    </li>
    <li>
      <strong>Behavioral Data:</strong> Navigation patterns, mouse movements, clickstream data, and timestamps of actions taken on the platform.
    </li>
  </ul>

  {/* Section C: Geolocation Data */}
  <h3>C. Geolocation Data</h3>
  <ul>
    <li>
      <strong>General Location:</strong> We use IP-based geolocation to determine your approximate location (City, State, Country, or Pincode) 
      for security, tax compliance, and shipping estimates.
    </li>
    <li>
      <strong>Precise Location:</strong> Only with your explicit consent via your device settings, we may collect exact GPS coordinates 
      to provide location-specific features.
    </li>
  </ul>

  {/* Section D: Cookies & Tracking Technologies */}
  <h3>D. Cookies & Tracking Technologies</h3>
  <p>
    We utilize cookies, web beacons, and similar technologies to recognize your preferences and analyze traffic patterns. 
    For detailed information, please refer to our Cookies & Similar Technologies Policy.
  </p>
</section>

{/* Section 3: Information Received from Third Parties */}
<section>
  <h2>3. Information Received from Third Parties</h2>

  <p>
    Aestheticommerce may receive information about you from external partners to facilitate transactions 
    and enhance our marketing efforts.
  </p>

  {/* Section A: Payment & Security Partners */}
  <h3>A. Payment & Security Partners</h3>
  <ul>
    <li>
      Verification of billing details (Name, Address, Phone).
    </li>
    <li>
      Risk assessment indicators and fraud-prevention scores.
    </li>
  </ul>

  {/* Section B: Advertising & Marketing Insights */}
  <h3>B. Advertising & Marketing Insights</h3>
  <ul>
    <li>
      <strong>Attribution Data:</strong> Information regarding which ads or links led you to Aestheticommerce.
    </li>
    <li>
      <strong>Demographic Insights:</strong> Aggregated data such as age range, gender, interests, and general purchasing habits, 
      provided by partners where you have given consent.
    </li>
  </ul>

  {/* Section C: Third-Party Integrations & Logistics */}
  <h3>C. Third-Party Integrations & Logistics</h3>
  <ul>
    <li>
      <strong>Social Sign-On:</strong> If you link your account to a third-party provider (e.g., Google or social media), 
      we receive profile details authorized by that provider.
    </li>
    <li>
      <strong>Fulfillment Partners:</strong> Delivery partners may share status updates, package events, or delivery confirmations 
      regarding your transactions.
    </li>
  </ul>

  {/* Section D: Non-Member Information */}
  <h3>D. Non-Member Information</h3>
  <ul>
    <li>
      We may collect limited data about individuals who do not have an Aestheticommerce account but interact with our features 
      (e.g., recipients of a gift, newsletter subscribers, or those invited to the platform). 
      This typically includes email addresses, delivery addresses, or IP addresses.
    </li>
  </ul>
</section>


{/*------2*/}
<section>
  <h2>4. How Aestheticommerce Shares Your Information</h2>

  <p>
    We share your information only when it is essential to provide our Services, comply with the law, 
    or protect our community. Aestheticommerce does not sell your personal data.
  </p>

  {/* Section A: Public Visibility & Community */}
  <h3>A. Public Visibility & Community</h3>
  <p>Certain information is visible to the public to facilitate trust in our marketplace:</p>
  <ul>
    <li>
      <strong>Interactions:</strong> Product reviews, photos of purchased items you upload, 
      "Favourites," and public comments in community forums.
    </li>
    <li>
      <strong>Seller Data:</strong> Business names, shop locations, and activity indicators 
      (e.g., response times) are displayed to assist Buyers.
    </li>
  </ul>

  {/* Section B: Transactional Sharing */}
  <h3>B. Transactional Sharing (Buyers & Sellers)</h3>
  <p>To fulfill orders, we share limited information between the parties involved:</p>
  <ul>
    <li>
      <strong>For Buyers:</strong> Your name and delivery address are shared with the Seller to enable shipping.
    </li>
    <li>
      <strong>For Sellers:</strong> Your shop details and message history are shared with the Buyer to facilitate communication and support.
    </li>
  </ul>

  {/* Section C: Aestheticommerce Group & Service Providers */}
  <h3>C. Aestheticommerce Group & Service Providers</h3>
  <ul>
    <li>
      <strong>Group Companies:</strong> Information may be shared with our affiliates for internal administration, 
      security, and cross-platform optimization.
    </li>
    <li>
      <strong>Service Providers:</strong> We engage vendors for cloud hosting, payment processing, 
      identity verification (KYC), and logistics. These providers are contractually obligated to use your data only 
      for the tasks we assign them.
    </li>
  </ul>

  {/* Section D: Legal, Safety, and Compliance */}
  <h3>D. Legal, Safety, and Compliance</h3>
  <p>We may disclose your information to authorities, regulators, or legal advisors when we believe in good faith that it is necessary to:</p>
  <ul>
    <li>Comply with Indian laws (e.g., tax regulations or court orders).</li>
    <li>Prevent fraud, security breaches, or technical issues.</li>
    <li>Protect the rights, property, or safety of Aestheticommerce, our users, or the public.</li>
  </ul>

  {/* Section E: Business Transfers */}
  <h3>E. Business Transfers</h3>
  <p>
    If Aestheticommerce undergoes a merger, acquisition, or sale of assets, your information may be transferred as part of that business transaction. 
    We will notify you via email or a prominent notice on our site before your information becomes subject to a different privacy policy.
  </p>

  {/* Section F: Advertising & Analytics */}
  <h3>F. Advertising & Analytics</h3>
  <p>
    We partner with marketing platforms to measure the effectiveness of our ads and provide personalized experiences. 
    You can manage your tracking preferences through your account settings or browser tools.
  </p>
</section>


{/*How we transfer info*/}
<section>
  <h2>5. How We Transfer Your Information</h2>

  <p>
    Aestheticommerce operates as a digital marketplace that relies on a robust technical infrastructure. 
    To provide you with a seamless experience, we may process, store, or access your information in India 
    as well as in other countries where our trusted service providers and group entities operate.
  </p>

  {/* Section A: Necessary Transfers for Platform Operations */}
  <h3>A. Necessary Transfers for Platform Operations</h3>
  <p>
    To deliver high-quality Services, we may transfer limited information to infrastructure partners 
    or affiliated entities outside of India. These transfers are strictly conducted to:
  </p>
  <ul>
    <li><strong>Maintain Performance:</strong> Ensure the Site and Apps remain fast and reliable.</li>
    <li><strong>Secure Transactions:</strong> Facilitate secure payment processing and fraud prevention.</li>
    <li><strong>Customer Support:</strong> Provide efficient assistance regardless of your location.</li>
    <li><strong>Operational Excellence:</strong> Manage internal business administration and technical support.</li>
  </ul>

  {/* Section B: Legal and Regulatory Compliance */}
  <h3>B. Legal and Regulatory Compliance</h3>
  <p>
    In specific instances, we may be required to share or transfer information to comply with lawful requests, 
    regulatory audits, or reporting obligations mandated by competent authorities. Such disclosures are made 
    strictly in accordance with applicable laws and are limited to the necessary scope of the request.
  </p>

  {/* Section C: Safeguards for Your Protection */}
  <h3>C. Safeguards for Your Protection</h3>
  <p>
    Even when data is processed across borders, Aestheticommerce remains committed to your privacy. 
    We ensure that all international transfers are protected by:
  </p>
  <ul>
    <li><strong>Strict Contracts:</strong> Ensuring our partners adhere to rigorous data protection and confidentiality standards.</li>
    <li><strong>Technical Security:</strong> Utilizing encryption and secure protocols to protect data during transit.</li>
    <li><strong>Authorized Use:</strong> Prohibiting third parties from using your information for any purpose other than the specific service they provide to us.</li>
  </ul>
</section>


{/*how we protect your info*/}
<section>
  <h2>6. How We Protect Your Information</h2>

  <p>
    At Aestheticommerce, the security of your personal data is a top priority. We implement a variety of 
    technical, administrative, and organizational safeguards to minimize the risk of unauthorized access, 
    loss, or misuse.
  </p>

  {/* Section A: Our Security Measures */}
  <h3>A. Our Security Measures</h3>
  <p>To keep your data safe, we employ industry-standard protections, including:</p>
  <ul>
    <li>
      <strong>Proactive Defense:</strong> We use technical measures like encryption and secure firewalls 
      to protect your information during storage and transmission.
    </li>
    <li>
      <strong>Automated Security:</strong> We utilize advanced, third-party fraud prevention tools to detect 
      and block spam, abuse, and unauthorized login attempts.
    </li>
    <li>
      <strong>Regular Audits:</strong> Our security protocols are reviewed and updated periodically to stay 
      ahead of evolving digital threats.
    </li>
  </ul>

  {/* Section B: Your Role in Security */}
  <h3>B. Your Role in Security</h3>
  <p>
    While we work hard to protect the platform, account security is a shared responsibility. We strongly encourage you to:
  </p>
  <ul>
    <li><strong>Use Strong Passwords:</strong> Create a unique password for your Aestheticommerce account.</li>
    <li><strong>Keep Credentials Private:</strong> Never share your login details or OTPs with anyone.</li>
    <li><strong>Enable 2FA:</strong> Use two-factor authentication (where available) through your account dashboard for an extra layer of protection.</li>
  </ul>

  {/* Section C: Limitations of Security */}
  <h3>C. Limitations of Security</h3>
  <p>
    Please note that while we take every reasonable precaution, no method of electronic storage or transmission over the internet is completely secure. 
    We encourage users to remain vigilant and notify us immediately if they suspect any unauthorized activity on their account.
  </p>
</section>


{/*how long information */}
<section>
  <h2>7. How Long We Store Your Information</h2>

  <p>
    Aestheticommerce retains your information only for as long as it is needed to serve you, 
    fulfill our legal obligations, or protect our platform. Retention periods are determined 
    based on the following criteria:
  </p>

  {/* Section A: Operational Necessity */}
  <h3>A. Operational Necessity</h3>
  <p>
    We keep your data for as long as your account is active or as long as necessary to provide 
    you with our Services. This includes:
  </p>
  <ul>
    <li>Maintaining your purchase history and shop records.</li>
    <li>Providing ongoing customer support.</li>
    <li>Ensuring the security and integrity of the marketplace.</li>
  </ul>

  {/* Section B: Legal and Regulatory Requirements */}
  <h3>B. Legal and Regulatory Requirements</h3>
  <p>
    In many cases, we are legally required to hold certain information for specific periods 
    (even after you close your account). This is necessary for:
  </p>
  <ul>
    <li>
      <strong>Tax and Accounting:</strong> Keeping records of sales and financial transactions 
      for audit purposes.
    </li>
    <li>
      <strong>Compliance:</strong> Fulfilling identity verification (KYC) and anti-fraud 
      requirements under Indian law.
    </li>
    <li>
      <strong>Dispute Resolution:</strong> Retaining evidence in case of legal claims or disputes.
    </li>
  </ul>

  {/* Section C: Consent-Based Data */}
  <h3>C. Consent-Based Data</h3>
  <p>
    If we process specific information based on your consent (such as for optional marketing 
    or surveys), we will only store that data until the purpose is fulfilled or until you 
    choose to withdraw your consent.
  </p>

  {/* Section D: Deletion and Anonymization */}
  <h3>D. Deletion and Anonymization</h3>
  <p>
    Once information is no longer required for any of the above purposes, we follow a strict 
    process to either:
  </p>
  <ul>
    <li>Permanently delete the data from our systems.</li>
    <li>
      Anonymize the data so it can no longer be linked to you, allowing us to use it for 
      high-level statistical analysis.
    </li>
  </ul>
</section>





      <section>
  <h2>8. Your Rights and Choices</h2>

  <p>
    We believe you should have full control over your personal data. In alignment with Indian 
    data protection principles and global privacy standards, Aestheticommerce provides you with 
    the following rights to manage your information.
  </p>

  {/* Section A: Access and Portability */}
  <h3>A. Access and Portability</h3>
  <p>You have the right to know what information we hold about you. You can:</p>
  <ul>
    <li>
      <strong>Review & Manage:</strong> View most of your data directly through your account settings.
    </li>
    <li>
      <strong>Request a Copy:</strong> Receive a structured, machine-readable report of the 
      personal information you have provided to us.
    </li>
  </ul>

  {/* Section B: Correction and Accuracy */}
  <h3>B. Correction and Accuracy</h3>
  <p>
    If any of your information is incorrect or incomplete, you have the right to request a 
    correction. Most details, such as your address or contact info, can be updated instantly via 
    your account dashboard.
  </p>

  {/* Section C: Deletion and Account Closure */}
  <h3>C. Deletion and Account Closure</h3>
  <p>You may request the deletion of your personal information at any time.</p>
  <ul>
    <li>
      <strong>Account Closure:</strong> You can choose to permanently close your account.
    </li>
    <li>
      <strong>Retention Exceptions:</strong> Please note that we may be legally required to retain 
      certain data (like tax records or transaction history) even after a deletion request to 
      comply with law or ensure platform security.
    </li>
  </ul>

  {/* Section D: Withdrawal of Consent */}
  <h3>D. Withdrawal of Consent</h3>
  <p>
    Where we rely on your consent to process data (such as for marketing or device permissions), 
    you can withdraw that consent at any time:
  </p>
  <ul>
    <li>
      <strong>Unsubscribe:</strong> Use the link at the bottom of our emails to opt-out of marketing.
    </li>
    <li>
      <strong>Device Settings:</strong> Manage location or notification permissions through your 
      mobile device settings.
    </li>
  </ul>
  <p>
    <em>Note:</em> Withdrawing consent does not affect the legality of any data processing we performed before the withdrawal.
  </p>

  {/* Section E: Automated Decision-Making */}
  <h3>E. Automated Decision-Making</h3>
  <p>
    To protect you from fraud, we use automated systems to monitor transactions. If an automated 
    decision significantly affects you, you have the right to request a human review of the 
    situation to ensure fairness.
  </p>

  {/* Section F: Communication Preferences */}
  <h3>F. Communication Preferences</h3>
  <p>
    While you can opt-out of marketing, Aestheticommerce will still send you "Service Communications." 
    These are essential messages regarding your orders, security alerts, or updates to our Terms of Service.
  </p>
</section>

  
<section>
  <h2>9. User Responsibilities (Sellers & Developers)</h2>
  <p>
    If you are a Seller on Aestheticommerce or utilize our developer tools, you may come into 
    possession of personal information belonging to Buyers. In such cases:
  </p>
  <ul>
    <li>
      <strong>Independent Obligations:</strong> You have independent legal responsibilities to protect that data.
    </li>
    <li>
      <strong>Compliance:</strong> You must use such information solely for fulfilling orders and comply with all applicable privacy laws regarding its security and confidentiality.
    </li>
    <li>
      <strong>Agreement:</strong> Detailed requirements for data handling are outlined in our Seller Policy and API Terms.
    </li>
  </ul>
</section>

<section>
  <h2>10. Changes to This Policy</h2>
  <p>
    We may update this Privacy Policy from time to time to reflect changes in our technology, services, or legal environment.
  </p>
  <ul>
    <li>
      <strong>Notification:</strong> If we make material changes, we will notify you through an in-app message, an email, or by updating the "Last Updated" date at the top of this policy.
    </li>
    <li>
      <strong>Review:</strong> We encourage you to visit this page periodically to stay informed about our data practices.
    </li>
  </ul>
</section>

<section>
  <h2>11. Regional Disclosures</h2>
  <p>
    Depending on your residency, you may be entitled to additional rights or specific disclosures under local regulations. 
    Aestheticommerce will provide supplemental notices where required to address these regional legal frameworks.
  </p>
</section>

<section>
  <h2>12. Our Relationship With You</h2>
  <p>
    Aestheticommerce operates through its Indian entity and affiliated group companies. The specific entity responsible 
    for your data (the "Data Controller") depends on the Services you use and your geographical location. 
    We are committed to transparency regarding our corporate structure and will provide further details upon request.
  </p>
</section>
<section>
  <h2>13. Contact Us</h2>

  <p>
    If you have any questions, concerns, or requests regarding this Privacy Policy or our data
    practices, please contact us at:
  </p>

  <ul>
    <li>Email: <a href="mailto:support@aestheticommerce.com">support@aestheticommerce.com</a></li>
    <li>Address: [Add Company Address]</li>
  </ul>

  <p>
    By using Aestheticommerce, you acknowledge that you have read and understood this Privacy Policy.
  </p>
</section>

      <p className="last-updated">Last Updated: February 2026</p>
    </div>
  );
};

export default PrivacyPolicyComponent;




 