# CDK constructs

Convenience constructs included in this project:

* ApiGatewayServedLambda
* HostedReactApp

## Usage

### ApiGatewayServedLambda

Includes following components:
* `HttpApi` to deliver endpoint
* `NodejsFunction` containing logic
* `Table` in case of parameters added

```typescript
new ApiGatewayServedLambda(stack, 'ApiGatwayServedLambda', {
  lambda: {
    entry: path.join(__dirname, 'handler.ts')
  }
})
```

### HostedReactApp

Includes following components:
* `Bucket` to host the react app
* `Distribution` to serve the react app

```typescript
new HostedReactApp(stack, 'HostedReactApp')
```

## Release

Use command `npm run patch` or `npm run minor`

Tags will be automatically published to npmjs