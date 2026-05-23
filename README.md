# Fullmäktige-Live

Prototyp för ett webbaserat grafiksystem till livesändningar av kommunfullmäktige.

## Innehåll i första iterationen

- Node/Express + Socket.io backend för realtidsstyrning.
- React/Tailwind-operatörspanel för ärenden, namnskyltar, ersättare och votering.
- Separat overlay-vy i ren HTML/CSS/JS avsedd som Browser Source.
- PostgreSQL-schema för workspaces, mandatperioder, partier, ledamöter, ärenden och mötesloggar.
- In-memory demo-state så prototypen kan köras direkt utan databas.

## Körning

Den här WSL-miljön saknar `npm`, men projektet är förberett för en vanlig Node 20+-miljö:

```bash
npm install
npm run dev
```

Öppna sedan:

- Operatörspanel: http://localhost:5173
- Overlay / Browser Source: http://localhost:3000/overlay
- API hälsa: http://localhost:3000/api/health

## Databas

Schemat finns i `db/schema.sql`. Backend faller tillbaka till demo-data om `DATABASE_URL` saknas.

## Tester

```bash
npm test
```

Testerna kör ren affärslogik för grafiktillstånd, votering och ersättarbyte utan externa beroenden.
