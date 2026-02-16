Overview

This project is a simple, real-time polling web application that allows anyone to create a poll, share it via a link, and collect votes while results update live for all viewers.

The focus of this project was not only to make something functional, but to ensure correctness, real-time behavior, persistence, and reasonable safeguards against abusive voting — while keeping the system simple and easy to understand.

How It Works

1. A user creates a poll by entering a question and at least two options.

2. Once created, the app generates a unique shareable URL for the poll.

3. Anyone with the link can open the poll and vote for a single option.

4. When a vote is cast, results update in real time for all users currently viewing the poll.

5. Polls and votes are persisted, so refreshing the page or opening the link later does not lose data.

Tech Stack

1. Frontend: Next.js (React)

2. Backend / Database: Supabase (PostgreSQL + Realtime)

3. Realtime Updates: Supabase Realtime (WebSockets)

Hosting: Vercel

1. This stack was chosen to keep the architecture minimal while still supporting real-time updates and persistent storage.

2. Real-Time Updates

3. Real-time behavior is achieved using Supabase Realtime.

4. The client subscribes to changes on the votes table.

5. When a new vote is inserted, Supabase broadcasts the change via WebSockets.

6. All connected clients listening to that poll receive the update instantly.

7. The voting user also sees immediate feedback using an optimistic UI update, while the realtime stream keeps everyone in sync.

8. This approach avoids manual refreshes and works well even with multiple users voting simultaneously.

Fairness / Anti-Abuse Measures

To reduce repeat or abusive voting, the app includes two independent safeguards.

1. Browser-Level Protection (Local Storage)

i) After a user votes, a flag is stored in localStorage for that poll.

What this prevents

1. Accidental double voting

2. Refresh-based repeat voting

3. Multiple clicks from the same browser

Limitations

i) Can be bypassed by clearing browser storage

ii) Does not stop voting from a different browser or device

2. Server-Side IP Hashing + Database Constraint

i) Each vote is associated with a hashed IP address on the server.
ii) The database enforces a unique constraint on (poll_id, ip_hash).

What this prevents

i) Voting multiple times from the same IP

ii) Multi-tab abuse

iii) Simple scripted attacks from a single source

Limitations

i) Shared networks (e.g. college or office Wi-Fi)

ii) VPN usage or frequently changing IPs

iii) Together, these two mechanisms provide reasonable protection for a lightweight polling app without requiring user authentication.

Persistence

1. Polls and votes are stored in a PostgreSQL database.

2. Refreshing the page does not reset results.

3. Poll links continue to work after the session ends.

4. Data remains available as long as the database exists.

 Edge Cases Handled

1. Page refresh during voting

2. Multiple users voting at the same time

3. Preventing duplicate votes from the same browser

4. Disabled voting after submission

5. Poll not found handling

6. Optimistic UI updates without breaking real-time sync

Known Limitations & Future Improvements

1. If this project were extended further, the following improvements would be considered:

2. User authentication (accounts or magic links)

3. Poll expiration or closing polls

4. Admin controls (reset or delete polls)

5. Rate limiting at the API level

6. Accessibility improvements

7.Advanced analytics and vote breakdowns
