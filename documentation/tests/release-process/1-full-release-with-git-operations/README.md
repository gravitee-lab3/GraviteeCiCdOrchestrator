# Tests of the release process ( git operations)


# Test suite : testing the 3.4.1  Release in https://github.com/gravitee-lab



## Production Test suite 1 (on `3.4.1` maintenance release)

In the https://github.com/gravitee-lab Github Org :
* the https://github.com/gravitee-lab/release-state-maintenance-rel-3.4.x github repo was forked from the https://github.com/gravitee-io/release just before making the `3.4.1` maintenance release
* On the `3.4.x` git branch of the https://github.com/gravitee-lab/release-state-maintenance-rel-3.4.x, I modified the `release.json` file, to add :

```JSon
{
  {
      "name": "gravitee-repository-test",
      "version": "3.4.1"
  },
  {
      "name": "gravitee-repository-test-release-3-4-1",
      "version": "3.4.1-SNAPSHOT"
  },
  {
      "name": "gravitee-repository-mongodb",
      "version": "3.4.1"
  },
  {
      "name": "gravitee-repository-mongodb-release-3-4-1",
      "version": "3.4.1-SNAPSHOT"
  },
  {
      "name": "gravitee-repository-jdbc",
      "version": "3.4.1"
  },
  {
      "name": "gravitee-repository-jdbc-release-3-4-1",
      "version": "3.4.1-SNAPSHOT"
  }
}
```

* On the `3.4.x` git branch of the https://github.com/gravitee-lab/release-state-maintenance-rel-3.4.x, I modified the `release.json` file, I also modified the `buildDependencies` JSON array :
  * to include the `gravitee-repository-test-release-3-4-1` at the same dependency level than the `gravitee-repository-test` repo
  * to include the `gravitee-repository-mongodb-release-3-4-1` at the same dependency level than the `gravitee-repository-mongodb` repo
  * to include the `gravitee-repository-jdbc-release-3-4-1` at the same dependency level than the `gravitee-repository-jdbc` repo

* I also, just before making the `3.4.1` maintenance release :
  * created the https://github.com/gravitee-lab/gravitee-repository-test-release-3-4-1 git repo, from https://github.com/gravitee-io/gravitee-repository-test
  * created the https://github.com/gravitee-lab/gravitee-repository-mongodb-release-3-4-1 git repo, from https://github.com/gravitee-io/gravitee-repository-mongodb
  * created the https://github.com/gravitee-lab/gravitee-repository-jdbc-release-3-4-1 git repo, from https://github.com/gravitee-io/gravitee-repository-jdbc
  * because running this test suite will modify the git repos : And I need to keep their initial state, to be able to reproduce the test.
* Finally, to be able to redefine the gravitee parent pom, I :
  * created the https://github.com/gravitee-lab/gravitee-parent-redefinition git repo, forking the https://github.com/gravitee-io/gravitee-parent
  * created a `19.99.x` git branch, from the `19` git tag in the https://github.com/gravitee-lab/gravitee-parent-redefinition git repo
  * on the `19.99.x` git branch of the https://github.com/gravitee-lab/gravitee-parent-redefinition git repo, I modified the `pom.xml`, to set the `19.99.1-SNAPSHOT` pom version, and added the `gio-release` maven profile
  * on the `19.99.x` git branch of the https://github.com/gravitee-lab/gravitee-parent-redefinition git repo, I added [this `.circleci/config.yml`](https://github.com/gravitee-lab/gravitee-parent-redefinition/blob/19.99.1/.circleci/config.yml), which triggered the `Circle CI` pipeline, ending up with releasing the `19.99.1` parent pom verion for gravitee io, in the private artifactory
  * Finally, on the `19.99.x` git branch of the https://github.com/gravitee-lab/gravitee-parent-redefinition git repo, I added the `19.99.1` tag.
  * From version `17`, in the https://github.com/gravitee-lab/gravitee-parent-redefinition git repo, I created a `17.99.x` git branch, and tried and release to artifactory a `17.99.1` gravitee parent pom, with the same process, this one failed
  * From version `18`, in the https://github.com/gravitee-lab/gravitee-parent-redefinition git repo, I created a `18.99.x` git branch, and trued and release to artifactory a `18.99.1` gravitee parent pom, with the same process, this one failed


