import { render, screen } from "@testing-library/react";

import { AccountView } from "./AccountView";
import { CreateAccountView } from "./CreateAccountView";
import { CreateErrorView } from "./CreateErrorView";
import { SignOnErrorView } from "./SignOnErrorView";
import { SignOnView } from "./SignOnView";

describe("SignOnView", () => {
  it("has labelled fields, a Sign on button and the returnTo", () => {
    const { container } = render(<SignOnView returnTo="/account" />);
    expect(screen.getByLabelText(/^user name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign on" })).toBeInTheDocument();
    expect(container.querySelector('input[name="returnTo"]')).toHaveValue("/account");
    expect(screen.getByText(/Sign on to continue to your account/)).toBeInTheDocument();
  });

  it("fills in and ticks a remembered user name", () => {
    render(<SignOnView rememberedUser="jsmith" />);
    expect(screen.getByLabelText(/^user name$/i)).toHaveValue("jsmith");
    expect(screen.getByRole("checkbox", { name: /remember my user name/i })).toBeChecked();
  });
});

describe("error views", () => {
  it("sign-on error offers try again, back to the requested page", () => {
    render(<SignOnErrorView returnTo="/account" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Sign-on failed");
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/signon?returnTo=%2Faccount",
    );
  });

  it("creation error links to a new attempt and to sign-on", () => {
    render(<CreateErrorView />);
    expect(screen.getByRole("link", { name: "Try a different user ID" })).toHaveAttribute(
      "href",
      "/accounts/create",
    );
    expect(screen.getByRole("link", { name: "Sign on instead" })).toHaveAttribute(
      "href",
      "/signon",
    );
  });
});

describe("CreateAccountView", () => {
  it("lists the categories after No favourite and posts to the users route", () => {
    const { container } = render(<CreateAccountView categories={[{ id: "DOGS", name: "Dogs" }]} />);
    const options = screen.getByLabelText(/^favourite category/i).querySelectorAll("option");
    expect([...options].map((o) => o.textContent)).toEqual(["No favourite", "Dogs"]);
    expect(container.querySelector("form")).toHaveAttribute("action", "/api/accounts/users");
  });
});

describe("AccountView", () => {
  it("shows the user name and preferences", () => {
    render(
      <AccountView
        username="jsmith"
        summary={{
          status: "active",
          language: "en_US",
          favoriteCategory: null,
          myList: true,
          banner: false,
        }}
      />,
    );
    expect(screen.getByText("jsmith")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
  });
});
