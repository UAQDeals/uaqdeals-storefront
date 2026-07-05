#!/usr/bin/env python3
"""Remove the stray ))} leftover from the old options-map structure."""
from pathlib import Path
import sys

TARGET = Path("components/product-detail.tsx")
s = TARGET.read_text()

# The broken close sequence: my two correct </div>s, then a stray ))},
# then the correct </div> )} . Remove only the stray ))} line.
old = '''                })}
              </div>
              </div>
            ))}
          </div>
        )}'''
new = '''                })}
              </div>
            </div>
          </div>
        )}'''
# Note: also fixing indentation of the second </div> for clarity.
if old in s:
    s = s.replace(old, new, 1)
    TARGET.write_text(s)
    print("FIXED: removed stray ))} and balanced closing divs")
else:
    print("anchor not found — paste sed -n '208,216p'")
    sys.exit(1)
