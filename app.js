"use strict";

const DEFAULT_PATTERN_WEIGHTS = new Map([
  ["1314", 30],
  ["1221", 24],
  ["3443", 24],
  ["520", 16],
  ["521", 16],
  ["988", 14],
  ["552", 12],
  ["225", 12],
  ["123", 10],
]);

const GOOD_SEQUENCES = [
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
];

const I18N = {
  zh: {
    "app.title": "控分计算器",
    "app.subtitle": "搜索 · 控分 · 评价",
    "language.switch": "语言切换",
    "tabs.mode": "计算模式",
    "tab.single": "单榜",
    "tab.multi": "多榜",
    "tab.guide": "说明",
    "section.baseScores": "基础分数",
    "section.bRules": "b 硬规则",
    "section.aRules": "a 硬规则",
    "section.output": "输出控制",
    "section.singleResults": "单榜结果",
    "section.totalRules": "总榜规则",
    "section.multiResults": "多榜结果",
    "guide.title": "使用说明",
    "guide.intro": "这个工具是给 World Link 控分用的：一边看单人榜 b，一边看总榜 a，帮你把“少打一点”和“数字好看”放在一起比较。",
    "guide.single": "单榜适合只剩最后一个章节还在打的情况。填当前总榜 a、当前单人榜 b 和最低增量，工具会保持 a-b 的差值不变，找出打完这个章节后可能出现的 b 和 a。",
    "guide.multi": "多榜适合还有多个章节要规划的情况。已经结算的章节可以用锁定值固定，没结算的章节再设置最低增量和数字规则；最后总榜按所有 b 相加。",
    "guide.exact": "全字匹配/锁定值就是“这个榜最后就按这个分算”。适合章节已结束，或你已经决定要打到某个分数。锁定后它不再搜索，只作为常量参与总榜。",
    "guide.requireAll": "单人榜 b 的“必须包含”最常见用途是控制生日、纪念日、名字谐音或你一定想展示的数字。比如填 123，最终 b 就必须完整出现 123。",
    "guide.defaults": "大多数参数第一次可以先用默认：搜索窗口、综合评分阈值、每档候选数和结果数都不用急着改。没结果时先加大搜索窗口；结果太多时提高阈值或减少结果数。",
    "guide.candidates": "候选数会影响“找得多不多”。候选数/每个 b 候选数越大，越可能看到更多备选，但多榜组合会明显变慢；结果数主要影响最后展示多少条，调大只是让列表更长。",
    "guide.mobileTooltip": "移动端没有鼠标悬停，可以点按输入框标题查看说明和示例；点页面其它位置会收起提示。",
    "guide.performance": "如果 3 个以上 b 没有锁定，页面会先提醒你，因为组合数会快速膨胀。这个版本会自动收紧候选上限，后续再考虑更强的算法。",
    "label.aCurrent": "当前总榜 a",
    "label.bCurrent": "当前单榜 b",
    "label.targetIncrements": "增量下限",
    "label.searchWindow": "搜索窗口",
    "label.exact": "全字匹配",
    "label.requireAll": "必须包含",
    "label.mayInclude": "可以包含",
    "label.requireAnyHard": "至少一个",
    "label.exclude": "必须排除",
    "label.scoreThreshold": "综合评分阈值",
    "label.resultLimit": "每档候选数",
    "label.aExact": "a 全字匹配",
    "label.aRequireAll": "a 必须包含",
    "label.aMayInclude": "a 可以包含",
    "label.aExclude": "a 必须排除",
    "label.maxCandidates": "每个 b 候选数",
    "label.maxCombinations": "最大组合数",
    "label.multiResultLimit": "结果数",
    "line.name": "名称",
    "line.current": "当前值",
    "line.minIncrement": "增量下限",
    "line.searchWindow": "窗口",
    "line.exact": "锁定值",
    "line.requireAll": "必须包含",
    "line.mayInclude": "可以包含",
    "line.exclude": "排除",
    "lineTable.label": "b 列表",
    "button.run": "计算",
    "button.runMulti": "计算多榜",
    "button.reset": "重置",
    "button.addLine": "添加 b",
    "button.delete": "删除",
    "status.waiting": "等待计算",
    "status.running": "计算中",
    "status.singleStage": "计算 {increment} 档",
    "status.singleProgress": "{increment} 档 {percent}%",
    "status.singleDone": "完成 {count} 档",
    "status.parameterError": "参数错误",
    "status.generating": "生成候选",
    "status.generatingLine": "生成 {name} 候选",
    "status.lineProgress": "{name} {percent}%",
    "status.cancelled": "已取消",
    "status.combining": "组合 {count} 组",
    "status.multiDone": "完成 {count} 组",
    "tip.aCurrent": "填现在看到的总榜分。单榜模式会用它和 b 的差值推算打完后的总榜。",
    "tip.bCurrent": "填当前要控的单人榜分。一般就是最后还没结算的章节分。",
    "tip.targetIncrements": "计划至少再打多少分。默认多档一起看，先不用改。",
    "tip.searchWindow": "从增量下限往上找多远。默认通常够用；没结果再加大，越大越慢。",
    "tip.singleBExact": "已经确定最终单人榜分就填这里；适合章节已结束或只想验证某个分数。例：6001234。",
    "tip.singleAExact": "只想要某个总榜分就填这里；普通试算可以留空。例：53012345。",
    "tip.multiAExact": "只接受某个总榜分时填写；普通多榜规划可以留空。例：50012345。",
    "tip.requireAll": "所有填入的数字串都必须完整出现。",
    "tip.bRequireAll": "单人榜 b 常用来控生日、纪念日或必须出现的数字；填了就一定要出现在最终分。例：123。",
    "tip.aRequireAll": "总榜 a 如果一定要出现某串数字才填；普通试算可以留空。例：666,888。",
    "tip.lineRequireAll": "这个章节最终分必须出现的数字，常用于控制生日、纪念日或固定展示数字。",
    "tip.mayInclude": "放想要出现的好看数字；不勾选“至少一个”时不会卡掉结果。多组可用分号或换行分开。例：1221,3443,1314。",
    "tip.requireAnyHard": "勾选后，“可以包含”会变成硬规则：每组至少命中一个。不勾选时只作为偏好和评价线索。",
    "tip.exclude": "不想看到的数字填这里，比如忌讳数字或不喜欢的组合。例：4,74。",
    "tip.scoreThreshold": "建议先用默认。调高会只看更靓的分，调低会显示更多普通候选。",
    "tip.resultLimit": "建议先用默认。调大能看更多备选，页面更长；调小更清爽但选择更少。",
    "tip.maxCandidates": "多榜建议先用默认。调大会让组合数暴涨，只在想深挖时再加。",
    "tip.maxCombinations": "浏览器可计算的组合上限。默认用于防卡死；调高会更慢。",
    "tip.multiResultLimit": "只影响最后展示多少组结果；默认够挑，调大只是多看一些。",
    "tip.lineName": "给章节起个名字，结果里好认。",
    "tip.lineCurrent": "填这个章节现在的单人榜分。",
    "tip.lineMinIncrement": "这个章节至少还要打多少。章节已结束并填了锁定值时可不管。",
    "tip.lineSearchWindow": "这个章节从最低增量往上找多远；默认先试，没结果再加。",
    "tip.lineExact": "章节已结束或分数已确定就填这里，它会被锁定，不再参与搜索。",
    "rule.exact": "全字匹配：{patterns}",
    "rule.requireAll": "必须包含：{patterns}",
    "rule.mayInclude": "可以包含：{patterns}",
    "rule.mayIncludeRequired": "可以包含（至少一个）：{patterns}",
    "rule.exclude": "必须排除：{patterns}",
    "rule.none": "无额外限制",
    "reason.contains": "包含 {pattern}（+{points}）",
    "reason.run": "{value} 连号（+{points}）",
    "reason.palindrome": "{value} 回文（+{points}）",
    "reason.sequence": "{value} 顺子（+{points}）",
    "reason.ending": "尾数 {value}（+{points}）",
    "reason.overlap": "{left}+{right} 拼成 {fused}，节省 {overlap} 位（+{points}）",
    "empty.beauty": "暂无明显数字亮点",
    "empty.control": "暂无重叠拼接",
    "empty.noCandidate": "本搜索区间内没有达到阈值的综合候选",
    "empty.noHardRuleB": "没有找到满足硬规则的 b",
    "empty.noMultiPlan": "没有找到满足总榜规则的组合",
    "card.stage": "{increment} 增量下限",
    "card.hit": "已命中硬规则",
    "card.none": "无方案",
    "cell.increment": "增量",
    "cell.singleB": "单榜 b",
    "cell.totalA": "总榜 a",
    "cell.control": "控分结构",
    "cell.beauty": "分数评价",
    "table.total": "综合",
    "multi.card": "组合 {index}",
    "multi.totalIncrement": "总增量",
    "multi.control": "b 控分",
    "multi.beauty": "a 分数评价",
    "multi.detail": "明细",
    "multi.locked": "锁定 ",
    "error.range": "{label} 必须在 {min} 到 {max} 之间",
    "error.numberList": "{label} 至少需要一个数值",
    "error.needLine": "至少需要一个 b",
    "error.tooManyB": "初版最多支持 6 个 b",
    "error.noLineHit": "{name} 没有命中硬规则",
    "error.tooManyCombos": "预计组合 {count} 组，超过上限 {max}",
    "confirm.unlocked": "当前有 {count} 个 b 未设置锁定值，组合数可能快速膨胀。\n\n继续后，每个未锁定 b 的候选上限将按数量自动收紧到 {limit}。",
  },
  en: {
    "app.title": "Score Control Calculator",
    "app.subtitle": "Search · Control · Evaluate",
    "language.switch": "Language switch",
    "tabs.mode": "Calculation mode",
    "tab.single": "Single",
    "tab.multi": "Multi",
    "tab.guide": "Guide",
    "section.baseScores": "Base Scores",
    "section.bRules": "b Rules",
    "section.aRules": "a Rules",
    "section.output": "Output",
    "section.singleResults": "Single Results",
    "section.totalRules": "Total Rules",
    "section.multiResults": "Multi Results",
    "guide.title": "Guide",
    "guide.intro": "Use this for World Link score control: compare the chapter score b and total score a while balancing fewer extra points with nicer-looking numbers.",
    "guide.single": "Single mode fits the common case where only the last chapter is still active. Enter current total a, current chapter b, and the minimum increment; the tool keeps a-b unchanged and finds possible final b and a values.",
    "guide.multi": "Multi mode is for planning several chapters. Lock chapters that already ended, set minimum increments and digit rules for the open ones, and the final total a is calculated from all b values.",
    "guide.exact": "Exact match / Locked value means “treat this ranking as this final score.” Use it for ended chapters or a score you are already committed to. Once locked, it is not searched and only contributes to the total.",
    "guide.requireAll": "For single b, Must contain is usually for birthdays, anniversaries, name puns, or any digits you definitely want shown. For example, 123 means the final b must contain 123 exactly.",
    "guide.defaults": "Most settings can stay at their defaults on the first run: search window, score threshold, candidates per tier, and result count. If nothing appears, increase the search window; if too much appears, raise the threshold or show fewer results.",
    "guide.candidates": "Candidate limits control how much the tool explores. Larger candidates-per-tier or candidates-per-b values can reveal more options, but multi-score combinations get slower quickly. Result count mostly changes how many final rows are displayed.",
    "guide.mobileTooltip": "On mobile, tap a field label to open its tooltip with notes and examples; tap elsewhere to close it.",
    "guide.performance": "If 3 or more b values are unlocked, the page warns you because combinations can explode. This version automatically tightens candidate limits; stronger search can be added later.",
    "label.aCurrent": "Current total a",
    "label.bCurrent": "Current b",
    "label.targetIncrements": "Minimum increments",
    "label.searchWindow": "Search window",
    "label.exact": "Exact match",
    "label.requireAll": "Must contain",
    "label.mayInclude": "May include",
    "label.requireAnyHard": "At least one",
    "label.exclude": "Must exclude",
    "label.scoreThreshold": "Score threshold",
    "label.resultLimit": "Candidates per tier",
    "label.aExact": "a exact match",
    "label.aRequireAll": "a must contain",
    "label.aMayInclude": "a may include",
    "label.aExclude": "a must exclude",
    "label.maxCandidates": "Candidates per b",
    "label.maxCombinations": "Max combinations",
    "label.multiResultLimit": "Result count",
    "line.name": "Name",
    "line.current": "Current",
    "line.minIncrement": "Min increment",
    "line.searchWindow": "Window",
    "line.exact": "Locked value",
    "line.requireAll": "Must contain",
    "line.mayInclude": "May include",
    "line.exclude": "Exclude",
    "lineTable.label": "b list",
    "button.run": "Run",
    "button.runMulti": "Run Multi",
    "button.reset": "Reset",
    "button.addLine": "Add b",
    "button.delete": "Delete",
    "status.waiting": "Ready",
    "status.running": "Running",
    "status.singleStage": "Running {increment} tier",
    "status.singleProgress": "{increment} tier {percent}%",
    "status.singleDone": "Done: {count} tier(s)",
    "status.parameterError": "Parameter error",
    "status.generating": "Generating candidates",
    "status.generatingLine": "Generating {name}",
    "status.lineProgress": "{name} {percent}%",
    "status.cancelled": "Cancelled",
    "status.combining": "Combining {count} groups",
    "status.multiDone": "Done: {count} group(s)",
    "tip.aCurrent": "Enter the total score you see now. Single mode uses it with b to keep a-b unchanged.",
    "tip.bCurrent": "Enter the current chapter ranking score you are controlling.",
    "tip.targetIncrements": "Planned minimum points to add. Keep the default tiers for a first pass.",
    "tip.searchWindow": "How far upward to search from the minimum increment. Defaults are usually enough; larger is slower.",
    "tip.singleBExact": "Enter a final b only when the chapter ended or you want to check one exact score. Example: 6001234.",
    "tip.singleAExact": "Enter this only when you need one exact total score; leave it blank for normal trials. Example: 53012345.",
    "tip.multiAExact": "Enter this only when the final total a must be exact; leave it blank for normal planning. Example: 50012345.",
    "tip.requireAll": "Every listed digit string must appear exactly.",
    "tip.bRequireAll": "For single b, use this for birthdays, anniversaries, or digits that must appear in the final score. Example: 123.",
    "tip.aRequireAll": "Use this only when total a must contain a specific digit string; leave blank for normal trials. Example: 666,888.",
    "tip.lineRequireAll": "Digits this chapter's final score must contain, often for birthdays, anniversaries, or fixed display digits.",
    "tip.mayInclude": "Optional preferred digits. They do not block results unless At least one is checked. Separate groups with semicolons or new lines. Example: 1221,3443,1314.",
    "tip.requireAnyHard": "When checked, May include becomes a hard rule: each group must match at least one item. When unchecked, it is only a preference and scoring hint.",
    "tip.exclude": "Digits you do not want to see, such as disliked or unlucky combinations. Example: 4,74.",
    "tip.scoreThreshold": "Keep the default first. Higher hides ordinary results; lower shows more candidates.",
    "tip.resultLimit": "Keep the default first. Larger shows more choices; smaller keeps the page cleaner.",
    "tip.maxCandidates": "For multi mode, keep the default first. Raising it can make combinations grow very fast.",
    "tip.maxCombinations": "Browser safety cap for combinations. Raising it can make the page slower.",
    "tip.multiResultLimit": "Only controls how many final groups are displayed; larger mostly makes a longer list.",
    "tip.lineName": "Name the chapter so result details are easy to read.",
    "tip.lineCurrent": "Current score for this chapter ranking.",
    "tip.lineMinIncrement": "Minimum more points for this chapter. Ignore it when a locked value is set.",
    "tip.lineSearchWindow": "How far this chapter searches upward from the minimum increment. Increase only if needed.",
    "tip.lineExact": "Enter ended or fixed chapter scores here. Locked values are not searched.",
    "rule.exact": "Exact match: {patterns}",
    "rule.requireAll": "Must contain: {patterns}",
    "rule.mayInclude": "May include: {patterns}",
    "rule.mayIncludeRequired": "May include (at least one): {patterns}",
    "rule.exclude": "Must exclude: {patterns}",
    "rule.none": "No extra rules",
    "reason.contains": "Contains {pattern} (+{points})",
    "reason.run": "{value} repeated run (+{points})",
    "reason.palindrome": "{value} palindrome (+{points})",
    "reason.sequence": "{value} sequence (+{points})",
    "reason.ending": "Ending {value} (+{points})",
    "reason.overlap": "{left}+{right} forms {fused}, saving {overlap} digit(s) (+{points})",
    "empty.beauty": "No obvious digit highlights",
    "empty.control": "No overlap merge",
    "empty.noCandidate": "No combined candidates reached the threshold in this window",
    "empty.noHardRuleB": "No b value matched the hard rules",
    "empty.noMultiPlan": "No combination matched the total rules",
    "card.stage": "{increment} minimum increment",
    "card.hit": "Hard rules matched",
    "card.none": "No plan",
    "cell.increment": "Increment",
    "cell.singleB": "Single b",
    "cell.totalA": "Total a",
    "cell.control": "Control fit",
    "cell.beauty": "Score evaluation",
    "table.total": "Combined",
    "multi.card": "Combination {index}",
    "multi.totalIncrement": "Total increment",
    "multi.control": "b control",
    "multi.beauty": "a score",
    "multi.detail": "Details",
    "multi.locked": "Locked ",
    "error.range": "{label} must be between {min} and {max}",
    "error.numberList": "{label} needs at least one value",
    "error.needLine": "At least one b is required",
    "error.tooManyB": "The first version supports up to 6 b values",
    "error.noLineHit": "{name} did not match its hard rules",
    "error.tooManyCombos": "Estimated {count} combinations exceeds the cap of {max}",
    "confirm.unlocked": "{count} b values are not locked, so combinations may grow quickly.\n\nIf you continue, each unlocked b candidate cap will be tightened to {limit}.",
  },
};

