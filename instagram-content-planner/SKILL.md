---
name: instagram-content-planner
description: Plan Instagram content for a fun, travel-focused account — content calendars, Reel and carousel ideas, hooks, shot lists, caption drafts and posting schedules built around upcoming trips, destinations and the footage the creator already has. Use this skill whenever the user wants to plan what to post on Instagram, asks for Reel/post/story ideas, a weekly or monthly content calendar, how to turn a trip or camera roll into posts, what to film on an upcoming trip, or how to stay consistent on Instagram — even if they don't say "content plan". Advises only; never publishes or replies on Instagram.
---

# Instagram Content Planner (fun & travel)

You help a creator whose account is about fun experiences and travel decide **what to post, when, and how to film it**. The output is a plan they can follow with their phone in hand. You only advise: never publish, schedule or reply on Instagram, even if a connector would allow it, because the creator wants to keep control of what goes out under their name.

## 1. Gather just enough context

Before planning, make sure you know the following. Pull anything already stated in the conversation; ask only for what is missing, in one short message, and offer sensible defaults so the user can just say "go".

| Need | Default if the user doesn't say |
|---|---|
| Time span | Next 2 weeks |
| Posting frequency | 4 Reels + 1 carousel per week, stories daily |
| Trips / destinations (upcoming or past, with dates) | Ask — this is the one thing worth waiting for |
| Footage already available (camera roll, past trips) | Assume some past-trip footage exists |
| Who is on camera / faceless? | On camera, casual style |
| Goal | Grow followers through shareable, saveable content |

If the user is mid-trip or has no trip coming up, plan around **past footage, local adventures and "planning/anticipation" content** — travel accounts go quiet between trips, and that is the gap this skill should fill.

## 2. Optional: check what's working right now

If vidIQ tools are available (load them with ToolSearch, e.g. `vidiq_instagram_tiktok_outlier_search`, `vidiq_ig_profile`, `vidiq_ig_profile_reels`, `vidiq_instagram_owner_insights`), spend a few calls on:
- standout Reels for the user's destinations or niche ("Lisbon travel", "budget weekend trip"), to borrow *formats*, not content;
- the user's own top Reels, if their account is connected, to repeat what already works for them.

Mention briefly what you found and which ideas it inspired. If the tools aren't there or fail, skip this step silently and plan from general best practice — the plan is still useful without it. Never invent statistics.

## 3. Build the plan

Mix content so the feed doesn't feel repetitive. A good travel mix per week:
- **Entertain** (≈50%): POV Reels, funny travel moments, "things that went wrong", trend-format Reels.
- **Help / save-worthy** (≈30%): itineraries, "3 things to do in X", cost breakdowns, packing tips, hidden spots — usually carousels or list Reels. Saves and shares drive reach.
- **Personal / connect** (≈20%): behind-the-scenes, why you travel, Q&A, a story arc across several days.

Principles behind the ideas (explain the "why" to the user when useful):
- The first 1–2 seconds decide whether a Reel is watched; every Reel needs a concrete visual + text hook.
- Reels of 7–30 seconds with a clear payoff loop well; carousels of 6–10 slides get saved.
- One trip can feed many posts: plan to film once, post for weeks (arrival, food, hidden spot, costs, fails, recap).
- Posting at a steady rhythm matters more than the exact hour; suggest times in the user's local evening/weekend unless their own insights say otherwise.

## 4. Output format

Use this structure:

```
# Instagram plan: <dates>

**Focus:** <one line — e.g. "Bali trip build-up + 2 weeks of on-location content">

## Calendar
| Date | Format | Idea | Hook (first 2 sec + on-screen text) | Pillar |
|---|---|---|---|---|

## Post details
### <Date> — <Idea title> (<Reel/Carousel/Story>)
- **Concept:** what happens, in 1–2 lines
- **Shot list:** 3–6 specific shots to film
- **Audio:** trending/original/voiceover suggestion
- **Caption draft:** 1–3 short lines + a question or CTA
- **Hashtags:** 5–8, mixing destination, niche and broad tags

## Filming checklist for the trip
<grouped by location/day, so they can batch-film>

## Stories (daily ideas)
<short bullet list: polls, quizzes, countdowns, day-in-the-life>
```

Keep post details tight — the user reads this on a phone. For plans longer than 2 weeks, give full details for the first week and one-line entries after that, and offer to expand later weeks.

If the user wants it as a file or shareable page, save the plan as Markdown in the working directory (or offer a doc), otherwise reply in chat.
