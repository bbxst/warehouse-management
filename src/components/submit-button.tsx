"use client";

import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export function SubmitButton({
  state,
  isValid = true,
  text,
}: {
  state: boolean;
  isValid?: boolean;
  text?: string;
}) {
  return (
    <Button type="submit" disabled={!isValid}>
      {state && <Loader2 className="animate-spin" />}
      {text || "Save"}
    </Button>
  );
}
