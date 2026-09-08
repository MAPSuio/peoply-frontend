import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  viewBox: string;
}

export type IconShapeProps = Omit<IconProps, "viewBox">;

function intrinsicSize(viewBox: string) {
  const [, , width, height] = viewBox.trim().split(/\s+/);
  const isNumeric = (value?: string) =>
    value !== undefined && value !== "" && Number.isFinite(Number(value));

  if (!isNumeric(width) || !isNumeric(height)) return {};

  return { width, height };
}

const Icon = ({ viewBox, children, ...svgProps }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      {...intrinsicSize(viewBox)}
      {...svgProps}
    >
      {children}
    </svg>
  );
};

export default Icon;
