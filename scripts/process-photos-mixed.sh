#!/bin/bash

# Photo Processing Script - Handles Mixed Portrait & Landscape
# Preserves each photo's original orientation.
#
# Prerequisites:
#   brew install imagemagick
#
# Usage:
#   ./process-photos-mixed.sh /path/to/input /path/to/output
#
# What it does:
#   - Landscape photos: Resize to fit within 1920×1440, maintain ratio
#   - Portrait photos:  Resize to fit within 1440×1920, maintain ratio
#   - Panoramas (width ≥ 2×height): Resize to fit within 3840×1440,
#     maintain ratio — a wider cap so the extra horizontal detail that
#     makes a panorama worth viewing isn't thrown away.
#   - All output: JPEG 80%, metadata stripped
#   - Recurses into subfolders and mirrors the structure to the output.
#     e.g. pre-processed/spain/madrid/IMG_1234.jpg → processed/spain/madrid/spain-madrid-001.jpg
#
# Naming & idempotency:
#   - For two-level <country>/<city>/ layouts, files are renamed to
#     <country>-<city>-NNN.jpg (3-digit, zero-padded, per-city counter).
#   - A hidden `.processed` manifest in each city folder tracks which
#     ORIGINAL filenames have been processed. Re-runs skip these and
#     assign new numbers to genuinely new files (so adding photos
#     a month later just appends spain-madrid-008.jpg, spain-madrid-009.jpg…).
#   - For any other layout, the original filename is kept (with .jpg ext).
#
# Grid cards crop most photos to 4:3 at render time via CSS (object-cover);
# panoramas instead break out onto their own full-width row at their true
# aspect ratio. The lightbox always shows the full untouched ratio.

if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick not found. Install: brew install imagemagick"
    exit 1
fi

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <input_folder> <output_folder>"
    exit 1
fi

INPUT_DIR="${1%/}"
OUTPUT_DIR="${2%/}"

if [ ! -d "$INPUT_DIR" ]; then
    echo "❌ Input folder not found: $INPUT_DIR"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"

TOTAL=$(find "$INPUT_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.heic" \) | wc -l | tr -d ' ')

if [ "$TOTAL" -eq 0 ]; then
    echo "❌ No images found in $INPUT_DIR"
    exit 1
fi

echo "🌍 Travel Photo Processor (Mixed Orientations)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📸 Processing $TOTAL images"
echo "📂 Input:  $INPUT_DIR"
echo "📂 Output: $OUTPUT_DIR"
echo "🎯 Target: Landscape → fit 1920×1440 · Portrait → fit 1440×1920 · Panorama → fit 3840×1440"
echo ""

CURRENT=0
LANDSCAPE_COUNT=0
PORTRAIT_COUNT=0
PANORAMA_COUNT=0

