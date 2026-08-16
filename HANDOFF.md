# HANDOFF — pointer only

This file does not define project rules and contains no independent implementation authority.

The single source of truth for `yanivmizrachiy/coordinate-lms` is:

> `RULES.md`

Historical handoff text was removed from the active branch because it contained obsolete statements about page counts, deployment state, and prior implementation decisions that could contradict the current rules.

Current handoff rule: read `RULES.md`, inspect the actual repository state and CI, and do not infer current requirements from historical notes.

Operational CI note: when the answer-coverage workflow pushes a derived `github-actions[bot]` commit, GitHub may mark the resulting pull-request workflow `action_required` with no jobs; a subsequent human-authored commit is required to obtain a normal CI run on the refreshed head.
