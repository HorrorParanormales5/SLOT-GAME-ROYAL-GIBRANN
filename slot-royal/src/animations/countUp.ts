import gsap from 'gsap'

/** Anima un número de `from` a `to`, llamando a onUpdate en cada frame. */
export function countUp(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void,
): gsap.core.Tween {
  const obj = { v: from }
  return gsap.to(obj, {
    v: to,
    duration,
    ease: 'power1.out',
    onUpdate: () => onUpdate(obj.v),
    onComplete,
  })
}
