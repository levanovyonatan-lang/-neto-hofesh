import re
import os

filepath = r'c:\Users\user\נטו חופש\neto-hofesh\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# The container to replace:
# <div class="social-banner-container" ...> ... </div>
# Inside it, there is <div class="social-icons-row"> ... </div>

# Find the start of the social-banner-container
start_idx = content.find('<div class="social-banner-container"')
if start_idx == -1:
    print("Could not find social-banner-container")
    exit(1)

# Find the end of this div by counting tags (simple heuristic)
# Or we can just use regex. The container ends before <footer class="seo-footer">
end_idx = content.find('<footer class="seo-footer">', start_idx)

container_content = content[start_idx:end_idx]

# Extract the social-icons-row
icons_row_match = re.search(r'(<div class="social-icons-row">.*?)</div>\s*</div>\s*$', container_content, flags=re.DOTALL)
if not icons_row_match:
    print("Could not find icons row")
    exit(1)

icons_row = icons_row_match.group(1) + "</div>" # add the closing div for social-icons-row

# Create the new button to replace the container
new_button = """            <div style="text-align: center; margin-top: 15px; margin-bottom: 30px;">
                <button class="ai-btn" style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);" onclick="document.getElementById('creator-modal').style.display='flex'">
                    <span>✨ הרשתות של יוצר האתר ✨</span>
                </button>
            </div>
"""

# Create the modal
modal_html = f"""
    <!-- Creator Networks Modal -->
    <div id="creator-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.85); z-index: 10000; align-items: center; justify-content: center; backdrop-filter: blur(8px); flex-direction: column;" onclick="this.style.display='none'">
        <div style="background: #1e293b; padding: 30px; border-radius: 20px; text-align: center; max-width: 90%; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);" onclick="event.stopPropagation()">
            <button onclick="document.getElementById('creator-modal').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer;">&times;</button>
            <h3 style="color: white; margin-top: 0; margin-bottom: 20px; font-size: 1.5rem;">היוצר של נטו חופש</h3>
            <p style="color: #cbd5e1; margin-bottom: 25px; font-size: 1rem;">מוזמנים לעקוב אחרי הפתעות ותכנים מטורפים!</p>
            {icons_row}
        </div>
    </div>
"""

# Replace the old container with the new button
new_content = content[:start_idx] + new_button + "\n" + content[end_idx:]

# Inject the modal right before </body>
body_end_idx = new_content.rfind('</body>')
new_content = new_content[:body_end_idx] + modal_html + "\n" + new_content[body_end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully replaced creator networks with a button and modal.")
