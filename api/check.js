// api/check.js — Vercel Serverless Function
// Answers တွေ ဒီမှာပဲ ရှိတယ်၊ browser မှာ မပါဘူး

const ANSWERS = {
  // Easy
  q0:  { type: 'bool', ans: true },
  q1:  { type: 'bool', ans: false },
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
};

export default function handler(req, res) {
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

  const { qId, pressed, eventReady, tapCount, cornerCount, smallestCorrect, lastAns, lastPressed, timeElapsed, hour } = req.body;

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

  // Return only correct/wrong — never return the answer itself
  return res.status(200).json({ correct });
}
