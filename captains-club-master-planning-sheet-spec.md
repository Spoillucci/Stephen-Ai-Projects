# Captains Club Master Planning Sheet — Structure Specification

A single workbook to track resort outreach, qualification, proposals, and final ranking. Build it in Google Sheets or Excel. Each tab has a defined purpose, column set, and controlled vocabulary so entries stay comparable across resorts.

**How to use**

- One row per resort on every tab. Use the resort's official name as the key field so tabs can be linked.
- Fill Tab 1 (Pipeline) the moment you identify a candidate. Fill Tab 2 (Qualification) as you research. Fill Tabs 3–5 only after a proposal arrives. Tab 6 is a running log.
- Do not score or rank a resort on Tab 5 until every mandatory criterion on Tab 2 is "Pass" and Tab 3 pricing is verified. This mirrors the framework rule: no ranking with pending pricing.
- Keep all evidence (screenshots, proposal PDFs, email threads) in a shared Drive folder and paste the link URL into the relevant column.

---

## Tab 1 — Pipeline Tracker

High-level status of every resort under consideration. This is your at-a-glance dashboard.

| Column | Type | Notes |
|---|---|---|
| Resort Name | Text | Official name; use as the key across all tabs |
| Country / Destination | Text | e.g., "Mexico — Riviera Cancun" |
| Nearest International Airport | Text | IATA code + name, e.g., "CUN — Cancún Intl" |
| Pipeline Status | Dropdown | Not contacted / RFP sent / Proposal received / Under review / Shortlisted / Confirmed / Eliminated |
| Date RFP Sent | Date | |
| Date Proposal Due | Date | The deadline you gave the resort |
| Date Proposal Received | Date | Blank until received |
| Days to Decision | Formula | Decision date minus today |
| Overall Qualification | Dropdown | Pass / Fail / Pending |
| Pricing Status | Dropdown | Verified — group quote / Verified — direct booking / Conditional — 2026 benchmark / Pending / Unverified |
| Final Recommendation | Dropdown | Recommend / Hold / Eliminate |
| Notes | Text | One-line status note |
| Owner | Text | Who is managing this resort |

---

## Tab 2 — Qualification Checklist

Every mandatory criterion from the framework. Each row is a resort; each criterion column is Pass / Fail / Pending plus an evidence link. A resort is "Pass" overall only when every column is Pass.

| Column | Type | Notes |
|---|---|---|
| Resort Name | Text | Key |
| 5-Star Marketed | Dropdown | Pass / Fail / Pending |
| 5-Star Evidence URL | URL | Link to official page |
| Adults-Only | Dropdown | Pass / Fail / Pending |
| Adults-Only Evidence URL | URL | |
| True All-Inclusive | Dropdown | Pass / Fail / Pending |
| All-Inclusive Evidence URL | URL | |
| 4+ À La Carte Restaurants | Dropdown | Pass / Fail / Pending |
| Restaurant Names | Text | List the qualifying restaurants |
| Modern Suites | Dropdown | Pass / Fail / Pending |
| <40 Min Road Transfer | Dropdown | Pass / Fail / Pending |
| Verified Drive Time (min) | Number | Minutes from airport |
| Transfer Evidence URL | URL | Google Maps or official directions |
| Dedicated Events Team | Dropdown | Pass / Fail / Pending |
| Events Team Contact | Text | Name / title / email |
| Welcome Reception Venue | Text | Venue name or "TBD" |
| Farewell Dinner Venue | Text | Venue name or "TBD" |
| Elimination Reason | Text | Required if any column is Fail |
| Overall Qualification | Formula | Pass only if all criteria Pass |

---

## Tab 3 — Proposal Comparison

Financial and contractual terms from each official proposal. One row per resort. This is where you compare dollars and terms side by side.

| Column | Type | Notes |
|---|---|---|
| Resort Name | Text | Key |
| Proposal Date | Date | Date the resort issued the proposal |
| Contact Name | Text | |
| Contact Title | Text | |
| Contact Email | Text | Must be official resort domain |
| Room Category Quoted | Text | Standard suite |
| Upgraded Suite Option | Text | |
| Bedding | Text | King / Double / Other |
| Nightly Rate (USD) | Number | Per room, per night |
| Taxes & Fees Included? | Dropdown | Yes / No / Partial |
| 3-Night Total Per Room (USD) | Number | All-in, including taxes and fees |
| Within $2,500 Budget? | Formula | Yes / No |
| All-Inclusive Inclusions | Text | Summary of what is included |
| All-Inclusive Exclusions | Text | What is NOT included |
| Private Event Charges | Text | F&B minimums, AV, staffing, porterage |
| Mandatory Group Charges | Text | Resort fees, service charges, event fees |
| Deposit Required | Text | Amount and due date |
| Attrition Terms | Text | |
| Cancellation Terms | Text | |
| Proposal Expiration Date | Date | |
| Construction Disclosures | Text | Any for May 2027 |
| Proposal Document URL | URL | Link to the PDF or email |
| Pricing Verified? | Dropdown | Yes / No |
| Pricing Source | Dropdown | Group quote / Direct booking |

