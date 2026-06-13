// api/check.js — Vercel Serverless Function
// Answers တွေ ဒီမှာပဲ ရှိတယ်၊ browser မှာ မပါဘူး

const ANSWERS = {
  // Easy
  q0:  { type: 'bool', ans: true },
  q1:  { type: 'bool', ans: true },
  q2:  { type: 'bool', ans: false },
  q3:  { type: 'bool', ans: true },
  q4:  { type: 'bool', ans: true },
  q5:  { type: 'bool', ans: false },
  q6:  { type: 'special', special: 'rat_delay' },
  q7:  { type: 'special', special: 'spider_delay' },
  q8:  { type: 'special', special: 'red_screen' },
  q9:  { type: 'bool', ans: false },
  q10: { type: 'bool', ans: true },
  q11: { type: 'bool', ans: false },
  q12: { type: 'special', special: 'tap3' },
  q13: { type: 'special', special: 'corner_press' },
  q14: { type: 'special', special: 'click_anywhere_but' },
  // Medium
  q15: { type: 'bool', ans: false },
  q16: { type: 'bool', ans: true },
  q17: { type: 'special', special: 'cats_even' },
  q18: { type: 'bool', ans: false },
  q19: { type: 'bool', ans: true },
  q20: { type: 'special', special: 'smallest_obj' },
  q21: { type: 'bool', ans: true },
  q22: { type: 'special', special: 'daytime' },
  q23: { type: 'special', special: 'dog_cat' },
  q24: { type: 'special', special: 'wait3' },
  q25: { type: 'bool', ans: true },
  q26: { type: 'bool', ans: false },
  q27: { type: 'bool', ans: true },
  q28: { type: 'special', special: 'color_text' },
  q29: { type: 'bool', ans: true },
  // Hard
  q30: { type: 'special', special: 'same_last' },
  q31: { type: 'bool', ans: true },
  q32: { type: 'bool', ans: true },
  q33: { type: 'bool', ans: false },
  q34: { type: 'bool', ans: false },
  q35: { type: 'bool', ans: false },
  q36: { type: 'special', special: 'not_last' },
  q37: { type: 'special', special: 'same_last' },
  q38: { type: 'bool', ans: true },
  q39: { type: 'special', special: 'disappear' },
  q40: { type: 'bool', ans: true },
  q41: { type: 'bool', ans: true },
  q42: { type: 'bool', ans: false },
  q43: { type: 'special', special: 'hidden' },
  q44: { type: 'bool', ans: true },

  // ===== Round 2: Bonus / harder set =====
  // Easy 2
  q45: { type: 'special', special: 'green_only' },
  q46: { type: 'special', special: 'even_qnum' },
  q47: { type: 'special', special: 'reflex1s' },
  q48: { type: 'special', special: 'no_negation' },
  q49: { type: 'special', special: 'count5th' },
  q50: { type: 'special', special: 'pos_tl' },
  q51: { type: 'special', special: 'shrink' },
  q52: { type: 'bool', ans: false },
  q53: { type: 'bool', ans: true },
  q54: { type: 'bool', ans: false },
  // Medium 2
  q55: { type: 'special', special: 'prev_wrong' },
  q56: { type: 'special', special: 'two_words_max' },
  q57: { type: 'special', special: 'repeat_corner' },
  q58: { type: 'special', special: 'stroop2' },
  q59: { type: 'special', special: 'time5s' },
  q60: { type: 'special', special: 'math_sum5' },
  q61: { type: 'special', special: 'cats_gt3' },
  q62: { type: 'special', special: 'night_only' },
  q63: { type: 'bool', ans: true },
  q64: { type: 'bool', ans: false },
  // Hard 2
  q65: { type: 'special', special: 'last2_wrong' },
  q66: { type: 'special', special: 'close_eyes_3s' },
  q67: { type: 'special', special: 'inverse_label' },
  q68: { type: 'special', special: 'must_skip' },
  q69: { type: 'special', special: 'press3_not3rd' },
  q70: { type: 'special', special: 'recall_q1' },
  q71: { type: 'special', special: 'sum4' },
  q72: { type: 'bool', ans: false },
  q73: { type: 'bool', ans: true },
  q74: { type: 'bool', ans: false },
};

