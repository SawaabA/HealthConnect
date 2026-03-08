# Deployment Placeholder (Vultr + Tailscale)

## Target model

1. `apps/api` runs on a private Vultr instance, joined to a Tailscale tailnet.
2. Internal workers/services communicate only over Tailscale IP/DNS.
3. `web` can run publicly (Vercel, Vultr VM, or container host) and call API through:
   - private tunnel during development, or
   - controlled Tailscale Funnel endpoint for demo mode.
4. Documents and generated audio are stored in Vultr Object Storage (S3-compatible).

## Placeholders to replace

- `tailscale up --auth-key=$TAILSCALE_AUTH_KEY`
- Funnel command (demo): `tailscale funnel 443 on`
- API base URL in web env should point to funnel/public gateway for demo, private URL for internal use.

## Security notes

- Keep API containers private by default; expose only the minimal demo endpoint.
- Enforce Auth0 RBAC at API route boundary.
- Store object storage credentials in a secret manager, not in env templates.
- Replace encryption placeholders in `storage_provider.py` with envelope encryption logic.
