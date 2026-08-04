export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly children?: readonly NavItem[];
}

export interface NavSection {
  readonly title: string;
  readonly items: readonly NavItem[];
}
