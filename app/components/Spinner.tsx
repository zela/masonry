/** @jsxImportSource @emotion/react */

import { useState, useEffect } from "react";
import { css, keyframes } from "@emotion/react";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const spinnerStyles = css`
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left-color: RoyalBlue;
  animation: ${spin} 1s linear infinite;
`;

export function DelayedSpinner({ delay = 1000 }) {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinner(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!showSpinner) {
    return null;
  }

  return <div css={spinnerStyles} />;
}
