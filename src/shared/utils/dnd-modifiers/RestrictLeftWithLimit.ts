import { Modifier } from "@dnd-kit/abstract";
import type { Coordinates } from "@dnd-kit/geometry";

export class RestrictLeftWithLimit extends Modifier {
  apply({ transform }: { transform: Coordinates }) {
    const maxOffset = -90; // максимум влево (отрицательное значение)
    return {
      x: Math.max(transform.x, maxOffset),
      y: 0,
    };
  }
}

export class RestrictRightWithLimit extends Modifier {
  apply({ transform }: { transform: Coordinates }) {
    const maxOffset = 0;
    return {
      x: Math.min(transform.x, maxOffset),
      y: 0,
    };
  }
}
