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
  await page.getByRole("button", { name: "计算" }).click();

  await expect(page.getByText("完成 1 档")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("6,008,123")).toBeVisible();
  await expect(page.getByText("812+123 拼成 8123").first()).toBeVisible();
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
  await singleForm.locator('[name="bRequireAll"]').fill("123");
  await singleForm.locator('[name="bRequireAny"]').fill("812");
  await page.getByRole("button", { name: "计算" }).click();

  await expect(page.getByText("完成 1 档")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("6,081,230").first()).toBeVisible();
  await expect(page.getByText("53,081,230").first()).toBeVisible();
});

test("multi-score warns before searching three unlocked b lines", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  await page.getByRole("button", { name: "多榜" }).click();
  await page.getByRole("button", { name: "添加 b" }).click();
  await page.locator("#line-rows .line-row").nth(2).locator('[name="current"]').fill("0");

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("3 个 b 未设置锁定值");
    await dialog.dismiss();
  });

  await page.getByRole("button", { name: "计算多榜" }).click();
  await expect(page.getByText("已取消")).toBeVisible();
});

test("multi-score exact match locks b as a constant", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  await page.getByRole("button", { name: "多榜" }).click();

  const rows = page.locator("#line-rows .line-row");
  const first = rows.nth(0);
  const second = rows.nth(1);

  await first.locator('[name="current"]').fill("6001234");
  await first.locator('[name="minIncrement"]').fill("999999");
  await first.locator('[name="exact"]').fill("6001234");
  await first.locator('[name="requireAll"]').fill("");
  await first.locator('[name="requireAny"]').fill("");

  await second.locator('[name="current"]').fill("1000");
  await second.locator('[name="minIncrement"]').fill("999999");
  await second.locator('[name="exact"]').fill("1000");

  await page.getByRole("button", { name: "计算多榜" }).click();

  await expect(page.getByText("完成 1 组")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("b1: 锁定 6,001,234 (+0)")).toBeVisible();
  await expect(page.getByText("b2: 锁定 1,000 (+0)")).toBeVisible();
});

test("language switch renders English labels and tooltips", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  await page.getByRole("button", { name: "English" }).click();

  await expect(page.getByRole("heading", { name: "Score Control Calculator" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run" })).toBeVisible();
  await expect(page.getByText("May include").first()).toBeVisible();
  await expect(page.locator("#single-form").locator('[name="targetIncrements"]')).toHaveAttribute(
    "title",
    "Planned minimum points to add. Keep the default tiers for a first pass.",
  );
});

test("guide tab explains World Link score control usage", async ({ page }) => {
  const fileUrl = pathToFileURL(path.resolve(__dirname, "..", "index.html")).href;

  await page.goto(fileUrl);
  await page.getByRole("button", { name: "说明" }).click();

  await expect(page.getByRole("heading", { name: "使用说明" })).toBeVisible();
  await expect(page.getByText("World Link 控分")).toBeVisible();
  await expect(page.getByText("单人榜 b 的“必须包含”最常见用途是控制生日")).toBeVisible();
  await expect(page.getByText("大多数参数第一次可以先用默认")).toBeVisible();

  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Guide" })).toBeVisible();
  await expect(page.getByText("Use this for World Link score control")).toBeVisible();
  await expect(page.getByText("For single b, Must contain is usually for birthdays")).toBeVisible();
});
