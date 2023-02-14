import { pascalCase } from '@casimir/string-helpers'

export default class Config {
    /** List of required environment variables */
    requiredEnvVars = ['PROJECT', 'STAGE', 'AWS_ACCOUNT', 'AWS_REGION']
    /** Project name */
    project: string
    /** Deployment stage name */
    stage: string
    /** Deployment AWS env */
    env: {
        /** AWS account number */
        account: string
        /** AWS region */
        region: string
    }

    constructor() {
        this.requiredEnvVars.forEach(v => {
            if (!process.env[v]) {
                console.log('No value provided for', v)
                process.exit(1)
            }
        })
        this.project = pascalCase(process.env.PROJECT as string)
        this.stage = pascalCase(process.env.STAGE as string)
        this.env = {
            account: process.env.AWS_ACCOUNT as string,
            region: process.env.AWS_REGION as string
        }
    }
}