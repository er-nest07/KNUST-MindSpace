import leoProfanity from "leo-profanity";

// Optional: add extra words specific to your app
// leoProfanity.add(["word1", "word2"]);

export function filterProfanity(text: string): string {
  return leoProfanity.clean(text);
}