---

## Tab 4 — Events & Excursions

Tracks the experience side: what each resort can actually deliver for the program's events and offsite activities.

| Column | Type | Notes |
|---|---|---|
| Resort Name | Text | Key |
| Welcome Reception Venue | Text | |
| Welcome Reception Capacity | Number | |
| Cocktail Reception Venue | Text | |
| Awards Ceremony Venue | Text | |
| Farewell Dinner Venue | Text | |
| Farewell Dinner Capacity | Number | |
| Indoor Backup Available? | Dropdown | Yes / No / TBD |
| AV Equipment Included? | Dropdown | Yes / No / Partial |
| F&B Minimum (USD) | Number | If stated |
| Excursion 1 | Text | Name and description |
| Excursion 2 | Text | |
| Excursion 3 | Text | |
| Excursion 4 | Text | |
| Excursion Suitability Notes | Text | Appropriate for 30 executives? |
| Reference 1 | Text | Comparable incentive group hosted |
| Reference 2 | Text | |

---

## Tab 5 — Scoring & Ranking

The framework's evaluation categories, scored 1–10. Fill only after Tabs 2 and 3 are complete. The weighted total drives the final ranking.

| Column | Type | Notes |
|---|---|---|
| Resort Name | Text | Key |
| Luxury Experience (1–10) | Number | |
| Executive Atmosphere (1–10) | Number | |
| Service (1–10) | Number | |
| Dining (1–10) | Number | |
| Event Capability (1–10) | Number | |
| Calm & Relaxing (1–10) | Number | |
| Excursion Quality (1–10) | Number | |
| Airport Convenience (1–10) | Number | |
| BOS–PVG Travel Balance (1–10) | Number | |
| Value (1–10) | Number | Based on group quote |
| Raw Total | Formula | Sum of all scores |
| Weighted Total | Formula | Apply weights below |
| Rank | Formula | 1 = best |
| Key Strengths | Text | |
| Meaningful Weaknesses | Text | |
| Red Flags | Text | |
| Executive Test: CEO-Appropriate? | Dropdown | Yes / No |
| Executive Test: Four Seasons-Level? | Dropdown | Yes / No |
| Executive Test: Photo-Worthy? | Dropdown | Yes / No |
| Executive Test: Exceeds Marriott/Hilton? | Dropdown | Yes / No |
| Executive Test: Worth $150K+? | Dropdown | Yes / No |
| Final Recommendation | Dropdown | Recommend / Hold / Eliminate |

**Suggested weights (customize with your manager):**

| Category | Weight |
|---|---|
| Luxury Experience | 15% |
| Executive Atmosphere | 15% |
| Service | 15% |
| Dining | 10% |
| Event Capability | 10% |
| Calm & Relaxing | 10% |
| Excursion Quality | 5% |
| Airport Convenience | 5% |
| BOS–PVG Travel Balance | 10% |
| Value | 5% |

---

## Tab 6 — Communication Log

A running record of every interaction with each resort. Multiple rows per resort over time.

| Column | Type | Notes |
|---|---|---|
| Resort Name | Text | Key |
| Date | Date | |
| Direction | Dropdown | Outbound / Inbound |
| Channel | Dropdown | Email / Phone / Video call |
| Contact Name | Text | |
| Summary | Text | What was discussed or sent |
| Action Item | Text | Next step and owner |
| Action Due Date | Date | |
| Document URL | URL | Link to any attachment |

---

## Controlled vocabularies

Use these exact values in dropdown columns so filtering and pivots work cleanly.

- **Pipeline Status:** Not contacted, RFP sent, Proposal received, Under review, Shortlisted, Confirmed, Eliminated
- **Qualification:** Pass, Fail, Pending
- **Pricing Status:** Verified — group quote, Verified — direct booking, Conditional — 2026 benchmark, Pending, Unverified
- **Final Recommendation:** Recommend, Hold, Eliminate
- **Yes/No columns:** Yes, No, Partial, TBD
