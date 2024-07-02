export type CreateGroceryListItem = {
  name: string;
  quantity: number | null;
  notes: string | null;
  link: string | null;
};

export type GroceryListItem = {
  id: number;
  groceryListId: number;
  name: string;
  quantity: number | null;
  notes: string | null;
  link: string | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateGroceryList = {
  title: string;
  items: CreateGroceryListItem[];
};

export type GroceryList = {
  id: number;
  title: string;
  items: GroceryListItem[];
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};
