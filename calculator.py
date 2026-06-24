# -*- coding: utf-8 -*-
from __future__ import annotations

from dataclasses import dataclass, field
from itertools import product
from typing import Iterable, Sequence


Pattern = str | int


def _as_patterns(patterns: Iterable[Pattern] | None) -> tuple[str, ...]:
    if patterns is None:
        return ()
    return tuple(str(pattern) for pattern in patterns if str(pattern))


def _as_pattern_groups(
    groups: Iterable[Iterable[Pattern] | Pattern] | None,
) -> tuple[tuple[str, ...], ...]:
    if groups is None:
        return ()

    normalized_groups = []
    for group in groups:
        if isinstance(group, (str, int)):
            normalized_group = (str(group),)
        else:
            normalized_group = _as_patterns(group)

        if normalized_group:
            normalized_groups.append(normalized_group)

    return tuple(normalized_groups)


def _exact_int_values(rule: "DigitRule") -> tuple[int, ...]:
    values = []

    for pattern in rule.exact:
        if not pattern.isdecimal():
            raise ValueError(f"全字匹配必须是非负整数：{pattern}")
        values.append(int(pattern))

    return tuple(sorted(set(values)))


@dataclass(frozen=True)
class DigitRule:
    """Hard digit constraints: exact match, required substrings, optional groups, and excluded substrings."""

    exact: Iterable[Pattern] = ()
    require_all: Iterable[Pattern] = ()
    require_any_groups: Iterable[Iterable[Pattern] | Pattern] = ()
    exclude: Iterable[Pattern] = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "exact", _as_patterns(self.exact))
        object.__setattr__(self, "require_all", _as_patterns(self.require_all))
        object.__setattr__(
            self,
            "require_any_groups",
            _as_pattern_groups(self.require_any_groups),
        )
        object.__setattr__(self, "exclude", _as_patterns(self.exclude))

    def match(self, value: int) -> bool:
        text = str(value)

        if self.exact and text not in self.exact:
            return False

        if any(pattern not in text for pattern in self.require_all):
            return False

        if any(pattern in text for pattern in self.exclude):
            return False

        for group in self.require_any_groups:
            if not any(pattern in text for pattern in group):
                return False

        return True

    def describe(self) -> str:
        parts = []

        if self.exact:
            parts.append(f"全字匹配：{', '.join(self.exact)}")

        if self.require_all:
            parts.append(f"必须包含：{', '.join(self.require_all)}")

        for group in self.require_any_groups:
            parts.append(f"可以包含：{', '.join(group)}")

        if self.exclude:
            parts.append(f"必须排除：{', '.join(self.exclude)}")

        return "；".join(parts) if parts else "无额外限制"


@dataclass(frozen=True)
class BeautyResult:
    score: int
    reasons: tuple[str, ...]


@dataclass(frozen=True)
class ScorePlan:
    increment: int
    b_value: int
    a_value: int
    beauty: BeautyResult
    control: BeautyResult


@dataclass(frozen=True)
class SingleScoreSearchResult:
    min_increment: int
    limit_plan: ScorePlan | None
    balanced_plans: tuple[ScorePlan, ...]


@dataclass(frozen=True)
class ScoreLineConfig:
    """Control settings for one b_i line in multi-score mode."""

    name: str
    current: int
    min_increment: int = 0
    search_window: int = 1_000_000
    rule: DigitRule = field(default_factory=DigitRule)


@dataclass(frozen=True)
class ScoreLineCandidate:
    name: str
    increment: int
    value: int


@dataclass(frozen=True)
class MultiScorePlan:
    total_increment: int
    total_value: int
    lines: tuple[ScoreLineCandidate, ...]
    beauty: BeautyResult


DEFAULT_TARGET_INCREMENTS = (3_000_000, 4_000_000, 5_000_000, 6_000_000)

DEFAULT_B_RULE = DigitRule(
    require_all=("123",),
    require_any_groups=(("520", "521", "1314"),),
)

DEFAULT_A_RULE = DigitRule()

