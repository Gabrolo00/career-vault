// ════════════════════════════════════════════════════════════════════════
// n8n Code Node — "Fill Template"
// Prende il JSON restituito dall'AI e riempie i {{placeholder}} nel templateHtml
//
// Input atteso da "Build AI Prompt" node:
//   $json.cvData      → oggetto JSON con tutto il contenuto del CV
//   $json.templateHtml → stringa HTML con i {{placeholder}}
//   $json.profile     → ProfileSnapshot dall'app
//   $json.userId, $json.documentId, $json.supabaseUrl, $json.supabaseKey
// ════════════════════════════════════════════════════════════════════════

const cfg = $('Config').first().json;
const buildData = $('Build AI Prompt').first().json;
const aiRaw = $input.first().json.choices[0].message.content;

// ── 1. Parse the JSON returned by the AI ────────────────────────────────
let cvData;
try {
    // Strip markdown code fences if present
    const cleaned = aiRaw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    cvData = JSON.parse(cleaned);
} catch (e) {
    throw new Error('AI did not return valid JSON: ' + aiRaw.slice(0, 200));
}

// ── 2. Shortcut helpers ─────────────────────────────────────────────────
const profile = buildData.profile || {};
const fullName = (profile.fullName || cvData.full_name || 'Nome Cognome').trim();
const nameParts = fullName.split(' ');
const firstName = nameParts[0] || '';
const lastName = nameParts.slice(1).join(' ') || '';
const initials = nameParts.map(p => p[0]).join('').toUpperCase().slice(0, 2);

// ── 3. Build HTML blocks from cvData arrays ─────────────────────────────

// --- Experiences block ---
function buildExperiencesHtml(experiences, templateId) {
    if (!experiences || experiences.length === 0) return '';
    return experiences.map(e => {
        const dateRange = e.date_range || [e.start_date, e.is_current ? 'Presente' : e.end_date].filter(Boolean).join(' – ');
        const location = e.location ? ` · ${e.location}` : '';
        const desc = e.description ? `<div class="entry-desc">${e.description}</div>` : '';
        const tags = e.skills && e.skills.length
            ? `<div class="entry-tags">${e.skills.map(s => `<span class="entry-tag">${s}</span>`).join('')}</div>`
            : '';

        if (templateId === 'minimal') {
            return `
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">${e.title}</div>
          <div class="entry-date">${dateRange}</div>
        </div>
        <div class="entry-org">${e.organization || ''}${location}</div>
        ${desc}
      </div>`;
        }
        if (templateId === 'creative') {
            return `
      <div class="entry-card">
        <div class="entry-card-top">
          <div class="entry-card-title">${e.title}</div>
          <div class="entry-card-date">${dateRange}</div>
        </div>
        <div class="entry-card-org">${e.organization || ''}${location}</div>
        ${desc ? `<div class="entry-card-desc">${e.description}</div>` : ''}
        ${tags ? `<div class="entry-card-tags">${e.skills && e.skills.length ? e.skills.map(s => `<span class="entry-card-tag">${s}</span>`).join('') : ''}</div>` : ''}
      </div>`;
        }
        // modern (default)
        return `
    <div class="entry">
      <div class="entry-left">
        <div class="entry-bullet"></div>
        <div class="entry-line"></div>
      </div>
      <div class="entry-right">
        <div class="entry-meta">${dateRange}${location}</div>
        <div class="entry-title">${e.title}</div>
        <div class="entry-org">${e.organization || ''}</div>
        ${desc}
        ${tags}
      </div>
    </div>`;
    }).join('\n');
}

// --- Education block ---
function buildEducationHtml(education, templateId) {
    if (!education || education.length === 0) return '';
    return education.map(e => {
        const dateRange = e.date_range || [e.start_date, e.end_date].filter(Boolean).join(' – ');
        const desc = e.description ? `<div class="entry-desc">${e.description}</div>` : '';

        if (templateId === 'minimal') {
            return `
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">${e.title}</div>
          <div class="entry-date">${dateRange}</div>
        </div>
        <div class="entry-org">${e.organization || ''}</div>
        ${desc}
      </div>`;
        }
        if (templateId === 'creative') {
            return `
      <div class="entry-card">
        <div class="entry-card-top">
          <div class="entry-card-title">${e.title}</div>
          <div class="entry-card-date">${dateRange}</div>
        </div>
        <div class="entry-card-org">${e.organization || ''}</div>
        ${desc ? `<div class="entry-card-desc">${e.description}</div>` : ''}
      </div>`;
        }
        return `
    <div class="entry">
      <div class="entry-left">
        <div class="entry-bullet"></div>
        <div class="entry-line"></div>
      </div>
      <div class="entry-right">
        <div class="entry-meta">${dateRange}</div>
        <div class="entry-title">${e.title}</div>
        <div class="entry-org">${e.organization || ''}</div>
        ${desc}
      </div>
    </div>`;
    }).join('\n');
}

