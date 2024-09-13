export function toCamelCase(text) {
  return text
    .toLowerCase() // Convert the text to lowercase
    .replace(/[^a-zA-Z0-9]+(.)/g, (_match, chr) => chr.toUpperCase()); // Replace non-alphanumeric characters and capitalize the following character
}

export function toKebabCase(text) {
  return text
    .toLowerCase() // Convert the text to lowercase
    .replace(/[^a-zA-Z0-9]+/g, "-") // Replace non-alphanumeric characters with a hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading or trailing hyphens
}

export function toPascalCase(text) {
  return text
    .toLowerCase() // Convert the text to lowercase
    .replace(/(?:^|\s|[^a-zA-Z0-9]+)(\w)/g, (_match, chr) => chr.toUpperCase()); // Capitalize the first letter of each word
}

export function toSnakeCase(text) {
  return text
    .toLowerCase() // Convert the text to lowercase
    .replace(/[^a-zA-Z0-9]+/g, "_") // Replace non-alphanumeric characters with underscores
    .replace(/^_+|_+$/g, ""); // Remove leading or trailing underscores
}

export function pluralize(word) {
  const irregularPlurals = {
    child: "children",
    person: "people",
    man: "men",
    woman: "women",
    tooth: "teeth",
    foot: "feet",
    mouse: "mice",
    goose: "geese",
  };

  // Handle irregular plurals
  if (irregularPlurals[word.toLowerCase()]) {
    return irregularPlurals[word.toLowerCase()];
  }

  // Handle words that end with 'y' (e.g., city -> cities)
  if (word.match(/[^aeiou]y$/)) {
    return word.replace(/y$/, "ies");
  }

  // Handle words that end with 's', 'x', 'z', 'ch', or 'sh' (e.g., box -> boxes)
  if (word.match(/(s|x|z|ch|sh)$/)) {
    return word + "es";
  }

  // Handle words that end with 'f' or 'fe' (e.g., leaf -> leaves)
  if (word.match(/(f|fe)$/)) {
    return word.replace(/(f|fe)$/, "ves");
  }

  // Default rule: just add 's'
  return word + "s";
}

export function singularize(word) {
  const irregularSingulars = {
    children: "child",
    people: "person",
    men: "man",
    women: "woman",
    teeth: "tooth",
    feet: "foot",
    mice: "mouse",
    geese: "goose",
  };

  // Handle irregular plurals
  if (irregularSingulars[word.toLowerCase()]) {
    return irregularSingulars[word.toLowerCase()];
  }

  // Handle words that end with 'ies' (e.g., cities -> city)
  if (word.match(/ies$/)) {
    return word.replace(/ies$/, "y");
  }

  // Handle words that end with 'es' (e.g., boxes -> box, churches -> church)
  if (word.match(/(ses|xes|zes|ches|shes)$/)) {
    return word.replace(/es$/, "");
  }

  // Handle words that end with 'ves' (e.g., leaves -> leaf)
  if (word.match(/ves$/)) {
    return word.replace(/ves$/, "f");
  }

  // Handle words that end with 's' (e.g., cars -> car)
  if (word.match(/s$/) && !word.match(/ss$/)) {
    return word.replace(/s$/, "");
  }

  // Return the word if it doesn't match any rule
  return word;
}
