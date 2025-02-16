# BNE Support Services app

Uses Vite, React, Shadcn, Tailwind and TypeScript

## Setup

install deps
```bash
npm install
```

requires google maps api key in `.env` file

## Run

run dev server
```bash
npm run dev
```

## Geocoding

```bash
npm run geocode
```

This will read a local copy of `services.csv` file, geocode the addresses, and save the results to a new file called `services_with_coordinates.csv`.