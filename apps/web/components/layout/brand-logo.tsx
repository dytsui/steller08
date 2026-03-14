import Link from 'next/link';

type BrandLogoProps = {
  href?: string;
  className?: string;
  ariaLabel?: string;
};

export function BrandLogo({ href = '/', className = '', ariaLabel = 'Back to homepage' }: BrandLogoProps) {
  return (
    <Link href={href} className={`brand-shell brand-shell-icon ${className}`.trim()} aria-label={ariaLabel}>
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-mark-core" />
      </span>
    </Link>
  );
}
