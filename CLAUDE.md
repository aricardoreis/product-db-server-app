# CLAUDE.md — product-db-server-app

Microservice responsible for scraping Brazilian electronic invoices (NF-e) and extracting structured data from their HTML pages.

## Commands

```bash
npm run dev       # Build + watch mode (tsc --watch + nodemon)
npm run build     # Compile TypeScript to dist/
npm start         # Install deps, build, and run (production)
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 8080) |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET /` | Health check — returns version from package.json |
| `POST /fetchInvoiceData` | **Main endpoint** — receives `{ url }`, scrapes NF-e HTML, returns structured data |

## How Scraping Works

The `Scraper` class (`src/scraper/index.ts`) uses Puppeteer to:

1. **Launch headless Chrome** with randomized viewport to avoid detection
2. **Navigate** to the NF-e URL
3. **Extract store info** from `#conteudo > div.txtCenter`: name (`.txtTopo`), CNPJ, address (`.text`)
4. **Extract sale info** from `#infos`: invoice ID, date (regex-parsed), total (`#linhaTotal > .txtMax`)
5. **Extract products** from `#tabResult tr`: name (`.txtTit`), unit type (`.RUN`), price (`.RvlUnit`), code (`.RCod`), quantity (`.Rqtd`)

Returns: `{ store, sale, products[] }`

## URL Validation

- URL must contain the string `"nfce"`
- URL must have exactly one `=` character

## Project Structure

```
src/
├── index.ts              # Express server with /fetchInvoiceData endpoint
├── scraper/index.ts      # Puppeteer scraper (core logic)
├── models/models.ts      # AppResponse wrapper
└── utils/
    ├── exception.ts      # ApplicationError class
    └── validator.ts      # URL validation
```

## Deployment

- **CI/CD**: GitHub Actions on push to `main`
  - Auto-bumps patch version in package.json
  - Builds TypeScript, then SCP copies `dist/` + `package.json` to Raspberry Pi
  - Reloads via PM2 (`pm2 reload product-db`)
- **Runtime**: Node.js on Raspberry Pi