DEFAULT_PATTERN_WEIGHTS = {
    "1314": 30,
    "1221": 24,
    "3443": 24,
    "520": 16,
    "521": 16,
    "988": 14,
    "552": 12,
    "225": 12,
    "123": 10,
}

GOOD_SEQUENCES = (
    "123",
    "234",
    "345",
    "456",
    "567",
    "678",
    "789",
    "987",
    "876",
    "765",
)


def _find_repeated_runs(text: str, min_length: int = 2) -> tuple[str, ...]:
    runs = []
    start = 0

    for index in range(1, len(text) + 1):
        if index == len(text) or text[index] != text[start]:
            run_length = index - start
            if run_length >= min_length:
                runs.append(text[start:index])
            start = index

    return tuple(runs)


def _find_palindromes(
    text: str,
    min_length: int = 3,
    max_length: int = 6,
    limit: int = 4,
) -> tuple[str, ...]:
    palindromes = []
    max_length = min(max_length, len(text))

    for length in range(max_length, min_length - 1, -1):
        for start in range(0, len(text) - length + 1):
            piece = text[start : start + length]
            if piece == piece[::-1] and len(set(piece)) > 1:
                palindromes.append(piece)
                if len(palindromes) >= limit:
                    return tuple(palindromes)

    return tuple(palindromes)


def _matched_rule_patterns(value: int, rule: DigitRule) -> tuple[str, ...]:
    """Return hard-rule patterns present in value for control-fit scoring."""

    text = str(value)
    patterns = []
    seen = set()

    def add(pattern: str) -> None:
        if pattern in text and pattern not in seen:
            patterns.append(pattern)
            seen.add(pattern)

    for pattern in rule.require_all:
        add(pattern)

    for group in rule.require_any_groups:
        for pattern in group:
            add(pattern)

    return tuple(patterns)


def _best_overlap(left: str, right: str) -> int:
    max_overlap = min(len(left), len(right))

    for size in range(max_overlap, 0, -1):
        if left.endswith(right[:size]):
            return size

    return 0


def evaluate_control_fit(value: int, rule: DigitRule) -> BeautyResult:
    """Score whether b-side hard-rule patterns merge in a digit-saving way."""

    text = str(value)
    patterns = _matched_rule_patterns(value, rule)
    score = 0
    reasons = []
    counted = set()

    for left in patterns:
        for right in patterns:
            if left == right:
                continue

            overlap = _best_overlap(left, right)
            if overlap == 0:
                continue

            fused = left + right[overlap:]
            key = (left, right, fused)

            if fused not in text or key in counted:
                continue

            counted.add(key)
            points = overlap * 18
            score += points
            reasons.append(f"{left}+{right} 拼成 {fused}，节省 {overlap} 位（+{points}）")

    return BeautyResult(score=score, reasons=tuple(reasons))


def evaluate_beauty(
    value: int,
    pattern_weights: dict[str, int] | None = None,
) -> BeautyResult:
    """General number-aesthetics scoring across motifs, runs, palindromes, sequences, and endings."""

    text = str(value)
    weights = pattern_weights or DEFAULT_PATTERN_WEIGHTS
    score = 0
    reasons = []

    for pattern, points in weights.items():
        if pattern in text:
            score += points
            reasons.append(f"包含 {pattern}（+{points}）")

    for run in _find_repeated_runs(text):
        run_length = len(run)
        points = run_length * run_length + (8 if run_length >= 3 else 2)
        score += points
        reasons.append(f"{run} 连号（+{points}）")

    for palindrome in _find_palindromes(text):
        points = len(palindrome) * 5
        score += points
        reasons.append(f"{palindrome} 回文（+{points}）")

    for sequence in GOOD_SEQUENCES:
        if sequence in text:
            score += 8
            reasons.append(f"{sequence} 顺子（+8）")

    if text.endswith(("888", "666", "988", "1314")):
        score += 8
        reasons.append(f"尾数 {text[-3:]}（+8）")

    return BeautyResult(score=score, reasons=tuple(reasons))


