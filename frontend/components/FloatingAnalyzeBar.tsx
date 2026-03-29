"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Input, Spinner } from "@/components/ui";
import { AiStarIcon } from "@/components/icons/AiStarIcon";
import { useAppHaptics } from "@/components/HapticsProvider";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/ds";

const PairSelectModal = dynamic(
  () => import("@/components/PairSelectModal").then((m) => m.PairSelectModal),
  { ssr: false }
);

/** Shared layout id for pill → modal morph (emil-design-eng: spring for on-screen movement). */
const PAIR_PICK_LAYOUT_ID = "pair-select-shell";

export function FloatingAnalyzeBar({
  pair,
  onPairChange,
  onSubmit,
  loading,
  pairInputInvalid = false,
  pairInputShakeKey = 0,
}: {
  pair: string;
  onPairChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  pairInputInvalid?: boolean;
  pairInputShakeKey?: number;
}) {
  const { trigger: haptic } = useAppHaptics();
  const [pickerOpen, setPickerOpen] = useState(false);
  /** Avoid two nodes with the same layoutId during modal exit (shared layout). */
  const [pickerExitComplete, setPickerExitComplete] = useState(true);
  const reduceMotion = useReducedMotion();
  const morphId = reduceMotion ? undefined : PAIR_PICK_LAYOUT_ID;

  const normalizedPair = pair.trim().toUpperCase().replace(/[^A-Z]/g, "");
  const browseLabel =
    normalizedPair.length === 6 ? normalizedPair : "Select pair";

  function openPicker() {
    void haptic("selection");
    setPickerOpen(true);
    setPickerExitComplete(false);
  }

  function closePicker() {
    setPickerOpen(false);
  }

  return (
    <LayoutGroup id="pair-picker-group">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <form onSubmit={onSubmit} className={ds.surface.floatBar}>
          <div
            key={pairInputShakeKey}
            className={cn(
              "min-w-0 flex-1",
              pairInputShakeKey > 0 && "animate-input-shake"
            )}
          >
            <label htmlFor="float-pair" className="sr-only">
              Forex pair
            </label>
            <Input
              id="float-pair"
              type="text"
              autoComplete="off"
              placeholder="Pair (e.g. EURUSD)"
              value={pair}
              onChange={(e) => onPairChange(e.target.value.toUpperCase())}
              aria-invalid={pairInputInvalid}
              variant="pill"
              invalid={pairInputInvalid}
            />
          </div>
          <motion.button
            type="button"
            layoutId={
              !pickerOpen && pickerExitComplete ? morphId : undefined
            }
            layout={false}
            transition={{
              type: "spring",
              duration: 0.24,
              bounce: 0.12,
            }}
            onClick={openPicker}
            className={ds.button.secondaryPill}
            aria-haspopup="dialog"
            aria-expanded={pickerOpen}
          >
            {browseLabel}
          </motion.button>
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            title={loading ? "Analyzing…" : "Analyze with AI"}
            aria-label={loading ? "Analyzing sentiment" : "Analyze sentiment with AI"}
            className={ds.button.primaryRound}
            onClick={() => {
              if (!loading) void haptic("medium");
            }}
          >
            {loading ? (
              <Spinner variant="onPrimary" size={20} />
            ) : (
              <AiStarIcon className="h-6 w-6" />
            )}
          </button>
        </form>
      </div>
      <PairSelectModal
        open={pickerOpen}
        onClose={closePicker}
        onExitComplete={() => setPickerExitComplete(true)}
        onSelect={onPairChange}
        currentPair={pair.trim().toUpperCase()}
        layoutId={morphId}
      />
    </LayoutGroup>
  );
}
