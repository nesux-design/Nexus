#!/usr/bin/env python3
from pathlib import Path
import sys
p = Path("worker.ts")
t = p.read_text()
if 'github: {\n    clientId: env.GITHUB_CLIENT_ID' in t and '"github"' in t[t.find("GENERIC_OAUTH_PROVIDERS"):t.find("GENERIC_OAUTH_PROVIDERS")+500]:
    print("Already fixed")
    sys.exit(0)

old_gen = 'var GENERIC_OAUTH_PROVIDERS = ["slack", "notion", "spotify", "dropbox", "hubspot", "linkedin", "zoom", "asana", "airtable", "monday", "microsoft", "salesforce", "twitter", "stripe", "mailchimp", "intercom", "linear", "reddit", "twitch"];'
new_gen = 'var GENERIC_OAUTH_PROVIDERS = ["slack", "notion", "spotify", "dropbox", "hubspot", "linkedin", "zoom", "asana", "airtable", "monday", "microsoft", "salesforce", "twitter", "stripe", "mailchimp", "intercom", "linear", "reddit", "twitch", "github"];'
if old_gen not in t:
    sys.exit("GENERIC_OAUTH_PROVIDERS missing")
t = t.replace(old_gen, new_gen, 1)

marker = '''  twitch: {
    clientId: env.TWITCH_CLIENT_ID || "ADD_YOUR_TWITCH_CLIENT_ID",
    clientSecret: env.TWITCH_CLIENT_SECRET || "ADD_YOUR_TWITCH_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/twitch/callback",
    authUrl: "https://id.twitch.tv/oauth2/authorize",
    tokenUrl: "https://id.twitch.tv/oauth2/token",
    scopes: "user:read:email channel:read:subscriptions"
  }
};'''
github_block = '''  twitch: {
    clientId: env.TWITCH_CLIENT_ID || "ADD_YOUR_TWITCH_CLIENT_ID",
    clientSecret: env.TWITCH_CLIENT_SECRET || "ADD_YOUR_TWITCH_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/twitch/callback",
    authUrl: "https://id.twitch.tv/oauth2/authorize",
    tokenUrl: "https://id.twitch.tv/oauth2/token",
    scopes: "user:read:email channel:read:subscriptions"
  },
  github: {
    clientId: env.GITHUB_CLIENT_ID || "ADD_YOUR_GITHUB_CLIENT_ID",
    clientSecret: env.GITHUB_CLIENT_SECRET || "ADD_YOUR_GITHUB_CLIENT_SECRET",
    redirectUri: "https://nexus-a1.apikeyakhilka.workers.dev/oauth/github/callback",
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scopes: "read:user user:email repo"
  }
};'''
if marker not in t:
    sys.exit("twitch block missing")
t = t.replace(marker, github_block, 1)
assert "GITHUB_CLIENT_ID" in t
p.write_text(t)
print("OK", len(t))
