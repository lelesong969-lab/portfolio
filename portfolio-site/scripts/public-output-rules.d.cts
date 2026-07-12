interface ForbiddenPattern {
  readonly label: string;
  readonly pattern: RegExp;
}

declare const rules: {
  readonly forbiddenPatterns: readonly ForbiddenPattern[];
};

export = rules;
