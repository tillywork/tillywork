export class CreateListDto {
    name: string;
    spaceId: number;
    defaultCardTypeId: number;
    createOnboardingData?: boolean;
}
