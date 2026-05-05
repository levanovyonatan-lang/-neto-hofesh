import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

target = '<body>\n    <div class="sun-background"></div>\n    <main class="app-container">'
replacement = '''<body>
    <div id="dynamic-bg-container" class="dynamic-bg-container">
        <div class="sun-background" id="default-sun-bg"></div>
        <div id="particles-container"></div>
    </div>
    <main class="app-container">'''

if target in content:
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content.replace(target, replacement))
    print("Success")
else:
    print("Target not found")