let currentLanguage = "zh";
let numberFormatter = new Intl.NumberFormat("zh-CN");
let lastSingleResults = null;
let lastMultiPlans = null;

const waitForFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

class DigitRule {
  constructor({ exact = [], requireAll = [], includeGroups = [], requireAnyGroups = [], exclude = [] } = {}) {
    this.exact = normalizePatterns(exact);
    this.requireAll = normalizePatterns(requireAll);
    this.includeGroups = (includeGroups.length ? includeGroups : requireAnyGroups)
      .map((group) => normalizePatterns(group))
      .filter((group) => group.length > 0);
    this.requireAnyGroups = requireAnyGroups
      .map((group) => normalizePatterns(group))
      .filter((group) => group.length > 0);
    this.exclude = normalizePatterns(exclude);
  }

  match(value) {
    const text = String(value);

    if (this.exact.length && !this.exact.includes(text)) {
      return false;
    }

    if (this.requireAll.some((pattern) => !text.includes(pattern))) {
      return false;
    }

    if (this.exclude.some((pattern) => text.includes(pattern))) {
      return false;
    }

    return this.requireAnyGroups.every((group) =>
      group.some((pattern) => text.includes(pattern)),
    );
  }

  describe() {
    const parts = [];

    if (this.exact.length) {
      parts.push(t("rule.exact", { patterns: this.exact.join(", ") }));
    }

    if (this.requireAll.length) {
      parts.push(t("rule.requireAll", { patterns: this.requireAll.join(", ") }));
    }

    for (const group of this.includeGroups) {
      const required = this.requireAnyGroups.some((requiredGroup) =>
        requiredGroup.length === group.length && requiredGroup.every((pattern, index) => pattern === group[index]),
      );
      parts.push(t(required ? "rule.mayIncludeRequired" : "rule.mayInclude", { patterns: group.join(", ") }));
    }

    if (this.exclude.length) {
      parts.push(t("rule.exclude", { patterns: this.exclude.join(", ") }));
    }

    return parts.length ? parts.join(currentLanguage === "zh" ? "；" : "; ") : t("rule.none");
  }
}

