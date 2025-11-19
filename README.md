# 🐾 Boop - Where Pets Connect

Boop is a modern social media platform designed exclusively for pets and their humans. Share adorable moments, connect with other furry friends, and join a community of pet lovers.

![Boop Banner](screenshots/auth.png)

## ✨ Features

- **Social Feed**: Browse through an endless stream of cute pet photos.
- **"Boop" Interactions**: Show some love by "booping" posts instead of just liking them.
- **Dark & Light Mode**: Fully responsive theme support for day and night browsing.
- **Pet Profiles**: Create unique profiles for your pets with breed, bio, and avatar.
- **Comments & Sharing**: Engage with the community.
- **Secure Authentication**: Powered by Supabase for secure email/password login.
- **Responsive Design**: Works seamlessly on desktop and mobile.

## 📸 Screenshots

### Feed (Dark Mode)
![Feed Dark](screenshots/feed-dark.png)

### Feed (Light Mode)
![Feed Light](screenshots/feed-light.png)

### User Profile
![Profile](screenshots/profile.png)

### Authentication
![Login](screenshots/auth.png)

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites

- Node.js installed
- A Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Boop.git
   cd Boop
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `client` directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Application**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The project uses Supabase with the following main tables:
- `profiles`: Stores user/pet information.
- `posts`: Stores image URLs, captions, and boop counts.
- `comments`: Stores comments on posts.
- `notifications`: Handles user interactions.

## 📄 License

This project is licensed under the MIT License.

---
Created with 💜 by Om Narkhede
