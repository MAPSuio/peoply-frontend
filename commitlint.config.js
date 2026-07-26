/**
 * Conventional Commits, enforced by the `commit-msg` hook.
 *
 * The default type list in config-conventional (build, chore, ci, docs, feat,
 * fix, perf, refactor, revert, style, test) already covers every type this
 * repository has used, so there is nothing to add. Merge, revert and fixup
 * commits are skipped by commitlint's own defaultIgnores.
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    /**
     * Off, not relaxed. config-conventional rejects any subject that starts
     * with a capital, which here means `fix: API returns 500`, `feat: Vipps
     * login ...` and `fix: SWR retries forever` are all rejected for naming
     * the thing they are about. The Conventional Commits spec says nothing
     * about subject case - this is commitlint's house style, and it fits a
     * codebase full of proper nouns badly.
     *
     * `type-case` still forces the type itself lowercase, so `Feat:` is
     * rejected as before.
     */
    "subject-case": [0],
  },
};
