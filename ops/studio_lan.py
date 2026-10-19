#!/usr/bin/env python3
"""LAN-bound TLS front end; Studio authentication and CSRF remain at loopback backend."""
import http.client, os, ssl
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HOST=os.environ.get('BIP_LAN_HOST','10.0.0.139')
PORT=int(os.environ.get('BIP_LAN_PORT','8466'))
NAME=os.environ.get('BIP_LAN_NAME','studio.massinissatinouche.com')
CERT=Path.home()/'.local/share/bip-studio/lan-tls'
LIMIT=12*1024*1024
HOP={'connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailer','transfer-encoding','upgrade'}
class Handler(BaseHTTPRequestHandler):
    protocol_version='HTTP/1.0'
    def setup(self):
        self.request.settimeout(15)
        super().setup()
    def log_message(self,*args):pass
    def do_GET(self):self.forward()
    def do_POST(self):self.forward()
    def forward(self):
        self.connection.settimeout(30)
        if self.headers.get('Host')!=f'{NAME}:{PORT}':return self.send_error(400,'Invalid Studio hostname')
        if self.headers.get('Transfer-Encoding'):return self.send_error(400,'Unsupported transfer encoding')
        try:length=int(self.headers.get('Content-Length','0'))
        except ValueError:return self.send_error(400,'Invalid request length')
        if length<0 or length>LIMIT:return self.send_error(413)
        connection=http.client.HTTPConnection('127.0.0.1',8765,timeout=910)
        try:
            body=self.rfile.read(length) if length else None
            if length and len(body)!=length:return self.send_error(400)
            headers={k:v for k,v in self.headers.items() if k.lower() not in HOP and k.lower() not in {'content-length','x-forwarded-for','x-forwarded-proto'}}
            headers['X-Forwarded-Proto']='https'
            connection.request(self.command,self.path,body,headers)
            response=connection.getresponse();data=response.read()
            self.send_response(response.status)
            for key,value in response.getheaders():
                if key.lower() not in HOP and key.lower() not in {'content-length','server','date'}:self.send_header(key,value)
            self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
        except (OSError,http.client.HTTPException):self.send_error(502,'Studio temporarily unavailable')
        finally:connection.close()
if __name__=='__main__':
    context=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);context.minimum_version=ssl.TLSVersion.TLSv1_2
    context.load_cert_chain(CERT/'fullchain.pem',CERT/'privkey.pem')
    server=ThreadingHTTPServer((HOST,PORT),Handler)
    server.socket=context.wrap_socket(server.socket,server_side=True,do_handshake_on_connect=False)
    server.serve_forever()
