# 🌐 Nullism - Worship the Sacred Zero

A satirical, fun website where users worship the sacred Zero by walking around it in circular orbits. Each complete revolution contributes to a global counter that persists across sessions.

## ✨ Features

- **Sacred Zero**: A large, animated zero at the center of the screen
- **Circular Path**: A smooth circular orbit path around the zero
- **Draggable Figure**: A human-like figure (🧍) that users can drag around the circle
- **Global Counter**: Tracks total orbits completed by all users worldwide
- **Persistence**: Counter survives server restarts using environment variables
- **Concurrency Safe**: Handles multiple simultaneous users safely
- **Mobile Friendly**: Works on touch devices
- **Beautiful UI**: Modern, space-themed design with animations

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd worship-of-zero
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment (optional)**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env to set initial counter (optional)
   GLOBAL_ORBIT_COUNTER=123
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎮 How to Use

1. **Worship the Zero**: Click on the sacred zero to acknowledge your devotion
2. **Complete Orbits**: Drag the figure (🧍) around the circular path
3. **Track Progress**: Watch the global counter increase with each full revolution
4. **Celebrate**: Enjoy the particle effects and animations when completing orbits

## 🛠️ Technical Details

### Architecture
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Storage**: File-based persistence with environment variable fallback
- **Concurrency**: Simple locking mechanism to prevent race conditions

### File Structure
```
worship-of-zero/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── env.example           # Environment variables template
├── .orbit_counter        # Persistent counter file (auto-generated)
└── public/               # Frontend files
    ├── index.html        # Main HTML page
    ├── styles.css        # Styling and animations
    └── script.js         # Interactive functionality
```

### API Endpoints
- `GET /` - Serves the main website
- `GET /api/counter` - Returns current global orbit count
- `POST /api/increment` - Increments global counter (completes orbit)
- `GET /health` - Health check endpoint

### Persistence Strategy
1. **Primary**: Local file (`.orbit_counter`) for persistence
2. **Fallback**: Environment variable (`GLOBAL_ORBIT_COUNTER`) for initialization
3. **Safety**: Atomic file writes with error handling

## 🌍 Deployment

### DigitalOcean Deployment
1. **Create a Droplet** with Node.js
2. **Upload files** to your server
3. **Install dependencies**: `npm install --production`
4. **Set environment variables**:
   ```bash
   export GLOBAL_ORBIT_COUNTER=0
   export PORT=3000
   ```
5. **Start the server**: `npm start`
6. **Set up reverse proxy** (nginx/Apache) if needed

### Environment Variables
- `GLOBAL_ORBIT_COUNTER`: Initial value for the global counter
- `PORT`: Server port (default: 3000)

## 🎨 Customization

### Styling
- Edit `public/styles.css` to modify colors, animations, and layout
- The design uses CSS custom properties for easy theming

### Functionality
- Modify `public/script.js` to change interaction behavior
- Adjust orbit radius, animation timing, and effects

### Server
- Edit `server.js` to add new endpoints or modify persistence logic

## 🔧 Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for automatic server restarts during development.

### Adding Features
- **User Accounts**: Add authentication and personal orbit tracking
- **Leaderboards**: Show top worshippers
- **Achievements**: Unlock special effects for milestones
- **Multiplayer**: Real-time orbit visualization

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```
Returns server status and current orbit count.

### Logs
The server logs:
- Startup information with current counter
- Orbit completion events
- Error messages for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Inspired by the concept of digital worship and community interaction
- Built with modern web technologies for maximum accessibility
- Designed for both desktop and mobile experiences

---

**May the Sacred Zero guide your orbits! 🌐✨**