# 🚀 FundPal: AI-Powered Financial Co-Pilot

![FundPal Banner](https://img.shields.io/badge/FundPal-AI%20Financial%20Assistant-blue?style=for-the-badge&logo=google-gemini)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?style=flat-square&logo=google-gemini)](https://deepmind.google/technologies/gemini/)
[![Expo](https://img.shields.io/badge/Build-Expo-000020?style=flat-square&logo=expo)](https://expo.dev/)

> **"Financial freedom, simplified for the Gig Economy."**

FundPal is a next-generation mobile financial assistant designed for the modern user. It combines **Agentic AI** with a **Neo-Brutalist UI** to make investing, budgeting, and debt management effortless.

---

## 📱 Mobile App Highlights

The FundPal mobile app is the heart of the ecosystem, built with **React Native** and **Expo**.

### 🌟 Key Features

*   **🤖 Agentic AI Assistant**: A conversational financial coach that understands your context.
    *   *Ask*: "I want to buy a car in 3 years."
    *   *Action*: FundPal plans the goal, suggests funds, and executes the investment.
*   **📊 Smart Dashboard**: Real-time view of your Net Worth, Runway, and Financial Health Score.
*   **💡 AI Insights**: The **Insights Tab** analyzes your spending patterns (e.g., "You spent 20% more on food this week") and offers actionable advice.
*   **🎯 Goal-Based Investing**: Create goals (Travel, Emergency, Retirement) and let the AI auto-allocate funds based on your risk profile and timeline.
*   **💸 One-Tap Transactions**: Scan & Pay, Pay Bills, and track expenses seamlessly.
*   **📉 Dynamic Portfolio**: Real-time tracking of your investments with PnL visualization.

---

## 🎨 Design Philosophy

We adopted a **Hybrid Professional Neo-Brutalist** aesthetic:
*   **Dark Mode First**: Sleek, battery-saving, and premium feel (`#09090b` background).
*   **Vibrant Accents**: High-contrast colors (`#3b82f6` Blue, `#a855f7` Purple, `#f59e0b` Amber) for key actions.
*   **Card-Based Layout**: Information is organized in clean, distinct cards with subtle gradients.

---

## 🛠️ Tech Stack

### **Mobile (Frontend)**
*   **Framework**: React Native (Expo)
*   **Styling**: TailwindCSS (`twrnc`), `lucide-react-native` icons.
*   **State Management**: Zustand.
*   **Navigation**: React Navigation (Bottom Tabs, Native Stack).

### **Backend (API)**
*   **Framework**: FastAPI (Python).
*   **AI Engine**: LangChain + Google Gemini 2.5 Flash.
*   **Database**: SQLite (with `pydantic` models).
*   **Services**: `yfinance` for real-time market data.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js & npm
*   Python 3.10+
*   Expo Go app on your phone

### Installation

1.  **Clone the repo**
    ```bash
    git clone https://github.com/yourusername/fundpal.git
    cd fundpal
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    # Create virtual env
    python -m venv venv
    # Activate (Windows)
    .\venv\Scripts\activate
    # Install deps
    pip install -r requirements.txt
    # Run Server
    uv run uvicorn main:app --reload --host 0.0.0.0
    ```

3.  **Mobile Setup**
    ```bash
    cd mobile
    npm install
    npx expo start
    ```
    *Scan the QR code with Expo Go to run on your device!*

---

## 🧠 AI Agents Under the Hood

*   **Orchestrator**: Routes user intent (Investment vs. Advice vs. Transaction).
*   **CoachAgent**: Generates empathetic, literacy-adjusted financial advice.
*   **AllocationAgent**: Builds personalized investment portfolios based on risk & duration.
*   **ObserverAgent**: Parses unstructured user messages into structured data.

---

## 🏆 Hackathon Pitch

**Problem**: Gen Z and Gig workers have irregular income and low financial literacy. Traditional banking apps are boring and complex.

**Solution**: FundPal acts as a **hyper-personalized financial co-pilot**. It doesn't just show charts; it *talks* to you, *plans* for you, and *executes* trades—all through a simple chat interface.

**Why Now?**: With the rise of LLMs, we can finally democratize high-quality financial planning that was previously reserved for the wealthy.

---

Made with ❤️ by Team Up,Up & debug