module.exports = function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    qId, pressed, eventReady, tapCount, cornerCount, smallestCorrect,
    lastAns, lastPressed, timeElapsed, hour,
    // Round 2 extra fields
    greenPressed, qNumEven, reflexHit, hasNegation, flashCount,
    posCorrect, shrinkHit, prevWrong, wordCountOk, repeatCornerCorrect,
    stroopCorrect, time5sHit, sumGt5, catCountGt3, isNight,
    last2Wrong, eyesReflexHit, didSkip, tap3NotThird, recallCorrect, sum4Correct
  } = req.body;

  const q = ANSWERS[qId];
  if (!q) {
    return res.status(400).json({ error: 'Invalid question ID' });
  }

  let correct = false;
  const src = pressed ? 'press' : 'timeout';

  if (q.type === 'bool') {
    // Simple press/no-press questions
    if (src === 'timeout') correct = (q.ans === false);
    else correct = (q.ans === true);
  }
  else if (q.special === 'rat_delay' || q.special === 'red_screen') {
    if (src === 'timeout') correct = false;
    else correct = (src === 'press' && eventReady === true);
  }
  else if (q.special === 'spider_delay') {
    // Spider: correct is to NOT press (timeout)
    correct = (src === 'timeout');
  }
  else if (q.special === 'tap3') {
    correct = (src === 'press' && tapCount >= 3);
  }
  else if (q.special === 'corner_press') {
    correct = (src !== 'timeout' && cornerCount === 4);
  }
  else if (q.special === 'click_anywhere_but') {
    correct = (src === 'outside');
  }
  else if (q.special === 'smallest_obj') {
    correct = (src === 'press' && smallestCorrect === true);
  }
  else if (q.special === 'same_last') {
    // Repeat last action
    if (lastAns === true) correct = (src === 'press');
    else correct = (src === 'timeout');
  }
  else if (q.special === 'not_last') {
    // Opposite of last press
    if (lastPressed) correct = (src === 'timeout');
    else correct = (src === 'press');
  }
  else if (q.special === 'daytime') {
    // Use client's hour (can't trust 100% but good enough)
    const isDay = (hour >= 6 && hour < 18);
    if (src === 'timeout') correct = !isDay;
    else correct = isDay;
  }
  else if (q.special === 'dog_cat') {
    // Resolved client-side (random), just check press=true
    if (src === 'timeout') correct = false;
    else correct = (src === 'press' && eventReady === true);
  }
  else if (q.special === 'wait3') {
    if (src === 'timeout') correct = false;
    else correct = (src === 'press' && timeElapsed >= 3);
  }
  else if (q.special === 'cats_even' || q.special === 'color_text') {
    // Resolved client-side; press=correct for color_text, cats depends on count
    if (src === 'timeout') correct = false;
    else correct = (src === 'press' && eventReady === true);
  }
  else if (q.special === 'disappear' || q.special === 'hidden') {
    correct = (src === 'press');
  }
  // ===== Round 2 specials =====
  else if (q.special === 'green_only') {
    correct = (src === 'press' && greenPressed === true);
  }
  else if (q.special === 'even_qnum') {
    // press only if qNumEven; timeout correct only if NOT qNumEven
    correct = (src === 'press') ? (qNumEven === true) : (qNumEven !== true);
  }
  else if (q.special === 'reflex1s') {
    correct = (src === 'press' && reflexHit === true);
  }
  else if (q.special === 'no_negation') {
    // If text has negation word, correct = don't press; else press
    if (hasNegation === true) correct = (src === 'timeout');
    else correct = (src === 'press');
  }
  else if (q.special === 'count5th') {
    correct = (src === 'press' && flashCount === 5);
  }
  else if (q.special === 'pos_tl') {
    correct = (src === 'press' && posCorrect === true);
  }
  else if (q.special === 'shrink') {
    if (src === 'timeout') correct = false;
    else correct = (src === 'press' && shrinkHit === true);
  }
  else if (q.special === 'prev_wrong') {
    // press only if previous round was wrong
    if (prevWrong === true) correct = (src === 'press');
    else correct = (src === 'timeout');
  }
  else if (q.special === 'two_words_max') {
    // press only if wordCountOk (<=2 words); timeout correct only if NOT wordCountOk (>2 words)
    correct = (src === 'press') ? (wordCountOk === true) : (wordCountOk !== true);
  }
  else if (q.special === 'repeat_corner') {
    correct = (src !== 'timeout' && repeatCornerCorrect === true);
  }
  else if (q.special === 'stroop2') {
    // press only if colors match (stroopCorrect); timeout correct only if colors DON'T match
    correct = (src === 'press') ? (stroopCorrect === true) : (stroopCorrect !== true);
  }
  else if (q.special === 'time5s') {
    correct = (src === 'press' && time5sHit === true);
  }
  else if (q.special === 'math_sum5') {
    // press only if sum > 5 (sumGt5); timeout correct only if sum <= 5
    correct = (src === 'press') ? (sumGt5 === true) : (sumGt5 !== true);
  }
  else if (q.special === 'cats_gt3') {
    // press only if cats > 3 (catCountGt3); timeout correct only if cats <= 3
    correct = (src === 'press') ? (catCountGt3 === true) : (catCountGt3 !== true);
  }
  else if (q.special === 'night_only') {
    const isDay = (hour >= 6 && hour < 18);
    if (src === 'timeout') correct = isDay;
    else correct = !isDay;
  }
  else if (q.special === 'last2_wrong') {
    if (last2Wrong === true) correct = (src === 'press');
    else correct = (src === 'timeout');
  }
  else if (q.special === 'close_eyes_3s') {
    correct = (src === 'press' && eyesReflexHit === true);
  }
  else if (q.special === 'must_skip') {
    correct = (didSkip === true);
  }
  else if (q.special === 'press3_not3rd') {
    correct = (tap3NotThird === true);
  }
  else if (q.special === 'recall_q1') {
    correct = (src === 'press' && recallCorrect === true);
  }
  else if (q.special === 'inverse_label') {
    // press only if label says 'False' (eventReady); timeout correct only if label says 'True'
    correct = (src === 'press') ? (eventReady === true) : (eventReady !== true);
  }
  else if (q.special === 'sum4') {
    correct = (src === 'press' && sum4Correct === true);
  }

  // Return only correct/wrong — never return the answer itself
  return res.status(200).json({ correct });
}