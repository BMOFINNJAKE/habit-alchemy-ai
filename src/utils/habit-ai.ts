
/**
 * Generate AI-enhanced habit suggestions following Atomic Habits principles
 */
export async function generateHabitSuggestion(
  habitName: string,
  frequency: string,
  motivation?: string,
  identity?: string
): Promise<string> {
  // In a real implementation, this would call an AI service
  // For now, we'll use a rule-based approach to generate suggestions based on Atomic Habits
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Clear implementation cue (Make it Obvious)
  const contextualTriggers = {
    "meditate": ["After I wake up", "Before I go to bed", "After lunch break"],
    "read": ["After dinner", "Before I go to bed", "After my morning coffee"],
    "exercise": ["After I wake up", "After work", "Before lunch"],
    "journal": ["Before I go to bed", "After I wake up", "After dinner"],
    "stretch": ["After I wake up", "Before exercise", "After sitting for an hour"],
    "walk": ["After lunch", "After dinner", "After a work meeting"],
    "write": ["After morning coffee", "After breakfast", "Before I check email"],
    "workout": ["After work", "Before breakfast", "After I change into gym clothes"],
    "drink water": ["After I wake up", "Before each meal", "When I feel hungry"],
    "practice": ["After breakfast", "After work", "Before dinner"]
  };
  
  // Default triggers if no matching habit is found
  const defaultTriggers = [
    "After I wake up",
    "After I brush my teeth",
    "Before I go to bed",
    "After lunch",
    "When I get home from work",
    "After dinner",
    "When I finish my workday"
  ];
  
  // Small, achievable amounts (Make it Easy)
  const durations = {
    "read": ["10 pages", "1 chapter", "15 minutes"],
    "meditate": ["2 minutes", "5 minutes", "3 deep breaths"],
    "exercise": ["10 minutes", "7 minutes", "5 exercises"],
    "write": ["one paragraph", "250 words", "10 minutes"],
    "journal": ["3 bullet points", "one gratitude item", "5 minutes"],
    "stretch": ["3 minutes", "5 stretches", "until I feel looser"],
    "walk": ["10 minutes", "around the block", "1,000 steps"],
    "workout": ["15 minutes", "3 exercises", "until I break a sweat"],
    "drink water": ["one glass", "16 oz", "until I'm no longer thirsty"],
    "practice": ["10 minutes", "3 repetitions", "one small section"]
  };
  
  // Find relevant triggers for the habit
  const habitKey = Object.keys(contextualTriggers).find(key => 
    habitName.toLowerCase().includes(key)
  );
  
  const relevantTriggers = habitKey 
    ? contextualTriggers[habitKey as keyof typeof contextualTriggers] 
    : defaultTriggers;
  
  // Pick a trigger that makes sense for the habit
  const trigger = relevantTriggers[Math.floor(Math.random() * relevantTriggers.length)];
  
  // Set a specific, achievable amount (Make it Easy)
  let specificHabit = habitName.toLowerCase();
  let duration = "";
  
  const habitDurationKey = Object.keys(durations).find(key => 
    specificHabit.includes(key)
  );
  
  if (habitDurationKey) {
    const possibleDurations = durations[habitDurationKey as keyof typeof durations];
    duration = possibleDurations[Math.floor(Math.random() * possibleDurations.length)];
  } else {
    duration = "for 2 minutes"; // Default to a very small duration for any habit
  }
  
  // Add identity component (Make it Attractive)
  let identityPhrase = "";
  if (identity) {
    identityPhrase = ` to become ${identity.startsWith("a") || identity.startsWith("an") ? identity : `a ${identity}`}`;
  } else if (motivation) {
    identityPhrase = ` because ${motivation}`;
  }
  
  // Add satisfaction element (Make it Satisfying)
  const satisfactionPhrases = [
    "I will track my streak in the app",
    "I'll mark it complete on my habit tracker",
    "I'll celebrate by checking it off my list",
    "I'll feel accomplished afterwards"
  ];
  
  const satisfaction = 
    frequency === "daily" && Math.random() > 0.5 
      ? ` Then ${satisfactionPhrases[Math.floor(Math.random() * satisfactionPhrases.length)]}.` 
      : "";
  
  // Create the suggestion following the complete Atomic Habits formula
  return `${trigger}, I will ${specificHabit} ${duration}${identityPhrase}.${satisfaction}`;
}
