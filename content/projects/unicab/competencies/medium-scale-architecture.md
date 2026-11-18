---
title: "Medium-scale architecture"
kind: "UniCab · CSC-324 · Basic · Development"
diagram: "backend-layers"
---

Our app, UniCab, in short, is a client-server program, where each student’s iPhone acts as a client, while our Supabase backend is the server that stores everything about the application (data) and enforces all the rules.

Throughout our project, I have focused primarily on the backend; therefore, it will be the component I will be focusing on. In particular, this component follows a layered architecture (several parts with unique responsibilities). First, our backend has an API layer, which is our only door between the phone and the server. When a student clicks on a button, the iOS application sends a request, and the API layer is the first to receive it. The PostgREST API receives the app’s HTTPS requests and communicates with our database, either to get the data from the tables or to call specific database functions. Then comes the logic layer, where our SQL and PL/pgSQL functions and triggers live. These functions are responsible for processing the requests, applying the application’s rules, and handling operations such as creating rides and accepting bookings. Finally, the data layer, built on PostgreSQL 17, stores the actual information in database tables and views.

In addition to those layers, there are also several components that play an important part in the proper functioning of the backend. Supabase Auth manages student authentication through email verification codes, while Row-Level Security (RLS) policies and database permissions control who can access specific information and functions. Supabase Realtime allows messages to appear in chats as they arrive, and Supabase Storage handles profile pictures. We also use pg_cron to expire ride requests that were never answered.
