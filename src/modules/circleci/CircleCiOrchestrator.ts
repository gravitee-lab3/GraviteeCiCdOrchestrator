/**
 * Executes the parallelized execution plan which launches all Circle CI Pipelines as distributed build across repos.
 *
 *
 **/
export class CircleCiOrchestrator {
    /**
     * [gravitee_release_branch] must match one the of the existing branch on
     **/
    private execution_plan: string [][];
    private retries: number;

    constructor(execution_plan: string [][], retries: number) {
        this.execution_plan = execution_plan;
        this.retries = retries;
    }
    /**
     * returning an A 2-dimensional array
     **/
    start()  : void {
      console.info("[{CircleCiOrchestrator}] - started processing execution plan, and will retry " + this.retries + " times executing a [Circle CI] pipeline before giving up.")
      this.execution_plan.forEach(parallelExecutions => {
        console.info("[{CircleCiOrchestrator}] - processing parallel executions of the following [Circle CI] pipelines : ");
        console.info(parallelExecutions);
      });
      console.log("[{CircleCiOrchestrator}] - Processing of the execution plan is not imlemented yet.");

    }
    giveup()  : void {
      console.log("[{CircleCiOrchestrator}] - giveup() method is not imlemented yet.");
    }
}
