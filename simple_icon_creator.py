#!/usr/bin/env python3
"""
Simple icon creator using cairosvg
"""

try:
    import cairosvg
    print("cairosvg imported successfully")
except ImportError as e:
    print(f"Failed to import cairosvg: {e}")
    exit(1)

def create_icon(size, filename):
    """Create PNG icon from SVG"""
    try:
        cairosvg.svg2png(
            url='icon.svg',
            write_to=filename,
            output_width=size,
            output_height=size
        )
        print(f"✓ Created {filename} ({size}x{size})")
        return True
    except Exception as e:
        print(f"✗ Failed to create {filename}: {e}")
        return False

def main():
    print("Creating Chrome extension icons...")
    
    sizes = [
        (16, 'icon16.png'),
        (48, 'icon48.png'),
        (128, 'icon128.png')
    ]
    
    success_count = 0
    for size, filename in sizes:
        if create_icon(size, filename):
            success_count += 1
    
    print(f"\nCompleted: {success_count}/3 icons created successfully!")

if __name__ == "__main__":
    main()
