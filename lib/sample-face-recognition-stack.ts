import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import { RemovalPolicy } from "aws-cdk-lib";

export class SampleFaceRecognitionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a S3 Bucket
    const faceImagesBucket = new s3.Bucket(this, "FaceImagesBucket", {
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      accessControl: s3.BucketAccessControl.PRIVATE,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Create a Lambda Function
    const faceComparisonFunction = new lambda.Function(
      this,
      "FaceComparisonFunction",
      {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: "index.handler",
        code: lambda.Code.fromAsset("lambda"),
        environment: {
          BUCKET_NAME: faceImagesBucket.bucketName,
        },
      }
    );
    faceImagesBucket.grantRead(faceComparisonFunction);

    // Create a custom IAM policy
    const rekognitionPolicy = new iam.PolicyStatement({
      actions: ["rekognition:CompareFaces"],
      resources: ["*"], // Adjust the resource ARN to a specific Rekognition resource if necessary
    });

    // Attach the policy to the Lambda execution role
    faceComparisonFunction.addToRolePolicy(rekognitionPolicy);

    // Create the API Gateway REST API
    const api = new apigateway.RestApi(this, "FaceComparisonApi");

    // Create an integration between API Gateway and the Lambda function
    const integration = new apigateway.LambdaIntegration(
      faceComparisonFunction
    );

    // Define the API Gateway resource and method
    const resource = api.root.addResource("compare");
    resource.addMethod("POST", integration);
  }
}
