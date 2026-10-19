# Studio on home Wi-Fi

Home-only URL: https://studio.massinissatinouche.com:8466/
Outside: retain https://tinouche-server.tailbe09b4.ts.net:8465/ with Tailscale connected.

The home URL resolves to the private server address 10.0.0.139 (DNS-only A record, no Cloudflare proxy). The TLS listener binds that LAN IPv4 address only. No router port forward or Tailscale Funnel was added. Name resolution uses ordinary DNS; public DNS visibility of a private address does not make the service internet-reachable.

The loopback Studio at 127.0.0.1:8765 still enforces the same owner login, optional enrolled MFA, session expiry, Host allowlist and CSRF checks. An additional explicit HTTPS origin is set in ~/.config/systemd/user/bip-content-studio.service.d/lan.conf. The LAN TLS front end does not authenticate users itself or remove these checks.

## Services

- bip-studio-lan.service: runs ops/studio_lan.py; home Wi-Fi HTTPS on port 8466.
- bip-studio-lan-cert.timer: daily certificate check at 05:15 server time, and on boot if missed.
- bip-studio-lan-cert.service: runs ops/studio_lan_cert.py --refresh.

The front end reuses the local gateway's existing Let's Encrypt wildcard certificate for *.massinissatinouche.com. The sync helper copies it from nginx-proxy-manager's /etc/letsencrypt/live/npm-1 into ~/.local/share/bip-studio/lan-tls with a mode-700 directory and mode-600 files, verifies the pair, then replaces them. A changed pair restarts only the LAN front end. Never commit certificates, private keys, accounts, recovery codes or the local database. The gateway remains responsible for obtaining certificate renewals; the helper only copies its renewed pair.

The implementation currently assumes the existing server user, paths, container name, certificate slot, and reserved address. After a future network/hardware migration, update the LAN bind address, DNS record and user service paths before starting this listener. This is not an automatic migration workflow.

## Verification performed

- Verified trusted HTTPS from the server and a second LAN computer using the normal hostname.
- Verified the hostname resolves to 10.0.0.139, the listener binds only that IPv4 address, and the port is reachable on the LAN.
- Unsigned drafts request returned 401; cross-origin login POST returned 403.
- Existing Tailscale HTTPS route preserved.
- Phone access and physical departure/return still need owner testing.

## Disable home-only access

Run on the server:

```bash
systemctl --user disable --now bip-studio-lan.service bip-studio-lan-cert.timer
```

The existing Tailscale route remains available. The DNS record can also be removed in Cloudflare. Its non-secret record identifiers are saved privately at ~/.local/share/bip-studio/lan-dns-record.json for rollback. Keep the additional origin only while this LAN endpoint is in use.
