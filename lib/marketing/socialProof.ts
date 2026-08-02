export type MarketingTestimonial = {
  quote: string;
  firstName: string;
  roleOrCity: string;
  photoUrl?: string;
  outcome: string;
};

/**
 * Add only genuine, permissioned customer feedback here.
 * Do not publish invented testimonials or stock-photo identities.
 */
export const MARKETING_TESTIMONIALS: MarketingTestimonial[] = [];

/**
 * Set this only to a real, verifiable number.
 * The homepage will not display a quantity badge while this is null.
 */
export const VERIFIED_HOMEOWNER_COUNT: number | null = null;
