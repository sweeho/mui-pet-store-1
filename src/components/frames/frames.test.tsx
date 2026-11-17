import { fireEvent, render, screen } from "@testing-library/react";

import { EmptyFrame } from "./EmptyFrame";
import { ErrorFrame } from "./ErrorFrame";
import { LoadingFrame } from "./LoadingFrame";

describe("shared frames", () => {
  it("[SWHM2-C-0228] EmptyFrame shows its title, message and action", () => {
    render(
      <EmptyFrame
        title="Nothing yet"
        message="Come back later"
        action={<button type="button">Go</button>}
      />,
    );

    expect(screen.getByTestId("empty-frame")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nothing yet" })).toBeInTheDocument();
    expect(screen.getByText("Come back later")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument();
  });

  it("[SWHM2-C-0229] ErrorFrame shows the message and Retry calls onRetry once", () => {
    const onRetry = jest.fn();
    render(<ErrorFrame message="It broke" onRetry={onRetry} />);

    expect(screen.getByTestId("error-frame")).toHaveTextContent("It broke");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("LoadingFrame is a status region", () => {
    render(<LoadingFrame />);

    expect(screen.getByTestId("loading-frame")).toHaveAttribute("role", "status");
  });
});
