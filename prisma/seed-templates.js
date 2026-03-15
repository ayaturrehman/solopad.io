/**
 * Seed built-in content templates.
 * Run: node prisma/seed-templates.js
 */

import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const PROPOSAL_TEMPLATES = [
  {
    name: "Brand Identity Package",
    description: "A comprehensive brand identity proposal covering strategy, logo, guidelines, and social kit.",
    category: "Design",
    content: {
      title: "Brand Identity Package",
      intro: "<p>Thank you for considering us for your brand identity project. This proposal outlines our approach, deliverables, and investment to build a visual identity that resonates with your audience and sets you apart from the competition.</p>",
      sections: [
        { heading: "Project Overview", body: "<p>We will create a comprehensive brand identity system that positions your business for growth and communicates your values clearly across every touchpoint.</p>" },
        { heading: "Deliverables", body: "<ul><li>Logo design (3 initial concepts, 2 revision rounds)</li><li>Brand guidelines document (colors, typography, usage rules)</li><li>Business card design</li><li>Social media profile kit</li><li>Letterhead & envelope design</li></ul>" },
        { heading: "Timeline", body: "<p>The project will be completed in <strong>4 weeks</strong> from kickoff, with two rounds of revisions included at each stage.</p>" },
        { heading: "Process", body: "<p>Week 1: Discovery & strategy. Week 2: Initial concepts. Week 3: Refinements. Week 4: Final files & handoff.</p>" },
      ],
      pricing: [
        { description: "Brand Strategy & Discovery", amount: 1200 },
        { description: "Logo Design (3 concepts, 2 revisions)", amount: 800 },
        { description: "Brand Guidelines Document", amount: 600 },
        { description: "Social Media Kit", amount: 400 },
      ],
      currency: "USD",
      validDays: 30,
    },
  },
  {
    name: "Website Redesign Proposal",
    description: "Full website redesign proposal with UX audit, design, and development phases.",
    category: "Development",
    content: {
      title: "Website Redesign Project",
      intro: "<p>Thank you for the opportunity to propose on your website redesign. This document outlines our recommended approach to modernize your web presence, improve user experience, and drive better business results.</p>",
      sections: [
        { heading: "Project Overview", body: "<p>We will redesign and rebuild your website with a focus on conversion, performance, and mobile experience. The new site will reflect your brand values and make it easy for visitors to take action.</p>" },
        { heading: "Scope of Work", body: "<ul><li>UX audit of current website</li><li>Wireframes for up to 8 key pages</li><li>Full visual design (desktop + mobile)</li><li>Development (Next.js / WordPress)</li><li>SEO foundations setup</li><li>Content migration</li></ul>" },
        { heading: "Timeline", body: "<p><strong>Phase 1 (Weeks 1-2):</strong> Discovery & UX audit<br/><strong>Phase 2 (Weeks 3-4):</strong> Wireframes & design<br/><strong>Phase 3 (Weeks 5-7):</strong> Development<br/><strong>Phase 4 (Week 8):</strong> Testing & launch</p>" },
        { heading: "What We Need From You", body: "<p>Access to current hosting/CMS, brand assets, existing content, and a dedicated point of contact for timely feedback at each milestone.</p>" },
      ],
      pricing: [
        { description: "Discovery & UX Audit", amount: 1500 },
        { description: "UX Wireframes (8 pages)", amount: 2000 },
        { description: "Visual Design", amount: 3000 },
        { description: "Development & Build", amount: 4500 },
        { description: "SEO Setup & Content Migration", amount: 1000 },
      ],
      currency: "USD",
      validDays: 30,
    },
  },
  {
    name: "Social Media Management",
    description: "Monthly social media management retainer proposal.",
    category: "Marketing",
    content: {
      title: "Social Media Management Proposal",
      intro: "<p>Growing a consistent, engaging social media presence takes time, strategy, and creative energy. This proposal outlines how we can take that off your plate and deliver measurable growth for your brand.</p>",
      sections: [
        { heading: "What's Included", body: "<ul><li>Content calendar planning (monthly)</li><li>16 posts per month across 2 platforms</li><li>Custom graphics and captions</li><li>Community management (Mon–Fri)</li><li>Monthly analytics report</li></ul>" },
        { heading: "Platforms", body: "<p>We recommend focusing on Instagram and LinkedIn based on your target audience. Additional platforms can be added.</p>" },
        { heading: "Process", body: "<p>Month 1: Strategy & brand voice setup. From Month 2 onwards: content creation, scheduling, engagement, and monthly reporting.</p>" },
      ],
      pricing: [
        { description: "Monthly retainer — Social Media Management", amount: 1800 },
        { description: "Setup & Strategy (one-time)", amount: 500 },
      ],
      currency: "USD",
      validDays: 14,
    },
  },
  {
    name: "Consulting Engagement",
    description: "Strategy consulting proposal for a defined-scope engagement.",
    category: "Consulting",
    content: {
      title: "Consulting Engagement Proposal",
      intro: "<p>This proposal outlines a focused consulting engagement to help you [define goal]. We will work together to diagnose challenges, develop a clear action plan, and provide ongoing support through execution.</p>",
      sections: [
        { heading: "Engagement Overview", body: "<p>This is a [X]-week consulting engagement structured around three phases: discovery, strategy, and recommendations.</p>" },
        { heading: "What We'll Cover", body: "<ul><li>Current-state assessment</li><li>Stakeholder interviews</li><li>Gap analysis and benchmarking</li><li>Strategic recommendations report</li><li>Implementation roadmap</li></ul>" },
        { heading: "Deliverables", body: "<p>At the end of the engagement you will receive: a written strategy report, implementation roadmap, and one 90-minute debrief session.</p>" },
        { heading: "Working Together", body: "<p>We will hold weekly 1-hour check-in calls. All materials shared will be kept strictly confidential.</p>" },
      ],
      pricing: [
        { description: "Discovery Phase (Week 1-2)", amount: 2000 },
        { description: "Strategy & Analysis (Week 3-4)", amount: 2500 },
        { description: "Final Report & Recommendations", amount: 1500 },
      ],
      currency: "USD",
      validDays: 21,
    },
  },
  {
    name: "Photography Package Proposal",
    description: "Commercial photography session proposal with licensing terms.",
    category: "Photography",
    content: {
      title: "Photography Session Proposal",
      intro: "<p>Thank you for reaching out. This proposal outlines the photography services, deliverables, and licensing for your upcoming project. I look forward to capturing images that elevate your brand.</p>",
      sections: [
        { heading: "Session Details", body: "<p>A [X]-hour shoot at [location/studio]. We will cover [describe subject: product, team, event, etc.]. A shot list will be agreed upon prior to the session.</p>" },
        { heading: "Deliverables", body: "<ul><li>[X] fully edited, high-resolution images</li><li>Web-optimized versions</li><li>Delivered via private download link within 7 business days</li></ul>" },
        { heading: "Licensing", body: "<p>License covers digital and print use for commercial purposes. No exclusivity unless agreed in writing. License is valid for 2 years from delivery date.</p>" },
        { heading: "What to Expect", body: "<p>A pre-shoot call will be held one week before to align on vision, mood board, and shot list. Post-processing includes color grading, retouching, and export in multiple formats.</p>" },
      ],
      pricing: [
        { description: "Photography session (half day)", amount: 900 },
        { description: "Editing & retouching (30 images)", amount: 450 },
        { description: "Commercial license (2 years)", amount: 350 },
      ],
      currency: "USD",
      validDays: 14,
    },
  },
  {
    name: "Content Writing Proposal",
    description: "SEO content writing proposal for blog or website copy.",
    category: "Writing",
    content: {
      title: "Content Writing Proposal",
      intro: "<p>Quality content is the foundation of organic growth. This proposal outlines our approach to creating compelling, SEO-optimized content that attracts your ideal audience and converts readers into customers.</p>",
      sections: [
        { heading: "Services", body: "<ul><li>Keyword research & content strategy</li><li>[X] long-form blog articles per month (1,200–2,000 words each)</li><li>On-page SEO optimization</li><li>Internal linking strategy</li><li>Monthly performance report</li></ul>" },
        { heading: "Process", body: "<p>Week 1: Keyword research & editorial calendar. Weeks 2-4: Writing, editing, and delivery of approved articles. All articles go through two rounds of review before delivery.</p>" },
        { heading: "Tone & Style", body: "<p>We will match your brand voice from day one. A brief onboarding call ensures we understand your audience, tone, and business goals before writing begins.</p>" },
      ],
      pricing: [
        { description: "Content strategy & keyword research", amount: 600 },
        { description: "Blog articles — 4 per month (1,500 words avg)", amount: 1200 },
        { description: "SEO optimization & internal linking", amount: 300 },
      ],
      currency: "USD",
      validDays: 21,
    },
  },
];

