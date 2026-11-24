// Stop hook for AI Control Center runs (zero dependencies).
// A Control Center session reports only through the last commit it pushes to its
// claude/cc-N branch. If the session tries to finish without that pushed report,
// this hook sends it back once to push it. Any other session is left alone.
import { execFileSync } from "node:child_process";

const MARKER = "---BEGIN CONTROL-CENTER HANDOFF v1---";
const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

let input = {};
try { input = JSON.parse(await new Promise((resolve) => { let d = ""; process.stdin.on("data", (c) => (d += c)); process.stdin.on("end", () => resolve(d || "{}")); })); } catch { /* not JSON: allow */ }
if (input.stop_hook_active) process.exit(0); // already sent back once: never loop

let branch = "";
try { branch = git("rev-parse", "--abbrev-ref", "HEAD"); } catch { process.exit(0); }
if (!/^claude\/cc-\d+/.test(branch)) process.exit(0); // not a Control Center run

let pushed = "";
try {
  git("fetch", "-q", "origin", `+${branch}:refs/remotes/origin/${branch}`);
  pushed = git("log", "-1", "--format=%B", `origin/${branch}`);
} catch { /* branch not on origin yet */ }
if (pushed.includes(MARKER)) process.exit(0);

process.stdout.write(JSON.stringify({
  decision: "block",
  reason: `This is an AI Control Center run on ${branch}, and the last commit on origin/${branch} carries no report. Nobody reads this chat. Write the report exactly as the REPORTING section of the task says, commit it with git commit --allow-empty -F /tmp/cc-report.txt, push it with git push -u origin ${branch}, check the push succeeded, then stop. If you cannot push, say why in one line and stop.`,
}));
