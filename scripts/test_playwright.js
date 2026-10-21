const path = require('path');
const { chromium } = require('C:/Users/gamer/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const lessons = [
  'robotics-2-1.html', 'robotics-2-2.html', 'robotics-2-3.html', 'robotics-2-4.html',
  'robotics-3-1.html', 'robotics-3-2.html', 'robotics-3-3.html', 'robotics-3-4.html', 'robotics-3-5.html',
  'robotics-4-1.html', 'robotics-4-2.html', 'robotics-4-3.html',
  'robotics-5-1.html', 'robotics-5-2.html', 'robotics-5-3.html', 'robotics-5-4.html',
  'robotics-5-5.html', 'robotics-5-6.html', 'robotics-5-7.html', 'robotics-5-8.html'
];

const viewports = [
  { width: 1200, height: 800, name: '1200px desktop' },
  { width: 375, height: 667, name: '375px mobile' }
];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  let totalErrors = 0;

  for (const vp of viewports) {
    console.log(`\n=== Testing Viewport: ${vp.name} ===`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    
    for (const lesson of lessons) {
      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(err.message));
      
      const fileUrl = 'file://' + path.resolve(lesson).replace(/\\/g, '/');
      await page.goto(fileUrl, { waitUntil: 'load' });
      await page.waitForTimeout(100);

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; // 1px threshold for subpixel rounding
      });

      if (pageErrors.length > 0) {
        console.error(`FAIL: ${lesson} had JS errors:`, pageErrors);
        totalErrors++;
      }
      if (hasHorizontalScroll) {
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        console.error(`FAIL: ${lesson} has horizontal scroll! scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
        totalErrors++;
      }

      if (pageErrors.length === 0 && !hasHorizontalScroll) {
        process.stdout.write('.');
      }
    }
    console.log(`\nCompleted ${lessons.length} lessons at ${vp.name}`);
    await page.close();
  }

  // Test Chapter Quizzes (scoring full marks)
  console.log('\n=== Testing Chapter Quizzes (Full Marks) ===');
  const quizPage = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  
  // Load course data to know the correct answers
  global.window = {};
  eval(require('fs').readFileSync('assets/js/course-data.js', 'utf8'));
  const courseQuizzes = window.RISE_COURSE.quizzes;

  for (const ch of [2, 3, 4, 5]) {
    const quizUrl = 'file://' + path.resolve('robotics-quiz.html').replace(/\\/g, '/') + `?chapter=${ch}`;
    await quizPage.goto(quizUrl, { waitUntil: 'load' });
    await quizPage.waitForTimeout(300);

    const questions = courseQuizzes[ch];
    console.log(`Chapter ${ch} quiz: ${questions.length} questions`);

    // In robotics-quiz.html, each question card has choices
    // Let's select the correct radio button for each question
    for (let qIdx = 0; qIdx < questions.length; qIdx++) {
      const correctAns = questions[qIdx].answer;
      // Selector for question radio: name is q0, q1, etc.
      const radioSelector = `input[name="q${qIdx}"][value="${correctAns}"]`;
      await quizPage.check(radioSelector);
    }

    // Submit the quiz
    await quizPage.click('button[type="submit"]');
    await quizPage.waitForTimeout(300);

    // Check score
    const scoreText = await quizPage.textContent('.quiz-result');
    console.log(`Chapter ${ch} quiz score result:`, scoreText ? scoreText.trim() : 'Score container found');
    
    // Verify all correct indicators
    const wrongCount = await quizPage.locator('.quiz-question.is-wrong').count();
    if (wrongCount > 0) {
      console.error(`FAIL: Chapter ${ch} quiz had ${wrongCount} wrong answers!`);
      totalErrors++;
    } else {
      console.log(`PASS: Chapter ${ch} quiz scored 100% full marks!`);
    }
  }

  await quizPage.close();
  await browser.close();

  if (totalErrors > 0) {
    console.error(`\nFAILED with ${totalErrors} errors.`);
    process.exit(1);
  } else {
    console.log('\nALL PLAYWRIGHT TESTS PASSED CLEANLY (0 JS errors, 0 horizontal scroll, 100% quiz scores)!');
  }
})();
