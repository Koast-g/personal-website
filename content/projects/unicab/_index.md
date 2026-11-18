---
title: "UniCab"
subtitle: "A ride-sharing app for Grinnell students"
weight: 1
kind: "Team project"
course: "CSC-324, Grinnell College"
when: "Fall 2026"
role: "Backend developer"
team: "Team of three"
summary: "Without a car, getting off campus in Grinnell means asking around in group chats for a ride. UniCab puts it all in one place: drivers post trips they're already taking, riders ask for a seat, and once the driver accepts, the two of them get a chat to sort out the details."
highlights:
  - "Run the app's Supabase backend: the PostgreSQL tables, the rules for who can see what, and the database functions the app calls to post rides, book seats and chat."
  - "Built round-trip booking: riders can book the way there, the way back or both, with seats counted separately for each leg."
  - "Built search across every ride: destinations within 10 miles of where you're going, served a page at a time for infinite scroll."
  - "Keep 380+ automated backend tests that run on every pull request with GitHub Actions."
stack: ["Swift", "SwiftUI", "Supabase", "PostgreSQL", "Python", "pytest", "GitHub Actions"]
visual: "route-map"   # the picture beside the card on the home page (layouts/_partials/visuals/)
stats:
  - value: "380+"
    label: "automated backend tests"
  - value: "3"
    label: "people on the team"
---

## The problem

Without a car, getting off campus in Grinnell usually means asking around in group chats for a ride to Des Moines, the airport or the nearest Costco. UniCab puts all of that in one place, just for Grinnell students.

## How it works

Drivers post trips they're already taking and how many seats they have open. Riders search for a ride that fits where and when they need to go, and ask for a seat. Once the driver accepts, the two of them get a chat to sort out the details. Only `@grinnell.edu` email addresses can sign up.

UniCab is a native iPhone app written in Swift and SwiftUI. Its backend runs on Supabase: a PostgreSQL database where all of the app's rules live (who can see what, and how many seats are left), plus Supabase's sign-in, live updates and file storage.

## My part: the backend

I'm responsible for UniCab's backend. Some of what I built this semester:

- **Booking.** Riders ask for a seat, drivers accept or decline, and requests nobody answers expire on their own. Drivers can also remove a rider, with a note saying why.
- **Round trips.** A rider can book the way there, the way back or both. Seats are counted separately for each leg, so a one-way rider only takes a seat on their leg.
- **Chats.** Once a ride is accepted, the driver and the rider can message each other. The rides you drive for a classmate and the rides they drive for you each get their own chat.
- **Search.** A search that looks through every ride, not just the next few dozen: destinations within 10 miles of where you're going, with the distance shown, served a page at a time for infinite scroll. The app's screens for it come next.
- **Tests.** The backend has 380+ automated tests, written in Python with pytest, that run against the database on every pull request with GitHub Actions.

## Competencies

My answers to the CSC-324 competency questions, with examples from this project, are on their own page: [Competencies]({{< relref "competencies" >}}).
