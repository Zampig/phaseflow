import { PhaseType } from '../types';

export const PHASE_CONTENT = {
  [PhaseType.MENSTRUAL]: {
    overview: "This is the start of your cycle. Your hormone levels (estrogen and progesterone) are low, and your uterine lining is shedding. It's a time for rest, renewal, and turning inward.",
    exercise: {
        recommended: ["Gentle walking", "Restorative Yoga", "Stretching & Foam Rolling", "Light Pilates", "Complete Rest"],
        avoid: ["High Intensity Interval Training", "Heavy lifting", "Inversions (if uncomfortable)"]
    },
    nutrition: {
        focus: ["Warm soups and stews", "Iron-rich foods (spinach, lentils)", "Magnesium-rich foods (dark chocolate)", "Herbal teas (ginger, chamomile)"],
        limit: ["Caffeine", "Sugar", "Cold, raw foods", "Salty snacks"]
    },
    hydration: {
        tips: ["Drink at least 2L of water daily", "Sip warm water with lemon", "Prioritize herbal teas over coffee"],
        supplements: ["Magnesium for cramps", "Iron for blood loss", "Vitamin C to absorb iron"]
    },
    weeklySuggestions: [
        "Days 1-2: Prioritize sleep and clear your schedule if possible.",
        "Day 3: Try a short, gentle walk outside.",
        "Day 4: Journaling can be very effective now.",
        "Day 5: Start planning your week as energy slowly returns."
    ]
  },
  [PhaseType.FOLLICULAR]: {
    overview: "Estrogen starts to rise as your body prepares for a potential pregnancy. You will likely feel a boost in energy, creativity, and mood. It's a great time to start new projects.",
    exercise: {
        recommended: ["Cardio / Running", "HIIT workouts", "Dance classes", "Spinning", "Hiking"],
        avoid: ["Overtraining without proper warm-up", "Staying sedentary"]
    },
    nutrition: {
        focus: ["Fermented foods (kimchi, yogurt)", "Lean proteins", "Fresh vegetables", "Avocado", "Seeds (flax, pumpkin)"],
        limit: ["Heavy, greasy foods", "Excessive alcohol"]
    },
    hydration: {
        tips: ["Hydrate before and after cardio", "Add electrolytes if sweating heavily", "Green tea is great for energy"],
        supplements: ["B-Complex for energy", "Probiotics for gut health"]
    },
    weeklySuggestions: [
        "Early Phase: Brainstorm new ideas and projects.",
        "Mid Phase: Try a new workout class or social activity.",
        "Late Phase: Schedule important meetings or presentations.",
        "General: Your confidence is rising, use it!"
    ]
  },
  [PhaseType.OVULATION]: {
    overview: "Estrogen peaks and testosterone rises slightly. You are at your most fertile. Confidence, communication skills, and libido are often at their highest during these few days.",
    exercise: {
        recommended: ["High-intensity training", "Heavy weightlifting", "Group sports", "Power yoga", "Spin classes"],
        avoid: ["Long endurance if prone to joint laxity (estrogen effect)", "Isolation"]
    },
    nutrition: {
        focus: ["Antioxidant-rich berries", "Cruciferous vegetables", "Hydrating fruits", "Quinoa", "Raw veggies"],
        limit: ["Inflammatory foods", "Excessive red meat"]
    },
    hydration: {
        tips: ["Drink water consistently throughout the day", "Coconut water for hydration", "Cooling teas like peppermint"],
        supplements: ["Zinc for immune support", "CoQ10"]
    },
    weeklySuggestions: [
        "Day 13: High energy day, great for social events.",
        "Day 14: Peak fertility, energy is magnetic.",
        "Day 15: Use this confidence to ask for what you want.",
        "General: Connect with others and express yourself."
    ]
  },
  [PhaseType.LUTEAL]: {
    overview: "Progesterone rises to support a potential pregnancy. If not pregnant, levels drop later, leading to PMS. You might feel slower, hungrier, and want to turn inward again.",
    exercise: {
        recommended: ["Low-impact strength training", "Walking", "Pilates", "Slow flow yoga", "Swimming"],
        avoid: ["High intensity cardio (can increase cortisol)", "Sprinting"]
    },
    nutrition: {
        focus: ["Complex carbohydrates (sweet potatoes)", "Fiber-rich foods", "Root vegetables", "Brown rice", "Magnesium-rich foods"],
        limit: ["Excess salt (bloating)", "Refined sugar (mood swings)", "Caffeine"]
    },
    hydration: {
        tips: ["Increase water intake to reduce bloating", "Avoid alcohol if feeling PMS", "Warm lemon water in mornings"],
        supplements: ["Magnesium for mood/sleep", "Vitamin B6 for PMS", "Omega-3s"]
    },
    weeklySuggestions: [
        "Early Luteal: Good focus for detail-oriented tasks.",
        "Mid Luteal: Start organizing and decluttering.",
        "Late Luteal (PMS): Be gentle, practice self-care.",
        "General: Don't force high social energy if you don't feel it."
    ]
  }
};

export const PHASE_COLORS = {
  [PhaseType.MENSTRUAL]: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200', icon: 'bg-rose-200' },
  [PhaseType.FOLLICULAR]: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', icon: 'bg-purple-200' },
  [PhaseType.OVULATION]: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-200', icon: 'bg-teal-200' },
  [PhaseType.LUTEAL]: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', icon: 'bg-amber-200' },
};