function t(key, params = {}) {
  const dictionary = I18N[currentLanguage] || I18N.zh;
  const template = dictionary[key] ?? I18N.zh[key] ?? key;

  return template.replace(/\{(\w+)\}/g, (_, name) => {
    return Object.prototype.hasOwnProperty.call(params, name) ? params[name] : `{${name}}`;
  });
}

function setStatus(element, key, params = {}) {
  element.dataset.statusKey = key;
  element.dataset.statusParams = JSON.stringify(params);
  element.textContent = t(key, params);
}

function statusParams(element) {
  try {
    return JSON.parse(element.dataset.statusParams || "{}");
  } catch {
    return {};
  }
}

function normalizePatterns(patterns) {
  return patterns.map((pattern) => String(pattern).trim()).filter(Boolean);
}

function parsePatternList(value) {
  return String(value)
    .split(/[,\s，、|]+/)
    .map((pattern) => pattern.trim())
    .filter(Boolean);
}

function parsePatternGroups(value) {
  return String(value)
    .split(/[;\n；]+/)
    .map(parsePatternList)
    .filter((group) => group.length > 0);
}

function parseNumber(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(t("error.range", { label, min: formatNumber(min), max: formatNumber(max) }));
  }

  return Math.trunc(parsed);
}

function parseNumberList(value, label) {
  const numbers = parsePatternList(value).map((item) => parseNumber(item, label));

  if (!numbers.length) {
    throw new Error(t("error.numberList", { label }));
  }

  return numbers;
}

