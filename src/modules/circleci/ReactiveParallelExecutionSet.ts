import * as rxjs from 'rxjs';
import { CircleCIClient } from '../../modules/circleci/CircleCIClient'
import { CircleCISecrets } from '../../modules/circleci/CircleCISecrets'

export class ReactiveParallelExecutionSet {

  private progressMatrix: any[]; // will be filled as requests are sent
  private progressMatrixSubject = new rxjs.Subject<any[]>();

  private parallelExecutionSet: any[]; // contains all the entires coming from execution_plan
  private parallelExecutionSetIndex: number; // [ParallelExecutionSet] index in execution plan

  private circleci_client: CircleCIClient;
  private secrets: CircleCISecrets;

  private pipelines_nb: number;

  constructor(parallelExecutionSet: any[], parallelExecutionSetIndex: number, circleci_client: CircleCIClient) {
    this.parallelExecutionSetIndex = parallelExecutionSetIndex;
    this.parallelExecutionSet = parallelExecutionSet;
    this.circleci_client = circleci_client;
    this.pipelines_nb = this.parallelExecutionSet.length;
    this.progressMatrix = [];
  }

  triggerPipelines(): rxjs.Subject<any[]> {


    console.info("");
    console.info('+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x')
    console.info("{[CircleCiOrchestrator]} - Processing Parallel Executions Set : the set under processing is the value of the 'parallelExecutionsSet' below : ");
    console.info('+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x')
    console.info(" ---");
    console.info(JSON.stringify({ parallelExecutionsSet: this.progressMatrix }, null, " "));
    console.info(" ---");
    console.info('+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x')
    console.info("");

    /// First, trigger all pipelines in the parallel execution set
    this.parallelExecutionSet.forEach(((componentName, index) => {
      /// pipeline execution parameters, same as Jenkins build parameters
      let pipelineParameters = { parameters: {}};
      let triggerPipelineSubscription = this.circleci_client.triggerCciPipeline(this.secrets.circleci.auth.username, process.env.GH_ORG, "testrepo1", 'dependabot/npm_and_yarn/handlebars-4.5.3', pipelineParameters).subscribe({
          next: this.handleTriggerPipelineCircleCIResponseData.bind(this),
          complete: data => {
            console.log( '[{[CircleCiOrchestrator]} - triggering Circle CI Build completed! :)]')
          },
          error: this.errorHandlerTriggerCCIPipeline.bind(this)
      });
    }).bind(this));
    return this.progressMatrixSubject;
  }
  private handleTriggerPipelineCircleCIResponseData (circleCiJsonResponse: any) : void {
    console.info( '[{CircleCiOrchestrator}] - [handleTriggerPipelineCircleCIResponseData] Processing Circle CI API Response [data] => ', circleCiJsonResponse.data )
    let entry: any = {};
    entry.pipeline = {
      pipeline_exec_number: `${circleCiJsonResponse.data.number}`,
      id : `${circleCiJsonResponse.data.id}`,
      created_at: `${circleCiJsonResponse.data.created_at}`,
      exec_state: `${circleCiJsonResponse.data.state}`
    }
    this.progressMatrix.push(entry.pipeline);
    /// this.progressMatrixSubject.next(entry.pipeline);
    this.progressMatrixSubject.next(this.progressMatrix);


    /// console.info('')
    /// console.info( '[{CircleCiOrchestrator}] - [handleTriggerPipelineCircleCIResponseData] [this.progressMatrix] is now :  ');
    // console.info(JSON.stringify({progressMatrix: this.progressMatrix}, null, " "));
    /// console.info({progressMatrix: this.progressMatrix});
    /// console.info('')
  }
  private errorHandlerTriggerCCIPipeline (error: any) : void {
    console.info( '[{CircleCiOrchestrator}] - Triggering Circle CI pipeline failed Circle CI API Response [data] => ', error )
    let entry: any = {};
    entry.pipeline = {
      execution_index: null,
      id : null,
      created_at: null,
      exec_state: null,
      error : {message: "[{CircleCiOrchestrator}] - Triggering Circle CI pipeline failed ", cause: error}
    }

    this.progressMatrix.push(entry);

    console.info('')
    console.info( '[{CircleCiOrchestrator}] - [errorHandlerTriggerCCIPipeline] [this.progressMatrix] is now :  ');
    // console.info(JSON.stringify({progressMatrix: this.progressMatrix}, null, " "));
    console.info({progressMatrix: this.progressMatrix});
    console.info('')
    throw new Error('[{CircleCiOrchestrator}] - [errorHandlerTriggerCCIPipeline] CICD PROCESS INTERRUPTED BECAUSE TRIGGERING PIPELINE FAILED with error : [' + error + '] '+ ' and, when failure happened, progress matrix was [' + { progressMatrix: this.progressMatrix } + ']')
  }

}
