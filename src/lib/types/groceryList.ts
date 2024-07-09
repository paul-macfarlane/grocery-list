export type UpsertGroceryList = {
  id: number | null;
  title: string;
  budget: number | null;
  items: UpsertGroceryListItem[];
};

export type GroceryList = {
  id: number;
  title: string;
  budget: number | null;
  items: GroceryListItem[];
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GroceryListMinified = {
  id: number;
  title: string;
  itemsCount: number;
  updatedAt: Date;
};

export type GroceryListFormData = {
  id: number | null;
  budget: number | null;
  title: string;
  items: GroceryListFormItem[];
};

export type UpsertGroceryListItem = {
  id: number | null;
  name: string;
  quantity: number | null;
  notes: string | null;
  link: string | null;
  groupName: string | null;
};

export type GroceryListItem = {
  id: number;
  groceryListId: number;
  name: string;
  quantity: number | null;
  notes: string | null;
  link: string | null;
  group: GroceryListGroup | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type GroceryListFormItem = UpsertGroceryListItem & {
  listKey: string; // needed because each item needs a key so it can be re-arranged as users edit a list
};

export type GroceryListGroup = {
  id: number;
  groceryListId: number;
  name: string;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};
