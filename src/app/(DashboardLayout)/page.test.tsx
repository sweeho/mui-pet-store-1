import { fireEvent, render, screen } from "@testing-library/react";

import { findUser } from "@/lib/users";

import RouteError from "./error";
import HomePage from "./page";

jest.mock("@/lib/users", () => ({ findUser: jest.fn() }));
const mockedFindUser = jest.mocked(findUser);

afterEach(() => jest.resetAllMocks());

describe("home page states", () => {
  it("[SWHM2-C-0228] renders the shared empty frame when there is no data", async () => {
    mockedFindUser.mockResolvedValue(null);

    render(await HomePage());

    expect(screen.queryByTestId("empty-frame")).toBeInTheDocument();
  });

  it("[SWHM2-C-0229] a failed load reaches the error frame, and Retry calls reset", async () => {
    mockedFindUser.mockRejectedValue(new Error("load failed"));

    await expect(HomePage()).rejects.toThrow("load failed");

    const reset = jest.fn();
    render(<RouteError error={new Error("load failed")} reset={reset} />);
    expect(screen.getByTestId("error-frame")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
