#!/bin/bash
pkill -f robobot
git pull origin master
nohup node index.js robobot &>../robobot-log.txt &