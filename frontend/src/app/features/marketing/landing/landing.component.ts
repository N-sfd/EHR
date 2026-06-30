import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface PricingTier {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  org: string;
}

interface FaqItem {
  q: string;
  a: string;
  open: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  readonly currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  readonly features: Feature[] = [
    { icon: 'fa-calendar-check', title: 'Intelligent Scheduling', desc: 'Drag-and-drop schedule grid with real-time conflict detection across every provider and location.' },
    { icon: 'fa-wand-magic-sparkles', title: 'AI-Assisted Workflows', desc: 'An embedded assistant that summarizes patient context, drafts notes, and answers scheduling questions — your choice of cloud or fully private on-prem model.' },
    { icon: 'fa-share-nodes', title: 'FHIR-Native Interoperability', desc: 'SMART on FHIR login and FHIR-based APIs built to connect with the clinical and billing systems you already run.' },
    { icon: 'fa-chart-line', title: 'Operational Analytics', desc: 'Provider utilization, scheduling throughput, and registration-completeness reporting your administrators can act on.' },
    { icon: 'fa-shield-halved', title: 'Role-Based Access Control', desc: 'Granular, auditable permissions across Admin, Provider, and Patient roles — built in, not bolted on.' },
    { icon: 'fa-hospital-user', title: 'Patient Engagement Portal', desc: 'A dedicated patient experience for appointments, secure messaging, and self-service — accessible wherever care happens.' },
  ];

  readonly pricing: PricingTier[] = [
    {
      name: 'Starter',
      price: '$199',
      period: '/provider / month',
      desc: 'For independent clinics and small practices getting started with a modern EHR.',
      features: ['Up to 5 providers', 'Scheduling & patient management', 'Standard reporting', 'Email support'],
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      price: '$349',
      period: '/provider / month',
      desc: 'For growing multi-location practices that need deeper clinical and operational tooling.',
      features: ['Unlimited providers', 'AI assistant included', 'Advanced analytics & reporting', 'FHIR API access', 'Priority support'],
      highlighted: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'volume pricing',
      desc: 'For health systems and hospital networks with complex compliance and integration needs.',
      features: ['Multi-organization administration', 'Dedicated security review', 'Custom integrations', 'SLA-backed support', 'Onboarding & migration services'],
      cta: 'Book Demo'
    }
  ];

  readonly testimonials: Testimonial[] = [
    { quote: 'CareOS cut our scheduling overhead dramatically. The AI assistant alone gives our front-desk staff back hours every week.', name: 'Sample Testimonial', role: 'Practice Administrator', org: 'Multi-Specialty Clinic' },
    { quote: 'The interoperability story is real — connecting our existing lab and billing systems was straightforward, not a six-month project.', name: 'Sample Testimonial', role: 'IT Director', org: 'Regional Health Network' },
    { quote: 'Clinicians actually like using it. That alone says a lot about how this was designed.', name: 'Sample Testimonial', role: 'Medical Director', org: 'Community Health System' },
  ];

  faqs: FaqItem[] = [
    { q: 'Is CareOS HIPAA compliant?', a: 'CareOS is designed and built around HIPAA-ready principles — role-based access control, audit trails, and PHI-aware logging are built into the platform from day one. Full compliance also depends on your organization’s deployment, hosting, and business-associate agreements; we work with you through that process rather than claiming blanket certification.', open: true },
    { q: 'Can CareOS integrate with our existing systems?', a: 'Yes. CareOS is built on FHIR-based APIs with SMART on FHIR support, designed for interoperability with third-party clinical, billing, and analytics systems.', open: false },
    { q: 'Do you offer a free trial?', a: 'Yes — every plan starts with a free trial so your team can evaluate scheduling, patient management, and the AI assistant before committing.', open: false },
    { q: 'Can we choose where our AI runs?', a: 'Yes. CareOS supports both cloud-hosted and fully private, on-premises AI models, so organizations with strict data residency requirements can keep AI processing in-house.', open: false },
    { q: 'How long does onboarding take?', a: 'Starter and Professional customers are typically live within days. Enterprise onboarding timelines depend on integration and migration scope and are scoped with our team directly.', open: false },
  ];

  toggleFaq(item: FaqItem): void {
    item.open = !item.open;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
