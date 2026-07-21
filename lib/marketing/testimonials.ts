export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  detail: string;
  featured?: boolean;
};

/** Placeholder testimonials — replace with real customer reviews when available. */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote:
      "We finally know what's in our home — and what's still under warranty.",
    name: "Sarah M.",
    detail: "Homeowner, Austin",
    featured: true,
  },
  {
    id: "2",
    quote:
      "Receipts live with the devices they protect. That alone changed how we handle repairs.",
    name: "David K.",
    detail: "Parent of three",
    featured: true,
  },
  {
    id: "3",
    quote:
      "Our family shares one vault now. No more texting router passwords.",
    name: "Priya R.",
    detail: "Family plan member",
    featured: true,
  },
  {
    id: "4",
    quote:
      "Calm, clear, and genuinely useful — not another complicated dashboard.",
    name: "Michael T.",
    detail: "Smart home enthusiast",
  },
  {
    id: "5",
    quote:
      "Moving was the test. Every device was documented before the boxes opened.",
    name: "Jen L.",
    detail: "Recent mover",
  },
  {
    id: "6",
    quote:
      "The demo sold me in ten minutes. I signed up the same day.",
    name: "Chris W.",
    detail: "Free plan user",
  },
];
