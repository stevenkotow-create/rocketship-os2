// V4 · Module shim for lucide-react · ensures types resolve even if package's
// own .d.ts files aren't generated locally. Vercel's install picks up real types,
// this shim just keeps TypeScript happy in local dev / sandboxes.

declare module "lucide-react" {
  import type { FC, SVGProps } from "react";

  export interface LucideProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = FC<LucideProps>;

  // V4.1 · Only the utility icons we keep from lucide · custom space icons in components/icons.tsx
  export const BookOpen: LucideIcon;
  export const Zap: LucideIcon;
  export const FileText: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Wrench: LucideIcon;
}
