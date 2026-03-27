This is the frontend for Peoply, built with [Next.js](https://nextjs.org/).

## Getting Started

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in the browser.

## Local auth with backend

If Vipps or Google login is inconvenient locally, the backend supports a dev-only mock auth flow.

1. Start the backend with `LOCAL_AUTH_ENABLED=true`.
2. Open the frontend locally.
3. Make sure the frontend points at the backend locally, typically with `NEXT_PUBLIC_API_URL=http://localhost:3000`.
4. Open this backend URL directly in the browser to log in as a seeded dev user:

```text
http://localhost:3000/auth/dev-login?email=Kristian@gmail.com
```

Important:

- this flow is for local development only and is disabled in production
- opening the URL in the browser sets cookies for the browser and redirects back to the frontend
- `curl -c cookies.txt` only logs in `curl`, not the browser UI
- available seeded users can be listed from the backend at `GET /auth/dev-users`

## Analytics

- Peoply uses Umami for anonymized analytics.
- The tracking script is loaded globally from `pages/_app.tsx`.
- Umami website ID: `7ec1d359-0bab-4bee-b214-d6f116701233`
- Temporary Umami owner user until a team account is created: `victor.uhnger@gmail.com`

## Notes

- FAQ/user-facing wording about anonymized analytics lives in `pages/faq.tsx`.
- Keep analytics-related changes documented here until a separate internal runbook exists.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
