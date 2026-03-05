/**
 * Maps known company/organization names to their Clearbit logo domains.
 * Clearbit Logo API: https://logo.clearbit.com/{domain}
 * Matching is case-insensitive and checks if the key is contained in the org name.
 */
const COMPANY_DOMAIN_MAP: Record<string, string> = {
    // Tech
    'mulesoft': 'salesforce.com',   // Mulesoft è Salesforce
    'salesforce': 'salesforce.com',
    'google': 'google.com',
    'microsoft': 'microsoft.com',
    'amazon': 'amazon.com',
    'aws': 'aws.amazon.com',
    'apple': 'apple.com',
    'meta': 'meta.com',
    'facebook': 'meta.com',
    'netflix': 'netflix.com',
    'spotify': 'spotify.com',
    'airbnb': 'airbnb.com',
    'uber': 'uber.com',
    'stripe': 'stripe.com',
    'shopify': 'shopify.com',
    'atlassian': 'atlassian.com',
    'slack': 'slack.com',
    'notion': 'notion.so',
    'figma': 'figma.com',
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'oracle': 'oracle.com',
    'sap': 'sap.com',
    'ibm': 'ibm.com',
    'accenture': 'accenture.com',
    'deloitte': 'deloitte.com',
    'pwc': 'pwc.com',
    'kpmg': 'kpmg.com',
    'mckinsey': 'mckinsey.com',
    'capgemini': 'capgemini.com',
    'engineering': 'eng.it',
    'reply': 'reply.com',
    'tim': 'telecomitalia.com',
    'eni': 'eni.com',
    'enel': 'enel.com',
    'intesa': 'intesasanpaolo.com',
    'unicredit': 'unicredit.it',
    'ferrari': 'ferrari.com',
    'fca': 'fcagroup.com',
    'stellantis': 'stellantis.com',
    'leonardo': 'leonardocompany.com',
    'fineco': 'finecobank.com',
    'sky': 'sky.com',
    'mediaset': 'mediaset.it',
    'rai': 'rai.it',
    'mondadori': 'mondadori.it',
    'ubi': 'ubibanca.com',
    'generali': 'generali.com',
    'allianz': 'allianz.com',
    'adobe': 'adobe.com',
    'autodesk': 'autodesk.com',
    'vmware': 'vmware.com',
    'cisco': 'cisco.com',
    'hp': 'hp.com',
    'dell': 'dell.com',
    'intel': 'intel.com',
    'nvidia': 'nvidia.com',
    'amd': 'amd.com',
    'twitter': 'twitter.com',
    'linkedin': 'linkedin.com',
    'tiktok': 'tiktok.com',
    'bytedance': 'bytedance.com',
    'alibaba': 'alibaba.com',
    'huawei': 'huawei.com',
    'samsung': 'samsung.com',
};

/**
 * Returns a Clearbit logo URL for a given organization name, or null if not found.
 */
export function getCompanyLogoUrl(organizationName: string | null | undefined): string | null {
    if (!organizationName) return null;
    const normalized = organizationName.toLowerCase().trim();

    // Exact match first
    if (COMPANY_DOMAIN_MAP[normalized]) {
        return `https://logo.clearbit.com/${COMPANY_DOMAIN_MAP[normalized]}`;
    }

    // Partial match — check if any key is contained in the org name
    for (const [key, domain] of Object.entries(COMPANY_DOMAIN_MAP)) {
        if (normalized.includes(key)) {
            return `https://logo.clearbit.com/${domain}`;
        }
    }

    return null;
}
