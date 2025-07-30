#!/usr/bin/env python3
"""
Convert SVG icon to PNG files in required sizes for Chrome extension.
"""

import subprocess
import sys
import os

def create_png_from_svg(svg_file, output_file, size):
    """Convert SVG to PNG using various available tools."""
    
    # Try different conversion methods
    methods = [
        # Method 1: Using cairosvg (Python library)
        lambda: convert_with_cairosvg(svg_file, output_file, size),
        # Method 2: Using rsvg-convert (librsvg)
        lambda: convert_with_rsvg(svg_file, output_file, size),
        # Method 3: Using ImageMagick
        lambda: convert_with_imagemagick(svg_file, output_file, size),
        # Method 4: Using Inkscape
        lambda: convert_with_inkscape(svg_file, output_file, size)
    ]
    
    for method in methods:
        try:
            method()
            print(f"✓ Created {output_file} ({size}x{size})")
            return True
        except Exception as e:
            continue
    
    print(f"✗ Failed to create {output_file}")
    return False

def convert_with_cairosvg(svg_file, output_file, size):
    """Convert using cairosvg Python library."""
    import cairosvg
    cairosvg.svg2png(url=svg_file, write_to=output_file, output_width=size, output_height=size)

def convert_with_rsvg(svg_file, output_file, size):
    """Convert using rsvg-convert command."""
    subprocess.run([
        'rsvg-convert', '-w', str(size), '-h', str(size), 
        svg_file, '-o', output_file
    ], check=True)

def convert_with_imagemagick(svg_file, output_file, size):
    """Convert using ImageMagick convert command."""
    subprocess.run([
        'convert', '-background', 'transparent', 
        '-size', f'{size}x{size}', svg_file, output_file
    ], check=True)

def convert_with_inkscape(svg_file, output_file, size):
    """Convert using Inkscape command."""
    subprocess.run([
        'inkscape', '--export-png', output_file, 
        '--export-width', str(size), '--export-height', str(size), svg_file
    ], check=True)

def main():
    svg_file = 'icon.svg'
    sizes = [(16, 'icon16.png'), (48, 'icon48.png'), (128, 'icon128.png')]
    
    if not os.path.exists(svg_file):
        print(f"Error: {svg_file} not found!")
        return
    
    print("Converting SVG to PNG icons...")
    
    success_count = 0
    for size, filename in sizes:
        if create_png_from_svg(svg_file, filename, size):
            success_count += 1
    
    if success_count == 0:
        print("\nNo conversion tools found. Please install one of:")
        print("- pip install cairosvg")
        print("- brew install librsvg (for rsvg-convert)")
        print("- brew install imagemagick")
        print("- brew install inkscape")
        print("\nOr create the PNG files manually from icon.svg")
    else:
        print(f"\n✓ Successfully created {success_count}/3 icon files!")

if __name__ == "__main__":
    main()
