import json

from scratch_build_tips_v2 import tips_db as part1
from scratch_build_tips_v2_part2 import tips_db_part2 as part2
from scratch_build_tips_v2_part3 import tips_db_part3 as part3
from scratch_build_tips_v2_part4 import tips_db_part4 as part4
from scratch_build_tips_v2_part5 import tips_db_part5 as part5
from scratch_build_tips_v2_part6 import tips_db_part6 as part6

full_db = {}
full_db.update(part1)
full_db.update(part2)
full_db.update(part3)
full_db.update(part4)
full_db.update(part5)
full_db.update(part6)

js_content = "window.tipsDatabase = " + json.dumps(full_db, ensure_ascii=False, indent=4) + ";"

with open("tips.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print("Created tips.js successfully.")
