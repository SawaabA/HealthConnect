type ClassValue = string | null | undefined | false | ClassValue[] | Record<string, boolean>;

function flatten(input: ClassValue): string[] {
  if (!input) {
    return [];
  }
  if (typeof input === "string") {
    return [input];
  }
  if (Array.isArray(input)) {
    return input.flatMap(flatten);
  }
  return Object.entries(input)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);
}

export function cn(...inputs: ClassValue[]) {
  return inputs.flatMap(flatten).join(" ");
}
