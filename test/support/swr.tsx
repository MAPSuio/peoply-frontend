import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { SWRConfig, type SWRConfiguration } from "swr";

export function renderWithSwr(ui: ReactElement, config: SWRConfiguration = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), ...config }}>
      {children}
    </SWRConfig>
  );

  return render(ui, { wrapper });
}