Once all this was done, I triggered the following release process :

```bash
# It should be SECRETHUB_ORG=graviteeio, but Cirlce CI token is related to
# a Circle CI User, not an Org, so jsut reusing the same than for Gravtiee-Lab here, to work faster
# ---
SECRETHUB_ORG=gravitee-lab
SECRETHUB_REPO=cicd
# Nevertheless, I today think :
# Each team member should have his own personal secrethub repo in the [graviteeio] secrethub org.
# like this :
# a [graviteeio/${TEAM_MEMBER_NAME}] secrethub repo for each team member
# and the Circle CI Personal Access token stored with [graviteeio/${TEAM_MEMBER_NAME}/circleci/token]
# ---
export HUMAN_NAME=jblasselle
export CCI_TOKEN=$(secrethub read "${SECRETHUB_ORG}/${SECRETHUB_REPO}/humans/${HUMAN_NAME}/circleci/token")

export ORG_NAME="gravitee-lab"
export REPO_NAME="release-state-maintenance-rel-3.4.x"
export BRANCH="3.4.x"
export JSON_PAYLOAD="{

    \"branch\": \"${BRANCH}\",
    \"parameters\":

    {
        \"gio_action\": \"release\"
    }

}"

curl -X GET -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" https://circleci.com/api/v2/me | jq .
curl -X POST -d "${JSON_PAYLOAD}" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" https://circleci.com/api/v2/project/gh/${ORG_NAME}/${REPO_NAME}/pipeline | jq .
```

The result of that first test was this :

* The `gravitee-repository-test-release-3-4-1` git repo  gave a successful `3.4.1` release, with
  * The maven artifact `3.4.1` in the private artifactory
  * The git tag `3.4.1` added to the `gravitee-repository-test-release-3-4-1` git repo
  * the `3.4.2-SNAPSHOT` "next SNAPSHOT version" in the `pom.xml` in a git commit right after the git tag `3.4.1`, on the `3.4.x` git branch of the `gravitee-repository-test-release-3-4-1` git repo
* The  failed :
  * Circle CI pipeline execution is https://app.circleci.com/pipelines/github/gravitee-lab/gravitee-repository-mongodb-release-3-4-1/3/workflows/d2fc6db1-2e49-492f-ab36-0506fc0923b5/jobs/3
  * In the stdout of that pipeline execution, we can spot the `Property ${gravitee-repository-test.version}: Leaving unchanged as 3.4.1-SNAPSHOT`
  * What happened is that the below maven command does not update the `gravitee-repository-test` dependency from `3.4.1-SNAPSHOT` to `3.4.1`, although the private artifactory server does have the `3.4.1` version available :

```bash
mvn -Duser.home=/home/${NON_ROOT_USER_NAME_LABEL}/ -s ./settings.xml -B -U versions:update-properties -Dincludes=io.gravitee.*:* -DallowMajorUpdates=false -DallowMinorUpdates=false -DallowIncrementalUpdates=true -DgenerateBackupPoms=false
```

* finally, the std-out of the execution of the `update-properties` goal of the maven `versions` plugin, can be shortened into this :

