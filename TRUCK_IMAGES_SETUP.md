# Truck Images Setup

To complete the truck type selector UI, you need to add truck type images to the public folder.

## Required Images

Copy the following images from `sample/trucks/addtruck_files/` to `public/images/trucks/`:

1. **lcv.png** - Mini Truck / LCV
2. **open_truck.png** - Open Body Truck
3. **closed_truck.png** - Closed Container
4. **trailer.png** - Trailer
5. **tanker.png** - Tanker
6. **tipper.png** - Tipper
7. **bus.png** - Other

## Directory Structure

```
public/
  images/
    trucks/
      lcv.png
      open_truck.png
      closed_truck.png
      trailer.png
      tanker.png
      tipper.png
      bus.png
```

## Copying Images

Run this PowerShell command from the project root:

```powershell
# Create the directory
New-Item -ItemType Directory -Force -Path "public\images\trucks"

# Copy the images
Copy-Item "sample\trucks\addtruck_files\lcv.png" "public\images\trucks\"
Copy-Item "sample\trucks\addtruck_files\open_truck.png" "public\images\trucks\"
Copy-Item "sample\trucks\addtruck_files\closed_truck.png" "public\images\trucks\"
Copy-Item "sample\trucks\addtruck_files\trailer.png" "public\images\trucks\"
Copy-Item "sample\trucks\addtruck_files\tanker.png" "public\images\trucks\"
Copy-Item "sample\trucks\addtruck_files\tipper.png" "public\images\trucks\"
Copy-Item "sample\trucks\addtruck_files\bus.png" "public\images\trucks\"
```

After copying the images, the truck type selector will display the proper icons when adding/editing trucks.
