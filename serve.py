#!/usr/bin/env python3
"""
Servidor local para ver zairo-films en dispositivos móviles.
Uso: python3 serve.py
Luego abre en tu móvil: http://192.168.0.4:8080/zairo-films/
"""
import http.server
import socketserver
import os

PORT = 8080
DIST_DIR = os.path.join(os.path.dirname(__file__), "dist")

os.chdir(os.path.dirname(DIST_DIR))

handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("0.0.0.0", PORT), handler) as httpd:
    print(f"Servidor corriendo en:")
    print(f"  Local:   http://localhost:{PORT}/zairo-films/")
    print(f"  Móvil:   http://192.168.0.4:{PORT}/zairo-films/")
    print(f"\nPresiona Ctrl+C para detener.")
    httpd.serve_forever()
