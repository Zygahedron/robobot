love = {}
love.system = {}
function love.system.getOS() return end
love.filesystem = {}
function love.filesystem.read() return end
function love.filesystem.getInfo() return end
love.graphics = {}
function love.graphics.newQuad() return end

json = require "robobot/lib/json"
require "bab-be-u/values"
for i,v in pairs(tiles_list)
  if not pcall(function(a, b) json.encode({a = b}) end, i, v) then
    print(i)
  end
end
print(json.encode({tiles_list = tiles_list, colors = main_palette_for_colour}))