# Gallery System

A dynamic gallery page inspired by Ali Gallop's website with falling/raining effect for pictures and videos.

## Features

- **Falling/Raining Effect**: Gallery items fall from the top of the screen with randomized positions and speeds
- **Touch/Mouse Interaction**: Users can move items up or down by touching/dragging on the screen
- **Admin Panel Integration**: Full CRUD operations for managing gallery items
- **Responsive Design**: Works on desktop and mobile devices
- **Modal View**: Click on items to view them in a full-screen modal
- **Video Support**: Supports both images and videos

## Gallery Page

The gallery page (`gallery.html`) features:

- **Custom Cursor**: A custom cursor that follows mouse movement
- **Falling Animation**: Items continuously fall with randomized speeds and rotations
- **Touch Controls**: On mobile, touch and drag to move items
- **Keyboard Controls**: 
  - `Space` to pause/resume animation
  - `Escape` to close modal
- **Control Buttons**:
  - Pause/Resume animation
  - Reset item positions
  - Fullscreen mode

## Admin Panel

Access the gallery manager through the admin dashboard:

1. Navigate to `/admin/dashboard.html`
2. Click on "Gallery Manager" in the sidebar
3. Use the interface to:
   - Add new gallery items
   - Edit existing items
   - Delete items
   - Randomize item positions
   - Toggle item visibility

### Adding Gallery Items

1. Click "Add New Item" in the gallery manager
2. Fill in the required fields:
   - **Title**: Name of the item
   - **Description**: Optional description
   - **Media Type**: Choose "image" or "video"
   - **Media URL**: URL to the image or video file
   - **Tags**: Comma-separated tags for organization
   - **Display Order**: Order in which items appear
   - **Active**: Toggle visibility on the gallery page

### Item Properties

Each gallery item has these properties:

- **Position**: X and Y coordinates (randomized)
- **Size**: Width and height (randomized)
- **Fall Speed**: How fast the item falls
- **Rotation**: Current rotation angle
- **Tags**: For categorization and filtering

## API Endpoints

### GET /api/gallery
Get all active gallery items

### GET /api/gallery/:id
Get a specific gallery item

### POST /api/gallery
Create a new gallery item (Admin only)

### PUT /api/gallery/:id
Update a gallery item (Admin only)

### DELETE /api/gallery/:id
Delete a gallery item (Admin only)

### POST /api/gallery/:id/randomize
Randomize item position (Admin only)

### GET /api/gallery/tags/all
Get all unique tags

## Database Schema

The gallery items are stored in the `gallery` table with the following structure:

```sql
CREATE TABLE gallery (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    media_url VARCHAR(500) NOT NULL,
    media_type ENUM('image', 'video') NOT NULL,
    thumbnail_url VARCHAR(500),
    tags JSON,
    position_x DECIMAL(5,2) DEFAULT (RAND() * 100),
    position_y DECIMAL(5,2) DEFAULT (RAND() * 100),
    size_width INT DEFAULT (200 + RAND() * 300),
    size_height INT DEFAULT (200 + RAND() * 300),
    fall_speed DECIMAL(3,2) DEFAULT (0.5 + RAND() * 2),
    rotation DECIMAL(5,2) DEFAULT (RAND() * 360),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Setup

1. **Database**: Run the gallery migration:
   ```sql
   source database/gallery.sql
   ```

2. **Server**: Start the server:
   ```bash
   npm start
   ```

3. **Access**: 
   - Gallery page: `http://localhost:3000/gallery.html`
   - Admin panel: `http://localhost:3000/admin/dashboard.html`

## Customization

### Styling
The gallery styles are in `gallery.html`. Key CSS variables:

```css
:root {
    --bg-color: #000000;
    --text-color: #ffffff;
    --accent-color: #ffffff;
    --transition-slow: 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Animation
Modify the animation parameters in the JavaScript:

```javascript
// In gallery.html, update these values:
item.y += item.fallSpeed * 0.02; // Fall speed multiplier
item.rotation += 0.1; // Rotation speed
```

### Admin Panel
The admin panel styles are in `admin/admin.css` under the "Gallery Manager Styles" section.

## Browser Support

- Modern browsers with ES6+ support
- Touch devices for mobile interaction
- Fullscreen API support for fullscreen mode

## Performance

- Uses `requestAnimationFrame` for smooth animations
- Lazy loading for images
- Efficient DOM updates
- Optimized for 60fps performance

## Security

- Input sanitization on all admin inputs
- Authentication required for admin operations
- CORS protection
- Rate limiting on API endpoints 