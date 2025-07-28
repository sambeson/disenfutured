# DISENFUTURED - Official Band Website

A retro Windows 98/99 style website for the hardcore punk band DISENFUTURED. Experience the underground scene through authentic 90s web aesthetics!

## 🎸 Features

- **Authentic Windows 98/99 UI**: Complete with taskbar, start menu, and draggable windows
- **Band Information**: About section with member details and bio
- **Show Listings**: Upcoming gigs and concert information
- **Merchandise Store**: Product listings with buy buttons
- **Social Media Integration**: Links to Instagram, Bandcamp, Spotify, and more
- **Interactive Elements**: Draggable windows, sound effects simulation, easter eggs
- **Responsive Design**: Works on desktop and mobile devices
- **GitHub Pages Ready**: Deploy directly to GitHub Pages

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Customize** the content for your band (see customization guide below)
4. **Deploy** to GitHub Pages or your preferred hosting service

## 🎨 Customization Guide

### Band Information
Edit the following in `index.html`:

- **Band Name**: Replace "DISENFUTURED" throughout the file
- **Member List**: Update the member names in the About window section
- **Band Bio**: Modify the biography text in the about section
- **Formation Year**: Add your band's formation year

### Shows & Events
In the Shows window section:
- Update dates, venues, and supporting acts
- Modify ticket links to point to your actual ticket vendors
- Add or remove show listings as needed

### Social Media Links
Update the links in the Music & Links window:
- **Instagram**: Replace `#` with your Instagram URL
- **Bandcamp**: Add your Bandcamp profile link
- **Spotify**: Link to your Spotify artist page
- **YouTube**: Connect to your YouTube channel
- **Facebook/Twitter**: Add your social media profiles

### Merchandise
Customize the merch section:
- Replace placeholder items with your actual products
- Update prices and descriptions
- Connect "BUY NOW" buttons to your store (PayPal, Shopify, etc.)
- Add product images (see Images section below)

### Contact Information
Update email addresses and contact methods:
- Change `booking@disenfutured.com` to your booking email
- Update `info@disenfutured.com` to your general contact email
- Modify contact methods as needed

## 🖼️ Adding Images

The website expects images in the `/images/` directory:

### Required Images:
- `windows-logo.png` - Windows logo for start button (16x16px)
- `icon.ico` - Window icon (16x16px)
- `skull-flame.gif` - Animated GIF for main page
- `my-computer.png` - Desktop icon (32x32px)
- `recycle-bin.png` - Desktop icon (32x32px)
- `internet-explorer.png` - Desktop icon (32x32px)

### Adding Your Own Images:
1. Create or find appropriate 90s-style graphics
2. Use tools like GIMP or Photoshop to create animated GIFs
3. Keep file sizes small for authentic 90s web experience
4. Consider using dithered/pixelated graphics for authenticity

### Image Resources:
- **Free 90s Icons**: Search for "Windows 98 icons" or "pixel art icons"
- **GIF Makers**: Use online tools to create animated GIFs
- **Skull/Flame Graphics**: Search for "pixel art skull" or create your own

## 🎵 Music Integration

### Bandcamp Integration:
Replace the placeholder music player with an embedded Bandcamp player:
```html
<iframe style="border: 0; width: 100%; height: 120px;" 
        src="https://bandcamp.com/EmbeddedPlayer/album=YOUR_ALBUM_ID/size=large/bgcol=c0c0c0/linkcol=0000ff/">
</iframe>
```

### Spotify Integration:
Embed Spotify players using their iframe embed code from Spotify for Artists.

## 🛠️ Advanced Customization

### Colors & Styling
Modify CSS variables in `styles.css`:
```css
:root {
    --win98-gray: #c0c0c0;     /* Main UI color */
    --win98-blue: #0000ff;     /* Accent color */
    --win98-red: #ff0000;      /* Error/highlight color */
}
```

### Adding New Windows
1. Copy an existing window structure in `index.html`
2. Give it a unique ID
3. Add a start menu item that calls `openWindow('yourWindowId')`
4. Style it in `styles.css`

### Easter Eggs
The site includes several easter eggs:
- **Konami Code** (↑↑↓↓←→←→BA): Shows a message
- **Alt+F4**: Displays a humorous error
- **Ctrl+Alt+Delete**: Shows task manager joke
- **Random window shaking**: Simulates 90s instability
- **Very rare BSOD**: Blue screen easter egg (0.1% chance)

## 🌐 Deployment

### GitHub Pages:
1. Push your customized code to a GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://yourusername.github.io/repository-name`

### Other Hosting:
- **Netlify**: Drag and drop the folder to Netlify
- **Vercel**: Connect your GitHub repository
- **Traditional Web Hosting**: Upload all files via FTP

## 📱 Mobile Optimization

The site is designed to work on mobile devices with:
- Responsive window sizing
- Touch-friendly buttons
- Readable text on small screens
- Simplified layouts on narrow screens

## 🐛 Troubleshooting

### Images Not Loading:
- Check that image files exist in `/images/` directory
- Verify file names match exactly (case-sensitive)
- Use placeholder text or Unicode symbols if images are missing

### Windows Not Dragging:
- Ensure JavaScript is enabled
- Check browser console for errors
- Verify `script.js` is loading correctly

### Links Not Working:
- Replace all `#` placeholders with actual URLs
- Test links before deploying
- Use `target="_blank"` for external links

## 🎤 Band-Specific Tips

### For Hardcore/Punk Bands:
- Use aggressive fonts and colors
- Add more animated elements for energy
- Include venue/show safety information
- Add links to local scene resources

### For Other Genres:
- Adjust color schemes to match your aesthetic
- Modify language/tone in text content
- Change animated elements to suit your style
- Customize window themes and layouts

## 🤝 Contributing

Feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests with improvements
- Share your customized versions

## 📄 License

This project is open source. Feel free to use, modify, and distribute for your band or project.

## 🔗 Credits

- Windows 98/99 UI inspiration from Microsoft
- Retro web design elements from 90s internet culture
- Built with vanilla HTML, CSS, and JavaScript for maximum compatibility

---

**DISENFUTURED** - Bringing the underground to the digital realm since 2025 🤘

*Keep the 90s alive, keep the music loud!*