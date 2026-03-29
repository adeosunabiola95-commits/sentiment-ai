# Sentiment.ai — V2 roadmap (one page)

Priorities: **Must** = ship-blocking or core product promise · **Should** = high leverage, near-term · **Could** = nice-to-have or later experiments.

---

## Must

| Item | Why |
| --- | --- |
| **Virtualized pair list** | Remove the 500-row cap without jank; full catalog must remain usable when search returns large sets. |
| **Batch or cached FX quotes** | One server endpoint or short-TTL cache for picker prices; avoids hammering `/forex/daily` and speeds modal open. |
| **Stable analyze + API contract** | Document and enforce which pairs the analysis backend accepts; graceful degradation when a pair is in the UI catalog but not yet supported server-side. |

---

## Should

| Item | Why |
| --- | --- |
| **Sign up & sign in** | Account creation and login (email/password and/or OAuth), session handling, and protected areas as needed—foundation for saved state, billing, and trust. |
| **Recents & favorites** | Last N pairs + starred pairs (localStorage v1; **sync to account** once sign-in exists). Reduces repeat search friction. |
| **Unified toast layer** | Stack / priority when analysis, news, and errors fire close together; consistent dismiss + a11y live regions. |
| **E2E smoke tests** | Picker open → search → select → analyze; error path; at least one happy path on CI. |
| **Performance budget** | Lighthouse / Core Web Vitals targets for the docs shell + chart + floating bar. |

---

## Could

| Item | Why |
| --- | --- |
| **Alerts & watchlists** | Price or sentiment thresholds; requires persistence and likely auth. |
| **PWA / offline shell** | Cached shell + queue failed analyze retries. |
| **Export** | CSV/PDF of history or single run. |
| **Multi-device sync & org-style features** | Sync favorites/history across devices, shared workspaces, roles—builds on sign-in; larger scope than MVP auth. |
| **Richer charting** | More intervals, compare pairs, annotations. |

---

## Out of scope for this doc

Production ops (hosting, secrets, rate limits), content/marketing, and design polish unless tied to a row above.

*Last updated: 2026-03-28*
