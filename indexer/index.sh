#!/bin/bash -v


# for this folder.
#node ./../../../../bitbucket/wdingsoft/utis/index.nod.js


# gen index for bitbucket. 
TargetDir="../"
TargetExe="./indexer/index_watch.nod.js"
cd ${TargetDir}
ls -ls ${TargetExe}
node ${TargetExe} 
open index.htm
node ${TargetExe} "./"
cd -

#back to this folder.
#node ./../../../bitbucket/wdingsoft/utis/index.nod.js





