
export interface LinkGroup {
  id: string;
  title: string;
  displayTitle: boolean;
  position: number;
  links: {
    id: string;
    title: string;
    url: string;
    icon: string;
  }[];
}
