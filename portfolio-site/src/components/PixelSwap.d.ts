import type { CSSProperties, ReactNode } from 'react';

export type PixelSwapPattern =
  | 'random'
  | 'center'
  | 'edges'
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'bottom-to-top'
  | 'diagonal'
  | 'spiral';

export type PixelSwapTrigger = 'hover' | 'click' | 'manual';

export interface PixelSwapProps {
  firstContent: ReactNode;
  secondContent: ReactNode;
  pixelSize?: number;
  gap?: number;
  pixelRadius?: number;
  pixelScale?: number;
  fade?: boolean;
  duration?: number;
  pixelDuration?: number;
  pattern?: PixelSwapPattern;
  randomness?: number;
  pixelSpin?: number;
  easing?: string;
  trigger?: PixelSwapTrigger;
  initialActive?: boolean;
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
  onComplete?: (active: boolean) => void;
  aspectRatio?: string;
  curtain?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function PixelSwap(props: PixelSwapProps): ReactNode;
