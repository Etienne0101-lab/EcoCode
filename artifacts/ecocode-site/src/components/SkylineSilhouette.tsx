/**
 * SkylineSilhouette — Lower Manhattan's actual skyline profile, drawn from
 * the real NYC Open Data footprints/heights (7,209 buildings): for each
 * east–west slice, the tallest roof in that slice. It is a silhouette —
 * a profile, not a photograph and not individual buildings — rendered as
 * one SVG path so it costs nothing at load. Fill colour comes from CSS
 * (.hero-silhouette / .closing-silhouette), so the same profile reads
 * dark-on-dark in the hero and dark-on-light in the closing section.
 */
export default function SkylineSilhouette({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 960 120" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M 0 120 L 0 113 L 10 102 L 20 96 L 30 85 L 40 85 L 51 85 L 61 81 L 71 81 L 81 69 L 91 62 L 101 59 L 111 59 L 121 62 L 131 59 L 141 10 L 152 10 L 162 10 L 172 10 L 182 37 L 192 37 L 202 37 L 212 37 L 222 63 L 232 63 L 243 57 L 253 57 L 263 48 L 273 48 L 283 56 L 293 56 L 303 56 L 313 56 L 323 56 L 333 73 L 344 61 L 354 53 L 364 53 L 374 53 L 384 70 L 394 70 L 404 74 L 414 74 L 424 74 L 435 77 L 445 77 L 455 77 L 465 77 L 475 76 L 485 76 L 495 76 L 505 84 L 515 84 L 525 93 L 536 93 L 546 97 L 556 97 L 566 97 L 576 97 L 586 97 L 596 102 L 606 102 L 616 98 L 627 89 L 637 89 L 647 89 L 657 101 L 667 101 L 677 101 L 687 105 L 697 96 L 707 95 L 717 95 L 728 95 L 738 95 L 748 57 L 758 57 L 768 57 L 778 101 L 788 101 L 798 103 L 808 101 L 819 101 L 829 101 L 839 95 L 849 95 L 859 91 L 869 91 L 879 91 L 889 97 L 899 97 L 909 100 L 920 101 L 930 102 L 940 102 L 950 105 L 960 110 L 960 120 Z" />
    </svg>
  );
}