```
[INFO] ---------< io.gravitee.repository:gravitee-repository-mongodb >---------
[INFO] Building Gravitee.io APIM - Repository - MongoDB 3.4.1-SNAPSHOT
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- versions-maven-plugin:2.7:update-properties (default-cli) @ gravitee-repository-mongodb ---
[=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> HERE A LOT OF DOWNLOADS THAT I STRIPPED OUT, and then :]
[INFO] artifact org.yaml:snakeyaml: checking for updates from artifactory-gravitee-non-dry-run
[INFO] artifact com.github.dozermapper:dozer-core: checking for updates from artifactory-gravitee-non-dry-run
[INFO] artifact org.mongodb:mongo-java-driver: checking for updates from artifactory-gravitee-non-dry-run
[INFO] artifact io.gravitee.repository:gravitee-repository: checking for updates from artifactory-gravitee-non-dry-run
[INFO] artifact org.mongodb:mongodb-driver-reactivestreams: checking for updates from artifactory-gravitee-non-dry-run
[INFO] artifact de.flapdoodle.embed:de.flapdoodle.embed.mongo: checking for updates from artifactory-gravitee-non-dry-run
[INFO] artifact org.springframework.data:spring-data-mongodb: checking for updates from artifactory-gravitee-non-dry-run
[INFO] artifact org.apache.maven.plugins:maven-dependency-plugin: checking for updates from artifactory-gravitee-non-dry-run
[INFO] Not updating the property ${snakeyaml.version} because it is used by artifact org.yaml:snakeyaml:jar:1.21:test and that artifact is not included in the list of  allowed artifacts to be updated.
[INFO] Not updating the property ${dozer.version} because it is used by artifact com.github.dozermapper:dozer-core:jar:6.4.1 and that artifact is not included in the list of  allowed artifacts to be updated.
[INFO] Incremental version changes allowed
[INFO] Property ${gravitee-repository-test.version}: Leaving unchanged as 3.4.1-SNAPSHOT
[INFO] Not updating the property ${mongo.version} because it is used by artifact org.mongodb:mongo-java-driver:jar:3.12.0 and that artifact is not included in the list of  allowed artifacts to be updated.
[INFO] Incremental version changes allowed
[INFO] Property ${gravitee-repository.version}: Leaving unchanged as 3.4.0
[INFO] Not updating the property ${mongodb-driver-reactivestreams.version} because it is used by artifact org.mongodb:mongodb-driver-reactivestreams:jar:1.13.0 and that artifact is not included in the list of  allowed artifacts to be updated.
[INFO] Not updating the property ${embed.mongo.version} because it is used by artifact de.flapdoodle.embed:de.flapdoodle.embed.mongo:jar:2.0.0:test and that artifact is not included in the list of  allowed artifacts to be updated.
[INFO] Not updating the property ${spring.data.mongodb.version} because it is used by artifact org.springframework.data:spring-data-mongodb:jar:2.1.5.RELEASE and that artifact is not included in the list of  allowed artifacts to be updated.
[INFO] Not updating the property ${maven-dependency-plugin.version} because it is used by artifact org.apache.maven.plugins:maven-dependency-plugin:maven-plugin:2.10:runtime and that artifact is not included in the list of  allowed artifacts to be updated.
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  01:45 min
[INFO] Finished at: 2020-12-10T12:32:12Z
[INFO] ------------------------------------------------------------------------
```
* As we can see in htis stdout of the `update-properties` goal of the maven `versions` plugin, the server from which the  dependencies are checked, is of id `artifactory-gravitee-non-dry-run`
  * the server of id `artifactory-gravitee-non-dry-run`, is a server configured in the `settings.xml`, and its URL is http://odbxikk7vo-artifactory.services.clever-cloud.com/nexus-and-non-dry-run-releases/
  * the http://odbxikk7vo-artifactory.services.clever-cloud.com/nexus-and-non-dry-run-releases/ is an artifactory virtual server which references ser https://odbxikk7vo-artifactory.services.clever-cloud.com/webapp/#/artifacts/browse/tree/General/gravitee-releases
* The Documentation of the maven plugin goal is at https://www.mojohaus.org/versions-maven-plugin/update-properties-mojo.html


Enfin :

