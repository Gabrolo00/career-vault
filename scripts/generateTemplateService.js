const fs = require('fs');
const path = require('path');

const root = 'path.join(__dirname, '..')';

function readTemplate(name) {
    return fs.readFileSync(path.join(root, 'templates', name + '.html'), 'utf-8');
}

// Escape only backticks and ${} so we can embed in a JS template literal
function esc(s) {
    return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

const modern = esc(readTemplate('modern'));
const minimal = esc(readTemplate('minimal'));
const creative = esc(readTemplate('creative'));

const output = `import { TemplateId } from '../../app/(tabs)/generate';

/**
 * templateClientService.ts  (AUTO-GENERATED — do not edit manually)
 *
 * Client-side version of the template service for Expo / React Native.
 * HTML is inlined as TypeScript string constants — no filesystem access needed.
 *
 * To regenerate after editing templates/*.html:
 *   node /tmp/gen_template_service.js
 */

// prettier-ignore
const MODERN_HTML = \`${modern}\`;

// prettier-ignore
const MINIMAL_HTML = \`${minimal}\`;

// prettier-ignore
const CREATIVE_HTML = \`${creative}\`;

const TEMPLATE_MAP: Record<TemplateId, string> = {
    modern: MODERN_HTML,
    minimal: MINIMAL_HTML,
    creative: CREATIVE_HTML,
};

/**
 * Returns the full HTML string for the given templateId.
 * Safe inside Expo/React Native — no fs access.
 */
export function getTemplateHtml(templateId: TemplateId): string {
    const html = TEMPLATE_MAP[templateId];
    if (!html) {
        throw new Error(
            \`Unknown template ID: "\${templateId}". Valid IDs: \${Object.keys(TEMPLATE_MAP).join(', ')}\`
        );
    }
    return html;
}

export function getAvailableTemplateIds(): TemplateId[] {
    return Object.keys(TEMPLATE_MAP) as TemplateId[];
}
`;

const outPath = path.join(root, 'src/services/templateClientService.ts');
fs.writeFileSync(outPath, output, 'utf-8');
console.log('Written:', outPath, '— size:', output.length, 'bytes');
