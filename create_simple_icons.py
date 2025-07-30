#!/usr/bin/env python3
"""
Create simple PNG icons using PIL (Pillow)
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    print("PIL imported successfully")
except ImportError:
    print("PIL not available, installing...")
    import subprocess
    subprocess.run(['pip', 'install', 'pillow'], check=True)
    from PIL import Image, ImageDraw, ImageFont

def create_simple_icon(size, filename):
    """Create a simple icon with PIL"""
    
    # Create image with blue background
    img = Image.new('RGBA', (size, size), (66, 133, 244, 255))  # Chrome blue
    draw = ImageDraw.Draw(img)
    
    # Calculate sizes based on icon size
    margin = size // 8
    tab_width = size // 3
    tab_height = size // 6
    
    # Draw two tabs
    # Tab 1 (white - current)
    tab1_x = margin
    tab1_y = margin + size // 4
    draw.rectangle([tab1_x, tab1_y, tab1_x + tab_width, tab1_y + tab_height], 
                  fill=(255, 255, 255, 255), outline=(0, 0, 0, 255))
    
    # Tab 2 (gray - last used)
    tab2_x = size - margin - tab_width
    tab2_y = margin + size // 4
    draw.rectangle([tab2_x, tab2_y, tab2_x + tab_width, tab2_y + tab_height], 
                  fill=(200, 200, 200, 255), outline=(0, 0, 0, 255))
    
    # Draw arrows between tabs (simple lines)
    arrow_y = tab1_y + tab_height + margin
    arrow_start_x = tab1_x + tab_width + 2
    arrow_end_x = tab2_x - 2
    
    # Draw double arrow
    draw.line([arrow_start_x, arrow_y, arrow_end_x, arrow_y], fill=(255, 255, 255, 255), width=2)
    draw.line([arrow_start_x, arrow_y + 4, arrow_end_x, arrow_y + 4], fill=(255, 255, 255, 255), width=2)
    
    # Arrow heads
    if size >= 32:  # Only draw arrow heads for larger icons
        # Right arrow head
        draw.line([arrow_end_x - 4, arrow_y - 2, arrow_end_x, arrow_y], fill=(255, 255, 255, 255), width=2)
        draw.line([arrow_end_x - 4, arrow_y + 2, arrow_end_x, arrow_y], fill=(255, 255, 255, 255), width=2)
        
        # Left arrow head
        draw.line([arrow_start_x + 4, arrow_y + 2, arrow_start_x, arrow_y + 4], fill=(255, 255, 255, 255), width=2)
        draw.line([arrow_start_x + 4, arrow_y + 6, arrow_start_x, arrow_y + 4], fill=(255, 255, 255, 255), width=2)
    
    # Add "Q" indicator for larger icons
    if size >= 48:
        q_size = size // 8
        q_x = size - q_size - 4
        q_y = size - q_size - 4
        draw.ellipse([q_x, q_y, q_x + q_size, q_y + q_size], fill=(255, 255, 255, 255))
        
        # Try to add Q text (may not work without font)
        try:
            font_size = max(6, q_size // 2)
            draw.text((q_x + q_size//2, q_y + q_size//2), "Q", fill=(66, 133, 244, 255), anchor="mm")
        except:
            pass  # Skip text if font not available
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"✓ Created {filename} ({size}x{size})")

def main():
    print("Creating simple Chrome extension icons...")
    
    sizes = [
        (16, 'icon16.png'),
        (48, 'icon48.png'),
        (128, 'icon128.png')
    ]
    
    for size, filename in sizes:
        create_simple_icon(size, filename)
    
    print("\n✓ All icons created successfully!")
    print("The extension now has proper icons!")

if __name__ == "__main__":
    main()
