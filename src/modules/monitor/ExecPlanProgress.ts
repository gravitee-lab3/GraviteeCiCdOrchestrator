import { ParallelExecutionSet } from '../manifest/ParallelExecutionSet';
import { ExecutionPlan } from '../manifest/ExecutionPlan';

/**
 * A ExecPlanProgress represents the progress matrix of all pipeline
*  executions planned by an {@see manifest.ExecutionPlan}
 **/

  export interface ExecPlanProgressArgs {
    executionPlan: ExecutionPlan;
  }

  /**
   *
   *
   **/
  export class ExecPlanProgress {

    public readonly executionPlan: ExecutionPlan;
    private completed: boolean;

    constructor (
      args: ExecPlanProgressArgs
    ) {
      /// super(`valueofContructorParamOne`, args)


      this.executionPlan = args.executionPlan;
      this.completed = false;

    }
    setCompleted() {
      this.completed = true;
    }
    isCompleted(): boolean {
      return this.completed;
    }
  }