function exactNumbers(rule, label) {
  return rule.exact.map((pattern) => parseNumber(pattern, label, { max: 1999999999 }));
}

function buildRule(prefix, source) {
  const includeGroups = parsePatternGroups(source.get(`${prefix}RequireAny`) ?? "");
  const requireAnyHard = source.get(`${prefix}RequireAnyHard`) === "on";

  return new DigitRule({
    exact: parsePatternList(source.get(`${prefix}Exact`) ?? ""),
    requireAll: parsePatternList(source.get(`${prefix}RequireAll`) ?? ""),
    includeGroups,
    requireAnyGroups: requireAnyHard ? includeGroups : [],
    exclude: parsePatternList(source.get(`${prefix}Exclude`) ?? ""),
  });
}

function fieldShell(input) {
  return input.closest(".field-block") || input.closest("label") || input.closest(".line-may-include");
}

function setFieldDisabled(input, disabled) {
  input.disabled = disabled;
  input.setAttribute("aria-disabled", String(disabled));

  const shell = fieldShell(input);
  if (shell) {
    shell.classList.toggle("is-disabled", disabled);
  }
}

function syncLockGroup(container, exactName, dependentNames) {
  const exactInput = container.querySelector(`[name="${exactName}"]`);
  if (!exactInput) {
    return;
  }

  const locked = exactInput.value.trim() !== "";
  for (const name of dependentNames) {
    const input = container.querySelector(`[name="${name}"]`);
    if (input) {
      setFieldDisabled(input, locked);
    }
  }
}

function syncSingleLockStates() {
  const form = document.querySelector("#single-form");
  syncLockGroup(form, "bExact", ["bRequireAll", "bRequireAny", "bRequireAnyHard", "bExclude"]);
  syncLockGroup(form, "aExact", ["aRequireAll", "aRequireAny", "aRequireAnyHard", "aExclude"]);
}

function syncMultiTotalLockState() {
  const form = document.querySelector("#multi-form");
  syncLockGroup(form, "multiAExact", [
    "multiARequireAll",
    "multiARequireAny",
    "multiARequireAnyHard",
    "multiAExclude",
  ]);
}

function syncLineRowLockState(row) {
  syncLockGroup(row, "exact", [
    "current",
    "minIncrement",
    "searchWindow",
    "requireAll",
    "requireAny",
    "requireAnyHard",
    "exclude",
  ]);
}

function syncLockStates() {
  syncSingleLockStates();
  syncMultiTotalLockState();
  document.querySelectorAll("#line-rows .line-row").forEach(syncLineRowLockState);
}

function findRepeatedRuns(text, minLength = 2) {
  const runs = [];
  let start = 0;

  for (let index = 1; index <= text.length; index += 1) {
    if (index === text.length || text[index] !== text[start]) {
      const run = text.slice(start, index);
      if (run.length >= minLength) {
        runs.push(run);
      }
      start = index;
    }
  }

  return runs;
}

