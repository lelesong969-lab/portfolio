import { useId } from "react";

type BreathingWaveProps = {
  className?: string;
};

const UPPER_PHASES = [
  "M0 29 C120 24 205 44 300 40 C400 35 505 21 600 28 C700 35 805 50 900 41 C1000 31 1090 27 1200 30",
  "M0 29 C110 36 205 48 300 37 C405 25 510 26 600 34 C700 44 805 22 900 29 C1010 38 1100 40 1200 30",
  "M0 29 C110 20 205 31 300 35 C410 43 510 49 600 38 C700 26 810 23 900 33 C1010 45 1100 35 1200 30",
  "M0 29 C110 42 205 22 300 30 C410 38 510 20 600 27 C700 35 805 47 900 39 C1010 26 1100 23 1200 30",
] as const;

const LOWER_PHASES = [
  "M0 44 C110 49 210 31 300 34 C410 38 510 50 600 43 C700 35 805 22 900 31 C1010 41 1100 48 1200 43",
  "M0 44 C110 31 205 24 300 35 C405 47 510 46 600 38 C700 28 805 50 900 43 C1010 34 1100 32 1200 43",
  "M0 44 C110 53 205 42 300 38 C410 30 510 24 600 35 C700 47 810 50 900 40 C1010 28 1100 38 1200 43",
  "M0 44 C110 30 205 50 300 42 C410 34 510 52 600 45 C700 37 805 25 900 33 C1010 46 1100 51 1200 43",
] as const;

const spline = "0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1;0.45 0 0.55 1";
const upperValues = [...UPPER_PHASES, UPPER_PHASES[0]].join(";");
const lowerValues = [...LOWER_PHASES, LOWER_PHASES[0]].join(";");

export default function BreathingWave({ className = "" }: BreathingWaveProps) {
  const id = useId().replace(/:/g, "");
  const upperGradientId = `black-gold-wave-upper-${id}`;
  const lowerGradientId = `black-gold-wave-lower-${id}`;

  return (
    <div className={`breathing-wave ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 72" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id={upperGradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0">
            <stop offset="0" stopColor="#11110f" />
            <stop offset=".18" stopColor="#41311a" />
            <stop offset=".42" stopColor="#d5ad58" />
            <stop offset=".58" stopColor="#171612" />
            <stop offset=".8" stopColor="#bc8d3e" />
            <stop offset="1" stopColor="#11110f" />
          </linearGradient>
          <linearGradient id={lowerGradientId} gradientUnits="userSpaceOnUse" x1="1200" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="#15140f" />
            <stop offset=".2" stopColor="#d9b45f" />
            <stop offset=".43" stopColor="#292217" />
            <stop offset=".62" stopColor="#e0bf72" />
            <stop offset=".84" stopColor="#4d381b" />
            <stop offset="1" stopColor="#11110f" />
          </linearGradient>
        </defs>
        <path className="breathing-wave__membrane membrane--upper" d={UPPER_PHASES[0]} stroke={`url(#${upperGradientId})`}>
          <animate
            attributeName="d"
            dur="8.4s"
            repeatCount="indefinite"
            values={upperValues}
            keyTimes="0;0.25;0.5;0.75;1"
            calcMode="spline"
            keySplines={spline}
          />
        </path>
        <path className="breathing-wave__membrane membrane--lower" d={LOWER_PHASES[0]} stroke={`url(#${lowerGradientId})`}>
          <animate
            attributeName="d"
            dur="8.4s"
            repeatCount="indefinite"
            values={lowerValues}
            keyTimes="0;0.25;0.5;0.75;1"
            calcMode="spline"
            keySplines={spline}
          />
        </path>
      </svg>
    </div>
  );
}
