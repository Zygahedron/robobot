love = {}
love.system = {}
function love.system.getOS() return end
love.filesystem = {}
function love.filesystem.read() return end
function love.filesystem.getInfo() return end

json = require "robobot/lib/json"
require "bab-be-u/values"
print(json.encode({tiles_list = tiles_list, tiles_by_name = tiles_by_name}))