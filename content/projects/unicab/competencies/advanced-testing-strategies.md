---
title: "Advanced testing strategies"
subtitle: "Property-based testing with Hypothesis"
kind: "UniCab · CSC-324 · Advanced · Verification"
---

As of right now, I have not completed this competency; however, my plan is to learn Hypothesis, which is a Python tool for property-based testing that works with pytest. Instead of picking an example, you write a rule that must always be true. Hypothesis generates hundreds of inputs trying to break it, and when one does, it shrinks the input to the simplest one that still fails.

I could start, let’s say, with the ride-search helper functions. For example, I could test that the distance between two locations is always the same no matter which way we are calculating that distance, that the distance from a location to itself is zero, and that the calculated distance never exceeds something unrealistic (e.g., Earth’s circumference).

Next, I would focus on the ride-search functionality and pagination. I want to check that the search works correctly no matter how many rides are available or how many results are shown per page, making sure no rides are missed, repeated, or displayed out of order. Return legs that come along with their way-there ride should not be counted as separate results!

Lastly, I will test the booking process using Hypothesis’s stateful testing. This would allow me to generate different scenarios in which students post rides, request seats, accept or decline bookings, withdraw requests, cancel rides, and remove passengers in random order. After every action, a separate Python model would check that the number of taken seats matches the seats in accepted bookings and never exceeds the number of seats the driver offered.
