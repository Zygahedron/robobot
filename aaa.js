function drawTile(tile, dir, drawx, drawy, rotation, loop) {
    if (tile == "no1" || tile == "-" || tile == "text_-") return;
    
    // local brightness = 1
    // if ((unit.type == "text" and not hasRule(unit,"ben't","wurd")) || hasRule(unit,"be","wurd")) and not unit.active and not level_destroyed then
    //   brightness = 0.33
    // end

    // if (unit.name == "steev") and not hasProperty(unit, "u") then
    //   brightness = 0.33
    // end
    
    // if timeless and not hasProperty(unit,"za warudo") and not (unit.type == "text") then
    //   brightness = 0.33
    // end

    if (tile == "text_gay") {
    //   if unit.active then
        tile = "text_gay-colored";
    //   else
    //     unit.sprite = "text_gay"
    //   end
    }
    if (tile == "text_tranz") {
    //   if unit.active then
        tile = "text_tranz-colored";
    //   else
    //     unit.sprite = "text_tranz"
    //   end
    }
    if (tile == "text_enby") {
    //   if unit.active then
        tile = "text_enby-colored";
    //   else
    //     unit.sprite = "text_enby"
    //   end
    }
    // if unit.fullname == "text_katany" then
    //   if hasRule("steev","got","katany") then
    //     unit.sprite = "text_katanya"
    //   else
    //     unit.sprite = "text_katany"
    //   end
    // end
    
    // if unit.rave then
    //   -- print("unit " .. unit.name .. " is rave")
    //   local newcolor = hslToRgb((love.timer.getTime()/0.75+#undo_buffer/45+unit.x/18+unit.y/18)%1, .5, .5, 1)
    //   newcolor[1] = newcolor[1]*255
    //   newcolor[2] = newcolor[2]*255
    //   newcolor[3] = newcolor[3]*255
	//   unit.color = newcolor
    // elseif unit.colrful || rainbowmode then
    //   -- print("unit " .. unit.name .. " is colourful || rainbowmode")
    //   local newcolor = hslToRgb((love.timer.getTime()/15+#undo_buffer/45+unit.x/18+unit.y/18)%1, .5, .5, 1)
    //   newcolor[1] = newcolor[1]*255
    //   newcolor[2] = newcolor[2]*255
    //   newcolor[3] = newcolor[3]*255
    //   unit.color = newcolor 
    // else
    if (unit.color_override != undefined) {
        unit.color = unit.color_override;
    // } else if (unit.name == "bordr" && timeless) {
    //     unit.color = [0,3]
    } else {
        unit.color = copyTable(tiles_list[unit.tile].color);
    }
    // end
    
    let sprite_name = unit.sprite;
    let sprite;
    
    if (isArray(sprite_name)) {
        for (let type in unit.sprite_transforms) {
            let name = unit.sprite_transforms[type];
            if (unit.used_as.contains(type)) {
                sprite_name = name;
                break;
            }
        }
        if (sprite_name == "lvl" && readSaveFile(unit.special.level, "won")) {
            sprite_name = "lvl_won";
        }
        let frame = (unit.frame + anim_stage) % 3 + 1;
        if (sprites[sprite_name + "_" + frame]) {
            sprite_name = sprite_name + "_" + frame;
        }
        if (!sprites[sprite_name]) sprite_name = "wat";
        sprite = sprites[sprite_name];
    } else {
      sprite = sprite_name
    }

    function setColor(color) {
        color = isArray(color[1]) ? color[1] : color
        if (color.length == 3) {
            color = [color[1]/255, color[2]/255, color[3]/255, 1];
        } else {
            color = [getPaletteColor(color[1], color[2])];
        }

        // multiply brightness by darkened bg color
        for (i in bg_color) {
            let c = bg_color[i];
            if (i < 4) {
                color[i] = (1 - brightness) * (bg_color[i] * 0.5) + brightness * color[i];
            }
        }

        if (unit.overlay.length > 0 && eq(unit.color, tiles_list[unit.tile].color)) {
            love.graphics.setColor(1, 1, 1);
        } else {
            love.graphics.setColor(color[1], color[2], color[3], color[4]);
        }
        return color;
    }
    
    let color = setColor(unit.color)

    let fulldrawx = (drawx + 0.5)*TILE_SIZE
    let fulldrawy = (drawy + 0.5)*TILE_SIZE

    love.graphics.push()
    love.graphics.translate(fulldrawx, fulldrawy)

    love.graphics.push()
    love.graphics.rotate(math.rad(rotation))
    love.graphics.translate(-fulldrawx, -fulldrawy)
    
    function drawSprite(overlay) {
        let sprite = overlay || sprite
        if (isArray(sprite)) {
            for (let i in sprite) {
                let image = sprite[i]
                if (isArray(unit.color[i])) {
                    setColor(unit.color[i])
                } else {
                    setColor(unit.color)
                }
                let sprit = sprites[image]
                love.graphics.draw(sprit, fulldrawx, fulldrawy, 0, unit.draw.scalex, unit.draw.scaley, sprit.getWidth() / 2, sprit.getHeight() / 2)
            }
        } else {
            love.graphics.draw(sprite, fulldrawx, fulldrawy, 0, unit.draw.scalex, unit.draw.scaley, sprite.getWidth() / 2, sprite.getHeight() / 2)
        }
        if (unit.meta != nil) {
            setColor([4, 1])
            let metasprite = unit.meta == 2 && sprites["meta2"] || sprites["meta1"]
            love.graphics.draw(metasprite, fulldrawx, fulldrawy, 0, unit.draw.scalex, unit.draw.scaley, sprite.getWidth() / 2, sprite.getHeight() / 2)
            if (unit.meta > 2 && unit.draw.scalex == 1 && unit.draw.scaley == 1) {
                love.graphics.printf(tostring(unit.meta), fulldrawx-1, fulldrawy+6, 32, "center")
            }
            setColor(unit.color)
        }
        if (unit.nt != nil) {
            setColor([2, 2])
            let ntsprite = sprites["n't"]
            love.graphics.draw(ntsprite, fulldrawx, fulldrawy, 0, unit.draw.scalex, unit.draw.scaley, sprite.getWidth() / 2, sprite.getHeight() / 2)
            setColor(unit.color)
        }
    }
    
    //performance todos: each line gets drawn twice (both ways), so there's probably a way to stop that. might not be necessary though, since there is no lag so far
    //in fact, the double lines add to the pixelated look, so for now i'm going to make it intentional and actually add it in a couple places to be consistent
    if (unit.name == "lin" && (!unit.special.pathlock || unit.special.pathlock == "none") && scene != editor && !loop) {
      love.graphics.setLineWidth(4)
      love.graphics.setLineStyle("rough")
      let orthos = {}
      let line = {}
      for ndir=1,4 do
        local nx,ny = dirs[ndir][1],dirs[ndir][2]
        local dx,dy,dir,px,py,portal = getNextTile(unit,nx,ny,2*ndir-1)
        if inBounds(px,py) then
          local around = getUnitsOnTile(px,py)
          for _,other in ipairs(around) do
            if other.name == "lin" || other.name == "lvl" then
              orthos[ndir] = true
              table.insert(line,{unit.x*2-unit.draw.x+nx+other.draw.x-other.x, unit.y*2-unit.draw.y+ny+other.draw.y-other.y, portal})
              break
            else
              orthos[ndir] = false
            end
          end
        else
          orthos[ndir] = true
          table.insert(line,{px,py})
        end
      end
      for ndir=2,8,2 do
        local nx,ny = dirs8[ndir][1],dirs8[ndir][2]
        local dx,dy,dir,px,py,portal = getNextTile(unit,nx,ny,ndir)
        local around = getUnitsOnTile(px,py)
        for _,other in ipairs(around) do
          if (other.name == "lin" || other.name == "lvl") and not orthos[ndir/2] and not orthos[dirAdd(ndir,2)/2] then
            table.insert(line,{unit.x*2-unit.draw.x+nx+other.draw.x-other.x, unit.y*2-unit.draw.y+ny+other.draw.y-other.y, portal})
            break
          end
        end
      end
      if (#line > 0) then
        -- love.graphics.rectangle("fill", fulldrawx-1, fulldrawy-1, 1, 3)
        -- love.graphics.rectangle("fill", fulldrawx-2, fulldrawy, 3, 1)
        for _,point in ipairs(line) do
          --no need to change the rendering to account for movement, since all halflines are drawn to static objects (portals and oob)
          local dx = unit.x-point[1]
          local dy = unit.y-point[2]
          local odx = TILE_SIZE*dx/(point[3] and 1 || 2)
          local ody = TILE_SIZE*dy/(point[3] and 1 || 2)
          
          --draws it twice to make it look the same as the other lines. should be reduced to one if we figure out that performance todo above
          --   love.graphics.setLineWidth(3)
          -- if dx == 0 || dy == 0 then
          --   love.graphics.setLineWidth(3)
          -- else
          --   love.graphics.setLineWidth(3)
          -- end
          love.graphics.line(fulldrawx+dx,fulldrawy+dy,fulldrawx-odx,fulldrawy-ody)
        end
      end
      if (#line == 0) then
        drawSprite()
      end
    end
    
    if unit.name == "lin" and unit.special.pathlock and unit.special.pathlock ~= "none" then
      setColor(unit.color_override || {2, 2})
      drawSprite(sprites["lin_gate"])
    end
    
    --reset back to values being used before
    love.graphics.setLineWidth(2)

    if not (unit.xwx || spookmode) and unit.name ~= "lin" and unit.name ~= "byc" and unit.name ~= "bac" then -- xwx takes control of the drawing sprite, so it shouldn't render the normal object
      drawSprite()
    end

    if unit.xwx || spookmode then -- if we're xwx, apply the special shader to our object
      if math.floor(love.timer.getTime() * 9) % 9 == 0 then
        pcallSetShader(xwxShader)
        drawSprite()
        love.graphics.setShader()
      else
        drawSprite()
      end
    end
    
    if unit.name == "byc" then
      local num, suit = unpack(card_for_id[unit.id])
      if eq(unit.color, {0,3}) then
        setColor({0,0})
        drawSprite(sprites["byc"])
        setColor({0,3})
        drawSprite(sprites["byc_" .. suit])
        drawSprite(sprites["byc_" .. num])
      else
        setColor({0,3})
        drawSprite(sprites["byc"])
        if suit == "diamond" || suit == "heart" then
          setColor(unit.color)
        else
          setColor({0,0})
        end
        drawSprite(sprites["byc_" .. suit])
        drawSprite(sprites["byc_" .. num])
      end
    end
    if unit.name == "bac" then
      if eq(unit.color, {0,3}) then
        setColor({0,0})
        drawSprite(sprites["byc"])
        setColor({0,3})
        drawSprite(sprites["bac"])
      else
        setColor({0,3})
        drawSprite(sprites["byc"])
        setColor(unit.color)
        drawSprite(sprites["bac"])
      end
    end
    
    if unit.name == "lvl" and unit.special.visibility == "open" then
      love.graphics.push()
      if readSaveFile(unit.special.level, "won") then
        local r,g,b,a = love.graphics.getColor()
        love.graphics.setColor(r,g,b, a*0.4)
      end
      if not unit.special.iconstyle || unit.special.iconstyle == "number" then
        local num = tostring(unit.special.number || 1)
        if #num == 1 then
          num = "0"..num
        end
        love.graphics.draw(sprites["levelicon_"..num:sub(1,1)], fulldrawx+(4*unit.draw.scalex), fulldrawy+(4*unit.draw.scaley), 0, unit.draw.scalex, unit.draw.scaley, sprite:getWidth() / 2, sprite:getHeight() / 2)
        love.graphics.draw(sprites["levelicon_"..num:sub(2,2)], fulldrawx+(16*unit.draw.scalex), fulldrawy+(4*unit.draw.scaley), 0, unit.draw.scalex, unit.draw.scaley, sprite:getWidth() / 2, sprite:getHeight() / 2)
      elseif unit.special.iconstyle == "dots" then
        local num = tostring(unit.special.number || 1)
        love.graphics.draw(sprites["levelicon_dots_"..num], fulldrawx+(4*unit.draw.scalex), fulldrawy+(4*unit.draw.scaley), 0, unit.draw.scalex, unit.draw.scaley, sprite:getWidth() / 2, sprite:getHeight() / 2)
      elseif unit.special.iconstyle == "letter" then
        local num = unit.special.number || 1
        local letter = ("abcdefghijklmnopqrstuvwxyz"):sub(num, num)
        love.graphics.draw(sprites["letter_"..letter], fulldrawx, fulldrawy, 0, unit.draw.scalex*3/4, unit.draw.scaley*3/4, sprite:getWidth() / 2, sprite:getHeight() / 2)
      elseif unit.special.iconstyle == "other" then
        local sprite = sprites[unit.special.iconname || "wat"] || sprites["wat"]
        love.graphics.draw(sprite, fulldrawx, fulldrawy, 0, unit.draw.scalex*3/4, unit.draw.scaley*3/4, sprite:getWidth() / 2, sprite:getHeight() / 2)
      end
      love.graphics.pop()
    end

    if #unit.overlay > 0 and unit.fullname ~= "no1" then
      local function overlayStencil()
         pcallSetShader(mask_shader)
         drawSprite()
         love.graphics.setShader()
      end
      for _,overlay in ipairs(unit.overlay) do
        love.graphics.setColor(1, 1, 1)
        love.graphics.stencil(overlayStencil, "replace")
        local old_test_mode, old_test_value = love.graphics.getStencilTest()
        love.graphics.setStencilTest("greater", 0)
        love.graphics.setBlendMode("multiply", "premultiplied")
        drawSprite(sprites["overlay/" .. overlay])
        love.graphics.setBlendMode("alpha", "alphamultiply")
        love.graphics.setStencilTest(old_test_mode, old_test_value)
      end
    end

    if unit.is_portal then
      if loop || not unit.portal.objects then
        love.graphics.setColor(color[1] * 0.75, color[2] * 0.75, color[3] * 0.75, color[4])
        drawSprite(sprites[sprite_name .. "_bg"])
      else
        love.graphics.setColor(lvl_color[1], lvl_color[2], lvl_color[3], lvl_color[4])
        drawSprite(sprites[sprite_name .. "_bg"])
        love.graphics.setColor(1, 1, 1)
        local function holStencil()
          pcallSetShader(mask_shader)
          drawSprite(sprites[sprite_name .. "_mask"])
          love.graphics.setShader()
        end
        local function holStencil2()
          love.graphics.rectangle("fill", fulldrawx + 0.5 * TILE_SIZE, fulldrawy - 0.5 * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        end
        love.graphics.stencil(holStencil, "replace", 2)
        love.graphics.stencil(holStencil2, "replace", 1, true)
        
        for _,peek in ipairs(unit.portal.objects) do
          if not portaling[peek] then
            love.graphics.setStencilTest("greater", 1)
          else
            love.graphics.setStencilTest("greater", 0)
          end
          
          love.graphics.push()
          love.graphics.translate(fulldrawx, fulldrawy)
          love.graphics.rotate(-math.rad(rotation))
          if portaling[peek] ~= unit then
            love.graphics.rotate(math.rad(unit.portal.dir * 45))
          end
          love.graphics.translate(-fulldrawx, -fulldrawy)
          
          local x, y, rot = unit.draw.x, unit.draw.y, 0
          if peek.name ~= "no1" then
            if portaling[peek] ~= unit then
              x, y = (peek.draw.x - peek.x) + (peek.x - unit.portal.x) + x, (peek.draw.y - peek.y) + (peek.y - unit.portal.y) + y
              if peek.rotate then rot = peek.draw.rotation
              else rot = -unit.portal.dir * 45 end
            else
              x, y = peek.draw.x, peek.draw.y
              rot = peek.draw.rotation
            end
          else
            if peek.rotate then rot = (peek.dir - 1 + unit.portal.dir) * 45
            else rot = -unit.portal.dir * 45 end
          end
          if portaling[peek] == unit and peek.draw.x == peek.x and peek.draw.y == peek.y then
            portaling[peek] = nil
          else
            drawUnit(peek, x, y, rot, true)
          end
          
          love.graphics.pop()
        end
        
        love.graphics.setStencilTest()
      end
    end
    
    if hasRule(unit,"be","sans") and unit.eye then
      local topleft = {x = fulldrawx - 16, y = fulldrawy - 16}
      love.graphics.setColor(getPaletteColor(1,4))
      love.graphics.rectangle("fill", topleft.x + unit.eye.x, topleft.y + unit.eye.y, unit.eye.w, unit.eye.h)
      for i = 1, unit.eye.w-1 do
        love.graphics.rectangle("fill", topleft.x + unit.eye.x + i, topleft.y + unit.eye.y - i, unit.eye.w - i, 1)
      end
    end

    if hasRule(unit,"got","hatt") then
      love.graphics.setColor(color[1], color[2], color[3], color[4])
      love.graphics.draw(sprites["hatsmol"], fulldrawx, fulldrawy - 0.5*TILE_SIZE, 0, unit.draw.scalex, unit.draw.scaley, sprite:getWidth() / 2, sprite:getHeight() / 2)
    end
    if hasRule(unit,"got","gunne") then
      love.graphics.setColor(1, 1, 1)
      love.graphics.draw(sprites["gunnesmol"], fulldrawx, fulldrawy, 0, unit.draw.scalex, unit.draw.scaley, sprite:getWidth() / 2, sprite:getHeight() / 2)
    end
    if hasRule(unit,"got","katany") then
      love.graphics.setColor(getPaletteColor(0,1))
      love.graphics.draw(sprites["katanysmol"], fulldrawx, fulldrawy, 0, unit.draw.scalex, unit.draw.scaley, sprite:getWidth() / 2, sprite:getHeight() / 2)
    end
    if hasRule(unit,"got","knif") then
      love.graphics.setColor(getPaletteColor(0,3))
      love.graphics.draw(sprites["knifsmol"], fulldrawx, fulldrawy, 0, unit.draw.scalex, unit.draw.scaley, sprite:getWidth() / 2, sprite:getHeight() / 2)
    end
    if hasRule(unit,"got","slippers") then
      love.graphics.setColor(getPaletteColor(1,4))
      love.graphics.draw(sprites["slippers"], fulldrawx, fulldrawy+sprite:getHeight()/4, 0, unit.draw.scalex, unit.draw.scaley, sprite:getWidth() / 2, sprite:getHeight() / 2)
    end
    
    if false then -- stupid lua comments
      if hasRule(unit,"got","?") then
        local matchrules = matchesRule(unit,"got","?")

        for _,matchrule in ipairs(matchrules) do
          local tile = tiles_list[tiles_by_name[matchrule[1][3]]]

          if #tile.color == 3 then
            gotcolor = {tile.color[1]/255 * brightness, tile.color[2]/255 * brightness, tile.color[3]/255 * brightness, 1}
          else
            local r,g,b,a = getPaletteColor(tile.color[1], tile.color[2])
            gotcolor = {r * brightness, g * brightness, b * brightness, a}
          end

          love.graphics.setColor(gotcolor[1], gotcolor[2], gotcolor[3], gotcolor[4])
          love.graphics.draw(sprites[tile.sprite], fulldrawx/4*3, fulldrawy/4*3, 0, 1/4, 1/4, sprite:getWidth() / 2, sprite:getHeight() / 2)
        end
      end
    end

    love.graphics.pop()

    if unit.blocked then
      local rotation = (unit.blocked_dir - 1) * 45

      love.graphics.push()
      love.graphics.rotate(math.rad(rotation))
      love.graphics.translate(-fulldrawx, -fulldrawy)

      local scalex = 1
      if unit.blocked_dir % 2 == 0 then
        scalex = math.sqrt(2)
      end

      love.graphics.setColor(getPaletteColor(2, 2))
      love.graphics.draw(sprites["scribble_" .. anim_stage+1], fulldrawx, fulldrawy, 0, unit.draw.scalex * scalex, unit.draw.scaley, sprite:getWidth() / 2, sprite:getHeight() / 2)

      love.graphics.pop()
    end

    love.graphics.pop()

    if hasProperty(unit,"loop") then
      love.graphics.setColor(1,1,1,.4)
      love.graphics.rectangle("fill",fulldrawx-16,fulldrawy-16,32,32)
    end
  end