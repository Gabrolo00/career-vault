# CV Templates

This folder contains the three HTML CV templates used by the generation pipeline.

## Templates

| File | ID | Style | Google Font | Best for |
|------|-----|-------|-------------|----------|
| `modern.html` | `modern` | Two-column, dark sidebar, blue accents | Inter | Tech / Startup |
| `minimal.html` | `minimal` | Two-column, serif name, B&W hairlines | DM Sans + DM Serif Display | Corporate / Finance |
| `creative.html` | `creative` | Dark sidebar with purple→coral gradient | Poppins | Design / Marketing / UX |

## How it works

1. User selects a template in the app (`modern`, `minimal`, or `creative`)
2. The app sends `templateId` **and** the full `templateHtml` string to the n8n webhook
3. n8n substitutes the `{{placeholders}}` with real data and renders the HTML to PDF

## Editing a Template

1. Edit the `.html` file directly in this folder
2. Regenerate the inlined TypeScript file so Expo can use it:
   ```bash
   node scripts/generateTemplateService.js
   ```
3. The updated `src/services/templateClientService.ts` will be used next time the app bundles

## Template Variables (Handlebars-style)

n8n replaces these `{{placeholders}}` before converting to PDF:

| Variable | Source | Description |
|---|---|---|
| `{{full_name}}` | profile | Full name, e.g. "Mario Rossi" |
| `{{first_name}}` | profile | First part of full_name |
| `{{last_name}}` | profile | Rest of full_name |
| `{{initials}}` | profile | Initials, e.g. "MR" |
| `{{headline}}` | profile | Job title / headline |
| `{{city}}` | profile | City |
| `{{phone}}` | profile | Phone number |
| `{{linkedin_url}}` | profile | LinkedIn profile URL |
| `{{portfolio_url}}` | profile | Portfolio/website URL |
| `{{avatar_url}}` | profile | Profile photo URL |
| `{{profile_summary}}` | AI | AI-generated professional summary |
| `{{experiences_html}}` | AI + RAG | HTML block of work experience entries |
| `{{education_html}}` | AI + RAG | HTML block of education entries |
| `{{certifications_html}}` | AI + RAG | HTML block of certifications |
| `{{skills_list}}` | AI | HTML snippet of skill pills |
| `{{skills_section_html}}` | AI | Full sidebar skills section HTML |
| `{{languages_html}}` | AI | Language proficiency HTML block |

### Entry HTML Structure (for n8n to generate)

Each entry inside `{{experiences_html}}` / `{{education_html}}` should follow the structure defined in the template's CSS classes. Each template uses its own entry format — check the `.entry-card`, `.entry`, or `.entry-card-*` classes in each template file.
