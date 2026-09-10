import { getProduct, saveProduct } from "./products.js";

const secretDateNightEN = `# SECRET DATE MISSION — 12 Unusual Date-Night Missions

A ready-to-play real-life mission pack for couples who want something more memorable than dinner and a movie.

## How to play
Choose one mission without telling your partner the exact objective. Agree on a time window and a budget before you start. Every mission can be adapted to your city. Keep every interaction legal, respectful and consensual.

## Mission 01 — The Three-Clue Rendezvous
Pick a meeting place your partner does not know. Send three clues over 60 minutes. Each clue should reveal a different feature of the destination without naming it. Meet there and order or do something neither of you normally chooses.

## Mission 02 — Tourist in Your Own City
Choose an area you both know but usually pass through. Each person must find one place, story, view or detail the other has never noticed. Finish at the discovery you both rate highest.

## Mission 03 — The $20 Adventure
Set a total spending ceiling equivalent to about USD 20. Build a two-hour date around that limit using walking, public spaces, inexpensive food, free exhibits or local events. The constraint is part of the game.

## Mission 04 — Reverse Recommendations
Each person privately chooses an activity they believe the other would enjoy but would never select for themselves. Reveal both options at the same time. Do the cheaper one first.

## Mission 05 — Five Photos, No Selfies
Take five photos that tell the story of the date without showing either person's face. At the end, arrange them in order and give the sequence a title.

## Mission 06 — The Hidden Menu
Find a cafe, restaurant, market or food stall you have never tried. Neither person may order their usual type of food or drink. Each chooses one item for the other within the agreed budget.

## Mission 07 — Memory Coordinates
Each person chooses one location connected to a personal memory they have never fully told the other. Visit one of them and tell the story there.

## Mission 08 — Learn Something in 90 Minutes
Find a legitimate place or person where you can both try a small skill: dance step, drawing technique, local recipe, sport, craft or language phrase. The mission ends when both can demonstrate the basic skill.

## Mission 09 — The Stranger's Choice
Ask a staff member, guide, host or another willing person to choose between two safe activities or destinations you have already shortlisted. Accept their choice and do it.

## Mission 10 — The No-Phone Hour
Choose a walkable area with at least three interesting stops. Put both phones away for one hour except for navigation or emergencies. Each person must identify one thing worth returning to later.

## Mission 11 — The Tiny Gift Hunt
Set a very small equal budget. Separate for 20 minutes in a market, shopping street or neighborhood. Each person finds one object for the other that represents an inside joke, shared goal or memory.

## Mission 12 — Build the Next Mission
After completing any three missions, each partner writes one new mission for the other using this structure: objective, time limit, budget, three rules and proof of completion. Exchange envelopes or messages and schedule one within seven days.

## Scoring
Completed mission: 10 points.
Finished under budget: +2.
Discovered a place neither knew: +2.
Created a lasting artifact — photo sequence, note, sketch or object: +2.
Completed a mission designed by your partner: +3.

## Make it yours
The best version of this pack is local. Replace generic destinations with specific neighborhoods, parks, cafes, markets, galleries, waterfronts or viewpoints in your city. Keep the structure; personalize the route.

Mission complete when you have a story you would not have had on an ordinary night.`;

const personalizedDateEN = `# PERSONALIZED SECRET DATE MISSION

This is a custom digital experience created after purchase using the city, country, occasion and preferences supplied at checkout.

The delivered mission should include:
- A clear mission objective.
- A suggested route or sequence adapted to the buyer's city using only verifiable public places or generic location types when live verification is unavailable.
- A time window and optional budget range.
- Three to five progressive clues.
- Two surprise challenges.
- A scoring system.
- A safe fallback if a suggested stop is unavailable.
- A final reveal or memorable closing activity.

The experience must remain legal, respectful, consensual and suitable for public participation. No invented local facts should be presented as real.`;

export function seedMarketPilotProducts(){
  const seeded:string[]=[];
  const slug="secret-date-mission-12-date-night-adventures";
  if(!getProduct(slug)){
    const p=saveProduct({
      slug,
      title:"Secret Date Mission — 12 Unusual Date-Night Adventures",
      description:"A ready-to-play digital mission pack for couples: 12 unusual, city-flexible date-night adventures designed to turn an ordinary evening into a story.",
      priceUsd:7.9,
      content:secretDateNightEN,
      format:"markdown",
      language:"en",
      targetMarket:"United States, United Kingdom, Canada, Australia",
      tags:["date night","couples","scavenger hunt","digital gift","adventure","mission"],
      active:true
    });
    console.log("[pilot-market] Seeded",p.slug);seeded.push(p.slug);
  }
  const premiumSlug="personalized-secret-date-mission";
  if(!getProduct(premiumSlug)){
    const p=saveProduct({
      slug:premiumSlug,
      title:"Personalized Secret Date Mission — Custom City Adventure",
      description:"A custom date-night mission created around your city, occasion and interests, then delivered to your checkout email.",
      priceUsd:29,
      content:personalizedDateEN,
      format:"markdown",
      language:"en",
      targetMarket:"Global English-speaking market",
      tags:["personalized date night","couples","custom adventure","digital gift","city experience","mission"],
      active:true
    });
    console.log("[pilot-market] Seeded",p.slug);seeded.push(p.slug);
  }
  return seeded;
}
