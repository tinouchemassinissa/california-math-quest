#!/usr/bin/env python3
"""Reuse renewed gateway wildcard certificate without exposing its key in logs."""
import os, ssl, subprocess, sys
from pathlib import Path
os.umask(0o077)
folder=Path.home()/'.local/share/bip-studio/lan-tls';folder.mkdir(mode=0o700,parents=True,exist_ok=True)
changed=False
for name in ['fullchain.pem','privkey.pem']:
    value=subprocess.check_output(['docker','exec','nginx-proxy-manager','cat','/etc/letsencrypt/live/npm-1/'+name])
    path=folder/name
    if not path.exists() or path.read_bytes()!=value:changed=True
    pending=folder/(name+'.new');pending.write_bytes(value);pending.chmod(0o600)
context=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(folder/'fullchain.pem.new',folder/'privkey.pem.new')
for name in ['fullchain.pem','privkey.pem']:os.replace(folder/(name+'.new'),folder/name)
if changed and '--refresh' in sys.argv:subprocess.run(['systemctl','--user','try-restart','bip-studio-lan.service'],check=True)
print('Studio LAN certificate checked; private key remains on server.')
