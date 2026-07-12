export interface ForbiddenPattern {
  readonly label: string;
  readonly pattern: RegExp;
}

export interface PublicScanMatch {
  readonly file: string;
  readonly label: string;
  readonly line: number;
}

export interface PublicScanResult {
  readonly matches: readonly PublicScanMatch[];
  readonly scannedRoots: number;
  readonly scannedTextFiles: number;
}

export const DEFAULT_SCAN_ROOTS: readonly string[];
export const forbiddenPatterns: readonly ForbiddenPattern[];

export function isScannableTextFile(filePath: string): boolean;
export function findForbiddenMatches(content: string): readonly Pick<ForbiddenPattern, "label">[];
export function scanPublicOutput(options?: {
  cwd?: string;
  roots?: readonly string[];
}): Promise<PublicScanResult>;
