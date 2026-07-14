import { test, expect } from "@playwright/test";

test.describe("Appifylab Social Feed App", () => {
  // Generate random emails for users so tests are isolated across runs
  const timestamp = Date.now();
  const emailA = `usera_${timestamp}_${Math.floor(Math.random() * 1000)}@test.com`;
  const emailB = `userb_${timestamp}_${Math.floor(Math.random() * 1000)}@test.com`;
  
  const firstNameA = "Alice";
  const lastNameA = "Smith";
  const firstNameB = "Bob";
  const lastNameB = "Jones";
  
  const password = "Password123!";

  test("1. Unauthenticated user is redirected to login from feed", async ({ page }) => {
    await page.goto("/feed");
    await page.waitForURL("**/login");
    await expect(page.locator("h4:has-text('Login to your account')")).toBeVisible();
  });

  test("2. User Registration & Redirect to Feed", async ({ page }) => {
    await page.goto("/register");
    await page.fill("#input-first-name", firstNameA);
    await page.fill("#input-last-name", lastNameA);
    await page.fill("#input-email", emailA);
    await page.fill("#input-password", password);
    await page.fill("#input-repeat-password", password);
    
    // Check agree terms if not checked
    const checkbox = page.locator("#agreeTermsCheckbox");
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }

    await page.click("button[type='submit']:has-text('Register now')");
    
    // Should be redirected to /feed
    await page.waitForURL("**/feed");
    await expect(page.locator("p._header_nav_para:has-text('Alice Smith')")).toBeVisible();
  });

  test("3. User Login & Logout", async ({ page }) => {
    // First register Bob so we have User B ready too
    await page.goto("/register");
    await page.fill("#input-first-name", firstNameB);
    await page.fill("#input-last-name", lastNameB);
    await page.fill("#input-email", emailB);
    await page.fill("#input-password", password);
    await page.fill("#input-repeat-password", password);
    
    const checkbox = page.locator("#agreeTermsCheckbox");
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }
    await page.click("button[type='submit']:has-text('Register now')");
    await page.waitForURL("**/feed");
    await expect(page.locator("p._header_nav_para:has-text('Bob Jones')")).toBeVisible();

    // Log out Bob
    await page.click("#_profile_drop_show_btn");
    await page.click("text=Log Out");
    await page.waitForURL("**/login");

    // Login Bob again
    await page.fill("#input-email", emailB);
    await page.fill("#input-password", password);
    await page.click("button[type='submit']:has-text('Login now')");
    await page.waitForURL("**/feed");
    await expect(page.locator("p._header_nav_para:has-text('Bob Jones')")).toBeVisible();
  });

  test("4. Post Creation, Visibility, Liking, Commenting, Replies", async ({ browser }) => {
    // Create contexts for both users
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Log in User A (Alice)
    await pageA.goto("/login");
    await pageA.fill("#input-email", emailA);
    await pageA.fill("#input-password", password);
    await pageA.click("button[type='submit']:has-text('Login now')");
    await pageA.waitForURL("**/feed");

    // Log in User B (Bob)
    await pageB.goto("/login");
    await pageB.fill("#input-email", emailB);
    await pageB.fill("#input-password", password);
    await pageB.click("button[type='submit']:has-text('Login now')");
    await pageB.waitForURL("**/feed");

    // User A creates a Public Post
    const publicPostText = `Alice Public Post - ${Date.now()}`;
    await pageA.fill("#floatingTextarea", publicPostText);
    await pageA.selectOption("select", "PUBLIC");
    await pageA.click("button:has-text('Post')");
    
    // Wait for post creation to be complete (textbox cleared)
    await expect(pageA.locator("#floatingTextarea")).toHaveValue("");
    
    // Verify post is visible in User A's feed
    await expect(pageA.locator(`text=${publicPostText}`)).toBeVisible();

    // User A creates a Private Post
    const privatePostText = `Alice Private Post - ${Date.now()}`;
    await pageA.fill("#floatingTextarea", privatePostText);
    await pageA.selectOption("select", "PRIVATE");
    await pageA.click("button:has-text('Post')");

    // Wait for post creation to be complete (textbox cleared)
    await expect(pageA.locator("#floatingTextarea")).toHaveValue("");

    // Verify private post is visible in User A's feed
    await expect(pageA.locator(`text=${privatePostText}`)).toBeVisible();

    // Verify Bob (User B) can see Alice's Public Post but NOT Alice's Private Post
    await pageB.reload(); // reload to get new posts
    await expect(pageB.locator(`text=${publicPostText}`)).toBeVisible();
    await expect(pageB.locator(`text=${privatePostText}`)).not.toBeVisible();

    // Bob likes Alice's Public Post
    const publicPostCard = pageB.locator("div._feed_inner_timeline_post_area", { hasText: publicPostText });
    const likeButton = publicPostCard.locator("button._feed_inner_timeline_reaction_emoji");
    await likeButton.click();

    // Verify liked state for Bob
    await expect(likeButton).toHaveClass(/_feed_reaction_active/);
    
    // Verify like count shows "1 Likes"
    const likesCountText = publicPostCard.locator("p._feed_inner_timeline_total_reacts_para");
    await expect(likesCountText).toHaveText("1 Likes");

    // Bob comments on Alice's Public Post
    const commentButton = publicPostCard.locator("button._feed_inner_timeline_reaction_comment");
    await commentButton.click(); // opens comments section
    
    const commentInput = publicPostCard.locator("textarea[placeholder='Write a comment...']");
    await commentInput.fill("Bob's cool comment");
    await publicPostCard.locator("button:has-text('Send')").click();

    // Wait for comment to be submitted (input cleared)
    await expect(commentInput).toHaveValue("");

    // Verify comment is displayed
    await expect(publicPostCard.locator("text=Bob's cool comment")).toBeVisible();

    // Bob likes the comment he just posted
    const commentItem = publicPostCard.locator("div._comment_main", { hasText: "Bob's cool comment" });
    const commentLikeButton = commentItem.locator("span:has-text('Like')").first();
    await commentLikeButton.click();

    // Verify comment like count updated
    await expect(commentItem.locator("div._total_reactions")).toContainText("1");

    // Alice (User A) reloads and replies to Bob's comment
    await pageA.reload();
    const alicePublicPostCard = pageA.locator("div._feed_inner_timeline_post_area", { hasText: publicPostText });
    
    // Open comments
    await alicePublicPostCard.locator("button._feed_inner_timeline_reaction_comment").click();
    
    const aliceCommentItem = alicePublicPostCard.locator("div._comment_main", { hasText: "Bob's cool comment" });
    await aliceCommentItem.locator("span:has-text('Reply')").click(); // open reply input
    
    const replyInput = aliceCommentItem.locator("textarea[placeholder='Write a reply...']");
    await replyInput.fill("Alice's nested reply");
    await aliceCommentItem.locator("button:has-text('Send')").click();

    // Wait for reply to be submitted (input cleared)
    await expect(replyInput).toHaveValue("");

    // Verify reply is displayed
    await expect(aliceCommentItem.locator("text=Alice's nested reply")).toBeVisible();

    // Alice opens Likes modal for the post
    await alicePublicPostCard.locator("p._feed_inner_timeline_total_reacts_para").click();
    // Modal should be visible
    await expect(pageA.locator("div.modal-content")).toBeVisible();
    await expect(pageA.locator("div.modal-body")).toContainText("Bob Jones");
    
    // Close modal
    await pageA.click("button[aria-label='Close']");
    await expect(pageA.locator("div.modal-content")).not.toBeVisible();

    // Clean up contexts
    await contextA.close();
    await contextB.close();
  });
});
