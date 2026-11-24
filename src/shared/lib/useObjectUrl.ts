import { useEffect, useState } from "react";

/**
 * A preview address of a picked file (null without a file). It is made and released inside the
 * effect, so it survives a remount of the component and the double effect run of React's strict
 * mode — an address made while rendering was released by that first cleanup and the picture broke.
 */
export function useObjectUrl(file: File | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  return url;
}
