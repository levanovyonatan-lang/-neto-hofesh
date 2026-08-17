import re

filepath = r'c:\Users\user\נטו חופש\neto-hofesh\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Hide the square icons row that was added previously
# It looks like: <div class="social-icons-row" style="margin-top: 25px; gap: 15px;">
content = content.replace(
    '<div class="social-icons-row" style="margin-top: 25px; gap: 15px;">',
    '<div class="social-icons-row demo-feature" style="margin-top: 25px; gap: 15px; display: none;">'
)

# 2. Extract the bottom yonatop icons (social-icons-row inside social-banner-container)
start_idx = content.find('<div class="social-banner-container"')
if start_idx != -1:
    end_idx = content.find('<footer class="seo-footer">', start_idx)
    container_content = content[start_idx:end_idx]

    icons_row_match = re.search(r'(<div class="social-icons-row">.*?)</div>\s*</div>\s*$', container_content, flags=re.DOTALL)
    if icons_row_match:
        icons_row = icons_row_match.group(1) + "</div>"
        
        # New button (Hidden by default!)
        new_button = """            <!-- רשתות חברתיות לכל השכבות (מופיע מתחת לבחירת החגים) -->
            <div class="demo-feature" style="text-align: center; margin-top: 15px; margin-bottom: 30px; display: none;">
                <button class="ai-btn" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);" onclick="document.getElementById('creator-modal').style.display='flex'">
                    <span>✨ הרשתות של יוצר האתר ✨</span>
                </button>
            </div>
            
            <div class="original-creator-networks">
""" + container_content + "            </div>"
        
        # Replace
        new_content = content[:start_idx] + new_button + "\n" + content[end_idx:]
        content = new_content
        
        # 3. Add Modal right before </body>
        modal_html = f"""
    <!-- Creator Networks Modal -->
    <div id="creator-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.85); z-index: 10000; align-items: center; justify-content: center; backdrop-filter: blur(8px); flex-direction: column;" onclick="this.style.display='none'">
        <div style="background: #1e293b; padding: 35px 25px; border-radius: 20px; text-align: center; max-width: 90%; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);" onclick="event.stopPropagation()">
            <button onclick="document.getElementById('creator-modal').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; font-size: 28px; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
            <h3 style="color: white; margin-top: 0; margin-bottom: 15px; font-size: 1.6rem; font-weight: 800;">יוצר האתר</h3>
            <p style="color: #cbd5e1; margin-bottom: 25px; font-size: 1.1rem; font-weight: 500;">מוזמנים לעקוב אחרי הפתעות ותכנים מטורפים!</p>
            <div style="display:flex; justify-content:center;">
                {icons_row}
            </div>
        </div>
    </div>
"""
        body_end_idx = content.rfind('</body>')
        content = content[:body_end_idx] + modal_html + "\n" + content[body_end_idx:]

# 4. Add the show_demo script right before </head>
script = """
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            if (new URLSearchParams(window.location.search).get('show_demo') === 'true') {
                document.querySelectorAll('.demo-feature').forEach(el => el.style.display = '');
                // Hide the original creator networks if demo is enabled
                document.querySelectorAll('.original-creator-networks').forEach(el => el.style.display = 'none');
            }
        });
    </script>
"""
if '<script>' not in content[:content.find('</head>')]: # just a tiny heuristic
    head_end_idx = content.find('</head>')
    content = content[:head_end_idx] + script + "\n" + content[head_end_idx:]

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("index.html fixed with demo features!")
