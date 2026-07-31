export interface NavItem {
  readonly label: string;
  readonly path: string;
}

export interface NavSection {
  readonly title: string;
  readonly items: readonly NavItem[];
}
