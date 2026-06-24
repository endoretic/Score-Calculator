# Repository Guidelines

## Project Structure & Module Organization

This is a small, single-file Python project for a numeric score search problem.

- `calculator.py`: main implementation and entry point. It defines `find_optimal_scores(...)` and prints candidate score plans directly.
- `dialog.md`: source problem statement and desired behavior notes.
- `brief.md`: project summary and agent-oriented development notes.

There are currently no dedicated `tests/`, assets, package metadata, or CLI modules. Keep new code close to `calculator.py` unless a feature becomes large enough to justify a second module.

## Build, Test, and Development Commands

- `python calculator.py`: run the score search with the default current values and target increments.
- `python -m py_compile calculator.py`: perform a quick syntax check without running the search output.

No build step is required. Do not add external dependencies unless the feature needs them and the tradeoff is clear.

## Coding Style & Naming Conventions

Use standard Python style: 4-space indentation, clear `snake_case` names for functions and variables, and simple loops or helper functions over complex abstractions. Preserve the current numeric semantics: `a - b` stays constant, `b` must match required digit patterns, and `a` is evaluated for attractive digit patterns.

The script currently uses Chinese comments and output wording. When editing or extending `calculator.py`, keep that style consistent and avoid mixing in unrelated English narration inside user-facing output.

## Testing Guidelines

There is no formal test framework yet. For every change, run:

```bash
python -m py_compile calculator.py
python calculator.py
```

If tests are added later, prefer a lightweight `tests/` directory with `test_*.py` files and built-in `unittest` or `pytest` only if explicitly introduced.

## Commit & Pull Request Guidelines

This checkout does not include Git history, so no repository-specific commit convention was found. Use concise, imperative commit messages such as `Add configurable digit constraints` or `Refine balanced score scoring`.

Pull requests should describe the numeric behavior changed, include example before/after output when relevant, and mention how validation was run. Link any related issue or problem note from `dialog.md`.

## Agent-Specific Notes

Prefer small, incremental changes. Treat new requirements as constraints for numeric search or scoring, not as reasons to add unrelated web, GUI, or database layers.