function findPalindromes(text, minLength = 3, maxLength = 6, limit = 4) {
  const palindromes = [];
  const safeMaxLength = Math.min(maxLength, text.length);

  for (let length = safeMaxLength; length >= minLength; length -= 1) {
    for (let start = 0; start <= text.length - length; start += 1) {
      const piece = text.slice(start, start + length);
      const reversed = [...piece].reverse().join("");
      const uniqueSize = new Set(piece).size;

      if (piece === reversed && uniqueSize > 1) {
        palindromes.push(piece);
        if (palindromes.length >= limit) {
          return palindromes;
        }
      }
    }
  }

  return palindromes;
}

function evaluateBeauty(value) {
  const text = String(value);
  let score = 0;
  const reasons = [];

  for (const [pattern, points] of DEFAULT_PATTERN_WEIGHTS.entries()) {
    if (text.includes(pattern)) {
      score += points;
      reasons.push(t("reason.contains", { pattern, points }));
    }
  }

  for (const run of findRepeatedRuns(text)) {
    const points = run.length * run.length + (run.length >= 3 ? 8 : 2);
    score += points;
    reasons.push(t("reason.run", { value: run, points }));
  }

  for (const palindrome of findPalindromes(text)) {
    const points = palindrome.length * 5;
    score += points;
    reasons.push(t("reason.palindrome", { value: palindrome, points }));
  }

  for (const sequence of GOOD_SEQUENCES) {
    if (text.includes(sequence)) {
      score += 8;
      reasons.push(t("reason.sequence", { value: sequence, points: 8 }));
    }
  }

  const goodEnding = ["888", "666", "988", "1314"].find((ending) => text.endsWith(ending));
  if (goodEnding) {
    score += 8;
    reasons.push(t("reason.ending", { value: goodEnding, points: 8 }));
  }

  return { score, reasons };
}

function matchedRulePatterns(value, rule) {
  const text = String(value);
  const patterns = [];
  const seen = new Set();
  const add = (pattern) => {
    if (text.includes(pattern) && !seen.has(pattern)) {
      patterns.push(pattern);
      seen.add(pattern);
    }
  };

  for (const pattern of rule.requireAll) {
    add(pattern);
  }

  for (const group of rule.includeGroups) {
    for (const pattern of group) {
      add(pattern);
    }
  }

  return patterns;
}

function bestOverlap(left, right) {
  const maxOverlap = Math.min(left.length, right.length);

  for (let size = maxOverlap; size > 0; size -= 1) {
    if (left.endsWith(right.slice(0, size))) {
      return size;
    }
  }

  return 0;
}

function evaluateControlFit(value, rule) {
  const text = String(value);
  const patterns = matchedRulePatterns(value, rule);
  let score = 0;
  const reasons = [];
  const counted = new Set();

  for (const left of patterns) {
    for (const right of patterns) {
      if (left === right) {
        continue;
      }

      const overlap = bestOverlap(left, right);
      if (!overlap) {
        continue;
      }

      const fused = left + right.slice(overlap);
      const key = `${left}|${right}|${fused}`;

      if (!text.includes(fused) || counted.has(key)) {
        continue;
      }

      counted.add(key);
      const points = overlap * 18;
      score += points;
      reasons.push(t("reason.overlap", { left, right, fused, overlap, points }));
    }
  }

  return { score, reasons };
}

function planScore(plan) {
  return plan.beauty.score + plan.control.score;
}

function comparePlans(left, right) {
  return (
    planScore(right) - planScore(left) ||
    right.beauty.score - left.beauty.score ||
    right.control.score - left.control.score ||
    left.increment - right.increment ||
    left.aValue - right.aValue
  );
}

async function searchSingleScore(options) {
  const {
    aCurrent,
    bCurrent,
    minIncrement,
    searchWindow,
    bRule,
    aRule,
    scoreThreshold,
    resultLimit,
    onProgress,
  } = options;

  const diff = aCurrent - bCurrent;
  const bStart = bCurrent + minIncrement;
  const bEnd = bStart + searchWindow;
  const lockedBValues = bRule.exact.length ? exactNumbers(bRule, t("label.exact")) : null;
  const candidates = [];
  let limitPlan = null;

  const recordCandidate = (plan) => {
    if (resultLimit <= 0) {
      return;
    }

    if (candidates.length < resultLimit) {
      candidates.push(plan);
      candidates.sort(comparePlans);
      return;
    }

    if (comparePlans(plan, candidates[candidates.length - 1]) < 0) {
      candidates[candidates.length - 1] = plan;
      candidates.sort(comparePlans);
    }
  };

  const visitBValue = (bValue) => {
    if (!bRule.match(bValue)) {
      return;
    }

    const aValue = bValue + diff;
    if (!aRule.match(aValue)) {
      return;
    }

    const plan = {
      increment: bValue - bCurrent,
      bValue,
      aValue,
      beauty: evaluateBeauty(aValue),
      control: evaluateControlFit(bValue, bRule),
    };

    if (!limitPlan) {
      limitPlan = plan;
    }

    if (planScore(plan) >= scoreThreshold) {
      recordCandidate(plan);
    }
  };

  if (lockedBValues) {
    for (const bValue of [...new Set(lockedBValues)].sort((left, right) => left - right)) {
      if (bValue - bCurrent >= minIncrement) {
        visitBValue(bValue);
      }
    }

    return {
      minIncrement,
      limitPlan,
      candidates,
    };
  }

  for (let bValue = bStart; bValue < bEnd; bValue += 1) {
    visitBValue(bValue);

    if ((bValue - bStart) % 50000 === 0) {
      onProgress?.(bValue - bStart, searchWindow);
      await waitForFrame();
    }
  }

  return {
    minIncrement,
    limitPlan,
    candidates,
  };
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function formatNumber(value) {
  return numberFormatter.format(value);
}

function formatReasons(reasons, emptyText = t("empty.beauty"), limit = 4) {
  if (!reasons.length) {
    return emptyText;
  }

  const selected = reasons.slice(0, limit).join(currentLanguage === "zh" ? "、" : "; ");
  return reasons.length > limit ? `${selected} ${currentLanguage === "zh" ? "等" : "..."}` : selected;
}

function renderPlanGrid(plan) {
  const grid = createElement("div", "plan-grid");
  const cells = [
    [t("cell.increment"), formatNumber(plan.increment), "accent"],
    [t("cell.singleB"), formatNumber(plan.bValue), ""],
    [t("cell.totalA"), formatNumber(plan.aValue), ""],
    [t("cell.control"), `${plan.control.score} / ${formatReasons(plan.control.reasons, t("empty.control"))}`, ""],
    [t("cell.beauty"), `${plan.beauty.score} / ${formatReasons(plan.beauty.reasons)}`, ""],
  ];

  for (const [label, value, className] of cells) {
    const cell = createElement("div", `plan-cell ${className}`.trim());
    cell.append(createElement("strong", "", label), createElement("span", "", value));
    grid.append(cell);
  }

  return grid;
}

function renderCandidateTable(candidates) {
  if (!candidates.length) {
    return createElement("div", "empty-state", t("empty.noCandidate"));
  }

  const table = createElement("table", "candidate-table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  for (const label of [
    t("table.total"),
    t("cell.increment"),
    "b",
    "a",
    t("cell.control"),
    t("cell.beauty"),
  ]) {
    headerRow.append(createElement("th", "", label));
  }

  thead.append(headerRow);
  table.append(thead);

  const tbody = document.createElement("tbody");
  for (const plan of candidates) {
    const row = document.createElement("tr");
    const values = [
      String(planScore(plan)),
      formatNumber(plan.increment),
      formatNumber(plan.bValue),
      formatNumber(plan.aValue),
      `${plan.control.score} / ${formatReasons(plan.control.reasons, t("empty.control"))}`,
      `${plan.beauty.score} / ${formatReasons(plan.beauty.reasons)}`,
    ];

    for (const value of values) {
      row.append(createElement("td", "", value));
    }
    tbody.append(row);
  }

  table.append(tbody);
  return table;
}

