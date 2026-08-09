export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly children?: readonly NavItem[];
}

export interface NavGroup {
  readonly title: string;
  readonly items: readonly NavItem[];
}

export interface NavSection {
  readonly title: string;
  /** Flat section (e.g. "General") — mutually exclusive with `groups`. */
  readonly items?: readonly NavItem[];
  /** Categorized section (e.g. "Components") — mutually exclusive with `items`. */
  readonly groups?: readonly NavGroup[];
}
