# CareerVault

> App mobile (React Native + Expo) per gestire il tuo storico professionale e generare CV personalizzati tramite AI (RAG + n8n).

---

## 🚀 Stack tecnologico

| Layer | Tecnologia |
|---|---|
| Framework | React Native + Expo Router (file-based routing) |
| Backend / DB | Supabase (PostgreSQL + pgvector + Auth + Storage) |
| AI Pipeline | n8n workflow (RAG + LLM via webhook) |
| Autenticazione | Supabase Auth + `expo-secure-store` |
| Form | `react-hook-form` + `zod` |
| State | React hooks + `zustand` (ready) |
| PDF | `react-native-pdf` + `expo-sharing` |

---

## 📁 Struttura del progetto

```
career-vault/
├── app/
│   ├── _layout.tsx          # Root layout (AuthProvider + AuthGuard)
│   ├── (auth)/
│   │   ├── login.tsx        # Schermata login
│   │   └── signup.tsx       # Schermata registrazione
│   ├── (tabs)/
│   │   ├── index.tsx        # 🗄️ Vault (lista esperienze)
│   │   ├── generate.tsx     # ✨ Genera CV/Cover Letter
│   │   └── history.tsx      # 📄 Storico generazioni
│   ├── experience/
│   │   ├── new.tsx          # Form nuova esperienza
│   │   └── [id].tsx         # Dettaglio + modifica + elimina
│   └── document/
│       └── [id].tsx         # Visualizzatore PDF
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx  # Sessione Supabase + signIn/signUp/signOut
│   ├── services/
│   │   ├── supabase.ts      # Client Supabase (SecureStore adapter)
│   │   ├── experienceService.ts  # CRUD esperienze
│   │   ├── documentService.ts    # CRUD documenti generati
│   │   └── webhookService.ts     # Chiamata POST al webhook n8n
│   ├── hooks/
│   │   ├── useExperiences.ts    # Hook con loading/error/optimistic update
│   │   └── useDocuments.ts      # Hook + flusso generation completo
│   ├── components/
│   │   └── ExperienceCard.tsx   # Card riutilizzabile
│   ├── types/
│   │   └── database.ts          # Tipi TypeScript dello schema Supabase
│   └── theme/
│       └── index.ts             # Palette, spacing, radius, typography
└── supabase/
    └── schema.sql               # Schema completo (pgvector + RLS)
```

---

## 🛠️ Setup iniziale

### 1. Clona e installa

```bash
git clone <repo-url>
cd career-vault
npm install
```

### 2. Configura le variabili d'ambiente

```bash
cp .env.example .env
```

Apri `.env` e inserisci i tuoi valori:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/career-vault
```

### 3. Crea il database su Supabase

1. Vai su [supabase.com](https://supabase.com) → crea un progetto
2. Vai su **SQL Editor** → incolla e lancia il contenuto di `supabase/schema.sql`
3. Abilita l'estensione **pgvector** se richiesto (il file include già `create extension if not exists vector`)

### 4. Avvia l'app

```bash
npm start           # Expo DevServer — apri con Expo Go
npm run android     # Android emulator / dispositivo fisico
npm run ios         # iOS simulator (solo macOS)
```

> **Nota**: `react-native-pdf` richiede una **build nativa** (`expo run:android` / `expo run:ios`). In Expo Go è disponibile il fallback con "Condividi PDF".

---

## 🤖 Configurazione n8n (Phase 6)

Il workflow n8n deve:

1. Ricevere `POST` all'URL configurato con payload:
   ```json
   {
     "userId": "uuid",
     "docType": "cv" | "cover_letter",
     "jobDescription": "...",
     "requestedAt": "ISO timestamp",
     "documentId": "uuid"
   }
   ```
2. Eseguire RAG sull'embedding delle esperienze (`pgvector`)
3. Generare il documento via LLM
4. Caricare il PDF su Supabase Storage
5. Rispondere con `{ "pdf_url": "...", "request_id": "..." }`
   oppure aggiornare direttamente la riga `generated_documents` tramite Supabase API

---

## 📋 Roadmap

- [x] Phase 1 — Inizializzazione progetto Expo
- [x] Phase 2 — Schema DB Supabase con pgvector + RLS
- [x] Phase 3 — Autenticazione (Login / Signup)
- [x] Phase 4 — UI & Navigazione (Tab bar + Vault screen)
- [x] Phase 5 — CRUD Esperienze (form, dettaglio, elimina)
- [x] Phase 6 — Generazione CV (webhook n8n, PDF viewer, storico)
- [ ] Phase 7 — Polish finale (theming, animazioni, onboarding)

---

## 📄 Licenza

MIT

---

Email confirmation:
  Per riattivare tutto in futuro basta:
  1. REQUIRE_EMAIL_CONFIRMATION = true in AuthContext.tsx e _layout.tsx                                                        
  2. Riattivare il toggle in Supabase dashboard
                                                           