function renderSingleResults(results) {
  const container = document.querySelector("#single-results");
  container.replaceChildren();

  for (const result of results) {
    const card = createElement("article", "result-card");
    const header = document.createElement("header");
    header.append(
      createElement("h3", "", t("card.stage", { increment: formatNumber(result.minIncrement) })),
      createElement("small", "", result.limitPlan ? t("card.hit") : t("card.none")),
    );
    card.append(header);

    if (result.limitPlan) {
      card.append(renderPlanGrid(result.limitPlan), renderCandidateTable(result.candidates));
    } else {
      card.append(createElement("div", "empty-state", t("empty.noHardRuleB")));
    }

    container.append(card);
  }
}

async function runSingleSearch(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const status = document.querySelector("#single-status");
  const submitButton = form.querySelector(".primary-button");

  try {
    submitButton.disabled = true;
    setStatus(status, "status.running");

    const aCurrent = parseNumber(data.get("aCurrent"), t("label.aCurrent"), { max: 1999999999 });
    const bCurrent = parseNumber(data.get("bCurrent"), t("label.bCurrent"), { max: 1999999999 });
    const targetIncrements = parseNumberList(data.get("targetIncrements"), t("label.targetIncrements"));
    const searchWindow = parseNumber(data.get("searchWindow"), t("label.searchWindow"), {
      min: 1,
      max: 5000000,
    });
    const scoreThreshold = parseNumber(data.get("scoreThreshold"), t("label.scoreThreshold"));
    const resultLimit = parseNumber(data.get("resultLimit"), t("label.resultLimit"), { min: 1, max: 50 });
    const bRule = buildRule("b", data);
    const aRule = buildRule("a", data);
    const results = [];

    for (const minIncrement of targetIncrements) {
      setStatus(status, "status.singleStage", { increment: formatNumber(minIncrement) });
      const result = await searchSingleScore({
        aCurrent,
        bCurrent,
        minIncrement,
        searchWindow,
        bRule,
        aRule,
        scoreThreshold,
        resultLimit,
        onProgress: (done, total) => {
          const percent = Math.floor((done / total) * 100);
          setStatus(status, "status.singleProgress", {
            increment: formatNumber(minIncrement),
            percent,
          });
        },
      });
      results.push(result);
    }

    lastSingleResults = results;
    renderSingleResults(results);
    setStatus(status, "status.singleDone", { count: results.length });
  } catch (error) {
    renderError("#single-results", error.message);
    setStatus(status, "status.parameterError");
  } finally {
    submitButton.disabled = false;
  }
}

function renderError(selector, message) {
  const container = document.querySelector(selector);
  container.replaceChildren(createElement("div", "error-state", message));
}

function lineRowValues(row) {
  const exact = parsePatternList(row.querySelector('[name="exact"]').value);
  const locked = exact.length > 0;
  const includeGroups = locked ? [] : parsePatternGroups(row.querySelector('[name="requireAny"]').value);
  const requireAnyHard = !locked && row.querySelector('[name="requireAnyHard"]').checked;

  return {
    name: row.querySelector('[name="name"]').value.trim() || "b",
    current: parseNumber(row.querySelector('[name="current"]').value, t("line.current"), {
      max: 1999999999,
    }),
    minIncrement: parseNumber(row.querySelector('[name="minIncrement"]').value, t("line.minIncrement"), {
      max: 1999999999,
    }),
    searchWindow: parseNumber(row.querySelector('[name="searchWindow"]').value, t("line.searchWindow"), {
      min: 1,
      max: 5000000,
    }),
    rule: new DigitRule({
      exact,
      requireAll: locked ? [] : parsePatternList(row.querySelector('[name="requireAll"]').value),
      includeGroups,
      requireAnyGroups: requireAnyHard ? includeGroups : [],
      exclude: locked ? [] : parsePatternList(row.querySelector('[name="exclude"]').value),
    }),
  };
}

async function generateLineCandidates(config, maxCandidates, onProgress) {
  const candidates = [];

  if (config.rule.exact.length) {
    const values = [...new Set(exactNumbers(config.rule, `${config.name} ${t("line.exact")}`))]
      .sort((left, right) => left - right);

    for (const value of values) {
      const increment = value - config.current;

      if (!config.rule.match(value)) {
        continue;
      }

      candidates.push({
        name: config.name,
        increment,
        value,
        control: evaluateControlFit(value, config.rule),
        locked: true,
      });

      if (candidates.length >= maxCandidates) {
        break;
      }
    }

    return candidates;
  }

  const start = config.current + config.minIncrement;
  const end = start + config.searchWindow;

  for (let value = start; value < end; value += 1) {
    if (config.rule.match(value)) {
      candidates.push({
        name: config.name,
        increment: value - config.current,
        value,
        control: evaluateControlFit(value, config.rule),
      });

      if (candidates.length >= maxCandidates) {
        break;
      }
    }

    if ((value - start) % 50000 === 0) {
      onProgress?.(value - start, config.searchWindow);
      await waitForFrame();
    }
  }

  return candidates;
}

