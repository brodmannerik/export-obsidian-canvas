# Obsidian Canvas Viewer

A web application for viewing and interacting with Obsidian Canvas files in a browser. This tool allows you to export and share your Obsidian mind maps and visual notes without requiring the Obsidian app.

![Obsidian Canvas Viewer](public/favicon.ico)

## Features

- **Canvas Visualization**: Render Obsidian canvas files with nodes, connections, and images
- **Interactive Navigation**: Smooth zooming and panning with mouse and touch support
- **Multi-platform Support**: Works on desktop and mobile devices
- **Image Support**: Display images embedded in canvas nodes
- **External Links**: Interact with website links from within canvas nodes
- **Responsive Design**: Adapts to different screen sizes with mobile-optimized interactions
- **Performance Optimized**: Only renders visible portions of large canvases for smooth experience
- **Light/Dark Mode**: Visual theme options for comfortable viewing in any environment

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/export-obsidian-canvas.git

# Navigate to the project directory
cd export-obsidian-canvas

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Usage

1. Place your `.canvas` file in the `public/canvas` directory (default is `Beliefs.canvas`)
2. Add any referenced images to the `public/images` directory
3. Start the application
4. Navigate the canvas:
   - **Pan**: Click and drag or use touch gestures
   - **Zoom**: Mouse wheel or pinch gestures on mobile
   - **Zoom Controls**: Use the buttons in the toolbar

## Deploying Your Canvas

To share your canvas with others:

1. Build the project: `npm run build`
2. Deploy the contents of the `dist` folder to any static web hosting service (GitHub Pages, Netlify, Vercel, etc.)

## Technical Details

This project is built with:

- React 18+ with TypeScript
- Vite build system for optimized performance
- CSS for styling with responsive design principles
- Touch events optimization for mobile devices

## Development

### Project Structure

- `public/canvas`: Canvas JSON files from Obsidian
- `public/images`: Images referenced in canvas files
- `src`: Source code
  - `src/App.tsx`: Main application component
  - `src/App.css`: Styling for the canvas viewer
  - `src/assets`: Static assets for the application

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Your Name

---

_Note: This project is not affiliated with Obsidian. Obsidian is a trademark of Dynalist Inc._
