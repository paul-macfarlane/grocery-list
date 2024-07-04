export type UpsertGroceryListItem = {
  id: number | null;
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

export type UpsertGroceryList = {
  id: number | null;
  title: string;
  items: UpsertGroceryListItem[];
};

export type GroceryList = {
  id: number;
  title: string;
  items: GroceryListItem[];
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GroceryListFormItem = UpsertGroceryListItem & {
  listKey: string; // needed because each item needs a key so it can be re-arranged as users edit a list
};

export type GroceryListFormData = {
  id: number | null;
  title: string;
  items: GroceryListFormItem[];
};
