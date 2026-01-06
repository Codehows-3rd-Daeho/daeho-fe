export type SidebarItem = {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
  children?: SidebarItem[];
};

export type SidebarProps = {
  items: SidebarItem[];
  collapsed?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  width?: number;
  onToggle?: () => void;
  openMobile?: boolean;
  onCloseMobile?: () => void;
};