# Use process substitution (not a pipe) so counters survive the loop —
# a piped `while` runs in a subshell and discards its variable updates.
while IFS= read -r FILE; do
    CURRENT=$((CURRENT + 1))
    FILENAME=$(basename "$FILE")

    # Mirror the input subfolder structure under the output dir.
    REL_PATH="${FILE#"$INPUT_DIR"/}"
    REL_DIR=$(dirname "$REL_PATH")
    if [ "$REL_DIR" = "." ]; then
        OUTPUT_SUBDIR="$OUTPUT_DIR"
    else
        OUTPUT_SUBDIR="$OUTPUT_DIR/$REL_DIR"
        mkdir -p "$OUTPUT_SUBDIR"
    fi
    DISPLAY_PATH="${REL_PATH}"

    # Decide output filename. For two-level country/city/ layouts, rename
    # to <country>-<city>-NNN.jpg and use a per-city `.processed` manifest
    # for idempotency. Otherwise fall back to keeping the original name.
    USE_MANIFEST=false
    MANIFEST=""
    if [ "$REL_DIR" != "." ]; then
        IFS='/' read -r -a PATH_PARTS <<< "$REL_DIR"
        if [ "${#PATH_PARTS[@]}" -eq 2 ]; then
            COUNTRY="${PATH_PARTS[0]}"
            CITY="${PATH_PARTS[1]}"
            USE_MANIFEST=true
            MANIFEST="$OUTPUT_SUBDIR/.processed"
        fi
    fi

    if [ "$USE_MANIFEST" = true ]; then
        if [ -f "$MANIFEST" ] && grep -Fxq "$FILENAME" "$MANIFEST"; then
            echo "[$CURRENT/$TOTAL] ⏭️  Skip: $DISPLAY_PATH (already processed)"
            continue
        fi
        if [ -f "$MANIFEST" ]; then
            EXISTING_COUNT=$(wc -l < "$MANIFEST" | tr -d ' ')
        else
            EXISTING_COUNT=0
        fi
        NEXT_COUNT=$((EXISTING_COUNT + 1))
        OUTPUT_FILENAME=$(printf "%s-%s-%03d.jpg" "$COUNTRY" "$CITY" "$NEXT_COUNT")
        OUTPUT_FILE="$OUTPUT_SUBDIR/$OUTPUT_FILENAME"
        if [ -f "$OUTPUT_FILE" ]; then
            echo "[$CURRENT/$TOTAL] ⚠️  Skip: $OUTPUT_FILENAME already exists (manifest out of sync?)"
            continue
        fi
    else
        OUTPUT_FILE="$OUTPUT_SUBDIR/${FILENAME%.*}.jpg"
        OUTPUT_FILENAME=$(basename "$OUTPUT_FILE")
        if [ -f "$OUTPUT_FILE" ]; then
            echo "[$CURRENT/$TOTAL] ⏭️  Skip: $DISPLAY_PATH (exists)"
            continue
        fi
    fi

    echo "[$CURRENT/$TOTAL] 🔄 $DISPLAY_PATH → $OUTPUT_FILENAME"

    # Get dimensions
    if ! DIMS=$(magick identify -format "%w %h" "$FILE" 2>/dev/null); then
        echo "  ❌ Error reading file"
        continue
    fi

    WIDTH=$(echo "$DIMS" | cut -d' ' -f1)
    HEIGHT=$(echo "$DIMS" | cut -d' ' -f2)

    echo "  📐 Original: ${WIDTH}×${HEIGHT}"

    # Determine orientation and resize within the matching bounding box.
    # `>` on the resize geometry means "shrink only" — won't enlarge small originals.
    # Panoramas (WIDTH ≥ 2×HEIGHT — the same 2.0 ratio the PhotoGallery
    # component uses to give them their own row) get a wider 3840px cap so
    # their horizontal detail survives; the 1440 height cap still binds for
    # less-extreme wide shots.
    if [ "$WIDTH" -ge $((HEIGHT * 2)) ]; then
        echo "  🌄 Panorama: fitting within 3840×1440"
        RESIZE_BOX="3840x1440>"
        ORIENTATION=panorama
    elif [ "$WIDTH" -gt "$HEIGHT" ]; then
        echo "  ↔️  Landscape: fitting within 1920×1440"
        RESIZE_BOX="1920x1440>"
        ORIENTATION=landscape
    else
        echo "  ↕️  Portrait: fitting within 1440×1920"
        RESIZE_BOX="1440x1920>"
        ORIENTATION=portrait
    fi

    if magick "$FILE" \
        -auto-orient \
        -resize "$RESIZE_BOX" \
        -quality 80 \
        -strip \
        "$OUTPUT_FILE"; then

        # Only record the original filename in the manifest after a
        # successful encode — otherwise a transient failure would lock
        # us out of retrying that input.
        if [ "$USE_MANIFEST" = true ]; then
            echo "$FILENAME" >> "$MANIFEST"
        fi

        case "$ORIENTATION" in
            panorama)  PANORAMA_COUNT=$((PANORAMA_COUNT + 1)) ;;
            landscape) LANDSCAPE_COUNT=$((LANDSCAPE_COUNT + 1)) ;;
            portrait)  PORTRAIT_COUNT=$((PORTRAIT_COUNT + 1)) ;;
        esac

        SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        NEW_DIMS=$(magick identify -format "%w×%h" "$OUTPUT_FILE")
        echo "  ✅ Output: ${NEW_DIMS}, $SIZE"
    else
        echo "  ❌ Processing failed for $DISPLAY_PATH"
    fi
    echo ""
done < <(find "$INPUT_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.heic" \) | sort)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Processing complete!"
echo ""
echo "📊 Summary:"
echo "   Total: $TOTAL images"
echo "   Landscape: $LANDSCAPE_COUNT"
echo "   Portrait:  $PORTRAIT_COUNT"
echo "   Panorama:  $PANORAMA_COUNT"
echo ""
echo "📂 Output: $OUTPUT_DIR"
