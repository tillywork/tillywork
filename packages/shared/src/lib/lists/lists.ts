import { CardType } from '../card-types';
import { View } from '../views';

export interface List {
  id: number;
  icon: string;
  iconColor: string;
  name: string;
  slug: string;
  spaceId: number;
  listStages: ListStage[];
  views: View[];
  defaultCardType: CardType;
  type: ListType;
}

export interface ListStage {
  id: number;
  listId: number;
  name: string;
  color: string;
  order: number;
  isCompleted?: boolean;
}

export enum ListType {
  LIST = 'default_list',
  CONTACTS = 'crm_contacts',
  ORGANIZATIONS = 'crm_organizations',
}