* [cette exécution](https://app.circleci.com/pipelines/github/gravitee-lab/gravitee-repository-test-release-3-4-1/7/workflows/79b4a7b7-5cfa-4b1f-b727-cd308e9887bd/jobs/7) de pipeline est celle qui utilise tout ça, et fait la signature GPG avec succès
* et au passage on a maintenant deux settings.xml séparés : un pour le dry-run, et un pour la "vraie release" , ce qui m'aamené à faire un nouveau commit sur ma pull request de l'orb, poru leprochain patch 1.0.4

Ok, now I am executing again the same test, but :
* I first manually removed the `3.4.1` tag in the https://github.com/gravitee-lab/gravitee-repository-test-release-3-4-1
* I then pushed one more commit on the `3.4.x` git branch of the https://github.com/gravitee-lab/gravitee-repository-test-release-3-4-1 repo, to reset the pom version from `3.4.2-SNAPSHOT`, to `3.4.1-SNAPSHOT`
* after that, I fork all involved repos to keep the initial state unchanged :
  * [ ] https://github.com/gravitee-lab/release-state-maintenance-rel-3.4.x is forked in a new repo https://github.com/gravitee-lab/release-state-maintenance-rel-3.4.x-test-1 :
    * on the `3.4.x` git branch of the new https://github.com/gravitee-lab/release-state-maintenance-rel-3.4.x-test1 git repo, I modifiy the `release.json` to replace, both in `components` and `buildDependencies` :
      * `gravitee-repository-test-release-3-4-1`, by `gravitee-repository-test-release-3-4-1-test-1`
      * `gravitee-repository-mongodb-release-3-4-1`, by `gravitee-repository-mongodb-release-3-4-1-test-1`
      * `gravitee-repository-jdbc-release-3-4-1`, by `gravitee-repository-jdbc-release-3-4-1-test-1`
  * [ ] https://github.com/gravitee-lab/gravitee-repository-test-release-3-4-1 is forked in a new repo https://github.com/gravitee-lab/gravitee-repository-test-release-3-4-1-test1
  * [ ] https://github.com/gravitee-lab/gravitee-repository-mongodb-release-3-4-1 is forked in a new repo https://github.com/gravitee-lab/gravitee-repository-mongodb-release-3-4-1-test1
  * [ ] https://github.com/gravitee-lab/gravitee-repository-jdbc-release-3-4-1 is forked in a new repo https://github.com/gravitee-lab/gravitee-repository-jdbc-release-3-4-1-test1
* I update to latest version the `.circleci/config.yml` of the 3 created git repos
* Last, before triggering the release, In Circle CI Web UI, setup to start building all 4 new repos, with "use existing config" option.

And finally the trigger the test-1 release :


```bash
# It should be SECRETHUB_ORG=graviteeio, but Cirlce CI token is related to
# a Circle CI User, not an Org, so jsut reusing the same than for Gravtiee-Lab here, to work faster
# ---
SECRETHUB_ORG=gravitee-lab
SECRETHUB_REPO=cicd
# Nevertheless, I today think :
# Each team member should have his own personal secrethub repo in the [graviteeio] secrethub org.
# like this :
# a [graviteeio/${TEAM_MEMBER_NAME}] secrethub repo for each team member
# and the Circle CI Personal Access token stored with [graviteeio/${TEAM_MEMBER_NAME}/circleci/token]
# ---
export HUMAN_NAME=jblasselle
export CCI_TOKEN=$(secrethub read "${SECRETHUB_ORG}/${SECRETHUB_REPO}/humans/${HUMAN_NAME}/circleci/token")

export ORG_NAME="gravitee-lab"
export REPO_NAME="release-state-maintenance-rel-3.4.x-test-1"
export BRANCH="3.4.x"
export JSON_PAYLOAD="{

    \"branch\": \"${BRANCH}\",
    \"parameters\":

    {
        \"gio_action\": \"release\"
    }

}"

curl -X GET -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" https://circleci.com/api/v2/me | jq .
curl -X POST -d "${JSON_PAYLOAD}" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" https://circleci.com/api/v2/project/gh/${ORG_NAME}/${REPO_NAME}/pipeline | jq .
```

Ok, so with this new test,I could successfully reproduce the issue about the maven versions plugin 's `update-properties` goal :
* The [pipeline execution reproducing the issue](https://app.circleci.com/pipelines/github/gravitee-lab/gravitee-repository-mongodb-release-3-4-1-test-1/4/workflows/fc4f2e26-1944-4062-8211-566853670d66/jobs/4)
* Never the less, I this time noticed a warning message, caused by a mistake in my `settings.xml`: `[WARNING] The requested profile "****************" could not be activated because it does not exist.` :
  * The `<activeProfiles>` tag is there where the mistake is.
  * The involved `settings.xml` is the one defined for the release process in secrethub `"${SECRETHUB_ORG}/${SECRETHUB_REPO}/graviteebot/infra/maven/dry-run/artifactory/settings.xml"`

I ran again the exact same test, but this time, I :
* fixed the acitveProfile issue in `settings.xml`
* added a `<repository>` entry in the `settings.xml`, with `serverId` `artifactory-gravitee-releases`, associated to the URL of the artifactory repo dedicated to mvn deploy (instead of the artifactory virtual repository) : http://odbxikk7vo-artifactory.services.clever-cloud.com/gravitee-releases/
* added the ` -D maven.version.rules.serverId=artifactory-gravitee-releases` option, in the Maven Prepare Release shell script of the Orb
* And this new test did not change anything in the result. The exact [same error occurs](https://app.circleci.com/pipelines/github/gravitee-lab/gravitee-repository-mongodb-release-3-4-1-test-1/7/workflows/964efa18-0ee9-45e1-825a-ab4156085899/jobs/7)


Now I will try and use another maven goal, this one : https://www.mojohaus.org/versions-maven-plugin/use-next-versions-mojo.html

I think changing maven goalis dangerous, but feaseable, since I know exactly whgat result I want.  Never the less, I will also consider using a different plugin, and :
* I will keep using the `versions:update-properties`, to make sure I do not removeanything from the release process, which is needed in special cases,and for ascendant compatibility.
* So Whatever new maven goal or plugin I use, I will execute it AFTER executing the legacy `versions:update-properties`.

I found :
* https://www.mojohaus.org/versions-maven-plugin/examples/use-releases.html : this looks likle the most obvious goalto use for our purpose !!

I just understood something else :
* the goal `versions:update-properties` was used instead of the `versions:use-releases` goal
* because dependencies versions are configured via java properties in most `pom.xml` files

When I execute the `mvn versions:update-properties` goal, in debug mode (`-X` option), I get the following details :

```bash
[ ===>>>>>>>>> SKIPPED A LOT OF STDOUT]
[DEBUG] Configuring mojo 'org.codehaus.mojo:versions-maven-plugin:2.7:update-properties' with basic configurator -->
[DEBUG]   (f) allowDowngrade = false
[DEBUG]   (f) allowIncrementalUpdates = true
[DEBUG]   (f) allowMajorUpdates = false
[DEBUG]   (f) allowMinorUpdates = false
[DEBUG]   (f) allowSnapshots = false
[DEBUG]   (f) autoLinkItems = true
[DEBUG]   (f) excludeReactor = true
[DEBUG]   (f) generateBackupPoms = false
[DEBUG]   (f) includesList = io.gravitee.*:*
[DEBUG]   (f) localRepository =       id: local
      url: file:///home/circleci/.m2/repository/
   layout: default
snapshots: [enabled => true, update => always]
 releases: [enabled => true, update => always]

[DEBUG]   (f) processDependencies = true
[DEBUG]   (f) processDependencyManagement = true
[DEBUG]   (f) processParent = false
[DEBUG]   (s) project = MavenProject: io.gravitee.repository:gravitee-repository-jdbc:3.4.1-SNAPSHOT @ /usr/src/giomaven_project/pom.xml
[DEBUG]   (f) reactorProjects = [MavenProject: io.gravitee.repository:gravitee-repository-jdbc:3.4.1-SNAPSHOT @ /usr/src/giomaven_project/pom.xml]
[DEBUG]   (f) remoteArtifactRepositories = [      id: artifactory-gravitee-non-dry-run
      url: http://odbxikk7vo-artifactory.services.clever-cloud.com/nexus-and-non-dry-run-releases/
   layout: default
snapshots: [enabled => false, update => daily]
 releases: [enabled => true, update => daily]
]
[DEBUG]   (f) remotePluginRepositories = [      id: artifactory-gravitee-non-dry-run
      url: http://odbxikk7vo-artifactory.services.clever-cloud.com/nexus-and-non-dry-run-releases/
   layout: default
snapshots: [enabled => false, update => daily]
 releases: [enabled => true, update => never]
]
[DEBUG]   (f) serverId = serverId
[DEBUG]   (f) session = org.apache.maven.execution.MavenSession@e7b265e
[DEBUG]   (f) settings = org.apache.maven.execution.SettingsAdapter@51da32e5
[DEBUG] -- end configuration --
[ ===>>>>>>>>> SKIPPED A LOT OF STDOUT]
[INFO] Incremental version changes allowed
[DEBUG] getNewestVersion(): includeSnapshots='false'
[DEBUG] Property ${gravitee-repository-test.version}: Set of valid available versions is []
[DEBUG] Property ${gravitee-repository-test.version}: Restricting results to null
[DEBUG] lowerBoundArtifactVersion: 3.4.1-SNAPSHOT
[DEBUG] Property ${gravitee-repository-test.version}: upperBound is: 3.5.0-SNAPSHOT
[DEBUG] Property ${gravitee-repository-test.version}: Current winner is: null
[DEBUG] Property ${gravitee-repository-test.version}: Searching reactor for a valid version...
[DEBUG] Property ${gravitee-repository-test.version}: Set of valid available versions from the reactor is []
[INFO] Property ${gravitee-repository-test.version}: Leaving unchanged as 3.4.1-SNAPSHOT
```

* Same test than before, but this time, in the `settings.xml`, I changed `<updatePolicy>never</updatePolicy>` to `<updatePolicy>always</updatePolicy>` for the gravitee-release repo (target) in

# Test suite : testing the 3.5.0 Release in https://github.com/gravitee-lab

I forked all the repos involved in the `3.5.0`, to use them as reference initial state for testing the release process :

* [x] https://github.com/gravitee-lab/release-state-release-3-5-0    : Fork of https://github.com/gravitee-io/release when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-portal-webui-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-portal-webui when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-management-webui-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-management-webui when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-management-rest-api-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-management-rest-api when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-policy-ssl-enforcement-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-policy-ssl-enforcement when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-policy-xml-validation-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-policy-xml-validation when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-policy-json-validation-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-policy-json-validation when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-elasticsearch-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-elasticsearch when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-policy-jwt-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-policy-jwt when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-policy-ratelimit-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-policy-ratelimit when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-gateway-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-gateway when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-alert-api-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-alert-api when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-repository-gateway-bridge-http-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-repository-gateway-bridge-http when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-repository-jdbc-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-repository-jdbc when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-repository-mongodb-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-repository-mongodb when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-definition-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-definition when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-repository-test-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-repository-test when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-notifier-api-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-notifier-api when release 3.5.0 was made
* [x] https://github.com/gravitee-lab/gravitee-repository-release-3-5-0    : Fork of https://github.com/gravitee-io/gravitee-repository when release 3.5.0 was made


* Here is the execution plan for the `3.5.0` release :

```bash
{
 "execution_plan_is": [
  [],
  [
   {
    "name": "gravitee-repository",
    "version": "3.5.0-SNAPSHOT"
   },
   {
    "name": "gravitee-notifier-api",fff
    "version": "1.4.0-SNAPSHOT"
   }
  ],
  [
   {
    "name": "gravitee-repository-test",
    "version": "3.5.0-SNAPSHOT"
   }
  ],
  [
   {
    "name": "gravitee-definition",
    "version": "1.25.0-SNAPSHOT"
   },
   {
    "name": "gravitee-repository-mongodb",
    "version": "3.5.0-SNAPSHOT"
   },
   {
    "name": "gravitee-repository-jdbc",
    "version": "3.5.0-SNAPSHOT"
   },
   {
    "name": "gravitee-repository-gateway-bridge-http",
    "version": "3.5.0-SNAPSHOT"
   },
   {
    "name": "gravitee-alert-api",
    "version": "1.6.0-SNAPSHOT"
   }
  ],
  [],
  [],
  [],
  [],
  [
   {
    "name": "gravitee-gateway",
    "version": "3.5.0-SNAPSHOT"
   }
  ],
  [],
  [
   {
    "name": "gravitee-policy-ratelimit",
    "version": "1.11.0-SNAPSHOT"
   },
   {
    "name": "gravitee-policy-jwt",
    "version": "1.16.0-SNAPSHOT"
   },
   {
    "name": "gravitee-elasticsearch",
    "version": "3.5.0-SNAPSHOT"
   },
   {
    "name": "gravitee-policy-json-validation",
    "version": "1.6.0-SNAPSHOT"
   },
   {
    "name": "gravitee-policy-xml-validation",
    "version": "1.1.0-SNAPSHOT"
   },
   {
    "name": "gravitee-policy-ssl-enforcement",
    "version": "1.2.0-SNAPSHOT"
   }
  ],
  [
   {
    "name": "gravitee-management-rest-api",
    "version": "3.5.0-SNAPSHOT"
   },
   {
    "name": "gravitee-management-webui",
    "version": "3.5.0-SNAPSHOT"
   },
   {
    "name": "gravitee-portal-webui",
    "version": "3.5.0-SNAPSHOT"
   }
  ]
 ]
}
 ---
+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x
```

I will use the same protocol than the one used to test the `3.4.1` maintenance release


# Testing the dry run release for the `3.5.0` release in `gravitee-io`

```bash
# It should be SECRETHUB_ORG=graviteeio, but Cirlce CI token is related to
# a Circle CI User, not an Org, so jsut reusing the same than for Gravtiee-Lab here, to work faster
# ---
SECRETHUB_ORG=gravitee-lab
SECRETHUB_REPO=cicd
# Nevertheless, I today think :
# Each team member should have his own personal secrethub repo in the [graviteeio] secrethub org.
# like this :
# a [graviteeio/${TEAM_MEMBER_NAME}] secrethub repo for each team member
# and the Circle CI Personal Access token stored with [graviteeio/${TEAM_MEMBER_NAME}/circleci/token]
# ---
export HUMAN_NAME=jblasselle
export CCI_TOKEN=$(secrethub read "${SECRETHUB_ORG}/${SECRETHUB_REPO}/humans/${HUMAN_NAME}/circleci/token")

export ORG_NAME="gravitee-io"
export REPO_NAME="release"
export BRANCH="3.0.0-beta"
export BRANCH="3.4.x"
# testing 3.5.0
export BRANCH="master"
export JSON_PAYLOAD="{

    \"branch\": \"${BRANCH}\",
    \"parameters\":

    {
        \"gio_action\": \"dry_release\"
    }

}"

curl -X GET -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" https://circleci.com/api/v2/me | jq .
curl -X POST -d "${JSON_PAYLOAD}" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" https://circleci.com/api/v2/project/gh/${ORG_NAME}/${REPO_NAME}/pipeline | jq .
```

# Issues stack


### Issue : SSH Key Access rights for Gravitee Lab Bot

Bon , ok j'ai une petite issue là dessus :
* le gravitee-bots était en read only, etj'avais en létat ajouté saclef SSH
* J'ai changé els droits en WRITE permissions, et ai retiré puis ajouté de nouveau le gravitee lab bot dans les membres de l'organisations, avec l'otions "start fresh" : rien à faire la clef SSH est toujours marquée comme étant en READ Only.
* Bref, je vais devoir faire une rotation du secret "parie de clefs SSH du Gavitee Lab Bot" pour que la git release puisse faire des git push sur le repo
* référence de pipeline en erreur pour cette raison : https://app.circleci.com/pipelines/github/gravitee-lab/gravitee-repository-test-release-3-4-1/4/workflows/1e55d217-f4e1-42db-97d7-77b73bcd284b/jobs/4

Réglé :

* La configuration de l'agent SSH était telle que c'était la `Circle CI` Checkout Key qui était utilisé, au lieu de la clef privée SSH pointée par export GIT_SSH_COMMAND='ssh -i ~/.ssh/id_rsa', clef installée à partir de secrethub, et de la clef privée SSH du Gravitee Bot.
* j'ai donc ajouté `ssh-add -D` pour vider le cache del'agent SSH, et derrière ai ajouté la clef RSA privée voulue, `ssh-add ${CHEMIN_COMPLET_DE_LA_CLEF}`
