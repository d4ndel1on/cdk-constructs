import {Stack} from "aws-cdk-lib";
import {ApiGatewayServedLambda} from "../lib/ApiGatewayServedLambda";
import {Template} from "aws-cdk-lib/assertions";
import {HostedReactApp} from "../lib/HostedReactApp";
import * as path from "path";
import {AttributeType} from "aws-cdk-lib/aws-dynamodb";

describe('ApiGatewayServedLambda', function () {
  it('should match snapshot', () => {
    const stack = new Stack()
    new ApiGatewayServedLambda(stack, 'Test', {
      lambda: {
        entry: path.join(__dirname, 'testHandler.ts')
      }
    })

    const template = Template.fromStack(stack)
    expect(template.toJSON()).toMatchSnapshot()
  })

  test('should match snapshot with dynamodb', () => {
    const stack = new Stack()
    new ApiGatewayServedLambda(stack, 'TestWithDynamodb', {
      lambda: {
        entry: path.join(__dirname, 'testHandler.ts')
      },
      table: {
        partitionKey: {type: AttributeType.STRING, name: 'key'},
        sortKey: {type: AttributeType.STRING, name: 'sort'},
      }
    })

    const template = Template.fromStack(stack)
    expect(template.toJSON()).toMatchSnapshot()
  })
})

describe('HostedReactApp', () => {
  it('should match snapshot', () => {
    const stack = new Stack()
    new HostedReactApp(stack, 'Test')

    const template = Template.fromStack(stack)
    expect(template.toJSON()).toMatchSnapshot()
  })
});
