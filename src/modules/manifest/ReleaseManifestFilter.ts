/*
Author (Copyright) 2020 <Jean-Baptiste-Lasselle>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

Also add information on how to contact you by electronic and paper mail.

If your software can interact with users remotely through a computer
network, you should also make sure that it provides a way for users to
get its source.  For example, if your program is a web application, its
interface could display a "Source" link that leads users to an archive
of the code.  There are many ways you could offer source, and different
solutions will be better for different programs; see section 13 for the
specific requirements.

You should also get your employer (if you work as a programmer) or school,
if any, to sign a "copyright disclaimer" for the program, if necessary.
For more information on this, and how to apply and follow the GNU AGPL, see
<https://www.gnu.org/licenses/>.
*/
import * as fs from 'fs';
import * as arrayUtils from 'util';
// export const manifestPath : string = "release-data/apim/1.30.x/tests/release.json";
export const manifestPath : string = process.env.RELEASE_MANIFEST_PATH;

/**
 * Filters Gravitee components to release and builds an Execution Plan.
 * @comment All methods are synchronous
 **/
export class ReleaseManifestFilter {
    /**
     * [gravitee_release_branch] must match one the of the existing branch on
     **/
    gravitee_release_branch: string;
    gravitee_release_version: string;
    releaseManifest: any;
    selectedComponents : any;
    parallelizationConstraintsMatrix: any[][];
    executionPlan : any [][];
    constructor(release_version: string, release_branch: string) {
        this.validateJSon();
        this.loadParallelizationContraints();
        // console.debug("{[ReleaseManifestFilter]} - Parsed Manifest is [" + `${JSON.stringify(this.releaseManifest, null, "  ")}` + "]");

        this.gravitee_release_version = release_version;
        this.gravitee_release_branch = release_branch;
        this.selectedComponents = { "components" : []};
        this.initializeExecutionPlan();
        /// throw new Error('DEBUG POINT to reove asap');
    }
    /**
     * initializes the execution plan, to :
     * <ul>
     * <li> an emply execution plan, </li>
     * <li> which is an array of arrays, </li>
     * <li> which is not an empty array, but an array of <pre>N</pre> empty arrays, where <pre>N</pre> is the length of {@see this.parallelizationConstraintsMatrix} </li>
     * </ul>
     **/
    initializeExecutionPlan () : void {
      this.executionPlan = [];
      console.debug("{[ReleaseManifestFilter]} - Initializing Empty Execution Plan from Parallelization Constraints Matrix... ");
      for (let i = 0; i < this.parallelizationConstraintsMatrix.length; i++) {
        let newEntry = [ ];
        this.executionPlan.push(newEntry);
      }
      console.debug("{[ReleaseManifestFilter]} - Initialized Empty Execution Plan with " + `${this.executionPlan.length}` + " empty arrays : ");
      console.log('[');
      this.executionPlan.forEach(executionSet => {
        console.log('  [');
        console.log('    ' + arrayUtils.inspect(`${executionSet}`, { maxArrayLength: null }));
        console.log('  ],');
      });
      console.log(']');
    }
    loadParallelizationContraints() : void {
      console.debug("{[ReleaseManifestFilter]} - Loading Parallelization Constraints Matrix from Release Manifest... ");
      this.parallelizationConstraintsMatrix = this.releaseManifest.buildDependencies
      console.debug("{[ReleaseManifestFilter]} - Loaded Parallelization Constraints Matrix from Release Manifest : ");
      // console.debug(`${this.parallelizationConstraintsMatrix}`);
      console.log('[');

      this.parallelizationConstraintsMatrix.forEach(executionSet => {
        console.log('  [');
        console.log('    ' + arrayUtils.inspect(`${executionSet}`, { maxArrayLength: null }));
        console.log('  ],');
      });
      console.log(']');
    }
    /**
     * Filters the releaseManifest Release manifest file to
     * Populate [this.selectedComponents] with the components that should be included in the release
     **/
    filter() : void {
      console.debug("{[ReleaseManifestFilter]} - Parsed Manifest is [" + `${JSON.stringify(this.releaseManifest, null, "  ")}` + "]");
      if (!this.releaseManifest.hasOwnProperty('version')) {
        throw new Error("The [release.json] file doesnot have a 'version' JSON property. It should, cannot proceed with CI CD Release Process.");
      }
      this.releaseManifest.components.forEach(component => {
        if (!component.hasOwnProperty('version')) {
          component.version = this.releaseManifest.version; // infer version from release manifest top level version JSON Property, as of [https://github.com/gravitee-lab/GraviteeCiCdOrchestrator/issues/26]
        }
        if (component.version.includes('-SNAPSHOT')) {
          console.info('');
          /// console.debug("[{CircleCiOrchestrator}] - processing filter selected component : ");
          /// console.debug(`${JSON.stringify(component, null, "  ")}`);
          /// selectedComponents.push(component);
          this.selectedComponents.components.push(component);
          console.info('');
        }
      });
      console.debug("{[ReleaseManifestFilter]} - Selected components are [" + `${JSON.stringify(this.selectedComponents, null, "  ")}` + "]");
    }
    /**
     * <p>
     * Generates the Execution plan using [this.selectedComponents()] with the components that should be included in the release :
     * <p>
     * <ul>
     * <li>The 2-dim. Array has the exact same structure as the 'buildDependencies' JSON property in the release.json (from https://github.com/gravitee-io/release.git)</li>
     * <li>The 2-dim. Array has the exact same entries than the 'buildDependencies' JSON property in the release.json (from https://github.com/gravitee-io/release.git), only  structure as the 'buildDependencies' JSON property in the release.json (from https://github.com/gravitee-io/release.git), only all dependencies that do not require processing release, were removed as Array entries.</li>
     * <li>The 2-dim. Array has the exact same length as the 'buildDependencies' JSON property in the release.json (from https://github.com/gravitee-io/release.git), only some entries are empty arrays (not undefined, but of length zero)</li>
     * <ul>
     *
     * Example Execution Plan :
     * -----
     * <pre>
     *      [
     *          [
     *              "gravitee-common"
     *          ],
     *          [
     *          ],
     *          [
     *              "gravitee-repository-test"
     *          ],
     *          [
     *              "gravitee-reporter-api",
     *              "gravitee-notifier-email"
     *          ],
     *          [
     *          ],
     *          [
     *          ],
     *          [
     *          ],
     *          [
     *          ],
     *          [
     *              "gravitee-resource-oauth2-provider-api"
     *          ],
     *          [
     *              "gravitee-resource-cache"
     *          ],
     *          [
     *              "gravitee-policy-apikey",
     *              "gravitee-policy-ratelimit",
     *              "gravitee-policy-dynamic-routing",
     *              "gravitee-fetcher-bitbucket",
     *              "gravitee-fetcher-github"
     *          ],
     *          [
     *              "gravitee-management-rest-api",
     *              "gravitee-management-webui"
     *          ]
     *      ]
     * </pre>
     *
     *
     * @returns A 2-dimensional JSon array, which is the execution plan, that will be executed by the {@see CircleCiOrchestrator}
     *
     **/
    buildExecutionPlan()  : string [][] {

      this.filter(); /// populates the [this.selectedComponents] Class member

      this.selectedComponents.components.forEach(component => {
        let parallelExecutionSetIndex = this.getParallelExecutionSetIndex(component);
        this.executionPlan[parallelExecutionSetIndex].push(component);
      });
      console.info("");
      console.info('+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x')
      console.info("{[ReleaseManifestFilter]} - EXECUTION PLAN is the value of the 'built_execution_plan_is' below : ");
      console.info('+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x')
      console.info(" ---");
      console.info(JSON.stringify({ built_execution_plan_is: this.executionPlan}, null, " "));
      console.info(" ---");
      console.info('+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x')
      console.info("");
      return this.executionPlan
    }