// --- Certifications block ---
function buildCertificationsHtml(certs, templateId) {
    if (!certs || certs.length === 0) return '';
    return buildEducationHtml(certs, templateId); // same structure
}

// --- Skills list (sidebar pills) ---
function buildSkillsList(skills, templateId) {
    if (!skills || skills.length === 0) return '';
    if (templateId === 'modern') {
        return skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
    }
    if (templateId === 'creative') {
        return skills.map(s => `<span class="skill-pill">${s}</span>`).join('');
    }
    // minimal
    return skills.map(s => `<div class="skill-line">${s}</div>`).join('');
}

// --- Skills section (for minimal sidebar) ---
function buildSkillsSectionHtml(skills) {
    if (!skills || skills.length === 0) return '';
    return skills.map(s => `<div class="skill-line">${s}</div>`).join('');
}

// --- Languages ---
function buildLanguagesHtml(languages, templateId) {
    if (!languages || languages.length === 0) return '';
    if (templateId === 'minimal') {
        return languages.map(l => `
    <div class="lang-item">
      <div class="lang-name-row">
        <span class="lang-name">${l.language}</span>
        <span class="lang-level">${l.level || ''}</span>
      </div>
      <div class="lang-bar"><div class="lang-bar-fill" style="width:${getLangPercent(l.level)}%"></div></div>
    </div>`).join('\n');
    }
    return languages.map(l => `<div class="side-item">
    <div class="side-item-label">${l.language}</div>
    <div class="side-item-sub">${l.level || ''}</div>
  </div>`).join('\n');
}

function getLangPercent(level) {
    const map = { A1: 15, A2: 28, B1: 45, B2: 62, C1: 80, C2: 95, Native: 100, Madrelingua: 100 };
    return map[level] || 50;
}

// ── 4. Generate all HTML blocks ─────────────────────────────────────────
const tid = buildData.templateId || 'modern';
const experiencesHtml = buildExperiencesHtml(cvData.experiences, tid);
const educationHtml = buildEducationHtml(cvData.education, tid);
const certificationsHtml = buildCertificationsHtml(cvData.certifications, tid);
const skillsList = buildSkillsList(cvData.skills, tid);
const skillsSectionHtml = buildSkillsSectionHtml(cvData.skills);
const languagesHtml = buildLanguagesHtml(cvData.languages, tid);

// ── 5. Fill the template ─────────────────────────────────────────────────
const replacements = {
    '{{full_name}}': fullName,
    '{{first_name}}': firstName,
    '{{last_name}}': lastName,
    '{{initials}}': initials,
    '{{headline}}': profile.headline || cvData.headline || '',
    '{{city}}': profile.city || cvData.city || '',
    '{{phone}}': profile.phone || cvData.phone || '',
    '{{linkedin_url}}': profile.linkedinUrl || cvData.linkedin_url || '',
    '{{portfolio_url}}': profile.portfolioUrl || cvData.portfolio_url || '',
    '{{avatar_url}}': profile.avatarUrl || cvData.avatar_url || '',
    '{{profile_summary}}': cvData.profile_summary || '',
    '{{experiences_html}}': experiencesHtml,
    '{{education_html}}': educationHtml,
    '{{certifications_html}}': certificationsHtml,
    '{{skills_list}}': skillsList,
    '{{skills_section_html}}': skillsSectionHtml,
    '{{languages_html}}': languagesHtml,
};

let filledHtml = buildData.templateHtml || '';
for (const [placeholder, value] of Object.entries(replacements)) {
    // Replace all occurrences
    filledHtml = filledHtml.split(placeholder).join(value || '');
}

// Remove unfilled {{#if ...}} / {{/if}} blocks and remaining {{...}} tokens
filledHtml = filledHtml
    .replace(/\{\{#if [^}]+\}\}[\s\S]*?\{\{\/if\}\}/g, '')
    .replace(/\{\{[^}]+\}\}/g, '');

// ── 6. Prepare output ───────────────────────────────────────────────────
const filename = `cv-${buildData.userId}-${Date.now()}.html`;

return [{
    json: {
        userId: buildData.userId,
        documentId: buildData.documentId,
        supabaseUrl: cfg.supabaseUrl,
        supabaseKey: cfg.supabaseKey,
        html: filledHtml,
        filename,
        cvData, // carry forward for debugging
    }
}];
