export function capitalizeEachWord(sentence: string) {
  // Split the sentence into an array of words
  const words = sentence.split(' ');

  // Iterate over each word and capitalize its first letter
  const capitalizedWords = words.map(word => {
    if (word.length === 0) {
      return ''; // Handle empty words if any
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  // Join the capitalized words back into a sentence
  return capitalizedWords.join(' ');
}