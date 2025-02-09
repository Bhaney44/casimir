import { Construct } from 'constructs'
import * as cdk from 'aws-cdk-lib'
import * as certmgr from 'aws-cdk-lib/aws-certificatemanager'
import * as route53targets from 'aws-cdk-lib/aws-route53-targets'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins'
import { LandingStackProps } from '../interfaces/StackProps'
import { pascalCase } from '@casimir/string-helpers'
import { Config } from './config'

/**
 * Landing page stack
 */
export class LandingStack extends cdk.Stack {
  /** Stack name */
  public readonly name = pascalCase('landing')
  /** Path to stack build assets or Dockerfile */
  public readonly assetPath = '../../apps/landing/dist'

  constructor(scope: Construct, id: string, props: LandingStackProps) {
    super(scope, id, props)

    const config = new Config()
    const { rootDomain, subdomains } = config
    const { hostedZone, certificate } = props

    /** Create a bucket for the landing page */
    const bucket = new s3.Bucket(this, config.getFullStackResourceName(this.name, 'bucket'), {
      accessControl: s3.BucketAccessControl.PRIVATE
    })

    /** Set bucket to allow cloudfront origin */
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, config.getFullStackResourceName(this.name, 'origin-access-identity'))
    bucket.grantRead(originAccessIdentity)

    /** Create a requisite us-east-1 certificate for distribution if needed */
    const distributionCertificate = (() => {
      if (certificate?.env.region === 'us-east-1') return certificate
      /** Replace deprecated method when cross-region support is out of beta */
      return new certmgr.DnsValidatedCertificate(this, config.getFullStackResourceName(this.name, 'cert'), {
        domainName: rootDomain,
        subjectAlternativeNames: [`${subdomains.landing}.${rootDomain}`],
        hostedZone,
        region: 'us-east-1'
      })
    })()

    /** Create a cloudfront distribution for the landing page */
    const distribution = new cloudfront.Distribution(this, config.getFullStackResourceName(this.name, 'distribution'), {
      certificate: distributionCertificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(30)
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(30)
        }
      ],
      defaultBehavior: {
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        origin: new cloudfrontOrigins.S3Origin(bucket, { originAccessIdentity })
      },
      domainNames: [rootDomain, `${subdomains.landing}.${rootDomain}`]
    })

    /** Deploy the landing page to the bucket */
    new s3Deployment.BucketDeployment(this, config.getFullStackResourceName(this.name, 'bucket-deployment'), {
      destinationBucket: bucket,
      sources: [s3Deployment.Source.asset(this.assetPath)],
      distribution,
      distributionPaths: ['/*']
    })

    /** Create an A record for the landing page root */
    new route53.ARecord(this, config.getFullStackResourceName(this.name, 'a-record'), {
      recordName: rootDomain,
      zone: hostedZone as route53.IHostedZone,
      target: route53.RecordTarget.fromAlias(new route53targets.CloudFrontTarget(distribution)),
      ttl: cdk.Duration.minutes(1),
    })

    /** Create an A record for the landing page www subdomain */
    new route53.ARecord(this, config.getFullStackResourceName(this.name, 'a-record-www'), {
      recordName: `${subdomains.landing}.${rootDomain}`,
      zone: hostedZone as route53.IHostedZone,
      target: route53.RecordTarget.fromAlias(new route53targets.CloudFrontTarget(distribution)),
      ttl: cdk.Duration.minutes(1),
    })
  }
}
