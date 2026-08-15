# Respect CFW

Premium bilingual FiveM marketplace prototype.

## Features
- Arabic is the default language
- Full RTL support
- English language switcher
- Responsive premium dark UI
- Product catalogue
- Cart drawer
- Checkout prototype
- Ready to extend with authentication, admin panel, payments and protected downloads

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Next phase
1. Add product detail pages
2. Add admin dashboard
3. Add database and authentication
4. Add PayPal/Revolut-compatible payment flow
5. Add protected ZIP downloads after successful payment
6. Add order history and customer accounts
## GitHub Pages

This project includes a GitHub Actions workflow for deployment.

1. Upload the entire project to a GitHub repository.
2. Make sure the default branch is `main`.
3. Open **Settings → Pages** in GitHub.
4. Under **Build and deployment → Source**, choose **GitHub Actions**.
5. Push/commit the project. The workflow will install dependencies, run `npm run build`, and publish the generated `dist` folder.

The Vite configuration uses `base: './'`, so asset URLs work when the site is hosted under a repository path.
