import { TemplateId } from '../../app/(tabs)/generate';

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
const MODERN_HTML = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{full_name}} — CV</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    background: #fff;
    color: #1e293b;
    font-size: 10px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── SHELL ── */
  .cv {
    width: 794px;
    min-height: 1123px;
    display: flex;
    background: #ffffff;
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 240px;
    min-width: 240px;
    background: #0f172a;
    padding: 40px 22px 40px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Avatar */
  .avatar-ring {
    display: flex;
    justify-content: center;
  }
  .avatar-ring img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #2563eb;
    box-shadow: 0 0 0 4px rgba(37,99,235,0.25);
  }
  .avatar-initials {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -1px;
  }

  /* Name block */
  .name-block {
    text-align: center;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding-bottom: 20px;
  }
  .name-block h1 {
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
    letter-spacing: -0.5px;
  }
  .name-block .role {
    margin-top: 6px;
    font-size: 10px;
    font-weight: 500;
    color: #2563eb;
    letter-spacing: 1.2px;
    text-transform: uppercase;
  }

  /* Sidebar section */
  .sb-section { display: flex; flex-direction: column; gap: 10px; }
  .sb-heading {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #64748b;
    margin-bottom: 4px;
  }

  /* Contact items */
  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 9px;
  }
  .contact-icon {
    width: 16px;
    height: 16px;
    fill: #2563eb;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .contact-text {
    font-size: 10px;
    color: #94a3b8;
    line-height: 1.5;
    word-break: break-word;
  }
  .contact-text a {
    color: #60a5fa;
    text-decoration: none;
  }

  /* Skills */
  .skill-tag {
    display: inline-block;
    background: rgba(37,99,235,0.18);
    border: 1px solid rgba(37,99,235,0.35);
    color: #93c5fd;
    border-radius: 4px;
    padding: 3px 8px;
    font-size: 9.5px;
    font-weight: 600;
    margin: 2px 2px 0 0;
  }

  /* ── MAIN ── */
  .main {
    flex: 1;
    padding: 36px 30px 36px 28px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* Section header */
  .section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .section-header .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #2563eb;
    flex-shrink: 0;
  }
  .section-header h2 {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #1e293b;
  }
  .section-header .line {
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #e2e8f0, transparent);
  }

  /* Timeline entries */
  .timeline { display: flex; flex-direction: column; gap: 12px; }

  .entry {
    display: flex;
    gap: 14px;
  }
  .entry-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 3px;
  }
  .entry-bullet {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #2563eb;
    flex-shrink: 0;
  }
  .entry-line {
    width: 1px;
    flex: 1;
    background: #e2e8f0;
    margin-top: 4px;
  }
  .entry-right { flex: 1; }

  .entry-meta {
    font-size: 9px;
    font-weight: 600;
    color: #2563eb;
    letter-spacing: 0.3px;
    margin-bottom: 2px;
  }
  .entry-title {
    font-size: 11px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.3;
  }
  .entry-org {
    font-size: 10px;
    font-weight: 500;
    color: #475569;
    margin-top: 1px;
  }
  .entry-desc {
    font-size: 9px;
    color: #64748b;
    line-height: 1.55;
    margin-top: 4px;
  }
  .entry-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 7px;
  }
  .entry-tag {
    background: #f1f5f9;
    border-radius: 3px;
    padding: 2px 6px;
    font-size: 9px;
    font-weight: 600;
    color: #475569;
  }

  /* Profile summary */
  .summary-box {
    background: linear-gradient(135deg, #eff6ff, #f0f9ff);
    border-left: 3px solid #2563eb;
    border-radius: 0 8px 8px 0;
    padding: 12px 16px;
    font-size: 9.5px;
    color: #334155;
    line-height: 1.7;
  }
  .summary-box p { margin-bottom: 8px; }
  .summary-box p:last-child { margin-bottom: 0; }

  /* Language — compact 2-column grid */
  .lang-grid { display: flex; flex-direction: column; gap: 4px; }
  .lang-row { display: flex; gap: 8px; border: 1px solid #e2e8f0; border-radius: 5px; overflow: hidden; }
  .lang-cell { flex: 1; padding: 5px 8px; border-right: 1px solid #e2e8f0; }
  .lang-cell:last-child { border-right: none; }
  .lang-cell-header { display: flex; align-items: baseline; gap: 4px; margin-bottom: 3px; }
  .lang-cell-name { font-size: 9px; font-weight: 700; color: #1e293b; }
  .lang-cell-level { font-size: 8.5px; font-weight: 700; color: #2563eb; }
  .lang-bar { height: 3px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin-bottom: 2px; }
  .lang-bar-fill { height: 100%; background: #2563eb; border-radius: 2px; }
  .lang-cell-label { font-size: 7.5px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
</style>
</head>
<body>
<div class="cv">

  <!-- ════ SIDEBAR ════ -->
  <aside class="sidebar">

    <div class="avatar-ring">
      {{#if avatar_url}}
        <img src="{{avatar_url}}" alt="{{full_name}}" crossorigin="anonymous" />
      {{else}}
        <div class="avatar-initials">{{initials}}</div>
      {{/if}}
    </div>

    <div class="name-block">
      <h1>{{full_name}}</h1>
      <div class="role">{{headline}}</div>
    </div>

    <!-- Contact -->
    <div class="sb-section">
      <div class="sb-heading">Contatti</div>

      {{#if city}}
      <div class="contact-item">
        <svg class="contact-icon" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
        <span class="contact-text">{{city}}</span>
      </div>
      {{/if}}

      {{#if phone}}
      <div class="contact-item">
        <svg class="contact-icon" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2z"/></svg>
        <span class="contact-text">{{phone}}</span>
      </div>
      {{/if}}

      {{#if linkedin_url}}
      <div class="contact-item">
        <svg class="contact-icon" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
        <span class="contact-text"><a href="{{linkedin_url}}">{{linkedin_url}}</a></span>
      </div>
      {{/if}}

      {{#if portfolio_url}}
      <div class="contact-item">
        <svg class="contact-icon" viewBox="0 0 24 24"><path d="M16.36 14c.08-.34.14-.68.14-1.04 0-.36-.06-.7-.14-1.04l2.26-1.76a.54.54 0 0 0 .13-.67l-2.14-3.7a.54.54 0 0 0-.66-.23l-2.67 1.07a7.17 7.17 0 0 0-1.78-1.03l-.4-2.84A.54.54 0 0 0 10.5 3h-4.3a.54.54 0 0 0-.53.46l-.4 2.84a7.17 7.17 0 0 0-1.78 1.03L.82 6.27a.54.54 0 0 0-.66.23L-.98 10.2a.53.53 0 0 0 .13.67l2.26 1.76c-.08.34-.14.69-.14 1.04s.06.7.14 1.04L-.85 16.47a.54.54 0 0 0-.13.67l2.14 3.7c.13.23.4.31.66.23l2.67-1.07a7.17 7.17 0 0 0 1.78 1.03l.4 2.84c.07.3.33.51.63.51h4.3c.3 0 .55-.21.62-.51l.4-2.84a7.17 7.17 0 0 0 1.78-1.03l2.67 1.07c.26.1.53 0 .66-.23l2.14-3.7a.54.54 0 0 0-.13-.67L16.36 14zM8.35 15.5A3.5 3.5 0 1 1 8.35 8.5a3.5 3.5 0 0 1 0 7z"/></svg>
        <span class="contact-text"><a href="{{portfolio_url}}">Portfolio</a></span>
      </div>
      {{/if}}
    </div>

    <!-- Skills -->
    {{#if skills_list}}
    <div class="sb-section">
      <div class="sb-heading">Competenze</div>
      <div>{{skills_list}}</div>
    </div>
    {{/if}}


  </aside>

  <!-- ════ MAIN ════ -->
  <main class="main">

    <!-- Profile Summary -->
    {{#if profile_summary}}
    <section>
      <div class="section-header">
        <div class="dot"></div>
        <h2>Profilo</h2>
        <div class="line"></div>
      </div>
      <div class="summary-box">{{profile_summary_html}}</div>
    </section>
    {{/if}}

    <!-- Work Experience -->
    <section>
      <div class="section-header">
        <div class="dot"></div>
        <h2>Esperienze Lavorative</h2>
        <div class="line"></div>
      </div>
      <div class="timeline">
        {{experiences_html}}
      </div>
    </section>

    <!-- Projects -->
    {{#if projects_html}}
    <section>
      <div class="section-header">
        <div class="dot"></div>
        <h2>Progetti</h2>
        <div class="line"></div>
      </div>
      <div class="timeline">
        {{projects_html}}
      </div>
    </section>
    {{/if}}

    <!-- Education -->
    {{#if education_html}}
    <section>
      <div class="section-header">
        <div class="dot"></div>
        <h2>Formazione</h2>
        <div class="line"></div>
      </div>
      <div class="timeline">
        {{education_html}}
      </div>
    </section>
    {{/if}}

    <!-- Certifications -->
    {{#if certifications_html}}
    <section>
      <div class="section-header">
        <div class="dot"></div>
        <h2>Certificazioni</h2>
        <div class="line"></div>
      </div>
      <div class="timeline">
        {{certifications_html}}
      </div>
    </section>
    {{/if}}

    <!-- Languages -->
    {{#if languages_html}}
    <section>
      <div class="section-header">
        <div class="dot"></div>
        <h2>Lingue</h2>
        <div class="line"></div>
      </div>
      <div class="lang-grid">{{languages_html}}</div>
    </section>
    {{/if}}

  </main>

</div>
</body>
</html>
`;

// prettier-ignore
const MINIMAL_HTML = `<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>{{full_name}} — CV</title>
    <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Serif+Display:ital@0;1&display=swap"
        rel="stylesheet"
    >
    <style>
        *,
        *::before,
        *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'DM Sans', system-ui, sans-serif;
            background: #ffffff;
            color: #1a1a1a;
            font-size: 10px;
            line-height: 1.55;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        /* ── SHELL ── */
        .cv {
            width: 794px;
            min-height: 1123px;
            padding: 56px 60px 56px 60px;
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        /* ── HEADER ── */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding-bottom: 24px;
            border-bottom: 2px solid #1a1a1a;
            margin-bottom: 28px;
        }

        .header-left {
            flex: 1;
        }

        .header-name {
            font-family: 'DM Serif Display', Georgia, serif;
            font-size: 40px;
            font-weight: 400;
            color: #1a1a1a;
            letter-spacing: -1.5px;
            line-height: 1.05;
        }

        .header-name em {
            font-style: italic;
            color: #555;
        }

        .header-role {
            margin-top: 8px;
            font-size: 11px;
            font-weight: 500;
            color: #666;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        .header-right {
            text-align: right;
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .contact-line {
            font-size: 10px;
            color: #555;
            font-weight: 400;
        }

        .contact-line a {
            color: #1a1a1a;
            text-decoration: none;
        }

        /* ── BODY GRID ── */
        .body-grid {
            display: flex;
            gap: 40px;
            flex: 1;
        }

        /* ── LEFT COLUMN ── */
        .col-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 26px;
        }

        /* ── RIGHT COLUMN ── */
        .col-side {
            width: 165px;
            display: flex;
            flex-direction: column;
            gap: 26px;
        }

        /* ── SECTION ── */
        .section {
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        .section-title {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #aaa;
            margin-bottom: 10px;
        }

        .section-divider {
            width: 100%;
            height: 1px;
            background: #e5e5e5;
            margin-bottom: 10px;
        }

        /* ── ENTRIES ── */
        .entry {
            margin-bottom: 12px;
        }

        .entry:last-child {
            margin-bottom: 0;
        }

        .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
        }

        .entry-title {
            font-size: 11px;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1.3;
        }

        .entry-date {
            font-size: 9.5px;
            color: #888;
            font-weight: 400;
            white-space: nowrap;
            margin-left: 12px;
            flex-shrink: 0;
        }

        .entry-org {
            font-size: 10.5px;
            font-weight: 500;
            color: #444;
            font-style: italic;
            margin-bottom: 5px;
        }

        .entry-desc {
            font-size: 9px;
            color: #555;
            line-height: 1.6;
        }

        /* Profile summary */
        .summary-text {
            font-size: 9.5px;
            color: #333;
            line-height: 1.7;
            font-weight: 300;
        }
        .summary-text p { margin-bottom: 8px; }
        .summary-text p:last-child { margin-bottom: 0; }

        /* ── SIDE COLUMN ITEMS ── */
        .side-item {
            margin-bottom: 8px;
        }

        .side-item:last-child {
            margin-bottom: 0;
        }

        .side-item-label {
            font-size: 10px;
            font-weight: 700;
            color: #1a1a1a;
            line-height: 1.3;
        }

        .side-item-sub {
            font-size: 9.5px;
            color: #777;
            line-height: 1.4;
        }

        /* Skills list */
        .skill-line {
            font-size: 10px;
            color: #555;
            padding: 4px 0;
            border-bottom: 1px solid #f0f0f0;
        }

        .skill-line:last-child {
            border-bottom: none;
        }

        /* Language — compact 2-column grid */
        .lang-grid { display: flex; flex-direction: column; gap: 4px; }
        .lang-row { display: flex; gap: 8px; border: 1px solid #e5e5e5; border-radius: 4px; overflow: hidden; }
        .lang-cell { flex: 1; padding: 5px 8px; border-right: 1px solid #e5e5e5; }
        .lang-cell:last-child { border-right: none; }
        .lang-cell-header { display: flex; align-items: baseline; gap: 4px; margin-bottom: 3px; }
        .lang-cell-name { font-size: 9px; font-weight: 700; color: #1a1a1a; }
        .lang-cell-level { font-size: 8.5px; font-weight: 700; color: #1a1a1a; }
        .lang-bar { height: 3px; background: #e5e5e5; border-radius: 2px; overflow: hidden; margin-bottom: 2px; }
        .lang-bar-fill { height: 100%; background: #1a1a1a; border-radius: 2px; }
        .lang-cell-label { font-size: 7.5px; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
    </style>
</head>

<body>
    <div class="cv">

        <!-- ════ HEADER ════ -->
        <header class="header">
            <div class="header-left">
                <div class="header-name">{{first_name}}<br><em>{{last_name}}</em></div>
                <div class="header-role">{{headline}}</div>
            </div>
            <div class="header-right">
                {{#if city}}<span class="contact-line">{{city}}</span>{{/if}}
                {{#if phone}}<span class="contact-line">{{phone}}</span>{{/if}}
                {{#if linkedin_url}}<span class="contact-line"><a href="{{linkedin_url}}">LinkedIn</a></span>{{/if}}
                {{#if portfolio_url}}<span class="contact-line"><a
                        href="{{portfolio_url}}">{{portfolio_url}}</a></span>{{/if}}
            </div>
        </header>

        <!-- ════ BODY ════ -->
        <div class="body-grid">

            <!-- Main Column -->
            <div class="col-main">

                {{#if profile_summary}}
                <section class="section">
                    <div class="section-title">Profilo</div>
                    <div class="section-divider"></div>
                    <div class="summary-text">{{profile_summary_html}}</div>
                </section>
                {{/if}}

                <!-- Work Experience -->
                <section class="section">
                    <div class="section-title">Esperienza</div>
                    <div class="section-divider"></div>
                    {{experiences_html}}
                </section>

                {{#if projects_html}}
                <section class="section">
                    <div class="section-title">Progetti</div>
                    <div class="section-divider"></div>
                    {{projects_html}}
                </section>
                {{/if}}

                {{#if education_html}}
                <section class="section">
                    <div class="section-title">Formazione</div>
                    <div class="section-divider"></div>
                    {{education_html}}
                </section>
                {{/if}}

                {{#if languages_html}}
                <section class="section">
                    <div class="section-title">Lingue</div>
                    <div class="section-divider"></div>
                    <div class="lang-grid">{{languages_html}}</div>
                </section>
                {{/if}}

            </div>

            <!-- Side Column -->
            <div class="col-side">

                {{#if skills_section_html}}
                <section class="section">
                    <div class="section-title">Competenze</div>
                    <div class="section-divider"></div>
                    {{skills_section_html}}
                </section>
                {{/if}}

                {{#if certifications_html}}
                <section class="section">
                    <div class="section-title">Certificazioni</div>
                    <div class="section-divider"></div>
                    {{certifications_html}}
                </section>
                {{/if}}


            </div>

        </div>

    </div>
</body>

</html>`;

// prettier-ignore
const CREATIVE_HTML = `<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >
    <title>{{full_name}} — CV</title>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400&display=swap"
        rel="stylesheet"
    >
    <style>
        *,
        *::before,
        *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Poppins', system-ui, sans-serif;
            background: #fff;
            color: #1e1b2e;
            font-size: 10px;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        :root {
            --accent-1: #6C3DE8;
            --accent-2: #F7615F;
            --sidebar-bg: #1e1b2e;
            --sidebar-text: rgba(255, 255, 255, 0.75);
            --sidebar-heading: rgba(255, 255, 255, 0.4);
            --sidebar-accent: #a78bfa;
        }

        /* ── SHELL ── */
        .cv {
            width: 794px;
            min-height: 1123px;
            display: flex;
            background: #ffffff;
        }

        /* ── SIDEBAR ── */
        .sidebar {
            width: 244px;
            min-width: 244px;
            background: var(--sidebar-bg);
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
        }

        /* Gradient top decoration */
        .sidebar-deco {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 200px;
            background: linear-gradient(135deg, var(--accent-1) 0%, var(--accent-2) 100%);
            clip-path: ellipse(140% 85% at 50% 0%);
        }

        .sidebar-content {
            position: relative;
            z-index: 1;
            padding: 44px 20px 36px 22px;
            display: flex;
            flex-direction: column;
            gap: 22px;
        }

        /* Avatar */
        .avatar-wrap {
            display: flex;
            justify-content: center;
        }

        .avatar-wrap img {
            width: 92px;
            height: 92px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        .avatar-initials-wrap {
            width: 92px;
            height: 92px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            font-weight: 800;
            color: #fff;
            border: 3px solid rgba(255, 255, 255, 0.25);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }

        /* Name */
        .name-block {
            text-align: center;
        }

        .name-block h1 {
            font-size: 17px;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.2;
            letter-spacing: -0.3px;
        }

        .name-block .role {
            margin-top: 6px;
            font-size: 9px;
            font-weight: 500;
            color: var(--sidebar-accent);
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }

        /* Sidebar divider */
        .sb-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.07);
            margin: 0 4px;
        }

        /* Sidebar section */
        .sb-section {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .sb-heading {
            font-size: 8.5px;
            font-weight: 700;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            color: var(--sidebar-heading);
            margin-bottom: 2px;
        }

        /* Contact */
        .contact-item {
            display: flex;
            align-items: flex-start;
            gap: 8px;
        }

        .contact-icon {
            width: 14px;
            height: 14px;
            fill: var(--sidebar-accent);
            flex-shrink: 0;
            margin-top: 1px;
        }

        .contact-text {
            font-size: 9.5px;
            color: var(--sidebar-text);
            line-height: 1.5;
            word-break: break-word;
        }

        .contact-text a {
            color: var(--sidebar-accent);
            text-decoration: none;
        }

        /* Skill pills */
        .skill-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(167, 139, 250, 0.12);
            border: 1px solid rgba(167, 139, 250, 0.25);
            border-left: 3px solid var(--accent-1);
            color: rgba(255, 255, 255, 0.82);
            border-radius: 5px;
            padding: 3px 8px;
            font-size: 9px;
            font-weight: 500;
            margin: 2px 2px 0 0;
        }

        /* ── MAIN ── */
        .main {
            flex: 1;
            padding: 36px 26px 36px 24px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            background: #fafafa;
        }

        /* Section */
        .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }

        .section-title-badge {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .section-title-badge svg {
            width: 12px;
            height: 12px;
            fill: #fff;
        }

        .section-title h2 {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: #1e1b2e;
        }

        /* Entry cards */
        .entry-card {
            background: #fff;
            border-radius: 10px;
            padding: 12px 14px;
            margin-bottom: 10px;
            border: 1px solid #ede9fe;
            border-left: 3px solid var(--accent-1);
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
        }

        .entry-card:last-child {
            margin-bottom: 0;
        }

        .entry-card-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px;
        }

        .entry-card-title {
            font-size: 12px;
            font-weight: 700;
            color: #1e1b2e;
            line-height: 1.3;
        }

        .entry-card-date {
            font-size: 9px;
            font-weight: 600;
            color: var(--accent-1);
            background: rgba(108, 61, 232, 0.08);
            border-radius: 4px;
            padding: 2px 7px;
            white-space: nowrap;
            margin-left: 8px;
            flex-shrink: 0;
        }

        .entry-card-org {
            font-size: 10.5px;
            font-weight: 500;
            color: #6c5ce7;
            margin-bottom: 6px;
        }

        .entry-card-desc {
            font-size: 9px;
            color: #64748b;
            line-height: 1.6;
        }

        .entry-card-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 7px;
        }

        .entry-card-tag {
            font-size: 8.5px;
            font-weight: 600;
            color: var(--accent-1);
            background: rgba(108, 61, 232, 0.08);
            border-radius: 3px;
            padding: 2px 6px;
        }

        /* Profile summary */
        .profile-card {
            background: linear-gradient(135deg, rgba(108, 61, 232, 0.06), rgba(247, 97, 95, 0.04));
            border: 1px solid rgba(108, 61, 232, 0.12);
            border-radius: 10px;
            padding: 12px 16px;
            font-size: 9.5px;
            color: #334155;
            line-height: 1.7;
        }
        .profile-card p { margin-bottom: 8px; }
        .profile-card p:last-child { margin-bottom: 0; }

        /* Language — compact 2-column grid */
        .lang-grid { display: flex; flex-direction: column; gap: 4px; }
        .lang-row { display: flex; gap: 8px; border: 1px solid #ede9fe; border-radius: 6px; overflow: hidden; }
        .lang-cell { flex: 1; padding: 5px 8px; border-right: 1px solid #ede9fe; }
        .lang-cell:last-child { border-right: none; }
        .lang-cell-header { display: flex; align-items: baseline; gap: 4px; margin-bottom: 3px; }
        .lang-cell-name { font-size: 9px; font-weight: 700; color: #1e1b2e; }
        .lang-cell-level { font-size: 8.5px; font-weight: 700; color: var(--accent-1); }
        .lang-bar { height: 3px; background: #ede9fe; border-radius: 2px; overflow: hidden; margin-bottom: 2px; }
        .lang-bar-fill { height: 100%; background: var(--accent-1); border-radius: 2px; }
        .lang-cell-label { font-size: 7.5px; color: #a78bfa; text-transform: uppercase; letter-spacing: 0.5px; }
    </style>
</head>

<body>
    <div class="cv">

        <!-- ════ SIDEBAR ════ -->
        <aside class="sidebar">
            <div class="sidebar-deco"></div>
            <div class="sidebar-content">

                <!-- Avatar -->
                <div class="avatar-wrap">
                    {{#if avatar_url}}
                    <img
                        src="{{avatar_url}}"
                        alt="{{full_name}}"
                        crossorigin="anonymous"
                    />
                    {{else}}
                    <div class="avatar-initials-wrap">{{initials}}</div>
                    {{/if}}
                </div>

                <!-- Name -->
                <div class="name-block">
                    <h1>{{full_name}}</h1>
                    <div class="role">{{headline}}</div>
                </div>

                <div class="sb-divider"></div>

                <!-- Contact -->
                <div class="sb-section">
                    <div class="sb-heading">Contatti</div>

                    {{#if city}}
                    <div class="contact-item">
                        <svg
                            class="contact-icon"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
                            />
                        </svg>
                        <span class="contact-text">{{city}}</span>
                    </div>
                    {{/if}}

                    {{#if phone}}
                    <div class="contact-item">
                        <svg
                            class="contact-icon"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2z"
                            />
                        </svg>
                        <span class="contact-text">{{phone}}</span>
                    </div>
                    {{/if}}

                    {{#if linkedin_url}}
                    <div class="contact-item">
                        <svg
                            class="contact-icon"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"
                            />
                        </svg>
                        <span class="contact-text"><a href="{{linkedin_url}}">LinkedIn</a></span>
                    </div>
                    {{/if}}

                    {{#if portfolio_url}}
                    <div class="contact-item">
                        <svg
                            class="contact-icon"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"
                            />
                        </svg>
                        <span class="contact-text"><a href="{{portfolio_url}}">Portfolio</a></span>
                    </div>
                    {{/if}}
                </div>

                <div class="sb-divider"></div>

                <!-- Skills -->
                {{#if skills_list}}
                <div class="sb-section">
                    <div class="sb-heading">Competenze</div>
                    <div>{{skills_list}}</div>
                </div>
                {{/if}}


            </div>
        </aside>

        <!-- ════ MAIN ════ -->
        <main class="main">

            {{#if profile_summary}}
            <section>
                <div class="section-title">
                    <div class="section-title-badge">
                        <svg viewBox="0 0 24 24">
                            <path
                                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                            />
                        </svg>
                    </div>
                    <h2>Profilo</h2>
                </div>
                <div class="profile-card">{{profile_summary_html}}</div>
            </section>
            {{/if}}

            <!-- Work Experience -->
            <section>
                <div class="section-title">
                    <div class="section-title-badge">
                        <svg viewBox="0 0 24 24">
                            <path
                                d="M20 6h-2.18c.07-.44.18-.88.18-1.34C18 2.99 16.34 1.5 14.5 1.5c-1.74 0-2.9 1.18-3.5 2.5-.6-1.32-1.76-2.5-3.5-2.5C5.66 1.5 4 2.99 4 4.66c0 .46.11.9.18 1.34H2c-1.1 0-1.99.9-1.99 2L0 19c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5.5-2.5c.83 0 1.5.67 1.5 1.66 0 .5-.37.84-.85.84H14v-.84c0-.83.52-1.66 1.5-1.66h-.5zm-7 0C8.33 3.5 9 4.17 9 5v.84H7.85C7.37 5.84 7 5.5 7 5c0-.99.67-1.5 1.5-1.5zM11 19H8V8h3v11zm5 0h-3V8h3v11zm4 0h-3V8h3v11z"
                            />
                        </svg>
                    </div>
                    <h2>Esperienze</h2>
                </div>
                {{experiences_html}}
            </section>

            {{#if projects_html}}
            <section>
                <div class="section-title">
                    <div class="section-title-badge">
                        <svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
                    </div>
                    <h2>Progetti</h2>
                </div>
                {{projects_html}}
            </section>
            {{/if}}

            {{#if education_html}}
            <section>
                <div class="section-title">
                    <div class="section-title-badge">
                        <svg viewBox="0 0 24 24">
                            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3 1 9l11 6 9-4.91V17h2V9L12 3z" />
                        </svg>
                    </div>
                    <h2>Formazione</h2>
                </div>
                {{education_html}}
            </section>
            {{/if}}

            {{#if certifications_html}}
            <section>
                <div class="section-title">
                    <div class="section-title-badge">
                        <svg viewBox="0 0 24 24">
                            <path
                                d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
                            />
                        </svg>
                    </div>
                    <h2>Certificazioni</h2>
                </div>
                {{certifications_html}}
            </section>
            {{/if}}

            {{#if languages_html}}
            <section>
                <div class="section-title">
                    <div class="section-title-badge">
                        <svg viewBox="0 0 24 24">
                            <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                        </svg>
                    </div>
                    <h2>Lingue</h2>
                </div>
                <div class="lang-grid">{{languages_html}}</div>
            </section>
            {{/if}}

        </main>

    </div>
</body>

</html>`;

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
            `Unknown template ID: "${templateId}". Valid IDs: ${Object.keys(TEMPLATE_MAP).join(', ')}`
        );
    }
    return html;
}

export function getAvailableTemplateIds(): TemplateId[] {
    return Object.keys(TEMPLATE_MAP) as TemplateId[];
}
