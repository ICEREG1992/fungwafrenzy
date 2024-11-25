// eslint-disable-next-line import/prefer-default-export
export function fadeAudio(
  currentValue: number,
  setFader: (value: number) => void,
  fadeIn: boolean,
) {
  const steps = 10;
  const delay = 500 / steps;
  const target = fadeIn ? 100 : 0;
  const step = (target - currentValue) / steps;

  for (let i = 1; i <= steps; i += 1) {
    const targetValue = currentValue + step * i;
    setTimeout(() => {
      setFader(targetValue);
    }, delay * i);
  }
}