function combineCandidateGroups(groups, maxResults, aRule) {
  const results = [];
  const stack = [];

  const visit = (index, totalValue, totalIncrement, controlScore) => {
    if (index === groups.length) {
      if (!aRule.match(totalValue)) {
        return;
      }

      const beauty = evaluateBeauty(totalValue);
      const plan = {
        totalValue,
        totalIncrement,
        lines: stack.slice(),
        beauty,
        controlScore,
        score: beauty.score + controlScore,
      };

      results.push(plan);
      return;
    }

    for (const candidate of groups[index]) {
      stack.push(candidate);
      visit(
        index + 1,
        totalValue + candidate.value,
        totalIncrement + candidate.increment,
        controlScore + candidate.control.score,
      );
      stack.pop();
    }
  };

  visit(0, 0, 0, 0);
  results.sort(
    (left, right) =>
      right.score - left.score ||
      right.beauty.score - left.beauty.score ||
      left.totalIncrement - right.totalIncrement ||
      left.totalValue - right.totalValue,
  );
  return results.slice(0, maxResults);
}

function adaptiveCandidateLimit(requestedLimit, unlockedCount) {
  if (unlockedCount <= 2) {
    return requestedLimit;
  }

  const caps = {
    3: 30,
    4: 15,
    5: 8,
    6: 5,
  };

  return Math.min(requestedLimit, caps[unlockedCount] ?? 5);
}

function renderMultiResults(plans) {
  const container = document.querySelector("#multi-results");
  container.replaceChildren();

  if (!plans.length) {
    container.append(createElement("div", "empty-state", t("empty.noMultiPlan")));
    return;
  }

  for (const [index, plan] of plans.entries()) {
    const card = createElement("article", "result-card");
    const header = document.createElement("header");
    header.append(
      createElement("h3", "", t("multi.card", { index: index + 1 })),
      createElement("small", "", `${t("table.total")} ${plan.score}`),
    );
    card.append(header);

    const grid = createElement("div", "plan-grid");
    const cells = [
      [t("multi.totalIncrement"), formatNumber(plan.totalIncrement), "accent"],
      [t("cell.totalA"), formatNumber(plan.totalValue), ""],
      [t("multi.control"), String(plan.controlScore), ""],
      [t("multi.beauty"), `${plan.beauty.score} / ${formatReasons(plan.beauty.reasons)}`, ""],
      [
        t("multi.detail"),
        plan.lines
          .map((line) => {
            const lockLabel = line.locked ? t("multi.locked") : "";
            return `${line.name}: ${lockLabel}${formatNumber(line.value)} (+${formatNumber(line.increment)})`;
          })
          .join(currentLanguage === "zh" ? "；" : "; "),
        "",
      ],
    ];

    for (const [label, value, className] of cells) {
      const cell = createElement("div", `plan-cell ${className}`.trim());
      cell.append(createElement("strong", "", label), createElement("span", "", value));
      grid.append(cell);
    }

    card.append(grid);
    container.append(card);
  }
}

async function runMultiSearch(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const rows = [...document.querySelectorAll("#line-rows .line-row")];
  const status = document.querySelector("#multi-status");
  const submitButton = form.querySelector(".primary-button");

  try {
    submitButton.disabled = true;
    setStatus(status, "status.generating");

    const maxCandidates = parseNumber(data.get("maxCandidates"), t("label.maxCandidates"), {
      min: 1,
      max: 100,
    });
    const maxCombinations = parseNumber(data.get("maxCombinations"), t("label.maxCombinations"), {
      min: 1000,
      max: 2000000,
    });
    const maxResults = parseNumber(data.get("multiResultLimit"), t("label.multiResultLimit"), {
      min: 1,
      max: 50,
    });
    const aRule = buildRule("multiA", data);
    const configs = rows.map(lineRowValues);

    if (!configs.length) {
      throw new Error(t("error.needLine"));
    }

    if (configs.length > 6) {
      throw new Error(t("error.tooManyB"));
    }

    const unlockedCount = configs.filter((config) => !config.rule.exact.length).length;
    const effectiveMaxCandidates = adaptiveCandidateLimit(maxCandidates, unlockedCount);

    if (unlockedCount >= 3) {
      const continueSearch = window.confirm(
        t("confirm.unlocked", { count: unlockedCount, limit: effectiveMaxCandidates }),
      );

      if (!continueSearch) {
        setStatus(status, "status.cancelled");
        return;
      }
    }

    const groups = [];
    for (const config of configs) {
      setStatus(status, "status.generatingLine", { name: config.name });
      const lineCandidateLimit = config.rule.exact.length ? maxCandidates : effectiveMaxCandidates;
      const group = await generateLineCandidates(config, lineCandidateLimit, (done, total) => {
        const percent = Math.floor((done / total) * 100);
        setStatus(status, "status.lineProgress", { name: config.name, percent });
      });

      if (!group.length) {
        throw new Error(t("error.noLineHit", { name: config.name }));
      }

      groups.push(group);
    }

    const combinationCount = groups.reduce((total, group) => total * group.length, 1);
    if (combinationCount > maxCombinations) {
      throw new Error(
        t("error.tooManyCombos", {
          count: formatNumber(combinationCount),
          max: formatNumber(maxCombinations),
        }),
      );
    }

    setStatus(status, "status.combining", { count: formatNumber(combinationCount) });
    await waitForFrame();
    const plans = combineCandidateGroups(groups, maxResults, aRule);
    lastMultiPlans = plans;
    renderMultiResults(plans);
    setStatus(status, "status.multiDone", { count: formatNumber(combinationCount) });
  } catch (error) {
    renderError("#multi-results", error.message);
    setStatus(status, "status.parameterError");
  } finally {
    submitButton.disabled = false;
  }
}

