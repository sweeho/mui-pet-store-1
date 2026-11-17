import { fireEvent, render, screen } from "@testing-library/react";

import HomePage from "@/app/(DashboardLayout)/page";
import RouteError from "@/app/(DashboardLayout)/error";
import { findUser } from "@/lib/users";

// The real home page reads its data through findUser; each test controls that load.
jest.mock("@/lib/users", () => ({ findUser: jest.fn() }));
const mockedFindUser = jest.mocked(findUser);

afterEach(() => jest.resetAllMocks());

// case: SWHM2-C-0228@v1
test("SWHM2-C-0228 page without data shows shared empty frame", async () => {
  mockedFindUser.mockResolvedValue(null);
  render(await HomePage());
  expect(screen.getByTestId("empty-frame")).toBeInTheDocument();
});

// case: SWHM2-C-0229@v1
test("SWHM2-C-0229 page load failure shows shared error frame with retry", async () => {
  mockedFindUser.mockRejectedValue(new Error("load failed"));
  // The real page's load fails; Next hands that error to the route's error boundary component.
  let error: Error | undefined;
  try {
    await HomePage();
  } catch (e) {
    error = e as Error;
  }
  expect(error).toBeInstanceOf(Error);

  const reset = jest.fn();
  render(<RouteError error={error as Error} reset={reset} />);
  expect(screen.getByTestId("error-frame")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /retry|try again/i }));
  expect(reset).toHaveBeenCalledTimes(1);
});
