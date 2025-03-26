import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class PlaceholderService {
    generatePlaceholders(payloadType: any): { label: string; value: string }[] {
        const placeholders: { label: string; value: string }[] = [];

        // Get properties from the type
        const properties = Object.keys(payloadType.prototype || {});

        // Add context placeholders
        placeholders.push(
            { label: "Card ID", value: "{{trigger.card.id}}" },
            { label: "Card Title", value: "{{trigger.card.title}}" }
        );

        // Add payload-specific placeholders
        properties.forEach((prop) => {
            placeholders.push({
                label: this.formatLabel(prop),
                value: `{{trigger.payload.${prop}}}`,
            });
        });

        Logger.debug({ placeholders });

        return placeholders;
    }

    private formatLabel(key: string): string {
        return key
            .split(/(?=[A-Z])|_/)
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
    }
}
