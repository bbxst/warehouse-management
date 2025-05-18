"use client";

import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export default function SubmitButton({
  state,
  text,
}: {
  state: boolean;
  text?: string;
}) {
  return (
    <Button type="submit">
      {state && <Loader2 className="animate-spin" />}
      {text || "Save"}
    </Button>
  );
}
