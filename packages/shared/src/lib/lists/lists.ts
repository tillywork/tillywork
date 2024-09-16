import { CardType } from '../card-types';
import { View } from '../views';

export interface List {
  id: number;
  icon: string;
  iconColor: string;
  name: string;
  spaceId: number;
  listStages: ListStage[];
  views: View[];
  defaultCardType: CardType;
}

export interface ListStage {
  id: number;
  listId: number;
  name: string;
  color: string;
  order: number;
  isCompleted?: boolean;
}
