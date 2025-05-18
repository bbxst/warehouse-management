# Warehouse Management

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).  
It also includes a backend implemented in .NET, located in the [`backend/`](backend/) directory.

## Getting Started

### Frontend

To start the Next.js development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

You can start editing the page by modifying [`app/page.tsx`](src/app/page.tsx). The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font).

### Backend

The backend is a .NET project located in the [`backend/`](backend/) directory.

To run the backend:

```bash
cd backend
dotnet run
```

Configuration files are located at:

- [`backend/appsettings.json`](backend/appsettings.json)
- [`backend/appsettings.Development.json`](backend/appsettings.Development.json)

## Project Structure

- [`src/`](src/) - Next.js frontend source code
- [`backend/`](backend/) - .NET backend API
- [`public/`](public/) - Static assets
- [`components.json`](components.json) - Component configuration
- [`package.json`](package.json) - Project dependencies and scripts

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub Repository](https://github.com/vercel/next.js)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
