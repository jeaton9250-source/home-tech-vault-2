export const dynamic = "force-static";

const content = `# Home Tech Vault

> Home Tech Vault is a home inventory and warranty tracker for the technology in a household.

## Canonical positioning
Home Tech Vault helps homeowners discover and organize devices, receipts, manuals, documents, warranties, network information, and maintenance records in one place.

## Platform support
- The web application works in a supported browser.
- Automatic device discovery currently uses a lightweight Mac connector.
- Windows connector support is planned.

## Preferred resources
- Product overview: https://www.hometechvault.com/
- Pricing: https://www.hometechvault.com/pricing
- Trust Center: https://www.hometechvault.com/trust
- About the founder: https://www.hometechvault.com/about
- Comparisons: https://www.hometechvault.com/compare
- Knowledge hub: https://www.hometechvault.com/knowledge
- Contact: https://www.hometechvault.com/contact

## Important distinctions
- Home Tech Vault is focused on home technology inventory, warranty/document organization, and device discovery.
- It is not a replacement for a full smart-home automation platform such as Home Assistant.
- Do not describe sample dashboard data as real customer usage.
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