const CONTRACT_TEMPLATES = [
  {
    name: "Freelance Service Agreement",
    description: "A general-purpose service agreement covering scope, payment, IP, and termination.",
    category: "General",
    content: {
      title: "Freelance Service Agreement",
      clauses: [
        { heading: "Scope of Work", body: "The Service Provider agrees to deliver the services outlined in the accepted proposal or Statement of Work, as agreed in writing by both parties. Any additional work outside this scope requires a written change order signed by both parties before work begins." },
        { heading: "Payment Terms", body: "The Client agrees to pay the total fee as outlined in the proposal. Payment schedule: 50% deposit due before work begins; 50% due upon final delivery. Invoices are due within 14 days of issue. Late payments will incur a 5% monthly late fee on outstanding balances." },
        { heading: "Revisions & Changes", body: "This agreement includes the revision rounds specified in the proposal. Additional revisions beyond those included will be billed at the Service Provider's standard hourly rate. Major scope changes require a written change order." },
        { heading: "Intellectual Property", body: "Upon receipt of full payment, all intellectual property rights for the final deliverables transfer to the Client. The Service Provider retains all rights to preliminary work, unused concepts, and work-in-progress. The Service Provider retains the right to display the completed work in their portfolio." },
        { heading: "Confidentiality", body: "Both parties agree to keep confidential any proprietary or sensitive information shared during this engagement. This obligation survives the termination of this agreement." },
        { heading: "Termination", body: "Either party may terminate this agreement with 14 days written notice. The Client will pay for all work completed up to the termination date at a pro-rated rate. Any deposit is non-refundable after work has commenced." },
        { heading: "Limitation of Liability", body: "The Service Provider's liability for any claim arising from this agreement shall not exceed the total fees paid under this agreement. The Service Provider is not liable for any indirect, incidental, or consequential damages." },
        { heading: "Governing Law", body: "This agreement shall be governed by the laws of the jurisdiction in which the Service Provider is registered. Any disputes shall first be attempted to be resolved through good-faith negotiation." },
      ],
    },
  },
  {
    name: "Website Development Contract",
    description: "Detailed contract for website and web application development projects.",
    category: "Development",
    content: {
      title: "Website Development Contract",
      clauses: [
        { heading: "Project Scope", body: "The Developer agrees to design and develop the website as described in the attached proposal or scope document. The final deliverable is a fully functional website meeting the agreed specifications. Any features or pages not listed in the scope document are outside this agreement." },
        { heading: "Client Responsibilities", body: "The Client agrees to provide all required content (text, images, assets) within 5 business days of project kickoff. Delays in providing materials may extend the project timeline accordingly. The Client will designate a single point of contact for feedback and approvals." },
        { heading: "Payment Schedule", body: "Payment is structured as follows: 50% deposit before development begins; 25% upon delivery of design mockups; 25% upon final launch. All payments are due within 7 days of invoice. Work will pause on overdue accounts." },
        { heading: "Revisions", body: "Two rounds of revisions are included at the design stage and two rounds at the development stage. Additional revision rounds are billed at the Developer's hourly rate." },
        { heading: "Hosting & Launch", body: "Deployment to production hosting is included. The Client is responsible for ongoing hosting costs after launch unless a maintenance retainer is agreed." },
        { heading: "Intellectual Property", body: "Upon full payment, the Client owns the final website design and custom code. Open-source components remain under their respective licenses. The Developer retains rights to showcase the work in their portfolio." },
        { heading: "Warranties & Support", body: "The Developer warrants that the website will function as specified for 30 days post-launch. Post-warranty support is available via a separate maintenance agreement." },
        { heading: "Termination", body: "Either party may terminate this contract with 14 days written notice. The Client pays for all work completed to date. Domain access and all completed work will be transferred to the Client upon final payment." },
      ],
    },
  },
  {
    name: "Graphic Design Contract",
    description: "Design contract covering deliverables, revisions, IP, and print/digital licensing.",
    category: "Design",
    content: {
      title: "Graphic Design Contract",
      clauses: [
        { heading: "Services", body: "The Designer agrees to create the design deliverables specified in the project brief. Deliverables will be provided in agreed file formats (PDF, PNG, SVG, AI, etc.) and in agreed dimensions." },
        { heading: "Revisions", body: "This agreement includes the number of revision rounds specified in the proposal. A revision is defined as minor changes to an approved direction — not a new concept. New directions or concepts after approval are treated as new work and billed accordingly." },
        { heading: "Payment", body: "50% of the project fee is due before work begins. The remaining 50% is due upon delivery of final files. Final files will not be released until full payment is received." },
        { heading: "Usage & Licensing", body: "Upon full payment, the Client receives a license to use the final approved designs for the agreed purpose (print, digital, both). The Designer retains the right to display work in their portfolio. Usage beyond the agreed scope requires a separate licensing agreement." },
        { heading: "Intellectual Property", body: "Preliminary designs, unused concepts, and rejected directions remain the intellectual property of the Designer. Only the final approved deliverables transfer to the Client upon full payment." },
        { heading: "Print & Production", body: "The Designer is not responsible for colour variations between screen and print. Print-ready files will be prepared to industry standards. The Designer recommends requesting a physical proof before a full print run." },
        { heading: "Termination", body: "If the Client cancels after work has begun, the Client will pay for all work completed to date. Any deposit paid is non-refundable." },
      ],
    },
  },
  {
    name: "Monthly Retainer Agreement",
    description: "Ongoing monthly retainer contract for regular services.",
    category: "General",
    content: {
      title: "Monthly Retainer Agreement",
      clauses: [
        { heading: "Retainer Scope", body: "The Service Provider agrees to make available up to [X] hours of services per month as outlined in the attached scope. Unused hours do not roll over to the following month. Hours beyond the retainer will be billed at the standard hourly rate." },
        { heading: "Monthly Fee & Payment", body: "The monthly retainer fee is as agreed. Invoices are issued on the 1st of each month and due within 7 days. Services for the following month will not commence if any invoice is overdue by more than 5 days." },
        { heading: "Term & Renewal", body: "This agreement is for a minimum term of 3 months, after which it continues on a rolling monthly basis. Either party may cancel with 30 days written notice after the initial term." },
        { heading: "Communication", body: "The Client agrees to a monthly check-in call. Requests should be submitted in writing (email or project management tool) with at least 3 business days lead time for standard tasks." },
        { heading: "Intellectual Property", body: "All work product created under this retainer transfers to the Client upon monthly payment. The Service Provider retains the right to reference the engagement in their portfolio." },
        { heading: "Confidentiality", body: "The Service Provider agrees to keep all client materials, strategies, and data confidential during and after the engagement." },
      ],
    },
  },
  {
    name: "Non-Disclosure Agreement",
    description: "Mutual NDA for sharing confidential information between two parties.",
    category: "General",
    content: {
      title: "Non-Disclosure Agreement",
      clauses: [
        { heading: "Definition of Confidential Information", body: "\"Confidential Information\" means any technical, business, financial, or other information disclosed by either party that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure." },
        { heading: "Obligations", body: "Each party agrees to: (a) keep the other party's Confidential Information strictly confidential; (b) not disclose such information to any third party without prior written consent; (c) use the Confidential Information only for the purpose of evaluating or conducting the proposed business relationship between the parties." },
        { heading: "Exclusions", body: "Confidentiality obligations do not apply to information that: (a) is or becomes publicly known through no breach of this agreement; (b) was known to the receiving party before disclosure; (c) is independently developed without use of the Confidential Information; (d) is required to be disclosed by law or court order." },
        { heading: "Term", body: "This agreement is effective from the date of signing and remains in effect for 2 years, unless extended in writing by both parties." },
        { heading: "Return of Information", body: "Upon request by either party, or upon termination of discussions, each party will promptly return or destroy all Confidential Information of the other party." },
        { heading: "Governing Law", body: "This agreement shall be governed by the laws of the jurisdiction in which the disclosing party is registered." },
      ],
    },
  },
  {
    name: "Photography License Agreement",
    description: "Contract for commercial photography use and licensing terms.",
    category: "Photography",
    content: {
      title: "Photography Services & License Agreement",
      clauses: [
        { heading: "Services", body: "The Photographer agrees to provide photography services as described in the accepted proposal, including the session, editing, and delivery of final images." },
        { heading: "Deliverables & Delivery", body: "Edited images will be delivered via secure download link within the timeframe specified in the proposal. Raw/unedited files are not included unless specifically agreed." },
        { heading: "License Grant", body: "Upon full payment, the Client receives a non-exclusive, non-transferable license to use the delivered images for the agreed purpose (print, digital, advertising, etc.) for the period specified in the proposal. Use beyond the agreed scope requires a written amendment." },
        { heading: "Portfolio Rights", body: "The Photographer retains the right to display images from this engagement in their portfolio, website, and social media unless the Client requests otherwise in writing." },
        { heading: "Copyright", body: "The Photographer retains copyright of all images at all times. The license granted does not transfer copyright ownership." },
        { heading: "Payment", body: "50% of the fee is due to confirm the booking. The remaining 50% is due on or before the shoot date. The shoot will not proceed if any payment is outstanding." },
        { heading: "Cancellation", body: "Cancellations made less than 72 hours before the session forfeit the deposit. Cancellations with more than 72 hours notice may receive a credit toward a rescheduled session at the Photographer's discretion." },
      ],
    },
  },
];

