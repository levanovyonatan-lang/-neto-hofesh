import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove the whatsapp modal
# The modal starts with <div id="whatsapp-modal" and ends before <!-- Premium Add Personal Event Modal -->
modal_start_idx = html.find('<!-- WhatsApp Registration Modal -->')
modal_end_idx = html.find('<!-- Premium Add Personal Event Modal -->')
if modal_start_idx != -1 and modal_end_idx != -1:
    html = html[:modal_start_idx] + html[modal_end_idx:]

# Replace the whatsapp button
button_pattern = r'<button onclick="trackEvent\(\'click_whatsapp_community_main\'\); document\.getElementById\(\'whatsapp-modal\'\)\.style\.display=\'flex\'; this\.style\.transform=\'scale\(0\.95\)\'; setTimeout\(\(\) => this\.style\.transform=\'\', 200\);" class="whatsapp-community-btn" style="([^"]+)">(.*?)</button>'
new_button = r'<a href="https://whatsapp.com/channel/0029VbDhEST8PgsCBre8SN1f" target="_blank" onclick="trackEvent(\'click_whatsapp_community_main\');" class="whatsapp-community-btn" style="\1; text-decoration: none;">\2</a>'

html = re.sub(button_pattern, new_button, html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
    
# 2. Update app.js
with open('assets/js/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# We want to remove all blocks that look like:
# const modalWhatsappBtn = document.getElementById('modal-whatsapp-join-btn');
# if (modalWhatsappBtn) modalWhatsappBtn.href = "https://chat.whatsapp.com/D6TsQfLFkA072Xv6Q6pKDc";
# const whatsappCommunityBtn = document.querySelector('.whatsapp-community-btn');
# if (whatsappCommunityBtn) { ... }

block_pattern = r'\s*const modalWhatsappBtn = document\.getElementById\(\'modal-whatsapp-join-btn\'\);\s*if \(modalWhatsappBtn\) modalWhatsappBtn\.href = "[^"]+";\s*const whatsappCommunityBtn = document\.querySelector\(\'\.whatsapp-community-btn\'\);\s*if \(whatsappCommunityBtn\) \{\s*whatsappCommunityBtn\.setAttribute\(\'onclick\', "[^"]+"\);\s*\}'
app_js = re.sub(block_pattern, '', app_js)

with open('assets/js/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Done updating WhatsApp links.")
