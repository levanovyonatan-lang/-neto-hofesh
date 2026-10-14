import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from bidi.algorithm import get_display

def bidi_text(text):
    return get_display(text)

def create_feature_graphic():
    width = 1024
    height = 500

    bg_path = r"C:\Users\user\.gemini\antigravity-ide\brain\53bab367-8ac0-4492-a83a-f6b034481775\neto_play_banner_bg_1791915410719.jpg"
    sun_path = r"c:\Users\user\נטו חופש\neto-hofesh\official-sun-neto-transparent.png"
    out_desktop = r"C:\Users\user\Desktop\neto_hofesh_feature_graphic_1024x500.png"
    out_project = r"c:\Users\user\נטו חופש\neto-hofesh\assets\images\feature-graphic-1024x500.png"

    # 1. Base background
    if os.path.exists(bg_path):
        bg = Image.open(bg_path).convert("RGBA")
        bg_ratio = bg.width / bg.height
        target_ratio = width / height
        if bg_ratio > target_ratio:
            new_w = int(bg.height * target_ratio)
            left = (bg.width - new_w) // 2
            bg = bg.crop((left, 0, left + new_w, bg.height))
        else:
            new_h = int(bg.width / target_ratio)
            top = (bg.height - new_h) // 2
            bg = bg.crop((0, top, bg.width, top + new_h))
        bg = bg.resize((width, height), Image.Resampling.LANCZOS)
    else:
        bg = Image.new("RGBA", (width, height), (56, 189, 248, 255))

    # Frosted glass card on the right
    card_w = 540
    card_h = 370
    card_x = 425
    card_y = 65

    # Card shadow
    shadow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.rounded_rectangle(
        [card_x + 8, card_y + 12, card_x + card_w + 8, card_y + card_h + 12],
        radius=36,
        fill=(15, 23, 42, 85)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    bg = Image.alpha_composite(bg, shadow)

    # Card background (White glass with crisp border)
    card_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    card_draw = ImageDraw.Draw(card_layer)
    card_draw.rounded_rectangle(
        [card_x, card_y, card_x + card_w, card_y + card_h],
        radius=36,
        fill=(255, 255, 255, 242),
        outline=(250, 204, 21, 255),
        width=4
    )
    bg = Image.alpha_composite(bg, card_layer)

    # Fonts
    font_bold = "C:/Windows/Fonts/segoeuib.ttf"
    font_title = ImageFont.truetype(font_bold, 66)
    font_subtitle = ImageFont.truetype(font_bold, 24)
    font_badge = ImageFont.truetype(font_bold, 18)

    draw = ImageDraw.Draw(bg)

    # Draw "נטו" in orange (#ea580c) and "חופש" in navy (#0f172a)
    # In RTL, "נטו" is on the right, "חופש" is on the left.
    text_neto = bidi_text("נטו")
    text_hofesh = bidi_text("חופש")

    bbox_neto = font_title.getbbox(text_neto)
    bbox_hofesh = font_title.getbbox(text_hofesh)
    w_neto = bbox_neto[2] - bbox_neto[0]
    w_hofesh = bbox_hofesh[2] - bbox_hofesh[0]
    spacing = 18

    total_title_w = w_neto + spacing + w_hofesh
    # Center the title in the card
    title_start_x = card_x + (card_w - total_title_w) // 2
    title_y = card_y + 35

    # Since we read RTL: right word is "נטו", left word is "חופש"
    x_neto = title_start_x + w_hofesh + spacing
    x_hofesh = title_start_x

    draw.text((x_neto, title_y), text_neto, font=font_title, fill=(234, 88, 12, 255))
    draw.text((x_hofesh, title_y), text_hofesh, font=font_title, fill=(15, 23, 42, 255))

    # Subtitle
    sub_text = bidi_text("ספירה לאחור • בלי שבתות וחגים")
    bbox_sub = font_subtitle.getbbox(sub_text)
    w_sub = bbox_sub[2] - bbox_sub[0]
    sub_x = card_x + (card_w - w_sub) // 2
    sub_y = card_y + 125
    draw.text((sub_x, sub_y), sub_text, font=font_subtitle, fill=(71, 85, 105, 255))

    # Badges (without tofu emojis, using clean text with bullet/stars)
    badges = [
        ("חופשות משרד החינוך", (254, 240, 138), (161, 98, 7)),     # yellow
        ("ימי לימוד נטו בלבד", (254, 215, 170), (194, 65, 12)),     # orange
        ("הספירה לחופש הגדול", (224, 242, 254), (3, 105, 161))      # sky blue
    ]

    badge_y = card_y + 185
    for b_text, b_bg, b_fg in badges:
        text_disp = bidi_text(b_text)
        bbox = font_badge.getbbox(text_disp)
        tw = bbox[2] - bbox[0]
        
        bw = tw + 46
        bh = 40
        bx = card_x + (card_w - bw) // 2
        
        badge_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        b_draw = ImageDraw.Draw(badge_layer)
        b_draw.rounded_rectangle([bx, badge_y, bx + bw, badge_y + bh], radius=20, fill=(*b_bg, 255))
        bg = Image.alpha_composite(bg, badge_layer)
        
        draw = ImageDraw.Draw(bg)
        draw.text((bx + 23, badge_y + 8), text_disp, font=font_badge, fill=(*b_fg, 255))
        badge_y += 50

    # Add official sun logo on the left
    if os.path.exists(sun_path):
        sun = Image.open(sun_path).convert("RGBA")
        sun_size = 370
        sun = sun.resize((sun_size, sun_size), Image.Resampling.LANCZOS)
        
        # Sun shadow
        sun_shadow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        sun_shadow.paste(sun, (55, 75), sun)
        alpha = sun_shadow.split()[3]
        sun_shadow_black = Image.new("RGBA", (width, height), (0, 0, 0, 95))
        sun_shadow_black.putalpha(alpha)
        sun_shadow_black = sun_shadow_black.filter(ImageFilter.GaussianBlur(18))
        bg = Image.alpha_composite(bg, sun_shadow_black)
        
        # Paste sun
        bg.paste(sun, (45, 65), sun)

    # Convert to RGB (Google Play requires JPG or 24-bit PNG without alpha for Feature Graphic)
    final_rgb = bg.convert("RGB")
    final_rgb.save(out_desktop, "PNG")
    
    os.makedirs(os.path.dirname(out_project), exist_ok=True)
    final_rgb.save(out_project, "PNG")

    print(f"Feature graphic successfully created at {out_desktop} ({final_rgb.size})")

if __name__ == "__main__":
    create_feature_graphic()
