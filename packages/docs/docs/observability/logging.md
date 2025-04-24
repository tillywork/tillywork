---
sidebar_position: 1
description: Learn how to set up and use logging, tracing, and monitoring
---

# Logging

## Logging Stack

tillywork implements a comprehensive observability stack using:

- Application Logging (NestJS Logger + Loki)
- Distributed Tracing (OpenTelemetry + Tempo)
- Metrics Visualization (Grafana)

## Configuration

### Environment Variables

```env
# Loki
TW_LOKI_HOST=http://loki:3100

# OpenTelemetry
TW_OTEL_SERVICE_NAME=tw-backend
TW_OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318/v1/traces

# Grafana
TW_GRAFANA_ADMIN_USER=admin
TW_GRAFANA_ADMIN_PASSWORD=admin
```

### Docker Compose Setup

Our observability stack is configured in docker-compose.yml:

```yaml
services:
  tempo:
    image: grafana/tempo:latest
    command: ['-config.file=/etc/tempo.yaml']
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
      - tempo:/var/tempo
    ports:
      - '127.0.0.1:4318:4318'

  loki:
    image: grafana/loki:latest
    ports:
      - '127.0.0.1:3100:3100'
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - loki:/loki

  grafana:
    image: grafana/grafana:latest
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_USER=${TW_GRAFANA_ADMIN_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${TW_GRAFANA_ADMIN_PASSWORD:-admin}
      - GF_AUTH_ANONYMOUS_ENABLED=false
    volumes:
      - ./grafana-datasources.yaml:/etc/grafana/provisioning/datasources/datasources.yaml
      - grafana:/var/lib/grafana
```

## Logging

### Application Logger

The `TillyLogger` extends NestJS's `ConsoleLogger` and provides:

- Sensitive data redaction
- Loki integration
- OpenTelemetry correlation

Usage example:

```typescript
import { TillyLogger } from '../common/logger/tilly.logger';

@Injectable()
export class YourService {
  private readonly logger = new TillyLogger('YourService');

  someMethod() {
    this.logger.log('Info message');
    this.logger.error('Error message', error.stack);
    this.logger.warn('Warning message');
    this.logger.debug('Debug info');
  }
}
```

### Sensitive Data Protection

The logger automatically redacts sensitive information including:

- Passwords
- Tokens
- Authorization headers
- Secrets
- API keys
- Credit card information
- Email addresses

## Distributed Tracing

OpenTelemetry configuration is initialized in `packages/backend/src/tracing.ts`:

```typescript
const sdk = new NodeSDK({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: process.env.TW_OTEL_SERVICE_NAME || 'tw-backend',
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [getNodeAutoInstrumentations(), new NestInstrumentation()],
});
```

### HTTP Request Tracing

All HTTP requests are automatically traced using the `TracingInterceptor`.

## Grafana Setup

1. Access Grafana at `http://localhost:3001`
2. Default credentials:
   - Username: admin
   - Password: admin

### Data Sources Configuration

The datasources are already configured in `grafana-datasources.yaml`.

- Loki: `http://loki:3100`
- Tempo: `http://tempo:4318`

### Example Loki Queries

Search for all logs:

```
{app="tw-backend"}
```

Filter error logs:

```
{app="tw-backend"} |= "error"
```

Filter by context:

```
{app="tw-backend", context="YourService"}
```

## Best Practices

1. **Context Usage**: Always provide a context when creating a logger:

```typescript
private readonly logger = new TillyLogger('YourServiceName');
```

2. **Log Levels**:

   - `error`: Application errors
   - `warn`: Warning conditions
   - `log`: General information
   - `debug`: Debug information
   - `verbose`: Detailed debug information

3. **Structured Logging**: Use objects for complex logs:

```typescript
this.logger.log({
  event: 'user_action',
  userId: user.id,
  action: 'login',
  duration: 123,
});
```

4. **Error Logging**: Include stack traces:

```typescript
try {
  await someOperation();
} catch (error) {
  this.logger.error('Operation failed', error.stack);
}
```

## Local Development

1. Start the observability stack:

```bash
docker compose up tempo loki grafana
```

2. Verify Grafana is running by going to:

   - http://localhost:3001
