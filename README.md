# Oliver's Konst

Webshop och gallerisida för konstnären Oliver – byggd med Next.js och driftsatt på GitHub Pages.

## Live-webbplats

**https://wiktor87.github.io/oliverkonst/**

## Teknisk översikt

Webbplatsen är en **helt statisk sajt** (Next.js static export) som körs utan server:

| Komponent | Lösning |
|-----------|---------|
| Hosting | GitHub Pages (gratis) |
| Driftsättning | GitHub Actions workflow |
| Produktdata | JSON-filer i `data/` + `public/data/` |
| Admin-panel | Klient-sida via GitHub REST API |
| Kontaktformulär | `mailto:`-länk |
| Kundvagn | localStorage (klient-sida) |
| Språkval (SV/EN) | localStorage (klient-sida) |

## Driftsättning

### Aktivera GitHub Pages

1. Gå till **Settings → Pages** i repot
2. Under **Source**, välj **GitHub Actions** (inte "Deploy from a branch")
3. Inga fler inställningar behövs – GitHub Actions-workflowet sköter resten

### Automatisk uppdatering

Varje push till `main` triggar en ny byggning och driftsättning via `.github/workflows/deploy.yml`.
Webbplatsen uppdateras automatiskt inom 1–2 minuter.

## Admin-panel

Admin-panelen finns på `/admin` och kräver ett **GitHub Personal Access Token (PAT)** för inloggning.

### Så här fungerar det

1. Du loggar in med ett GitHub PAT som har `repo`-behörighet
2. Ändringar (lägg till/redigera/ta bort produkter och kategorier) sparas direkt till repots JSON-filer via GitHub API
3. Varje ändring skapar en commit i repot
4. Commiten triggar GitHub Actions → ny byggning → webbplatsen uppdateras automatiskt

### Skapa ett PAT

1. Gå till [GitHub → Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens/new?scopes=repo&description=OliverKonst+Admin)
2. Skapa ett token med `repo`-scope
3. Kopiera tokenet och använd det för att logga in på admin-panelen

> **Säkerhet**: Tokenet lagras i `sessionStorage` och rensas när webbläsarfliken stängs. Det skickas **aldrig** till en tredjepartsserver – det används bara för direkta anrop mot GitHub API.

## Lokal utveckling

```bash
npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

### Bygga för produktion

```bash
NEXT_PUBLIC_BASE_PATH=/oliverkonst npm run build
```

Det statiska resultatet hamnar i `out/`.

## Datastruktur

JSON-filer lagras i `data/` (för byggprocessen) och kopieras till `public/data/` (för statisk servering):

- `data/products.json` – Produktkatalog
- `data/categories.json` – Kategorier
- `data/messages.json` – Kontaktmeddelanden (hanteras via admin)
- `data/orders.json` – Beställningar (hanteras via admin)

## Konfiguration

Webbplatsens inställningar finns i `src/lib/config.ts`:

```ts
export const siteConfig = {
  repoOwner: 'Wiktor87',
  repoName: 'oliverkonst',
  contactEmail: 'oliver@oliverskonst.se',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
};
```

## Teknologier

- [Next.js 15](https://nextjs.org/) med App Router och static export
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GitHub REST API](https://docs.github.com/en/rest) för admin-CRUD
- [GitHub Pages](https://pages.github.com/) + [GitHub Actions](https://github.com/features/actions) för hosting
