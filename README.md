# product-db-server-app

Microservice that scrapes Brazilian electronic invoices (NF-e) using Puppeteer and returns structured data (store, sale, products).

Part of the [Product-DB](../README.md) ecosystem.

## Tech Stack

- **Express** — HTTP server
- **Puppeteer** — Headless Chrome for HTML scraping
- **TypeScript**
- **Firebase/Firestore** — Legacy persistence (no longer the primary data store)

## Getting Started

```bash
npm install
npm run dev
```

The server starts on port `8080` (or `PORT` env var).

## API

### `POST /fetchInvoiceData` (main endpoint)

Receives an NF-e URL, scrapes the HTML page, and returns structured data.

**Request:**
```json
{ "url": "https://www.nfce.fazenda.sp.gov.br/..." }
```

**Response:**
```json
{
  "success": true,
  "result": {
    "store": { "id": "12345678000199", "name": "Supermarket Name", "storeAddress": "..." },
    "sale": { "id": "000123", "total": 157.43, "date": 1678924800000 },
    "products": [
      { "name": "Product A", "value": 5.99, "code": "7891234567890", "amount": 2, "type": "Un", "date": 1678924800000 }
    ]
  }
}
```

## Deployment

Deployed to a Raspberry Pi via GitHub Actions (build → SCP → PM2 reload).
