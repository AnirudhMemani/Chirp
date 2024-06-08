# P2P WebRTC Chat Application
A peer-to-peer (P2P) video chat application with text chat functionality, similar to Omegle. The application uses WebRTC communication and websockets for real-time video and text chat.

# Features

+ Peer-to-Peer Video Chat: Connects users directly for a seamless video chat experience using WebRTC.
+ Text Chat: Integrated text chat feature for sending messages during video calls.
+ Random Matching: Automatically matches users randomly for a chat session.
+ Responsive Design: Optimized for both desktop and mobile devices.

# Tech Stack

+ Frontend: React.js
+ Backend: Node.js, Express
+ WebRTC: RTCPeerConnection for handling WebRTC connections.
+ Websockets: ws library for real-time communication.

# Getting Started

## Prerequisites

Ensure you have the following installed on your machine:

Node.js (>= 14.x)
npm (>= 6.x) or yarn (>= 1.x)

# Installation

1. Clone the repository:

```
git clone https://github.com/AnirudhMemani/serendipity.git
cd serendipity
```

2. Install dependencies:

```
cd frontend
npm install
```

```
cd ../backend
npm install
```

3. Run the development server from root directory:

```
npm run dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the application.

# The application uses WebRTC for establishing peer-to-peer connections and WebSockets for signaling. Below is a brief overview of how these technologies are integrated:

# WebRTC

+ simple-peer: A lightweight wrapper around WebRTC to simplify peer-to-peer connections.
+ Video Component: Manages the local and remote video streams using WebRTC.

# WebSockets

+ Server: Handles signaling for WebRTC connection setup and messaging between clients.
+ Client: Manages socket connections and handles events for user connections and messaging.

# Contributing

We welcome contributions from the community! Please fork the repository and submit a pull request with your changes. Make sure to follow the code style and add appropriate tests.

