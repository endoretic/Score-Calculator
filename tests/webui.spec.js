const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { expect, test } = require("@playwright/test");

test("single-score search renders default control results", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  const singleForm = page.locator("#single-form");
  await singleForm.locator('[name="aCurrent"]').fill("50000000");
  await singleForm.locator('[name="bCurrent"]').fill("3000000");
  await page.getByLabel("增量下限").fill("3000000");
  await page.getByLabel("搜索窗口").fill("400000");
  await singleForm.locator('[name="bRequireAll"]').fill("123");
  await singleForm.locator('[name="bRequireAny"]').fill("812");
  await singleForm.locator('[name="bRequireAnyHard"]').check();
  await page.getByRole("button", { name: "计算" }).click();

  await expect(page.getByText("完成 1 档")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("6,008,123")).toBeVisible();
  await expect(page.getByText("命中规则 123").first()).toBeVisible();
  await expect(page.getByText("命中规则 812").first()).toBeVisible();
});

test("single-score exact match locks final b outside the search window", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  const singleForm = page.locator("#single-form");
  await singleForm.locator('[name="aCurrent"]').fill("50000000");
  await singleForm.locator('[name="bCurrent"]').fill("3000000");
  await singleForm.locator('[name="targetIncrements"]').fill("3000000");
  await singleForm.locator('[name="searchWindow"]').fill("10");
  await singleForm.locator('[name="bExact"]').fill("6081230");
  await expect(singleForm.locator('[name="bExact"]')).toBeEnabled();
  await expect(singleForm.locator('[name="bRequireAll"]')).toBeDisabled();
  await expect(singleForm.locator('[name="bRequireAny"]')).toBeDisabled();
  await expect(singleForm.locator('[name="bRequireAnyHard"]')).toBeDisabled();
  await expect(singleForm.locator('[name="bExclude"]')).toBeDisabled();
  await page.getByRole("button", { name: "计算" }).click();

  await expect(page.getByText("完成 1 档")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("6,081,230").first()).toBeVisible();
  await expect(page.getByText("53,081,230").first()).toBeVisible();
});

test("exact and locked values disable related inputs", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  const singleForm = page.locator("#single-form");

  await singleForm.locator('[name="aExact"]').fill("53012345");
  await expect(singleForm.locator('[name="aExact"]')).toBeEnabled();
  await expect(singleForm.locator('[name="aRequireAll"]')).toBeDisabled();
  await expect(singleForm.locator('[name="aRequireAny"]')).toBeDisabled();
  await expect(singleForm.locator('[name="aRequireAnyHard"]')).toBeDisabled();
  await expect(singleForm.locator('[name="aExclude"]')).toBeDisabled();

  await singleForm.locator('[name="aExact"]').fill("");
  await expect(singleForm.locator('[name="aRequireAll"]')).toBeEnabled();
  await expect(singleForm.locator('[name="aRequireAny"]')).toBeEnabled();
  await expect(singleForm.locator('[name="aRequireAnyHard"]')).toBeEnabled();
  await expect(singleForm.locator('[name="aExclude"]')).toBeEnabled();

  await page.getByRole("button", { name: "多榜" }).click();
  const multiForm = page.locator("#multi-form");
  await multiForm.locator('[name="multiAExact"]').fill("50012345");
  await expect(multiForm.locator('[name="multiAExact"]')).toBeEnabled();
  await expect(multiForm.locator('[name="multiARequireAll"]')).toBeDisabled();
  await expect(multiForm.locator('[name="multiARequireAny"]')).toBeDisabled();
  await expect(multiForm.locator('[name="multiARequireAnyHard"]')).toBeDisabled();
  await expect(multiForm.locator('[name="multiAExclude"]')).toBeDisabled();

  const first = page.locator("#line-rows .line-row").nth(0);
  await first.locator('[name="current"]').fill("6001234");
  await first.locator('[name="locked"]').check();
  await expect(first.locator('[name="name"]')).toBeEnabled();
  await expect(first.locator('[name="current"]')).toBeEnabled();
  await expect(first.locator('[name="locked"]')).toBeEnabled();
  await expect(first.locator('[name="minIncrement"]')).toBeDisabled();
  await expect(first.locator('[name="searchWindow"]')).toBeDisabled();
  await expect(first.locator('[name="requireAll"]')).toBeDisabled();
  await expect(first.locator('[name="requireAny"]')).toBeDisabled();
  await expect(first.locator('[name="requireAnyHard"]')).toBeDisabled();
  await expect(first.locator('[name="exclude"]')).toBeDisabled();

  await first.locator('[name="locked"]').uncheck();
  await expect(first.locator('[name="current"]')).toBeEnabled();
  await expect(first.locator('[name="minIncrement"]')).toBeEnabled();
  await expect(first.locator('[name="searchWindow"]')).toBeEnabled();
  await expect(first.locator('[name="requireAll"]')).toBeEnabled();
  await expect(first.locator('[name="requireAny"]')).toBeEnabled();
  await expect(first.locator('[name="requireAnyHard"]')).toBeEnabled();
  await expect(first.locator('[name="exclude"]')).toBeEnabled();
});

test("may-include only blocks results when at-least-one is checked", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  const singleForm = page.locator("#single-form");
  await singleForm.locator('[name="aCurrent"]').fill("50000000");
  await singleForm.locator('[name="bCurrent"]').fill("0");
  await singleForm.locator('[name="targetIncrements"]').fill("3000000");
  await singleForm.locator('[name="searchWindow"]').fill("100000");
  await singleForm.locator('[name="aExact"]').fill("53012345");

  await page.getByRole("button", { name: "计算" }).click();

  await expect(page.getByText("完成 1 档")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("3,012,345").first()).toBeVisible();
  await expect(page.getByText("53,012,345").first()).toBeVisible();

  await singleForm.locator('[name="bRequireAnyHard"]').check();
  await page.getByRole("button", { name: "计算" }).click();

  await expect(page.getByText("没有找到满足硬规则的 b")).toBeVisible({ timeout: 15000 });
});

