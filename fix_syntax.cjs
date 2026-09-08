const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

// The original script did:
// newContent = newContent.replace(/          <\/motion.button>\n        <\/section>/, `          </motion.button>\n        </section>\n        )}`);
// BUT the original file had `</section>` much further down!
// So it actually just closed the section EARLY, leaving dangling JSX inside.

// Wait, I can just use git checkout to revert it and do it properly, since I haven't committed.
// Oh wait, I am not in git. Let's just fix it by replacing the `{isPaired && (` string to just nothing, and same for the other change, then I'll do it right.

content = content.replace('{isPaired && (\\n        <section id="block-4-hug-cta" className="relative">', '<section id="block-4-hug-cta" className="relative">');

