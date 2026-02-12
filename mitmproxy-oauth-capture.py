"""
mitmproxy addon to capture OAuth requests.
Run with: mitmproxy -s mitmproxy-oauth-capture.py --set block_global=false
"""

from mitmproxy import http
import json


class OAuthCapture:
    def request(self, flow: http.HTTPFlow) -> None:
        """Intercept and log OAuth requests."""

        # Only capture requests to platform.claude.com or api.anthropic.com
        if "claude.com" not in flow.request.pretty_host and "anthropic.com" not in flow.request.pretty_host:
            return

        # Focus on OAuth-related paths
        if "oauth" not in flow.request.path and "token" not in flow.request.path:
            return

        print("\n" + "="*80)
        print(f"🔍 CAPTURED REQUEST: {flow.request.method} {flow.request.pretty_url}")
        print("="*80)

        # Headers
        print("\n📋 HEADERS:")
        for key, value in flow.request.headers.items():
            print(f"  {key}: {value}")

        # Body
        if flow.request.content:
            print("\n📦 BODY:")
            body = flow.request.content.decode('utf-8', errors='replace')
            print(f"  Raw: {body}")
            print(f"  Length: {len(body)} bytes")

            # Try to parse as form data
            if "application/x-www-form-urlencoded" in flow.request.headers.get("content-type", ""):
                try:
                    from urllib.parse import parse_qs
                    parsed = parse_qs(body)
                    print("\n  Parsed form data:")
                    for key, values in parsed.items():
                        for value in values:
                            print(f"    {key} = {value[:100]}{'...' if len(value) > 100 else ''}")
                except Exception as e:
                    print(f"  Error parsing: {e}")

        print("\n" + "="*80 + "\n")

    def response(self, flow: http.HTTPFlow) -> None:
        """Intercept and log OAuth responses."""

        if "claude.com" not in flow.request.pretty_host and "anthropic.com" not in flow.request.pretty_host:
            return

        if "oauth" not in flow.request.path and "token" not in flow.request.path:
            return

        print("\n" + "="*80)
        print(f"📥 RESPONSE: {flow.response.status_code} for {flow.request.pretty_url}")
        print("="*80)

        # Response body
        if flow.response.content:
            try:
                body = flow.response.content.decode('utf-8', errors='replace')
                print(f"\n📦 RESPONSE BODY:\n{body[:1000]}")
            except Exception as e:
                print(f"Error decoding response: {e}")

        print("\n" + "="*80 + "\n")


addons = [OAuthCapture()]
