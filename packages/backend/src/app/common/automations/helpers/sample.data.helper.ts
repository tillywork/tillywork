import { FieldTypes, User } from "@tillywork/shared";
import { Field } from "../../fields/field.entity";

export function getSampleDataByField(field: Field) {
    let sampleData;

    switch (field.type) {
        case FieldTypes.DATE:
        case FieldTypes.DATETIME:
            sampleData = new Date().toISOString();
            break;
        case FieldTypes.USER:
            sampleData = getUserSampleData();
            break;
        case FieldTypes.DROPDOWN:
        case FieldTypes.LABEL:
            sampleData = [field.items?.[0]?.item || "Option 1"];
            break;
        case FieldTypes.TEXT:
            sampleData = `Sample ${field.name}`;
            break;
        case FieldTypes.NUMBER:
        case FieldTypes.CURRENCY:
        case FieldTypes.PERCENTAGE:
            sampleData = 42;
            break;
        case FieldTypes.CHECKBOX:
            sampleData = true;
            break;
        case FieldTypes.EMAIL:
            sampleData = "john@doe.com";
            break;
        case FieldTypes.URL:
            sampleData = "john.doe.com";
            break;
        default:
            sampleData = `Sample data for ${field.name}`;
    }

    return sampleData;
}

export function getUserSampleData() {
    const user: Partial<User> = {
        id: 1946,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
    };

    return user;
}
