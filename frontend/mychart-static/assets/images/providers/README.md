# Provider Images

This directory should contain provider photos. Please add the following images:

## Required Images:

1. **muna-bahsali.jpg** - Photo of Muna Bahsali, NP (Primary Care Provider)
   - Recommended size: 200x200px or larger (square)
   - Format: JPG, PNG, or WebP

2. **victor-anyangwe.jpg** - Photo of Victor Anyangwe, MD (Orthopedic Surgery)
   - Recommended size: 200x200px or larger (square)
   - Format: JPG, PNG, or WebP

3. **shahid-mahmood.jpg** - Photo of Shahid Mahmood, MD (Primary Care Provider)
   - Recommended size: 200x200px or larger (square)
   - Format: JPG, PNG, or WebP

4. **rhamee-badr.jpg** - Photo of Rhamee Badr, MD (Orthopedics)
   - Recommended size: 200x200px or larger (square)
   - Format: JPG, PNG, or WebP

## Image Guidelines:

- Images should be professional headshots
- Square aspect ratio works best (1:1)
- Minimum size: 200x200px
- Maximum file size: 500KB per image
- Supported formats: JPG, PNG, WebP

## Fallback Behavior:

If an image is not found, the application will:
1. Try to load the image from the specified path
2. If that fails, display the provider's initials in a colored circle
3. If that also fails, use a placeholder avatar service

## Adding New Providers:

When adding a new provider, add their photo to this directory with the naming convention:
`firstname-lastname.jpg` (all lowercase, hyphens for spaces)

Then update the provider's `photo` property in the component to point to:
`/assets/images/providers/firstname-lastname.jpg`

