import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

// Configure the trace exporter
const traceExporter = new OTLPTraceExporter({
    url:
        process.env.TW_OTEL_EXPORTER_OTLP_ENDPOINT ||
        "http://localhost:4318/v1/traces",
    headers: {}, // Add any headers if needed
});

const sdk = new NodeSDK({
    resource: new Resource({
        [ATTR_SERVICE_NAME]: process.env.TW_OTEL_SERVICE_NAME || "tw-backend",
        [ATTR_SERVICE_VERSION]: "1.0.0",
    }),
    spanProcessor: new BatchSpanProcessor(traceExporter, {
        // Customize batch processing if needed
        scheduledDelayMillis: 500, // Time between two consecutive exports
        maxExportBatchSize: 100, // How many spans to send in one batch
    }),
    instrumentations: [
        getNodeAutoInstrumentations({
            // Enable HTTP instrumentation
            "@opentelemetry/instrumentation-http": {
                enabled: true,
            },
            // Enable Express instrumentation
            "@opentelemetry/instrumentation-express": {
                enabled: true,
            },
        }),
        new NestInstrumentation(),
    ],
});

sdk.start();

process.on("SIGTERM", () => {
    sdk.shutdown()
        .then(() => console.log("Tracing terminated"))
        .catch((error) => console.log("Error terminating tracing", error))
        .finally(() => process.exit(0));
});
