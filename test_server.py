import http.server
import socketserver
import json
import urllib.parse
import sys

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length).decode('utf-8')
        try:
            data = json.loads(post_data)
            print("LOGGED_JSON_DATA:" + json.dumps(data), flush=True)
        except Exception as e:
            print("ERROR: " + str(e), flush=True)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"OK")
        
        # Shutdown after receiving one log
        def kill_server():
            sys.exit(0)
        import threading
        threading.Timer(1.0, kill_server).start()

PORT = 8081
with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print("Serving at port", PORT, flush=True)
    httpd.serve_forever()
