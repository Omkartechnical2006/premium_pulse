# 📰 Premium Pulse
App is live on: https://premium-pulse.onrender.com<br>
**Premium Pulse** is a cutting-edge news aggregator application built with **Next.js 15**, designed to deliver premium content from India's top news publications—**The Times of India Plus (TOI+)**, **The Indian Express Premium**, and **The Hindu Premium**—in a unified, distraction-free environment.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/State_Management-Zustand-orange?style=for-the-badge)

---

## 🚀 Key Features

-   **🌐 Multi-Source Aggregation**
    -   Access premium articles from *The Times of India*, *The Indian Express*, and *The Hindu* in one place.
-   **🔄 Smart Feed Toggle (The Hindu Premium)**
    -   **Default Mode**: Uses RSS feeds to provide accurate publication dates and stable content.
    -   **Latest News Mode**: Leverages advanced server-side scraping to fetch the absolute latest stories in real-time.
-   **⚡ High Performance**
    -   Powered by **Next.js 15** and **Turbopack** for lightning-fast development and rendering.
    -   Server-side HTML parsing using `cheerio` for optimal speed and SEO.
-   **📱 Modern UI/UX**
    -   Built with **Tailwind CSS v4** for a sleek, responsive design.
    -   **Infinite Scroll** implementation for seamless reading.
    -   Distraction-free article viewer.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4
-   **Backend**: Next.js API Routes (Node.js runtime)
-   **Data Processing**:
    -   `cheerio`: For server-side HTML parsing and scraping.
    -   `xml2js` / Custom Parsers: For handling RSS feeds.
-   **State Management**: Zustand
-   **Language**: TypeScript

## 🏗️ Architecture

Premium Pulse uses a proxy architecture to bypass CORS restrictions and normalize data from different sources:

1.  **Client**: The React frontend requests data from its own local API (`/api/toi/...`, `/api/the_hindu/...`).
2.  **Proxy Layer (API Routes)**: 
    -   Fetches raw HTML or JSON from the news provider.
    -   Parses and cleans the data (extracting titles, images, dates, and content).
    -   Returns a standardized JSON format to the frontend.
3.  **Source**: The original news websites (TOI, IE, Hindu).

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   Node.js 18.17 or later
-   npm, pnpm, or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Omkartechnical2006/premium_pulse.git
    cd premium-pulse
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    # or
    pnpm dev
    ```

4.  **Access the app**
    Open [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal) to view the application.

## 📂 Project Structure

```bash
src/
├── app/
│   ├── (server)/api/      # Backend API routes for scraping/fetching
│   ├── the_hindu_premium/ # The Hindu Premium page logic
│   ├── toi_plus/          # TOI Plus page logic
│   └── ...
├── components/            # Reusable UI components
├── lib/                   # Constants, Enums, and Utility functions
├── store/                 # Zustand state management
```

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ using Next.js
</p>
