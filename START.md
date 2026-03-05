# Come avviare CareerVault (Ambiente di Sviluppo)

Per avviare correttamente l'intero ecosistema dell'app, è necessario aprire **3 terminali separati** nella cartella del progetto (`career-vault`).

### 1️⃣ Terminale 1: Avvia n8n (Backend/Orchestratore)
Questo avvia il server locale di n8n che gestisce le chiamate a OpenAI e Supabase.
```bash
npx n8n start
```
*(L'interfaccia di n8n sarà accessibile dal browser all'indirizzo http://localhost:5678)*

---

### 2️⃣ Terminale 2: Bridge webhook (ADB Reverse)
Se stai usando un **emulatore Android** o un **dispositivo fisico USB**, l'app mobile non sa cos'è `localhost`. Questo comando instrada la porta 5678 dal telefono al tuo computer, così i webhooks possono comunicare.
```bash
adb reverse tcp:5678 tcp:5678
```

---

### 3️⃣ Terminale 3: Avvia l'App (Expo)
Pulisce la cache di Expo e avvia il bundler Metro per React Native.
```bash
npx expo start --clear
```

> **💡 Nota:** Assicurati sempre che il tuo file `.env` sia compilato correttamente con le chiavi di Supabase e N8N Webhook (`EXPO_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/career-vault`).
