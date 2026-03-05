import { TemplateId } from '../../app/(tabs)/generate';
import { readFileSync } from 'fs';
import * as path from 'path';

/**
 * templateService.ts
 *
 * Loads the raw HTML string for a given CV template ID.
 *
 * Templates are stored as separate HTML files in the /templates/ folder
 * at the project root, making them easy to read, edit and version-control.
 *
 * At runtime (inside n8n or a Node-based PDF renderer) you can call
 * getTemplateHtml(templateId) to get the full HTML string, then do
 * variable substitution on the {{placeholders}} before rendering to PDF.
 *
 * NOTE: Because React Native / Expo cannot use `fs` at runtime on the device,
 * this service is designed to be called ONLY on the server side (n8n workflow
 * or a Node function). The app sends the templateId in the webhook payload;
 * n8n picks it up from its own local copy of the templates folder.
 *
 * Template variables used by n8n for substitution:
 *   {{full_name}}         – e.g. "Mario Rossi"
 *   {{first_name}}        – first word of full_name (used in minimal template)
 *   {{last_name}}         – rest of full_name
 *   {{initials}}          – e.g. "MR"
 *   {{headline}}          – job title / headline from profile
 *   {{city}}              – city from profile
 *   {{phone}}             – phone from profile
 *   {{linkedin_url}}      – LinkedIn URL
 *   {{portfolio_url}}     – portfolio/website URL
 *   {{avatar_url}}        – avatar image URL
 *   {{profile_summary}}   – AI-generated professional summary paragraph
 *   {{experiences_html}}  – HTML block of work experience entries (from RAG)
 *   {{education_html}}    – HTML block of education entries
 *   {{certifications_html}} – HTML block of certification entries
 *   {{skills_list}}       – HTML snippet of skill pills/tags
 *   {{skills_section_html}} – HTML block for skills sidebar section
 *   {{languages_html}}    – HTML block for language skill entries
 */

const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

const TEMPLATE_FILE_MAP: Record<TemplateId, string> = {
    modern: path.join(TEMPLATES_DIR, 'modern.html'),
    minimal: path.join(TEMPLATES_DIR, 'minimal.html'),
    creative: path.join(TEMPLATES_DIR, 'creative.html'),
};

/**
 * Returns the raw HTML template string for the given templateId.
 * Throws if the templateId is unknown or the file cannot be read.
 *
 * @param templateId  One of 'modern' | 'minimal' | 'creative'
 */
export function getTemplateHtml(templateId: TemplateId): string {
    const filePath = TEMPLATE_FILE_MAP[templateId];
    if (!filePath) {
        throw new Error(`Unknown template ID: "${templateId}". Valid IDs: ${Object.keys(TEMPLATE_FILE_MAP).join(', ')}`);
    }
    try {
        return readFileSync(filePath, 'utf-8');
    } catch (err: any) {
        throw new Error(`Failed to load template "${templateId}" from ${filePath}: ${err.message}`);
    }
}

/**
 * Returns all available template IDs.
 */
export function getAvailableTemplateIds(): TemplateId[] {
    return Object.keys(TEMPLATE_FILE_MAP) as TemplateId[];
}