function addLineRow(values = {}) {
  const rows = document.querySelector("#line-rows");
  const template = document.querySelector("#line-row-template");
  const row = template.content.firstElementChild.cloneNode(true);
  const index = rows.children.length + 1;
  const defaults = {
    name: `b${index}`,
    current: "",
    minIncrement: 0,
    searchWindow: 1000000,
    exact: "",
    requireAll: "",
    requireAny: "",
    requireAnyHard: false,
    exclude: "",
    ...values,
  };

  for (const [name, value] of Object.entries(defaults)) {
    const input = row.querySelector(`[name="${name}"]`);
    if (input) {
      if (input.type === "checkbox") {
        input.checked = Boolean(value);
      } else {
        input.value = value;
      }
    }
  }

  row.querySelector("[data-remove-line]").addEventListener("click", () => {
    row.remove();
  });

  rows.append(row);
  applyLocalizedAttributes(row);
  syncLineRowLockState(row);
}

function resetMultiRows() {
  const rows = document.querySelector("#line-rows");
  rows.replaceChildren();
  addLineRow({
    name: "b1",
    current: 3000000,
    minIncrement: 3000000,
    searchWindow: 1000000,
    requireAll: "123",
    requireAny: "520,521,1314",
  });
  addLineRow({
    name: "b2",
    current: 0,
    minIncrement: 0,
    searchWindow: 100000,
    requireAll: "",
    requireAny: "",
  });
}

function bindLockStateControls() {
  const singleForm = document.querySelector("#single-form");
  const multiForm = document.querySelector("#multi-form");
  const lineRows = document.querySelector("#line-rows");

  singleForm.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement && ["bExact", "aExact"].includes(event.target.name)) {
      syncSingleLockStates();
    }
  });

  singleForm.addEventListener("reset", () => {
    setTimeout(syncSingleLockStates, 0);
  });

  multiForm.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    if (event.target.name === "multiAExact") {
      syncMultiTotalLockState();
      return;
    }

    if (event.target.name === "exact") {
      const row = event.target.closest(".line-row");
      if (row) {
        syncLineRowLockState(row);
      }
    }
  });

  lineRows.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement && event.target.name === "exact") {
      const row = event.target.closest(".line-row");
      if (row) {
        syncLineRowLockState(row);
      }
    }
  });
}

function bindTabs() {
  const buttons = [...document.querySelectorAll(".tab-button")];
  const panels = {
    single: document.querySelector("#single-panel"),
    multi: document.querySelector("#multi-panel"),
    guide: document.querySelector("#guide-panel"),
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      for (const item of buttons) {
        item.classList.toggle("active", item === button);
      }

      for (const [key, panel] of Object.entries(panels)) {
        panel.classList.toggle("active", key === button.dataset.tab);
      }
    });
  }
}

function applyLocalizedAttributes(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  root.querySelectorAll("[data-tooltip]").forEach((element) => {
    const tooltip = t(element.dataset.tooltip);
    element.title = tooltip;

    const label = element.closest("label");
    if (label) {
      label.title = tooltip;
      const input = label.querySelector("input");
      if (input) {
        input.title = tooltip;
      }
    }
  });

  root.querySelectorAll("[data-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.ariaLabel));
  });

  root.querySelectorAll("[data-title]").forEach((element) => {
    element.title = t(element.dataset.title);
  });

  root.querySelectorAll("[data-status-key]").forEach((element) => {
    element.textContent = t(element.dataset.statusKey, statusParams(element));
  });
}

function tooltipElement() {
  let element = document.querySelector(".floating-tooltip");

  if (!element) {
    element = document.createElement("div");
    element.className = "floating-tooltip";
    element.hidden = true;
    element.setAttribute("role", "tooltip");
    document.body.append(element);
  }

  return element;
}

function hideTapTooltip() {
  const element = document.querySelector(".floating-tooltip");
  if (element) {
    element.hidden = true;
  }
}

function showTapTooltip(trigger) {
  const tooltip = tooltipElement();
  tooltip.textContent = t(trigger.dataset.tooltip);
  tooltip.hidden = false;

  const margin = 12;
  const rect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const maxLeft = window.innerWidth - tooltipRect.width - margin;
  const left = Math.max(margin, Math.min(rect.left, maxLeft));
  let top = rect.bottom + 8;

  if (top + tooltipRect.height > window.innerHeight - margin) {
    top = Math.max(margin, rect.top - tooltipRect.height - 8);
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function bindTapTooltips() {
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest("[data-tooltip]");
    if (!trigger) {
      hideTapTooltip();
      return;
    }

    if (!trigger.matches("input, textarea, select")) {
      event.preventDefault();
    }

    showTapTooltip(trigger);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideTapTooltip();
    }
  });

  window.addEventListener("resize", hideTapTooltip);
  window.addEventListener("scroll", hideTapTooltip, true);
}

function setLanguage(language) {
  hideTapTooltip();
  currentLanguage = language;
  numberFormatter = new Intl.NumberFormat(language === "en" ? "en-US" : "zh-CN");
  document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  document.title = t("app.title");

  document.querySelectorAll(".language-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.language === language);
  });

  applyLocalizedAttributes();

  if (lastSingleResults) {
    renderSingleResults(lastSingleResults);
  }

  if (lastMultiPlans) {
    renderMultiResults(lastMultiPlans);
  }
}

function bindLanguageSwitch() {
  document.querySelectorAll(".language-button").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.language);
    });
  });
}

function init() {
  bindTabs();
  bindLanguageSwitch();
  bindTapTooltips();
  resetMultiRows();
  bindLockStateControls();
  setLanguage("zh");
  syncLockStates();
  document.querySelector("#single-form").addEventListener("submit", runSingleSearch);
  document.querySelector("#multi-form").addEventListener("submit", runMultiSearch);
  document.querySelector("#add-line").addEventListener("click", () => {
    if (document.querySelectorAll("#line-rows .line-row").length >= 6) {
      renderError("#multi-results", t("error.tooManyB"));
      return;
    }
    addLineRow();
  });
  document.querySelector("#multi-form").addEventListener("reset", () => {
    setTimeout(() => {
      resetMultiRows();
      syncMultiTotalLockState();
    }, 0);
  });
}

init();
