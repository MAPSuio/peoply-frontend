interface GridCompactIconProps {
  className?: string;
}

export default function GridCompactIcon({ className }: GridCompactIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <rect x="3" y="3" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="7.83" y="3" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="12.67" y="3" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="17.5" y="3" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="3" y="7.83" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="7.83" y="7.83" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="12.67" y="7.83" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="17.5" y="7.83" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="3" y="12.67" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="7.83" y="12.67" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="12.67" y="12.67" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="17.5" y="12.67" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="3" y="17.5" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="7.83" y="17.5" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="12.67" y="17.5" width="3.5" height="3.5" rx="0.875"></rect>
      <rect x="17.5" y="17.5" width="3.5" height="3.5" rx="0.875"></rect>
    </svg>
  );
}
