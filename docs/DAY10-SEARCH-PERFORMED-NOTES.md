# Day 10 — Honest searchPerformed

Previously: `searchPerformed: reasoning.plan.needsSearch` (plan said search, even if skipped by flag/quota/failure).

Now: `searchPerformed: true` only when live search content was actually applied (`didRunWebSearch`).

Simple pings / disabled `web_search` / quota skip → `searchPerformed: false`.