def format_reasons(
    reasons: Sequence[str],
    limit: int = 4,
    empty_text: str = "暂无明显数字亮点",
) -> str:
    if not reasons:
        return empty_text

    selected = "、".join(reasons[:limit])
    return f"{selected} 等" if len(reasons) > limit else selected


def search_single_score(
    a_current: int,
    b_current: int,
    min_increment: int,
    search_window: int = 1_000_000,
    b_rule: DigitRule = DEFAULT_B_RULE,
    a_rule: DigitRule = DEFAULT_A_RULE,
    balanced_score_threshold: int = 30,
    balanced_limit: int = 8,
) -> SingleScoreSearchResult:
    """Single-score mode: keep a - b constant and return the floor plan plus ranked candidates."""

    diff = a_current - b_current
    b_start = b_current + min_increment
    limit_plan = None
    balanced_plans = []

    def candidate_score(plan: ScorePlan) -> int:
        return plan.beauty.score + plan.control.score

    def candidate_rank(plan: ScorePlan) -> tuple[int, int, int, int, int]:
        return (
            -candidate_score(plan),
            -plan.beauty.score,
            -plan.control.score,
            plan.increment,
            plan.a_value,
        )

    def record_balanced_plan(plan: ScorePlan) -> None:
        if balanced_limit <= 0:
            return

        if len(balanced_plans) < balanced_limit:
            balanced_plans.append(plan)
            balanced_plans.sort(key=candidate_rank)
            return

        if candidate_rank(plan) < candidate_rank(balanced_plans[-1]):
            balanced_plans[-1] = plan
            balanced_plans.sort(key=candidate_rank)

    def visit_b_value(b_new: int) -> None:
        nonlocal limit_plan

        if not b_rule.match(b_new):
            return

        a_new = b_new + diff
        if not a_rule.match(a_new):
            return

        beauty = evaluate_beauty(a_new)
        control = evaluate_control_fit(b_new, b_rule)
        plan = ScorePlan(
            increment=b_new - b_current,
            b_value=b_new,
            a_value=a_new,
            beauty=beauty,
            control=control,
        )

        # The first hit in ascending search is the minimum-effort plan under the hard rules.
        if limit_plan is None:
            limit_plan = plan

        if candidate_score(plan) >= balanced_score_threshold:
            record_balanced_plan(plan)

    if b_rule.exact:
        for b_new in _exact_int_values(b_rule):
            if b_new - b_current >= min_increment:
                visit_b_value(b_new)
    else:
        for b_new in range(b_start, b_start + search_window):
            visit_b_value(b_new)

    return SingleScoreSearchResult(
        min_increment=min_increment,
        limit_plan=limit_plan,
        balanced_plans=tuple(balanced_plans),
    )


def _print_single_result(result: SingleScoreSearchResult) -> None:
    separator = "=" * 15
    print(f"{separator} 目标增量下限：{result.min_increment // 10000}万 {separator}")

    if result.limit_plan is None:
        print("未找到满足硬约束的方案，请扩大 search_window 或放宽规则。\n")
        return

    limit_plan = result.limit_plan
    print("【方案一】极限压分（肝度最小）:")
    print(f"  -> 需要增加: {limit_plan.increment:,}")
    print(f"  -> 单榜分 b: {limit_plan.b_value:,} (满足 b 的数字硬约束)")
    print(f"  -> 总榜分 a: {limit_plan.a_value:,}")
    print(f"  -> 控分结构: {limit_plan.control.score}，{format_reasons(limit_plan.control.reasons, empty_text='暂无重叠拼接')}")
    print(f"  -> 分数评价: {limit_plan.beauty.score}，{format_reasons(limit_plan.beauty.reasons)}\n")

    if not result.balanced_plans:
        print("【方案二】综合候选：本搜索区间内未达到评分阈值。\n")
        return

    print("【方案二】综合候选（按 a 分数评价 + b 控分结构排序，供手动选择）:")
    for plan in result.balanced_plans:
        total_score = plan.beauty.score + plan.control.score
        print(f"  -> 需要增加: {plan.increment:,}")
        print(f"  -> 单榜分 b: {plan.b_value:,}")
        print(f"  -> 总榜分 a: {plan.a_value:,}")
        print(f"  -> 综合评分: {total_score}")
        print(f"  -> 控分结构: {plan.control.score}，{format_reasons(plan.control.reasons, empty_text='暂无重叠拼接')}")
        print(f"  -> 分数评价: {plan.beauty.score}，{format_reasons(plan.beauty.reasons)}\n")