    /**
     * This method lokks up the [this.parallelizationConstraintsMatrix] ("Parallelization Constraints Matrix") to determine what is the Parallelization Execution Set Index of {@argument component}
     *
     * @argument component must be a JSon Object, with only two properties : "name", and "version", just like in the [release.json]
     * @returns number a positive integer, between zero and length of the [this.parallelizationConstraint] array
     *
     **/
    getParallelExecutionSetIndex (component: any) : number {

      /// First, let's check the provided argument actually is a component :
      /// is a JSON Object with only two properties, 'name', and 'version', jsut like in the 'components' array in [release.json] Release manifest file.
      /// .keys(obj).length
      console.debug('');
      console.debug('--- ');
      console.debug('');
      if (Object.keys(component).length != 2) {
        let errMsg = "{[ReleaseManifestFilter]} - The component : ";
        errMsg += `${JSON.stringify(component, null, "  ")}`;
        errMsg += "{[ReleaseManifestFilter]} - has a total of " + `${Object.keys(component).length}` +" [JSon] properties.";
        errMsg += "{[ReleaseManifestFilter]} - whil components are exepected to have exactly 2 properties [JSon] properties.";
        throw new Error(errMsg);
      }
      if (component.name === undefined || component.name === "") {
        let errMsg = "{[ReleaseManifestFilter]} - The component : ";
        errMsg += `${JSON.stringify(component, null, "  ")}`;
        errMsg += "{[ReleaseManifestFilter]} - 'name' [JSon] property is undefined, while Gravitee [components] are exepected to";
        errMsg += "{[ReleaseManifestFilter]} - have a 'name' [JSon] property that neither is undefined, nor an empty string.";
        throw new Error(errMsg);
      }
      if (component.version === undefined || component.name === "") {
        let errMsg = "{[ReleaseManifestFilter]} - The component : ";
        errMsg += `${JSON.stringify(component, null, "  ")}`;
        errMsg += "{[ReleaseManifestFilter]} - 'version' [JSon] property is undefined, while Gravitee [components] are exepected to";
        errMsg += "{[ReleaseManifestFilter]} - have a 'version' [JSon] property that neither is undefined, nor an empty string.";
        throw new Error(errMsg);
      }

      /// now we know we have available properties 'name' and 'version' into 'component'
      let parallelExecutionSetIndexToReturn = -1;
      /// component.name

      /// double loop search into [Parallelization Constraints Matrix]
      for (let i = 0; i < this.parallelizationConstraintsMatrix.length; i++) {

        this.parallelizationConstraintsMatrix[i].forEach(componentName => {
          if (component.name === componentName) {
            console.debug("{[ReleaseManifestFilter]} - Gravitee Release Orchestrator searches for " + `${componentName}` + " into Parallel Execution Set no. ["+ `${i}` + "] : ");
            console.debug('');
            console.debug(`${JSON.stringify(component, null, "  ")}`);
            console.debug('');
            console.debug('--- ');
            console.debug('');
            parallelExecutionSetIndexToReturn = i;
            let foundMsg = "{[ReleaseManifestFilter]} - Gravitee Release Orchestrator could determine Parallel Execution Set Index is [" + `${parallelExecutionSetIndexToReturn}` + "] for the following component : \n";
            foundMsg += `${JSON.stringify(component, null, "  ")}`;
            foundMsg += " ";
            console.info(foundMsg);
          }
        });
      }

      /// Index must not be out of bounds of the [parallelizationConstraintsMatrix]
      /// Index must not be negative
      if (parallelExecutionSetIndexToReturn < 0) {
        let errMsg = "{[ReleaseManifestFilter]} - Gravitee Release Orchestrator could not determine which Parallel Execution Set Index for the following component (do they appear in the [buildDependencies] in the [release.json] ? ) : ";
        errMsg += `${JSON.stringify(component, null, "  ")}`;
        errMsg += " ";
        throw new Error(errMsg)
      }
      /// Index must not be strictly less than the [this.parallelizationConstraintsMatrix] array length
      if (parallelExecutionSetIndexToReturn > this.parallelizationConstraintsMatrix.length - 1) {

        let errMsg = "{[ReleaseManifestFilter]} - [Parallel Execution Set Index] out of bounds Exception"
        errMsg += "{[ReleaseManifestFilter]} - Gravitee Release Orchestrator determined the Parallel Execution Set Index of the following component : ";
        errMsg += `${JSON.stringify(component, null, "  ")}`;
        errMsg += " is [" + `${parallelExecutionSetIndexToReturn}` + "] ";
        errMsg += " while the [Parallelization Constraints Matrix] defines the highest index to  [" + `${this.parallelizationConstraintsMatrix.length - 1}` + "] ";

        throw new Error(errMsg)
      }
      return parallelExecutionSetIndexToReturn;
    }
    /**
     * Checks :
     * => if the file exists,
     * => if it contains a valid JSON,
     *
     **/
    validateJSon()  : void {
      if (!fs.existsSync(manifestPath)) {
        throw new Error("{[ReleaseManifestFilter]} - [" + `${manifestPath}` + "] does not exists, stopping release process");
      } else {
        console.log("{[ReleaseManifestFilter]} - found release.json release manifest located at [" + manifestPath + "]");
      }
      console.info("{[ReleaseManifestFilter]} - Parsing release.json Release Manifest file located at [" + manifestPath + "]");
      console.debug("{[ReleaseManifestFilter]} - Parsed Manifest is [" + `${JSON.stringify(this.releaseManifest, null, "  ")}` + "]");
      let manifestAsString: string = fs.readFileSync(`${manifestPath}`,'utf8');
      this.releaseManifest = JSON.parse(manifestAsString);
    }
}
export let companyName:string = "Gravitee.io";
/// let notVisibleFromOutside:string = "I'm a kind of protected property";
