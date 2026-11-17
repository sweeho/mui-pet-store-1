import { fireEvent, render, screen } from "@testing-library/react";

import { EmptyFrame } from "@/shell/EmptyFrame";
import { ErrorFrame } from "@/shell/ErrorFrame";

// A page given no data renders the shared frame: the page decides, the frame draws.
function Page({ items }: { items: string[] }) {
  return items.length === 0 ? (
    <EmptyFrame />
  ) : (
    <ul>
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

function FailingPage({ onRetry }: { onRetry: () => void }) {
  return <ErrorFrame onRetry={onRetry} />;
}

// case: SWHM2-C-0228@v1
test("SWHM2-C-0228 page without data shows shared empty frame", () => {
  render(<Page items={[]} />);
  expect(screen.getByTestId("empty-frame")).toBeInTheDocument();
});

// case: SWHM2-C-0229@v1
test("SWHM2-C-0229 page load failure shows shared error frame with retry", () => {
  const onRetry = jest.fn();
  render(<FailingPage onRetry={onRetry} />);
  expect(screen.getByTestId("error-frame")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /retry|try again/i }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});
