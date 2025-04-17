/** @jsxImportSource @emotion/react */

import { css } from "@emotion/react";

export function HomeHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const headerStyles = css`
    text-align: center;
    margin-bottom: 2rem;

    p {
      color: #666;
      max-width: 600px;
      margin: 0 auto;
    }
  `;

  return (
    <header css={headerStyles}>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
