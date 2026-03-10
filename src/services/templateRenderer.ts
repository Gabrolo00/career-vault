/**
 * templateRenderer.ts
 *
 * Takes an N8nGenerationResult (pure JSON) and a templateId, returns
 * the final HTML string ready to be fed to expo-print.
 *
 * Handles the Handlebars-like syntax used by the templates:
 *   {{variable}}
 *   {{#if variable}}...{{/if}}
 *   {{#if variable}}...{{else}}...{{/if}}
 */

import { TemplateId } from '../../app/(tabs)/generate';
import { N8nGenerationResult, N8nExperienceItem, N8nLanguageItem, N8nProjectItem } from '../types/generation';
import { getTemplateHtml } from './templateClientService';

// ─── Public API ───────────────────────────────────────────────────────────────

export function renderCvHtml(
  data: N8nGenerationResult,
  templateId: TemplateId
): string {
  const template = getTemplateHtml(templateId);

  const vars: Record<string, string> = {
    full_name: data.contact.full_name ?? '',
    first_name: data.contact.first_name ?? '',
    last_name: data.contact.last_name ?? '',
    initials: data.contact.initials ?? '',
    headline: data.contact.headline ?? '',
    city: data.contact.city ?? '',
    phone: data.contact.phone ?? '',
    email: data.contact.email ?? '',
    linkedin_url: data.contact.linkedin_url ?? '',
    portfolio_url: data.contact.portfolio_url ?? '',
    avatar_url: data.contact.avatar_url ?? '',
    profile_summary: data.profile_summary ?? '',
    profile_summary_html: buildSummaryHtml(data.profile_summary ?? ''),
    experiences_html: buildEntriesHtml(data.experiences ?? [], templateId),
    projects_html: buildEntriesHtml((data.projects ?? []) as N8nExperienceItem[], templateId),
    education_html: buildEntriesHtml(data.education ?? [], templateId),
    certifications_html: buildEntriesHtml(data.certifications ?? [], templateId),
    skills_list: buildSkillsInline(data.skills ?? [], templateId),
    skills_section_html: buildSkillsSection(data.skills ?? [], templateId),
    languages_html: buildLanguagesHtml(data.languages ?? []),
  };

  let html = processIfElse(template, vars);
  html = processIf(html, vars);
  html = replaceVars(html, vars);

  return html;
}

// ─── Template processing ──────────────────────────────────────────────────────

/** Handles {{#if key}}...{{else}}...{{/if}} */
function processIfElse(html: string, vars: Record<string, string>): string {
  return html.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, key, ifContent, elseContent) => (vars[key] ? ifContent : elseContent)
  );
}

/** Handles {{#if key}}...{{/if}} (no else branch) */
function processIf(html: string, vars: Record<string, string>): string {
  return html.replace(
    /\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, key, content) => (vars[key] ? content : '')
  );
}

/** Replaces all {{variable}} placeholders */
function replaceVars(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

// ─── HTML block builders ──────────────────────────────────────────────────────

function buildEntriesHtml(items: N8nExperienceItem[], templateId: TemplateId): string {
  if (!items.length) return '';
  return items.map((item) => buildEntryHtml(item, templateId)).join('\n');
}

function buildEntryHtml(item: N8nExperienceItem, templateId: TemplateId): string {
  const title = esc(item.title);
  const org = esc(item.organization);
  const period = esc(item.period);
  const desc = esc(item.description);

  if (templateId === 'modern') {
    const tags = (item.tags ?? [])
      .map((t) => `<span class="entry-tag">${esc(t)}</span>`)
      .join('');
    return `<div class="entry">
  <div class="entry-left">
    <div class="entry-bullet"></div>
    <div class="entry-line"></div>
  </div>
  <div class="entry-right">
    <div class="entry-meta">${period}${org ? ` · ${org}` : ''}</div>
    <div class="entry-title">${title}</div>
    <div class="entry-desc">${desc}</div>
    ${tags ? `<div class="entry-tags">${tags}</div>` : ''}
  </div>
</div>`;
  }

  if (templateId === 'minimal') {
    return `<div class="entry">
  <div class="entry-header">
    <span class="entry-title">${title}</span>
    <span class="entry-date">${period}</span>
  </div>
  ${org ? `<div class="entry-org">${org}</div>` : ''}
  <div class="entry-desc">${desc}</div>
</div>`;
  }

  if (templateId === 'creative') {
    const tags = (item.tags ?? [])
      .map((t) => `<span class="entry-card-tag">${esc(t)}</span>`)
      .join('');
    return `<div class="entry-card">
  <div class="entry-card-top">
    <span class="entry-card-title">${title}</span>
    <span class="entry-card-date">${period}</span>
  </div>
  ${org ? `<div class="entry-card-org">${org}</div>` : ''}
  <div class="entry-card-desc">${desc}</div>
  ${tags ? `<div class="entry-card-tags">${tags}</div>` : ''}
</div>`;
  }

  return '';
}

/** Inline skill pills — used in sidebar of modern/creative templates */
function buildSkillsInline(skills: string[], templateId: TemplateId): string {
  if (!skills.length) return '';
  return skills.map((s) => {
    if (templateId === 'modern') return `<span class="skill-tag">${esc(s)}</span>`;
    if (templateId === 'creative') return `<span class="skill-pill">${esc(s)}</span>`;
    return `<span>${esc(s)}</span>`;
  }).join(' ');
}

/** Skills section — used in side column of minimal template */
function buildSkillsSection(skills: string[], templateId: TemplateId): string {
  if (!skills.length) return '';
  if (templateId === 'minimal') {
    return skills.map((s) => `<div class="skill-line">${esc(s)}</div>`).join('\n');
  }
  return buildSkillsInline(skills, templateId);
}

/** Language section — compact 2-column grid, one row per pair of languages */
function buildLanguagesHtml(languages: N8nLanguageItem[]): string {
  if (!languages.length) return '';

  const cells = languages.map((lang) => {
    const isMadrelingua = lang.proficiency >= 100 || lang.level === 'Madrelingua';
    const pct = lang.proficiency;
    const name = esc(lang.name);
    const level = esc(lang.level);

    if (isMadrelingua) {
      return `<div class="lang-cell">
  <div class="lang-cell-header"><span class="lang-cell-name">${name}:</span> <span class="lang-cell-level">Madrelingua</span></div>
  <div class="lang-bar"><div class="lang-bar-fill" style="width:100%"></div></div>
  <div class="lang-cell-label">Avanzato</div>
</div>`;
    }

    return `<div class="lang-cell">
  <div class="lang-cell-header"><span class="lang-cell-name">${name}:</span> <span class="lang-cell-level">${level}</span></div>
  <div class="lang-bar"><div class="lang-bar-fill" style="width:${pct}%"></div></div>
  <div class="lang-cell-label">${pct >= 90 ? 'Avanzato' : pct >= 65 ? 'Intermedio' : 'Base'}</div>
</div>`;
  });

  // Pair into 2-column rows
  const rows: string[] = [];
  for (let i = 0; i < cells.length; i += 2) {
    const second = cells[i + 1] ? cells[i + 1] : '<div class="lang-cell"></div>';
    rows.push(`<div class="lang-row">${cells[i]}${second}</div>`);
  }
  return rows.join('\n');
}

/** Converts plain-text summary (with \n\n paragraph breaks) to HTML paragraphs */
function buildSummaryHtml(text: string): string {
  if (!text) return '';
  return text
    .split(/\n\n+/)
    .map((para) => `<p>${esc(para.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function esc(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
