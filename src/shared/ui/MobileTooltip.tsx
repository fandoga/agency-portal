import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import React, { useEffect, useState } from "react";

interface MobileTooltip extends React.ComponentProps<
  typeof TooltipPrimitive.Content
> {
  text: string;
}

const MobileTooltip = ({ text, children, ...props }: MobileTooltip) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [coarsePointer, setCoarsePointer] = useState(false);

  // Логика чтобы тултип корректно работал на мобильных
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setCoarsePointer(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild>
        <span
          className=" touch-manipulation"
          onClick={(e) => {
            if (!coarsePointer) return;
            e.preventDefault();
            e.stopPropagation();
            setTooltipOpen((v) => !v);
          }}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default MobileTooltip;
