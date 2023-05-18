import {Construct} from 'constructs';
import {BlockPublicAccess, Bucket, BucketProps} from "aws-cdk-lib/aws-s3";
import {CfnOutput, RemovalPolicy} from "aws-cdk-lib";
import {
  CachedMethods,
  Distribution,
  DistributionProps,
  PriceClass,
  ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import {S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";

export interface HostedReactAppProps {
  /**
   * bucket props to overwrite defaults
   */
  bucket?: Partial<BucketProps>
  /**
   * distribution props to overwrite defaults
   */
  distribution?: Omit<Partial<DistributionProps>, 'comment' | 'defaultBehavior'>
}

export class HostedReactApp extends Construct {

  readonly bucket: Bucket
  readonly distribution: Distribution

  constructor(scope: Construct, id: string, props?: HostedReactAppProps) {
    super(scope, id);

    const bucket = props?.bucket
    const distribution = props?.distribution

    this.bucket = new Bucket(this, `${id}_FrontendBucket`, {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      ...bucket,
    });

    this.distribution = new Distribution(this, `${id}_CloudfrontDistribution`, {
      priceClass: PriceClass.PRICE_CLASS_100,
      comment: `${id} cloudfront distribution to serve ${this.bucket.bucketName} bucket`,
      defaultBehavior: {
        origin: new S3Origin(this.bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachedMethods: CachedMethods.CACHE_GET_HEAD,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      ...distribution,
    });

    new CfnOutput(this, 'CloudFrontURL', {
      value: this.distribution.domainName,
      description: 'The distribution URL',
      exportName: `${id}:CloudfrontURL`,
    });

    new CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'The name of the S3 bucket',
      exportName: `${id}:BucketName`,
    });
  }
}
