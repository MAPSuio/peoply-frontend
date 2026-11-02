import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import SummaryCard from "../components/SummaryCard";

it("keeps edit controls and inputs out of nested buttons", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <SummaryCard
      inputId={1}
      Icon={<span />}
      editButtonVisible
      editButtonOnClick={vi.fn()}
      onCheck={vi.fn()}
      onCross={vi.fn()}
      inputComponent={<input aria-label="Title" />}
    >
      Team dinner
    </SummaryCard>,
  );
  expect(container.querySelector("button button")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Rediger" }));
  expect(screen.getByRole("textbox", { name: "Title" })).toBeInTheDocument();
  expect(container.querySelector("button button")).toBeNull();
  expect(container.querySelector("button input")).toBeNull();
});

it("keeps a card without an edit button clickable", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(
    <SummaryCard inputId={5} Icon={<span />} onClick={onClick}>
      Team dinner
    </SummaryCard>,
  );
  await user.click(screen.getByRole("button", { name: "Team dinner" }));
  expect(onClick).toHaveBeenCalledWith(5);
});
