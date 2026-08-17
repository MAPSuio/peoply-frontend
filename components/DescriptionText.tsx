import { injectLink } from "../utils/functions";

export interface DescriptionTextProps {
  text?: string;
  className?: string;
  paragraphClassName?: string;
}

/**
 * User-written free text: newlines become paragraphs and bare URLs become
 * links. Events and organizations render their description identically, so
 * only the two class names differ between the call sites.
 */
export default function DescriptionText({
  text,
  className,
  paragraphClassName,
}: DescriptionTextProps) {
  return (
    <div className={className}>
      {text?.split("\n").map((line) => (
        <p key={line} className={paragraphClassName}>
          {injectLink(line)}
          <br></br>
        </p>
      ))}
    </div>
  );
}