def find_optimal_scores(
    a_current: int = 50_000_000,
    b_current: int = 3_000_000,
    target_increments: Sequence[int] | None = None,
    search_window: int = 1_000_000,
    b_rule: DigitRule = DEFAULT_B_RULE,
    a_rule: DigitRule = DEFAULT_A_RULE,
    balanced_score_threshold: int = 30,
    balanced_limit: int = 8,
) -> tuple[SingleScoreSearchResult, ...]:
    """Default entry point for the single-score model; prints and returns structured results."""

    if target_increments is None:
        target_increments = DEFAULT_TARGET_INCREMENTS

    results = []
    print(f"b 硬约束：{b_rule.describe()}")
    print(f"a 硬约束：{a_rule.describe()}")
    print(f"综合评分阈值：{balanced_score_threshold}\n")

    for min_increment in target_increments:
        result = search_single_score(
            a_current=a_current,
            b_current=b_current,
            min_increment=min_increment,
            search_window=search_window,
            b_rule=b_rule,
            a_rule=a_rule,
            balanced_score_threshold=balanced_score_threshold,
            balanced_limit=balanced_limit,
        )
        results.append(result)
        _print_single_result(result)

    return tuple(results)


def generate_line_candidates(
    config: ScoreLineConfig,
    max_candidates: int = 20,
) -> tuple[ScoreLineCandidate, ...]:
    """Multi-score mode: generate a limited candidate list for one b_i line."""

    candidates = []

    # In multi-score mode, exact match locks b_i as a constant and ignores increment/window limits.
    if config.rule.exact:
        for exact_value in _exact_int_values(config.rule):
            increment = exact_value - config.current
            if not config.rule.match(exact_value):
                continue

            candidates.append(
                ScoreLineCandidate(
                    name=config.name,
                    increment=increment,
                    value=exact_value,
                )
            )

            if len(candidates) >= max_candidates:
                break

        return tuple(candidates)

    start = config.current + config.min_increment

    for value in range(start, start + config.search_window):
        if not config.rule.match(value):
            continue

        candidates.append(
            ScoreLineCandidate(
                name=config.name,
                increment=value - config.current,
                value=value,
            )
        )

        if len(candidates) >= max_candidates:
            break

    return tuple(candidates)


def find_multi_score_plans(
    lines: Sequence[ScoreLineConfig],
    a_rule: DigitRule = DEFAULT_A_RULE,
    min_beauty_score: int = 0,
    max_candidates_per_line: int = 20,
    max_results: int = 10,
) -> tuple[MultiScorePlan, ...]:
    """
    Multi-score mode: a = sum(b1..bn).

    Generate candidates for each b_i first, then combine them and filter by total-score rules.
    To avoid combinatorial blowups, each b_i keeps only a limited number of candidates by default.
    """

    candidate_groups = [
        generate_line_candidates(line, max_candidates=max_candidates_per_line)
        for line in lines
    ]

    if not candidate_groups or any(not group for group in candidate_groups):
        return ()

    plans = []
    for candidate_group in product(*candidate_groups):
        total_value = sum(candidate.value for candidate in candidate_group)

        if not a_rule.match(total_value):
            continue

        beauty = evaluate_beauty(total_value)
        if beauty.score < min_beauty_score:
            continue

        plans.append(
            MultiScorePlan(
                total_increment=sum(candidate.increment for candidate in candidate_group),
                total_value=total_value,
                lines=tuple(candidate_group),
                beauty=beauty,
            )
        )

    plans.sort(key=lambda plan: (plan.total_increment, -plan.beauty.score, plan.total_value))
    return tuple(plans[:max_results])


if __name__ == "__main__":
    find_optimal_scores()
