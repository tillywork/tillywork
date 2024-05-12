import { User } from "../../users/user.entity";
import { Card } from "../card.entity";

export class UpdateCardDto implements Partial<Card> {
    users?: User[];
}
