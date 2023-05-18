import {Construct} from "constructs";
import {NodejsFunction, NodejsFunctionProps} from "aws-cdk-lib/aws-lambda-nodejs";
import {HttpApi} from "@aws-cdk/aws-apigatewayv2-alpha";
import * as path from "path";
import {BillingMode, Table, TableProps} from "aws-cdk-lib/aws-dynamodb";
import {CfnOutput, Duration} from "aws-cdk-lib";
import {Architecture, Runtime} from "aws-cdk-lib/aws-lambda";
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {HttpLambdaIntegration} from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

export interface ApiGatewayServedLambdaProps {
  /**
   * Table properties to overwrite. No dynamodb table created on absent
   */
  table?: Pick<
    TableProps,
    'billingMode' |
    'partitionKey' |
    'sortKey' |
    'timeToLiveAttribute' |
    'removalPolicy' |
    'readCapacity' |
    'writeCapacity' |
    'tableName'
  >
  /**
   * Lambda properties to overwrite. Defaults are used if absent.
   */
  lambda?: Partial<Pick<
    NodejsFunctionProps,
    'runtime' |
    'timeout' |
    'memorySize' |
    'logRetention' |
    'handler' |
    'environment' |
    'entry'
  >>
}

export class ApiGatewayServedLambda extends Construct {

  readonly table: Table | undefined
  readonly lambda: NodejsFunction
  readonly api: HttpApi

  constructor(scope: Construct, id: string, props?: ApiGatewayServedLambdaProps) {
    super(scope, id);

    const lambda = props?.lambda
    const table = props?.table

    this.table = table ? new Table(this, 'Table', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      ...table,
    }) : undefined

    this.lambda = new NodejsFunction(this, `${id}ApiLambda`, {
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(5),
      architecture: Architecture.ARM_64,
      memorySize: 128,
      entry: path.join(__dirname, '../src/api.ts'),
      logRetention: RetentionDays.ONE_WEEK,
      handler: 'handler',
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk'],
      },
      ...lambda,
      environment: {
        TABLE: this.table?.tableName || '',
        ...lambda?.environment,
      },
    })

    this.table?.grantReadWriteData(this.lambda)

    this.api = new HttpApi(this, `${id}HttpApi`, {
      defaultIntegration: new HttpLambdaIntegration(`${id}ApiIntegration`, this.lambda),
    })

    new CfnOutput(this, `${id}ApiURL`, {
      value: this.api.apiEndpoint,
      exportName: `${id}:ApiURL`,
    })
    if (this.table) {
      new CfnOutput(this, `${id}DynamoDbTable`, {
        value: this.table.tableArn,
        exportName: `${id}:TableArn`,
      })
    }
  }
}