test("multi-score warns before searching three unlocked b lines", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  await page.getByRole("button", { name: "多榜" }).click();
  await page.getByRole("button", { name: "添加 b" }).click();
  await page.locator("#line-rows .line-row").nth(2).locator('[name="current"]').fill("0");

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("3 个 b 未勾选锁定");
    await dialog.dismiss();
  });

  await page.getByRole("button", { name: "计算多榜" }).click();
  await expect(page.getByText("已取消")).toBeVisible();
});

test("multi-score locked b uses current value as a constant", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  await page.getByRole("button", { name: "多榜" }).click();

  const rows = page.locator("#line-rows .line-row");
  const first = rows.nth(0);
  const second = rows.nth(1);

  await first.locator('[name="current"]').fill("6001234");
  await first.locator('[name="minIncrement"]').fill("999999");
  await first.locator('[name="locked"]').check();
  await expect(first.locator('[name="name"]')).toBeEnabled();
  await expect(first.locator('[name="current"]')).toBeEnabled();
  await expect(first.locator('[name="requireAll"]')).toBeDisabled();
  await expect(first.locator('[name="requireAny"]')).toBeDisabled();

  await second.locator('[name="current"]').fill("1000");
  await second.locator('[name="minIncrement"]').fill("999999");
  await second.locator('[name="locked"]').check();

  await page.getByRole("button", { name: "计算多榜" }).click();

  await expect(page.getByText("完成 1 组")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("b1: 锁定 6,001,234 (+0)")).toBeVisible();
  await expect(page.getByText("b2: 锁定 1,000 (+0)")).toBeVisible();

  const cells = page.locator("#multi-results .result-card").first().locator(".plan-cell");
  await expect(cells.nth(2).locator("strong")).toHaveText("单榜 b");
  await expect(cells.nth(2).locator("span")).toHaveText(/b1: 锁定 6,001,234 \(\+0\)\nb2: 锁定 1,000 \(\+0\)/);
  await expect(cells.nth(4).locator("strong")).toHaveText("b 分数评价");
  await expect(cells.nth(4).locator("span")).toContainText("49 /");
  await expect(cells.nth(4).locator("span")).toContainText("包含 123");
});

test("language switch renders English labels and tooltips", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  await page.getByRole("button", { name: "English" }).click();

  await expect(page.getByRole("heading", { name: "Score Control Calculator" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run" })).toBeVisible();
  await expect(page.getByText("May include").first()).toBeVisible();
  await expect(page.getByText("At least one").first()).toBeVisible();
  await expect(page.locator("#single-form").locator('[name="targetIncrements"]')).not.toHaveAttribute(
    "title",
    /.+/,
  );
  await expect(page.locator("#single-form").locator('[name="bExact"]')).not.toHaveAttribute(
    "placeholder",
    /.+/,
  );
  await expect(page.locator("#single-form").locator('[name="bExact"]')).not.toHaveAttribute("title", /.+/);

  await page.locator('#single-form [data-tooltip="tip.targetIncrements"]').click();
  await expect(page.locator(".floating-tooltip")).toContainText(
    "Planned minimum points to add. Keep the default tiers for a first pass.",
  );

  await page.locator("#single-form").locator('[name="targetIncrements"]').click();
  await expect(page.locator(".floating-tooltip")).toBeHidden();
});

test("guide tab explains World Link score control usage", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  await page.getByRole("button", { name: "说明" }).click();

  await expect(page.getByRole("heading", { name: "使用说明" })).toBeVisible();
  await expect(page.getByText("World Link 控分")).toBeVisible();
  await expect(page.getByText("单人榜 b 的“必须包含”最常见用途是控制生日")).toBeVisible();
  await expect(page.getByText("大多数参数第一次可以先用默认")).toBeVisible();
  await expect(page.getByText("移动端没有鼠标悬停")).toBeVisible();

  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Guide" })).toBeVisible();
  await expect(page.getByText("Use this for World Link score control")).toBeVisible();
  await expect(page.getByText("For single b, Must contain is usually for birthdays")).toBeVisible();
  await expect(page.getByText("On mobile, tap a field label")).toBeVisible();
});

test("mobile layout keeps controls usable and exposes tap tooltips", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(fileUrl);

  await expect(page.getByRole("heading", { name: "控分计算器" })).toBeVisible();
  await expect(page.getByRole("button", { name: "单榜" })).toBeVisible();
  await expect(page.getByRole("button", { name: "多榜" })).toBeVisible();
  await expect(page.getByRole("button", { name: "说明" })).toBeVisible();

  const noSinglePageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(noSinglePageOverflow).toBe(true);

  await page.locator('#single-form [data-tooltip="tip.aCurrent"]').click();
  await expect(page.locator(".floating-tooltip")).toContainText("填现在看到的总榜分");

  await page.getByRole("button", { name: "多榜" }).click();
  const noMultiPageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(noMultiPageOverflow).toBe(true);

  const tableScrollsInside = await page.locator(".line-table").evaluate((element) => {
    const style = window.getComputedStyle(element);
    return element.scrollWidth > element.clientWidth && style.overflowX === "auto";
  });
  expect(tableScrollsInside).toBe(true);

  await page.getByRole("button", { name: "说明" }).click();
  await expect(page.getByText("移动端没有鼠标悬停")).toBeVisible();
});