const INVOICE_TEMPLATES = [
  {
    name: "Milestone Invoice (50% Deposit)",
    description: "Invoice for a 50% upfront deposit before project work begins.",
    category: "General",
    content: {
      lineItems: [
        { description: "Project deposit — 50% of total project fee", amount: 0 },
      ],
      currency: "USD",
      taxRate: 0,
      discountType: "none",
      discountValue: 0,
      notes: "This invoice represents the 50% deposit required to begin work on your project. Work will commence upon receipt of payment. The remaining balance will be invoiced upon project completion.",
    },
  },
  {
    name: "Hourly Rate Invoice",
    description: "Time-based invoice for hourly work.",
    category: "General",
    content: {
      lineItems: [
        { description: "Professional services — [X] hours @ $[rate]/hr", amount: 0 },
        { description: "Expenses (if applicable)", amount: 0 },
      ],
      currency: "USD",
      taxRate: 0,
      discountType: "none",
      discountValue: 0,
      notes: "A timesheet is available upon request. Payment is due within 14 days of this invoice.",
    },
  },
  {
    name: "Fixed Project Invoice",
    description: "Final invoice for a completed fixed-price project.",
    category: "General",
    content: {
      lineItems: [
        { description: "Project: [Project Name] — as per agreed proposal", amount: 0 },
        { description: "Less: deposit previously paid", amount: 0 },
      ],
      currency: "USD",
      taxRate: 0,
      discountType: "none",
      discountValue: 0,
      notes: "This invoice is for the final balance due upon delivery of all agreed deliverables. Files and assets will be released upon receipt of payment.",
    },
  },
  {
    name: "Monthly Retainer Invoice",
    description: "Monthly recurring invoice for ongoing retainer services.",
    category: "General",
    content: {
      lineItems: [
        { description: "Monthly retainer — [Month Year]", amount: 0 },
        { description: "Additional hours beyond retainer ([X] hrs @ $[rate])", amount: 0 },
      ],
      currency: "USD",
      taxRate: 0,
      discountType: "none",
      discountValue: 0,
      notes: "Monthly retainer invoice for services provided. Payment is due within 7 days of this invoice to ensure uninterrupted service for the following month.",
    },
  },
];

async function main() {
  console.log("Seeding content templates...");

  // Remove existing system templates to avoid duplicates
  await db.contentTemplate.deleteMany({ where: { isSystem: true } });

  const proposalInserts = PROPOSAL_TEMPLATES.map((t) =>
    db.contentTemplate.create({ data: { ...t, type: "proposal", isSystem: true } })
  );
  const contractInserts = CONTRACT_TEMPLATES.map((t) =>
    db.contentTemplate.create({ data: { ...t, type: "contract", isSystem: true } })
  );
  const invoiceInserts = INVOICE_TEMPLATES.map((t) =>
    db.contentTemplate.create({ data: { ...t, type: "invoice", isSystem: true } })
  );

  await Promise.all([...proposalInserts, ...contractInserts, ...invoiceInserts]);

  console.log(`✓ Seeded ${PROPOSAL_TEMPLATES.length} proposal templates`);
  console.log(`✓ Seeded ${CONTRACT_TEMPLATES.length} contract templates`);
  console.log(`✓ Seeded ${INVOICE_TEMPLATES.length} invoice templates`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
