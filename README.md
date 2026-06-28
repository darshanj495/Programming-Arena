<div align="center">

<img src="https://img.shields.io/badge/Season%203-Live%20Now-10b981?style=for-the-badge&labelColor=0a0a0f" alt="Season 3 Live" />

# ◈ Algorithmic Arena

### Real-time 1v1 competitive programming battles

**Code faster than your opponent.**

[**Play Now →**](https://programming-arena.vercel.app)

<!-- 🖼️ HERO SCREENSHOT — Replace with your landing/home page screenshot -->
![Algorithmic Arena Hero](https://github.com/user-attachments/assets/873f9723-8142-4b84-a6b3-204158ae13a2)

</div>

---

## What is Algorithmic Arena?

Algorithmic Arena is a **real-time 1v1 competitive coding platform** where two players are matched by ELO rating, given the same algorithmic problem, and race to solve it first. Every submission is judged instantly against hidden test cases. Every second counts. The better coder wins.

Think LeetCode — but against a real person, with a live countdown, a global leaderboard, and your ELO rating on the line.

---

## The Experience

When you open Algorithmic Arena, you pick a difficulty — Easy, Medium, or Hard — and enter the queue. The matchmaking system finds an opponent within ±200 ELO of you and locks you into a room together. A 60-second ready check gives both players a chance to accept. Miss it and you're back in queue.

Once both players accept, the battle begins. You both receive the same problem — a hand-crafted algorithmic challenge pulled from the database based on your chosen difficulty. You have 10 minutes. The Monaco code editor loads up, you pick your language, and you start coding.

Every time you submit, your code is bundled with a language-specific boilerplate and sent to JDoodle's sandboxed execution environment where it runs against hidden test cases. Results come back in under 2 seconds. Pass some tests and your opponent sees your progress bar tick up in real time on their screen — and vice versa. The pressure is mutual and visible.

The first player to pass all test cases wins. If time runs out, whoever passed more tests wins. If it's tied, it's a draw. If your opponent closes their browser mid-match, you get the win and the ELO immediately — no waiting.

<!-- 🖼️ MATCHMAKING FLOW — Replace with a screenshot of queue/matchmaking screen + ready check -->
![Matchmaking & Ready Check](https://github.com/user-attachments/assets/5605157f-4ccd-4950-bf85-62306995e5ce)

---

## Features

**Real-time 1v1 Matchmaking**
Players are queued by difficulty and matched by ELO using WebSockets. The moment two compatible players are found, a private room is created and both are notified simultaneously.

**Live Code Execution**
Submissions are evaluated by the JDoodle API in isolated sandboxes. JavaScript, Python, C++, and Java are all supported. Each problem has a language-specific boilerplate that handles I/O, so players only need to write the solution function — nothing else.

<!-- 🖼️ BATTLE SCREEN — Replace with a screenshot of the Monaco editor mid-battle with opponent progress visible -->
![Battle Screen](https://github.com/user-attachments/assets/5846d417-23e4-4dd9-be64-fedd3c09c3ef)

**Live Opponent Progress**
As your opponent submits code and passes test cases, their progress syncs to your screen in real time via Socket.IO. You can watch the pressure build as their score bar fills up.

**ELO Rating System**
Every match affects your ELO. Win and gain 20 points. Lose and drop 20. Draw and stay put. Rage quit and your opponent gets the 20 instantly as a forfeit bonus. Starting ELO is 1200.

**Tier System**
Players are ranked into four tiers based on ELO — Gold (below 1300), Platinum (1300–1599), Diamond (1600–1999), and Legend (2000+). Tiers are displayed on the global leaderboard.

<!-- 🖼️ LEADERBOARD — Replace with a screenshot of the global leaderboard -->
![Global Leaderboard](https://github.com/user-attachments/assets/f825cc20-b1d3-47e8-a0af-20de66960d0a)

**Global Leaderboard**
The top 100 players are ranked and displayed with their ELO, tier badge, and a proportional ELO bar. If you're outside the top 100, a sticky footer shows your exact rank and ELO at the bottom of the screen.

**Lobby Chat**
While waiting in queue, players can talk to each other in a global lobby chat. Messages are broadcast to everyone in real time via Socket.IO.

**Ready Check**
Before every match starts, both players must accept within 60 seconds. A countdown ring shows the time remaining. If either player fails to accept, both are returned to queue.

**Rage Quit Detection**
If a player disconnects mid-match, the server detects it immediately via the socket disconnect event, awards the remaining player a victory and +20 ELO, and shows them a "Rage Quit" result screen with a randomised taunt about their opponent.

**10-Minute Match Timer**
If neither player solves the problem completely within 10 minutes, the server automatically resolves the match based on how many test cases each player passed.

<!-- 🖼️ RESULT SCREEN — Replace with a screenshot of win/loss/rage-quit result screen -->
![Match Result Screen](https://github.com/user-attachments/assets/44b5184a-9877-44c6-8870-01723ac81ecc)

**Firebase Authentication**
Players sign up and sign in with email and password via Firebase. Their profile is synced to MongoDB on every login, creating the account if it doesn't exist yet.

---

## Problems

The platform currently ships with three problems — one per difficulty tier:

**Easy — Contains Duplicate**
Given an integer array, determine whether any value appears more than once. Tests set membership and basic hash-based lookups.

**Medium — Two Sum (All Pairs)**
Given an array and a target, return all unique index pairs that sum to the target. Tests hash maps and handling multiple valid answers.

**Hard — Trapping Rain Water**
Given an elevation map, compute how much rainwater it can trap. Tests two-pointer technique and spatial reasoning under time pressure.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 5, Framer Motion, Monaco Editor |
| **Backend** | Node.js, Express, Socket.IO |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | Firebase Authentication |
| **Code Execution** | JDoodle API |
| **Deployment** | Vercel (frontend) · Render (backend) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client (Vercel)                     │
│     React + Framer Motion + Monaco Editor               │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS + WebSocket
┌───────────────────────▼─────────────────────────────────┐
│                    Server (Render)                      │
│            Node.js + Express + Socket.IO                │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐   │
│  │ Matchmaking │  │  Game State  │  │  REST APIs    │   │
│  │   Queues    │  │  ELO Engine  │  │  /execute     │   │
│  │ Easy/Med/Hd │  │  Room Scores │  │  /leaderboard │   │
│  └─────────────┘  └──────────────┘  └───────┬───────┘   │
└──────────────────────────────────────────────┼──────────┘
                        │                      │
         ┌──────────────▼──────┐    ┌──────────▼──────────┐
         │   MongoDB Atlas     │    │    JDoodle API      │
         │  Users + Problems   │    │  Code Execution     │
         └─────────────────────┘    └─────────────────────┘
```

---

## ELO & Tiers

| Result | ELO Change |
|---|---|
| Win | +20 |
| Loss | −20 |
| Draw | ±0 |
| Opponent disconnects | +20 (forfeit bonus) |

| Tier | ELO Range |
|---|---|
| 🟢 Gold | < 1300 |
| 🔵 Platinum | 1300 – 1599 |
| 🟣 Diamond | 1600 – 1999 |
| 🟡 Legend | 2000+ |

---

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `join_queue` | Client → Server | Enter matchmaking queue |
| `leave_queue` | Client → Server | Leave queue |
| `match_found` | Server → Client | Match found with problem data |
| `accept_match` | Client → Server | Player accepts ready check |
| `opponent_accepted` | Server → Client | Opponent accepted |
| `match_started` | Server → Client | Both accepted, battle begins |
| `update_progress` | Client → Server | Submission result (tests passed) |
| `opponent_progress` | Server → Client | Opponent's live pass count |
| `match_finished` | Server → Client | Result + ELO change |
| `send_chat` | Client → Server | Send lobby chat message |
| `receive_chat` | Server → Client | Broadcast message to all |
| `match_cancelled` | Server → Client | Ready check timed out |

---

<div align="center">

Built with ⚔️ by [Darshan J](https://github.com/darshanj495)

**[⭐ Star this repo](https://github.com/darshanj495/Programming-Arena)**

</div>
