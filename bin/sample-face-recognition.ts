#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SampleFaceRecognitionStack } from "../lib/sample-face-recognition-stack";

const app = new cdk.App();
new SampleFaceRecognitionStack(app, "SampleFaceRecognitionStack", {
  env: { account: "REPLACE_ME", region: "eu-west-1" },
});
