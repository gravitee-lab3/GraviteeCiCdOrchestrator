#!/bin/bash

# ---
# This script expects the list of all
# git URIs inside the [${OPS_HOME}/consolidated-git-repos-uris.list] local file.
# This local file is generated by the [shell/consolidate-dev-repos-inventory.sh] Bash script
# ---
export DEV_REPOS_DATASPACE=$(pwd)/inventory
export OPS_HOME=$(pwd)




echo "---"
echo "backing-up repos listed in [${OPS_HOME}/consolidated-git-repos-uris.list]"
# In each ${OPS_HOME}/consolidated-git-repos-uris.list
echo "---"
# ${OPS_HOME}/shell/backup-repos.sh ${OPS_HOME}/consolidated-git-repos-uris.list

export BCKUP_EXIT_CODE="$?"
echo "BCKUP_EXIT_CODE=[${BCKUP_EXIT_CODE}]"
if [ "${BCKUP_EXIT_CODE}" == "0" ]; then
  echo "---"
  echo "processing repos listed in [${OPS_HOME}/consolidated-git-repos-uris.list]"
  echo "---"
  # testing error handling
  # ${OPS_HOME}/deploy-repo-pipeline-def.sh
  ${OPS_HOME}/shell/deploy-repo-pipeline-def.sh ${OPS_HOME}/consolidated-git-repos-uris.list
  # hard list provided by nicolas with a python script
  ${OPS_HOME}/shell/deploy-repo-pipeline-def.sh ${OPS_HOME}/shell/consolidation-diff.list
  echo "---"
else
  echo "There has been a problem backing up one of the reposlisted in  [${OPS_HOME}/consolidated-git-repos-uris.list] "
  echo "So operations were cancelled on repos listed in [${OPS_HOME}/consolidated-git-repos-uris.list]"
  return
  # exit 1
fi;
