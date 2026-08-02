export type CustomerStory = {
  enabled: boolean;
  firstName: string;
  location: string;
  headline: string;
  before: string;
  after: string;
  result: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
};

/**
 * Enable only after receiving the customer's written permission.
 */
export const CUSTOMER_STORY: CustomerStory = {
  enabled: false,
  firstName: "",
  location: "",
  headline: "",
  before: "",
  after: "",
  result: "",
};
