Overview

This project is a simple, real-time polling web application that allows anyone to create a poll, share it via a link, and collect votes while results update live for all viewers.

The focus of this project was not only to make something functional, but to ensure correctness, real-time behavior, persistence, and reasonable safeguards against abusive voting — while keeping the system simple and easy to understand.

How It Works

A user creates a poll by entering a question and at least two options.

Once created, the app generates a unique shareable URL for the poll.

Anyone with the link can open the poll and vote for a single option.

When a vote is cast, results update in real time for all users currently viewing the poll.

Polls and votes are persisted, so refreshing the page or opening the link later does not lose data.

Tech Stack

Frontend: Next.js (React)

Backend / Database: Supabase (PostgreSQL + Realtime)

Realtime Updates: Supabase Realtime (WebSockets)

Hosting: Vercel

This stack was chosen to keep the architecture minimal while still supporting real-time updates and persistent storage.

Real-Time Updates

Real-time behavior is achieved using Supabase Realtime.

The client subscribes to changes on the votes table.

When a new vote is inserted, Supabase broadcasts the change via WebSockets.

All connected clients listening to that poll receive the update instantly.

The voting user also sees immediate feedback using an optimistic UI update, while the realtime stream keeps everyone in sync.

This approach avoids manual refreshes and works well even with multiple users voting simultaneously.

Fairness / Anti-Abuse Measures

To reduce repeat or abusive voting, the app includes two independent safeguards.

1. Browser-Level Protection (Local Storage)

After a user votes, a flag is stored in localStorage for that poll.

What this prevents

Accidental double voting

Refresh-based repeat voting

Multiple clicks from the same browser

Limitations

Can be bypassed by clearing browser storage

Does not stop voting from a different browser or device

2. Server-Side IP Hashing + Database Constraint

Each vote is associated with a hashed IP address on the server.
The database enforces a unique constraint on (poll_id, ip_hash).

What this prevents

Voting multiple times from the same IP

Multi-tab abuse

Simple scripted attacks from a single source

Limitations

Shared networks (e.g. college or office Wi-Fi)

VPN usage or frequently changing IPs

Together, these two mechanisms provide reasonable protection for a lightweight polling app without requiring user authentication.

Persistence

Polls and votes are stored in a PostgreSQL database.

Refreshing the page does not reset results.

Poll links continue to work after the session ends.

Data remains available as long as the database exists.

Edge Cases Handled

Page refresh during voting

Multiple users voting at the same time

Preventing duplicate votes from the same browser

Disabled voting after submission

Poll not found handling

Optimistic UI updates without breaking real-time sync

Known Limitations & Future Improvements

If this project were extended further, the following improvements would be considered:

User authentication (accounts or magic links)

Poll expiration or closing polls

Admin controls (reset or delete polls)

Rate limiting at the API level

Accessibility improvements

Advanced analytics and vote breakdowns
