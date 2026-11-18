import { render, screen } from "@testing-library/react";

import type { CatalogItem } from "@/catalog/types";

import { CategoryListView } from "./CategoryListView";
import { ItemDetailView } from "./ItemDetailView";
import { ItemListView } from "./ItemListView";
import { ProductListView } from "./ProductListView";
import { SearchResultsView } from "./SearchResultsView";

const item: CatalogItem = {
  categoryId: "DOGS",
  productId: "K9-RT-02",
  productName: "Labrador Retriever",
  itemId: "EST-24",
  image: "x.gif",
  description: "Male Puppy Labrador Retriever",
  attr1: "Male Puppy",
  attr2: "Chocolate coat",
  attr3: null,
  attr4: null,
  attr5: null,
  listPrice: 255.5,
  unitCost: 160,
};

describe("CategoryListView", () => {
  it("lists each category as a link named for it, with the range", () => {
    render(
      <CategoryListView
        page={{
          entries: [
            { id: "FISH", name: "Fish" },
            { id: "DOGS", name: "Dogs" },
          ],
          hasNext: false,
        }}
        pageNumber={1}
        offset={0}
      />,
    );
    expect(screen.getByRole("link", { name: "Fish" })).toHaveAttribute(
      "href",
      "/catalog/categories/FISH",
    );
    expect(screen.getByText("Categories 1–2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("shows the empty frame when nothing is loaded", () => {
    render(<CategoryListView page={{ entries: [], hasNext: false }} pageNumber={1} offset={0} />);
    expect(screen.getByTestId("empty-frame")).toHaveTextContent("catalog is empty");
  });

  it("links Next when another page exists", () => {
    render(
      <CategoryListView
        page={{ entries: [{ id: "A", name: "A" }], hasNext: true }}
        pageNumber={2}
        offset={10}
      />,
    );
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute("href", "/catalog?page=3");
    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute(
      "href",
      "/catalog?page=1",
    );
  });
});

describe("ProductListView", () => {
  it("lists products linking to their items", () => {
    render(
      <ProductListView
        category={{ id: "DOGS", name: "Dogs" }}
        page={{
          entries: [{ id: "K9-BD-01", categoryId: "DOGS", name: "Bulldog" }],
          hasNext: false,
        }}
        pageNumber={1}
        offset={0}
      />,
    );
    expect(screen.getByRole("link", { name: "Bulldog" })).toHaveAttribute(
      "href",
      "/catalog/products/K9-BD-01",
    );
  });
});

describe("ItemListView", () => {
  it("shows items with attributes and the list price", () => {
    render(
      <ItemListView
        category={{ id: "DOGS", name: "Dogs" }}
        product={{
          id: "K9-RT-02",
          categoryId: "DOGS",
          name: "Labrador Retriever",
          image: null,
          description: "Great hunting dog",
        }}
        page={{ entries: [item], hasNext: false }}
        pageNumber={1}
        offset={0}
      />,
    );
    expect(screen.getByText("EST-24")).toBeInTheDocument();
    expect(screen.getByText("Chocolate coat")).toBeInTheDocument();
    expect(screen.getByText("$255.50")).toBeInTheDocument();
    expect(screen.getByText("Items 1–1")).toBeInTheDocument();
  });
});

describe("ItemDetailView", () => {
  it("shows price, unit cost and the present attributes, without an add-to-cart", () => {
    render(<ItemDetailView item={item} categoryName="Dogs" />);
    expect(screen.getByText("Unit cost")).toBeInTheDocument();
    expect(screen.getByText("$160.00")).toBeInTheDocument();
    expect(screen.getByText("Attribute 2")).toBeInTheDocument();
    expect(screen.queryByText("Attribute 3")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add to cart/i })).not.toBeInTheDocument();
  });
});

describe("SearchResultsView", () => {
  it("shows the results for a query", () => {
    render(
      <SearchResultsView
        query="retriever"
        page={{ entries: [item], hasNext: false }}
        pageNumber={1}
        offset={0}
      />,
    );
    expect(screen.getByText(/1 item on this page for “retriever”/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: item.description })).toHaveAttribute(
      "href",
      "/catalog/items/EST-24",
    );
  });

  it("asks for a word on a blank query and says when nothing matches", () => {
    const { rerender } = render(
      <SearchResultsView
        query="  "
        page={{ entries: [], hasNext: false }}
        pageNumber={1}
        offset={0}
      />,
    );
    expect(screen.getByTestId("empty-frame")).toHaveTextContent("Type at least one word");
    rerender(
      <SearchResultsView
        query="zzz"
        page={{ entries: [], hasNext: false }}
        pageNumber={1}
        offset={0}
      />,
    );
    expect(screen.getByTestId("empty-frame")).toHaveTextContent("No items match");
  });
});
