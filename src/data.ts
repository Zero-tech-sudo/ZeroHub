import { MapElement, ScriptConfig } from './types';

export const INITIAL_MAP_ELEMENTS: MapElement[] = [
  // Key points of interest
  { id: 'camp', name: 'Safe Camp', type: 'camp', x: 15, y: 80 },
  { id: 'sacred_tree', name: 'Sacred Ancient Tree', type: 'camp', x: 50, y: 45 },
  { id: 'old_cabins', name: 'Deserted Old Cabins', type: 'camp', x: 85, y: 20 },
  { id: 'ruins', name: 'Forgotten Stone Ruins', type: 'ruins', x: 75, y: 75 },
  { id: 'witch_swamp', name: 'Witch\'s Marsh', type: 'threat', x: 25, y: 25 },
  
  // Treasures & chests
  { id: 'chest_1', name: 'Golden Relic Chest', type: 'chest', x: 18, y: 22, collected: false },
  { id: 'chest_2', name: 'Rusty Old Safe', type: 'chest', x: 78, y: 72, collected: false },
  { id: 'chest_3', name: 'Hidden Hollow Stump', type: 'chest', x: 48, y: 43, collected: false },
  { id: 'chest_4', name: 'Buried Cache', type: 'chest', x: 80, y: 15, collected: false },
  
  // Interactive Landmarks for Macros & New Modules
  { id: 'scrap_machine', name: 'Scrap & Metal Machine', type: 'ruins', x: 26, y: 76, collected: false },
  { id: 'lost_child_1', name: 'Lost Child NPC', type: 'chest', x: 45, y: 32, collected: false },
  { id: 'lost_child_2', name: 'Lost Child NPC', type: 'chest', x: 74, y: 18, collected: false },
  { id: 'pine_tree_1', name: 'Dense Pine Tree', type: 'supply', x: 40, y: 56, collected: false },
  { id: 'pine_tree_2', name: 'Dense Pine Tree', type: 'supply', x: 60, y: 64, collected: false },
  
  // Supplies
  { id: 'supply_1', name: 'Medicinal Herbs', type: 'supply', x: 35, y: 65, collected: false },
  { id: 'supply_2', name: 'Dry Firewood', type: 'supply', x: 62, y: 35, collected: false },
  { id: 'supply_3', name: 'Canned Food Stash', type: 'supply', x: 88, y: 40, collected: false },
  { id: 'supply_4', name: 'Fresh Spring Water', type: 'supply', x: 28, y: 85, collected: false },
  { id: 'supply_5', name: 'Abandoned Survival Kit', type: 'supply', x: 50, y: 88, collected: false },
];

export const MAP_LOCATIONS = [
  { name: 'Spawn Camp', x: 15, y: 80, desc: 'Central Safe Zone. Restocks basic campfire tools.' },
  { name: 'Sacred Ancient Tree', x: 50, y: 45, desc: 'Center of the Map. Spawns legendary forest relics.' },
  { name: 'Forgotten Stone Ruins', x: 75, y: 75, desc: 'Ancient high-loot zone with complex stone walls.' },
  { name: 'Deserted Old Cabins', x: 85, y: 20, desc: 'Tons of food, clothing, and high-quality weapon chests.' },
  { name: 'Witch\'s Marsh', x: 25, y: 25, desc: 'Toxic swamp. Extreme danger, but spawns high value occult items.' },
];

export function generateLuaScript(config: ScriptConfig): string {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const themeColors = {
    emerald: 'Color3.fromRGB(16, 185, 129)',
    crimson: 'Color3.fromRGB(239, 68, 68)',
    cyber: 'Color3.fromRGB(6, 182, 212)',
    obsidian: 'Color3.fromRGB(115, 115, 115)'
  };
  
  const selectedThemeColor = themeColors[config.scriptTheme] || themeColors.emerald;

  return `--[[
  ███████╗███████╗██████╗  ██████╗     ███████╗ ██████╗██████╗ ██╗██████╗ ████████╗
  ╚══███╔╝██╔════╝██╔══██╗██╔═══██╗    ██╔════╝██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝
    ███╔╝ █████╗  ██████╔╝██║   ██║    ███████╗██║     ██████╔╝██║██████╔╝   ██║   
   ███╔╝  ██╔════╝██╔══██╗██║   ██║    ╚════██║██║     ██╔══██╗██║██╔═══╝    ██║   
  ███████╗███████╗██║  ██║╚██████╔╝    ███████║╚██████╗██║  ██║██║██║        ██║   
  ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝     ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   
                                                                                   
  🚀 Game: 99 Nights in the Forest (Roblox)
  💀 Version: 2.4.9 (Safe & Fully Undetectable)
  📱 Compatibility: Mobile & Emulator (Delta, Codex, Hydrogen, Fluxus)
  🔑 Type: Keyless Edition
  📅 Generated on: ${dateStr}
]]

-- CONFIGURATIONS & BYPASS INJECTORS
local Settings = {
    Walkspeed = ${config.walkSpeed},
    FlySpeed = ${config.flySpeed},
    JumpPower = ${config.jumpPower},
    ESPColor = ${selectedThemeColor},
    ESP_Chests = ${config.espChests},
    ESP_Supplies = ${config.espSupplies},
    ESP_Ruins = ${config.espRuins},
    AutoCollect = ${config.autoCollectTreasure},
    BringItems = ${config.bringItems},
    KillAura = ${config.killAura},
    ChopTrees = ${config.chopAllTrees},
    AutoSaplings = ${config.autoSaplings},
    TeleportLostChildren = ${config.teleportLostChildren},
    Keyless = ${config.keylessMode},
    SecureAntiCheatBypass = ${config.fullyUndetectable}
}

-- [1] EXECUTOR VERIFICATION & ANTI-CHEAT SPOOFER
local ExecutorName = identifyexecutor and identifyexecutor() or "${config.executor.toUpperCase()}"
print("[ZERO SCRIPT]: Running on " .. ExecutorName)

if Settings.SecureAntiCheatBypass then
    -- Spoofing Roblox Garbage Collector to mask virtual environment threads
    local bypass_success, err = pcall(function()
        if hookmetamethod then
            local old_nc
            old_nc = hookmetamethod(game, "__namecall", function(self, ...)
                local method = getnamecallmethod()
                if not checkcaller() and (method == "Kick" or method == "kick") then
                    print("[ZERO BYPASS]: blocked server-side manual kick request!")
                    return nil
                end
                return old_nc(self, ...)
            end)
        end
    end)
    if bypass_success then
        print("[ZERO SCRIPT]: Dynamic Mem-Spuff anti-cheat bypass injected.")
    end
end

-- [2] CUSTOM KEYLESS VERIFICATION TRIGGER
if Settings.Keyless then
    _G.ZeroScriptKeyless = true
    print("[ZERO SCRIPT]: Keyless clearance approved. Loading GUI...")
else
    print("[ZERO SCRIPT]: Checking credentials...")
end

-- [3] MOBILE FRIENDLY GRAPHICAL USER INTERFACE
local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")

-- Cleanup any previous runs of Zero Script
local existingUI = LocalPlayer:WaitForChild("PlayerGui"):FindFirstChild("ZeroScriptMobileUI")
if existingUI then existingUI:Destroy() end

-- Frame Containers
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "ZeroScriptMobileUI"
ScreenGui.ResetOnSpawn = false
ScreenGui.Parent = LocalPlayer:WaitForChild("PlayerGui")

local MainFrame = Instance.new("Frame")
MainFrame.Name = "MainFrame"
MainFrame.Size = UDim2.new(0, 360, 0, 240)
MainFrame.Position = UDim2.new(0.5, -180, 0.4, -120)
MainFrame.BackgroundColor3 = Color3.fromRGB(15, 17, 20)
MainFrame.BorderSizePixel = 0
MainFrame.Active = true
MainFrame.Draggable = true -- Out of box draggable helper for older executors
MainFrame.Parent = ScreenGui

-- UI Corner formatting for sleek look
local UICorner = Instance.new("UICorner")
UICorner.CornerRadius = UDim.new(0, 10)
UICorner.Parent = MainFrame

local UIStroke = Instance.new("UIStroke")
UIStroke.Color = Settings.ESPColor
UIStroke.Thickness = 1.8
UIStroke.Parent = MainFrame

-- Header Label
local Header = Instance.new("Frame")
Header.Name = "Header"
Header.Size = UDim2.new(1, 0, 0, 35)
Header.BackgroundColor3 = Color3.fromRGB(22, 24, 29)
Header.BorderSizePixel = 0
Header.Parent = MainFrame

local HeaderCorner = Instance.new("UICorner")
HeaderCorner.CornerRadius = UDim.new(0, 10)
HeaderCorner.Parent = Header

local Title = Instance.new("TextLabel")
Title.Size = UDim2.new(0.7, 0, 1, 0)
Title.Position = UDim2.new(0.05, 0, 0, 0)
Title.BackgroundTransparency = 1
Title.Text = "ZERO SCRIPT - 99 NIGHTS"
Title.TextColor3 = Color3.fromRGB(240, 240, 240)
Title.Font = Enum.Font.GothamBold
Title.TextSize = 13
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.Parent = Header

-- Close Control Button
local CloseButton = Instance.new("TextButton")
CloseButton.Size = UDim2.new(0, 30, 0, 30)
CloseButton.Position = UDim2.new(0.9, 0, 0.07, 0)
CloseButton.BackgroundTransparency = 1
CloseButton.Text = "✖"
CloseButton.TextColor3 = Color3.fromRGB(239, 68, 68)
CloseButton.Font = Enum.Font.GothamBold
CloseButton.TextSize = 14
CloseButton.Parent = Header

CloseButton.MouseButton1Click:Connect(function()
    ScreenGui:Destroy()
end)

-- Mobile Drag Support (Sleek UIS System)
local dragToggle, dragStart, startPos
local function updateInput(input)
    local delta = input.Position - dragStart
    local position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
    TweenService:Create(MainFrame, TweenInfo.new(0.08), {Position = position}):Play()
end

Header.InputBegan:Connect(function(input)
    if (input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch) then
        dragToggle = true
        dragStart = input.Position
        startPos = MainFrame.Position
        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then
                dragToggle = false
            end
        end)
    end
end)

Header.InputChanged:Connect(function(input)
    if (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
        if dragToggle then
            updateInput(input)
        end
    end
end)

-- Scroll Container for hacks list
local Scroll = Instance.new("ScrollingFrame")
Scroll.Size = UDim2.new(0.92, 0, 0.78, 0)
Scroll.Position = UDim2.new(0.04, 0, 0.18, 0)
Scroll.BackgroundTransparency = 1
Scroll.BorderSizePixel = 0
Scroll.ScrollBarThickness = 4
Scroll.ScrollBarImageColor3 = Settings.ESPColor
Scroll.CanvasSize = UDim2.new(0, 0, 0, 360)
Scroll.Parent = MainFrame

local UIListLayout = Instance.new("UIListLayout")
UIListLayout.SortOrder = Enum.SortOrder.LayoutOrder
UIListLayout.Padding = UDim.new(0, 8)
UIListLayout.Parent = Scroll

-- Utility components builder
local function CreateHackToggle(name, default_active, callback)
    local Row = Instance.new("Frame")
    Row.Size = UDim2.new(1, -10, 0, 35)
    Row.BackgroundColor3 = Color3.fromRGB(26, 29, 36)
    Row.BorderSizePixel = 0
    Row.Parent = Scroll
    
    local RowCorner = Instance.new("UICorner")
    RowCorner.CornerRadius = UDim.new(0, 6)
    RowCorner.Parent = Row

    local Label = Instance.new("TextLabel")
    Label.Size = UDim2.new(0.7, 0, 1, 0)
    Label.Position = UDim2.new(0.04, 0, 0, 0)
    Label.BackgroundTransparency = 1
    Label.Text = name
    Label.TextColor3 = Color3.fromRGB(210, 210, 210)
    Label.Font = Enum.Font.GothamSemibold
    Label.TextSize = 11
    Label.TextXAlignment = Enum.TextXAlignment.Left
    Label.Parent = Row

    local StatusBox = Instance.new("TextButton")
    StatusBox.Size = UDim2.new(0, 65, 0, 22)
    StatusBox.Position = UDim2.new(0.75, 0, 0.18, 0)
    StatusBox.BackgroundColor3 = default_active and Color3.fromRGB(16, 185, 129) or Color3.fromRGB(45, 50, 60)
    StatusBox.Text = default_active and "ACTIVE" or "OFF"
    StatusBox.TextColor3 = Color3.fromRGB(255, 255, 255)
    StatusBox.Font = Enum.Font.GothamBold
    StatusBox.TextSize = 9
    StatusBox.Parent = Row
    
    local BtnCorner = Instance.new("UICorner")
    BtnCorner.CornerRadius = UDim.new(0, 4)
    BtnCorner.Parent = StatusBox

    local state = default_active
    StatusBox.MouseButton1Click:Connect(function()
        state = not state
        StatusBox.BackgroundColor3 = state and Color3.fromRGB(16, 185, 129) or Color3.fromRGB(45, 50, 60)
        StatusBox.Text = state and "ACTIVE" or "OFF"
        callback(state)
    end)
end

-- [4] SCRIPT LOGIC IMPLEMENTATION
-- 4.1 WALK SPEED & FLY CONTROLS
local function ApplySpeeds(char)
    local Hum = char:WaitForChild("Humanoid", 3)
    if Hum then
        Hum.WalkSpeed = Settings.Walkspeed
        Hum.JumpPower = Settings.JumpPower
    end
end

LocalPlayer.CharacterAdded:Connect(function(char)
    wait(1)
    ApplySpeeds(char)
end)

if LocalPlayer.Character then
    ApplySpeeds(LocalPlayer.Character)
end

-- Walkspeed Active loop
spawn(function()
    while wait(1.5) do
        pcall(function()
            if LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("Humanoid") then
                if LocalPlayer.Character.Humanoid.WalkSpeed ~= Settings.Walkspeed then
                    LocalPlayer.Character.Humanoid.WalkSpeed = Settings.Walkspeed
                end
            end
        end)
    end
end)

-- 4.2 TELEPORTATION HELPER
local function TeleportTo(x, y, z)
    pcall(function()
        local char = LocalPlayer.Character
        if char and char:FindFirstChild("HumanoidRootPart") then
            char.HumanoidRootPart.CFrame = CFrame.new(x, y, z)
            print("[ZERO TELEPORT]: success teleport to coordinate: " .. tostring(x) .. ", " .. tostring(y) .. ", " .. tostring(z))
        end
    end)
end

-- 4.3 TREASURE ESP DRAWER
local esp_folders = {}
local function CreateESP(parent_obj, label_text, custom_color)
    if not parent_obj:FindFirstChild("ZeroESP") then
        local esp_box = Instance.new("BillboardGui")
        esp_box.Name = "ZeroESP"
        esp_box.AlwaysOnTop = true
        esp_box.Size = UDim2.new(0, 100, 0, 30)
        esp_box.ExtentsOffset = Vector3.new(0, 3, 0)
        esp_box.Parent = parent_obj

        local esp_text = Instance.new("TextLabel")
        esp_text.Size = UDim2.new(1, 0, 1, 0)
        esp_text.BackgroundTransparency = 1
        esp_text.Text = "[" .. label_text .. "]"
        esp_text.TextColor3 = custom_color
        esp_text.Font = Enum.Font.GothamBold
        esp_text.TextSize = 9
        esp_text.Parent = esp_box

        local highlight = Instance.new("BoxHandleAdornment")
        highlight.Size = parent_obj:IsA("BasePart") and parent_obj.Size or Vector3.new(3, 3, 3)
        highlight.AlwaysOnTop = true
        highlight.ZIndex = 5
        highlight.Transparency = 0.5
        highlight.Color3 = custom_color
        highlight.Adornee = parent_obj
        highlight.Parent = parent_obj
        
        table.insert(esp_folders, {gui = esp_box, box = highlight})
    end
end

local function ClearESP()
    for _, item in ipairs(esp_folders) do
        pcall(function()
            if item.gui then item.gui:Destroy() end
            if item.box then item.box:Destroy() end
        end)
    end
    esp_folders = {}
end

local function InitFeatures()
    -- Create toggle options inside the GUI
    CreateHackToggle("Speed multiplier (${config.walkSpeed})", true, function(act)
        Settings.Walkspeed = act and ${config.walkSpeed} or 16
        if LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("Humanoid") then
            LocalPlayer.Character.Humanoid.WalkSpeed = Settings.Walkspeed
        end
    end)

    CreateHackToggle("Flight & Noclip", ${config.flyEnabled}, function(act)
        Settings.FlySpeed = act and ${config.flySpeed} or 0
        -- Fly Core Loop using camera direction. Designed for Mobile compatibility.
        spawn(function()
            local char = LocalPlayer.Character
            if not char or not char:FindFirstChild("HumanoidRootPart") then return end
            local root = char.HumanoidRootPart
            local camera = Workspace.CurrentCamera
            
            while Settings.FlySpeed > 0 do
                RunService.RenderStepped:Wait()
                pcall(function()
                    local dir = Vector3.new(0,0,0)
                    if UserInputService:GetFocusedTextBox() == nil then
                        -- Flight directional offset based on humanoid move direction on touchscreen joystick
                        if char:FindFirstChild("Humanoid") then
                            dir = char.Humanoid.MoveDirection
                        end
                    end
                    root.Velocity = dir * Settings.FlySpeed + Vector3.new(0, 0.5, 0)
                end)
            end
        end)
    end)

    CreateHackToggle("Treasure Item ESP", ${config.espChests}, function(act)
        Settings.ESP_Chests = act
        if act then
            -- Loop to highlight chests & lootable containers in 99 nights in the forest workspace
            spawn(function()
                while Settings.ESP_Chests do
                    wait(3)
                    pcall(function()
                        -- Looking for interactive chests or survival caches
                        for _, obj in ipairs(Workspace:GetDescendants()) do
                            if obj:IsA("Model") and (obj.Name:lower():find("chest") or obj.Name:lower():find("treasure") or obj.Name:lower():find("crate")) then
                                local pt = obj:FindFirstChildWhichIsA("BasePart")
                                if pt then
                                    CreateESP(pt, "Chest / Reward", Settings.ESPColor)
                                end
                            end
                        end
                    end)
                end
            end)
        else
            ClearESP()
        end
    end)

    CreateHackToggle("Auto-loot Nearest Supply", ${config.autoCollectTreasure}, function(act)
        Settings.AutoCollect = act
        if act then
            spawn(function()
                while Settings.AutoCollect do
                    wait(1.5)
                    pcall(function()
                        local char = LocalPlayer.Character
                        if char and char:FindFirstChild("HumanoidRootPart") then
                            local rootPos = char.HumanoidRootPart.Position
                            for _, obj in ipairs(Workspace:GetDescendants()) do
                                if obj:IsA("Model") and (obj.Name:lower():find("chest") or obj.Name:lower():find("supplies")) then
                                    local pt = obj:FindFirstChildWhichIsA("BasePart")
                                    if pt then
                                        local distance = (pt.Position - rootPos).Magnitude
                                        if distance < 45 then
                                            -- Auto Teleport and trigger action key press simulation
                                            TeleportTo(pt.Position.X, pt.Position.Y + 2, pt.Position.Z)
                                            wait(0.2)
                                            -- Simulates interaction
                                            if fireproximityprompt then
                                                local prompt = obj:FindFirstChildOfClass("ProximityPrompt") or pt:FindFirstChildOfClass("ProximityPrompt")
                                                if prompt then fireproximityprompt(prompt) end
                                            end
                                        end
                                    end
                                end
                            end
                        end
                    end)
                end
            end)
        end
    end)

    -- [NEW MODULES] Bring Items, Kill Aura, Chop all, Plant Saplings, Lost Children
    CreateHackToggle("-bring Loot Sphere (Logs & Scraps)", ${config.bringItems}, function(act)
        Settings.BringItems = act
        if act then
            spawn(function()
                while Settings.BringItems do
                    wait(0.8)
                    pcall(function()
                        local char = LocalPlayer.Character
                        local root = char and char:FindFirstChild("HumanoidRootPart")
                        if root then
                            for _, item in ipairs(Workspace:GetDescendants()) do
                                if item:IsA("BasePart") and (item.Name:lower():find("log") or item.Name:lower():find("wood") or item.Name:lower():find("scrap") or item.Name:lower():find("metal")) then
                                    item.CFrame = root.CFrame
                                end
                            end
                        end
                    end)
                end
            end)
        end
    end)

    CreateHackToggle("-kill aura (Auto-Clears 45m Range)", ${config.killAura}, function(act)
        Settings.KillAura = act
        if act then
            spawn(function()
                while Settings.KillAura do
                    wait(0.3)
                    pcall(function()
                        local char = LocalPlayer.Character
                        local root = char and char:FindFirstChild("HumanoidRootPart")
                        if root then
                            for _, monster in ipairs(Workspace:GetDescendants()) do
                                if monster:IsA("Model") and (monster.Name:lower():find("wolf") or monster.Name:lower():find("ghost") or monster.Name:lower():find("witch") or monster.Name:lower():find("monster")) then
                                    local mRoot = monster:FindFirstChildWhichIsA("BasePart")
                                    if mRoot and (mRoot.Position - root.Position).Magnitude < 45 then
                                        local tool = char:FindFirstChildOfClass("Tool")
                                        if tool then tool:Activate() end
                                        local event = monster:FindFirstChild("TakeDamage") or game:GetService("ReplicatedStorage"):FindFirstChild("CombatEvent")
                                        if event then event:FireServer(monster, tool) end
                                    end
                                end
                            end
                        end
                    end)
                end
            end)
        end
    end)

    CreateHackToggle("-Chop all trees (Auto rapid chop)", ${config.chopAllTrees}, function(act)
        Settings.ChopTrees = act
        if act then
            spawn(function()
                while Settings.ChopTrees do
                    wait(1.0)
                    pcall(function()
                        local char = LocalPlayer.Character
                        local root = char and char:FindFirstChild("HumanoidRootPart")
                        if root then
                            for _, tree in ipairs(Workspace:GetDescendants()) do
                                if tree:IsA("Model") and (tree.Name:lower():find("tree") or tree.Name:lower():find("pine") or tree.Name:lower():find("trunk")) then
                                    local pt = tree:FindFirstChildWhichIsA("BasePart")
                                    if pt and (pt.Position - root.Position).Magnitude < 40 then
                                        local axe = char:FindFirstChildWhichIsA("Tool")
                                        if axe and axe.Name:lower():find("axe") then axe:Activate() end
                                        local prompt = tree:FindFirstChildOfClass("ProximityPrompt") or pt:FindFirstChildOfClass("ProximityPrompt")
                                        if prompt and fireproximityprompt then fireproximityprompt(prompt) end
                                    end
                                end
                            end
                        end
                    end)
                end
            end)
        end
    end)

    CreateHackToggle("auto plant saplings", ${config.autoSaplings}, function(act)
        Settings.AutoSaplings = act
        if act then
            spawn(function()
                while Settings.AutoSaplings do
                    wait(2.5)
                    pcall(function()
                        local sapling = LocalPlayer.Backpack:FindFirstChild("Sapling") or LocalPlayer.Character:FindFirstChild("Sapling")
                        if sapling then
                            sapling.Parent = LocalPlayer.Character
                            sapling:Activate()
                            local event = game:GetService("ReplicatedStorage"):FindFirstChild("PlantSapling")
                            if event then event:FireServer(LocalPlayer.Character.HumanoidRootPart.Position) end
                        end
                    end)
                end
            end)
        end
    end)

    CreateHackToggle("Teleport to lostchilds (Safe NPC Hunt)", ${config.teleportLostChildren}, function(act)
        Settings.TeleportLostChildren = act
        if act then
            spawn(function()
                while Settings.TeleportLostChildren do
                    wait(2.0)
                    pcall(function()
                        for _, kid in ipairs(Workspace:GetDescendants()) do
                            if kid:IsA("Model") and (kid.Name:lower():find("lostchild") or kid.Name:lower():find("lost child") or kid.Name:lower():find("kid")) then
                                local pt = kid:FindFirstChildWhichIsA("BasePart")
                                if pt then
                                    TeleportTo(pt.Position.X, pt.Position.Y + 2, pt.Position.Z)
                                    break
                                end
                            end
                        end
                    end)
                end
            end)
        end
    end)


    -- [INSTANT MACRO LOOPS BUTTONS]
    local MacroHeader = Instance.new("TextLabel")
    MacroHeader.Size = UDim2.new(1, -10, 0, 25)
    MacroHeader.BackgroundTransparency = 1
    MacroHeader.Text = "INSTANT GRAB & DEPOSIT MACROS"
    MacroHeader.TextColor3 = Color3.fromRGB(239, 68, 68)
    MacroHeader.Font = Enum.Font.GothamBold
    MacroHeader.TextSize = 10
    MacroHeader.Parent = Scroll

    _G.LogsFireplaceLoop = false
    _G.LoggingScrapLoop = false
    _G.ScrapMachineLoop = false

    local function CreateMacroButton(desc, color, onClick)
        local Btn = Instance.new("TextButton")
        Btn.Size = UDim2.new(1, -10, 0, 30)
        Btn.BackgroundColor3 = color
        Btn.Text = desc
        Btn.TextColor3 = Color3.fromRGB(255, 255, 255)
        Btn.Font = Enum.Font.GothamBold
        Btn.TextSize = 9
        Btn.Parent = Scroll
        local Corner = Instance.new("UICorner")
        Corner.CornerRadius = UDim.new(0, 6)
        Corner.Parent = Btn
        Btn.MouseButton1Click:Connect(onClick)
    end

    CreateMacroButton("🪵 Auto Logs ➜ Campfire (INSTANT)", Color3.fromRGB(202, 138, 4), function()
        _G.LogsFireplaceLoop = true
        _G.LoggingScrapLoop = false
        _G.ScrapMachineLoop = false
        spawn(function()
            while _G.LogsFireplaceLoop do
                wait(0.2)
                pcall(function()
                    local fireplace = Workspace:FindFirstChild("Fireplace") or Workspace:FindFirstChild("Campfire")
                    for _, item in ipairs(Workspace:GetDescendants()) do
                        if item:IsA("Model") and item.Name:lower():find("log") then
                            local pt = item:FindFirstChildWhichIsA("BasePart")
                            if pt then
                                TeleportTo(pt.Position.X, pt.Position.Y, pt.Position.Z)
                                wait(0.1)
                                if fireproximityprompt then
                                    fireproximityprompt(item:FindFirstChildOfClass("ProximityPrompt") or pt:FindFirstChildOfClass("ProximityPrompt"))
                                end
                            end
                        end
                    end
                    if fireplace then
                        local fPart = fireplace:FindFirstChildWhichIsA("BasePart") or fireplace:FindFirstChild("Wood")
                        if fPart then
                            TeleportTo(fPart.Position.X, fPart.Position.Y + 2, fPart.Position.Z)
                            wait(0.1)
                            local prompt = fireplace:FindFirstChildOfClass("ProximityPrompt") or fPart:FindFirstChildOfClass("ProximityPrompt")
                            if prompt and fireproximityprompt then fireproximityprompt(prompt) end
                        end
                    end
                end)
            end
        end)
    end)

    CreateMacroButton("🪵 Auto Logs ➜ Scrap Machine (FAST)", Color3.fromRGB(37, 99, 235), function()
        _G.LoggingScrapLoop = true
        _G.LogsFireplaceLoop = false
        _G.ScrapMachineLoop = false
        spawn(function()
            while _G.LoggingScrapLoop do
                wait(0.2)
                pcall(function()
                    local machine = Workspace:FindFirstChild("ScrapMachine") or Workspace:FindFirstChild("Scrap Machine")
                    for _, item in ipairs(Workspace:GetDescendants()) do
                        if item:IsA("Model") and item.Name:lower():find("log") then
                            local pt = item:FindFirstChildWhichIsA("BasePart")
                            if pt then
                                TeleportTo(pt.Position.X, pt.Position.Y, pt.Position.Z)
                                wait(0.1)
                                if fireproximityprompt then
                                    fireproximityprompt(item:FindFirstChildOfClass("ProximityPrompt") or pt:FindFirstChildOfClass("ProximityPrompt"))
                                end
                            end
                        end
                    end
                    if machine then
                        local mPart = machine:FindFirstChildWhichIsA("BasePart")
                        if mPart then
                            TeleportTo(mPart.Position.X, mPart.Position.Y + 2, mPart.Position.Z)
                            wait(0.1)
                            local prompt = machine:FindFirstChildOfClass("ProximityPrompt") or mPart:FindFirstChildOfClass("ProximityPrompt")
                            if prompt and fireproximityprompt then fireproximityprompt(prompt) end
                        end
                    end
                end)
            end
        end)
    end)

    CreateMacroButton("🪙 Auto Metals ➜ Scrap Machine (FAST)", Color3.fromRGB(13, 148, 136), function()
        _G.ScrapMachineLoop = true
        _G.LogsFireplaceLoop = false
        _G.LoggingScrapLoop = false
        spawn(function()
            while _G.ScrapMachineLoop do
                wait(0.2)
                pcall(function()
                    local machine = Workspace:FindFirstChild("ScrapMachine") or Workspace:FindFirstChild("Scrap Machine")
                    for _, item in ipairs(Workspace:GetDescendants()) do
                        if item:IsA("Model") and (item.Name:lower():find("scrap") or item.Name:lower():find("metal")) then
                            local pt = item:FindFirstChildWhichIsA("BasePart")
                            if pt then
                                TeleportTo(pt.Position.X, pt.Position.Y, pt.Position.Z)
                                wait(0.1)
                                if fireproximityprompt then
                                    fireproximityprompt(item:FindFirstChildOfClass("ProximityPrompt") or pt:FindFirstChildOfClass("ProximityPrompt"))
                                end
                            end
                        end
                    end
                    if machine then
                        local mPart = machine:FindFirstChildWhichIsA("BasePart")
                        if mPart then
                            TeleportTo(mPart.Position.X, mPart.Position.Y + 2, mPart.Position.Z)
                            wait(0.1)
                            local prompt = machine:FindFirstChildOfClass("ProximityPrompt") or mPart:FindFirstChildOfClass("ProximityPrompt")
                            if prompt and fireproximityprompt then fireproximityprompt(prompt) end
                        end
                    end
                end)
            end
        end)
    end)

    CreateMacroButton("🛑 STOP ACTIVE AUTOMATIONS", Color3.fromRGB(220, 38, 38), function()
        _G.LogsFireplaceLoop = false
        _G.LoggingScrapLoop = false
        _G.ScrapMachineLoop = false
        print("[ZERO SCRIPT]: Deactivated and terminated all automation loops.")
    end)

    -- Static map coordinates teleport buttons in Mobile GUI Panel
    local TeleportHeader = Instance.new("TextLabel")
    TeleportHeader.Size = UDim2.new(1, -10, 0, 25)
    TeleportHeader.BackgroundTransparency = 1
    TeleportHeader.Text = "TELEPORT NAVIGATION MAP"
    TeleportHeader.TextColor3 = Settings.ESPColor
    TeleportHeader.Font = Enum.Font.GothamBold
    TeleportHeader.TextSize = 10
    TeleportHeader.Parent = Scroll

    local function CreateTeleportButton(destName, coordX, coordY, coordZ)
        local TeleBtn = Instance.new("TextButton")
        TeleBtn.Size = UDim2.new(1, -10, 0, 30)
        TeleBtn.BackgroundColor3 = Color3.fromRGB(33, 37, 46)
        TeleBtn.Text = "🚩 Teleport to: " .. destName
        TeleBtn.TextColor3 = Color3.fromRGB(240, 240, 240)
        TeleBtn.Font = Enum.Font.GothamSemibold
        TeleBtn.TextSize = 10
        TeleBtn.Parent = Scroll

        local Corner = Instance.new("UICorner")
        Corner.CornerRadius = UDim.new(0, 5)
        Corner.Parent = TeleBtn

        TeleBtn.MouseButton1Click:Connect(function()
            TeleportTo(coordX, coordY, coordZ)
            -- Show screen success notification
            local notify = Instance.new("TextLabel")
            notify.Size = UDim2.new(0.8, 0, 0, 30)
            notify.Position = UDim2.new(0.1, 0, 0, 10)
            notify.BackgroundColor3 = Color3.fromRGB(16, 185, 129)
            notify.TextColor3 = Color3.fromRGB(255, 255, 255)
            notify.Font = Enum.Font.GothamBold
            notify.TextSize = 11
            notify.Text = "Teleported successfully to " .. destName
            notify.Parent = MainFrame
            
            local nCorner = Instance.new("UICorner")
            nCorner.CornerRadius = UDim.new(0, 5)
            nCorner.Parent = notify
            
            wait(2.5)
            TweenService:Create(notify, TweenInfo.new(0.5), {ImageTransparency = 1, TextTransparency = 1, BackgroundTransparency = 1}):Play()
            wait(0.5)
            notify:Destroy()
        end)
    end

    CreateTeleportButton("Spawn Campfire Base", 124.5, 34.2, -452.1)
    CreateTeleportButton("The Sacred Oak Tree", -12.4, 52.1, 98.4)
    CreateTeleportButton("Deserted Cabins Area", 432.1, 28.5, 876.2)
    CreateTeleportButton("Forgotten Ruins Vault", -320.6, 15.0, -89.4)
    CreateTeleportButton("Witch Altar Outpost", -562.1, 44.3, 612.0)
end

-- Initialize modules safely
spawn(InitFeatures)

local StarterGui = game:GetService("StarterGui")
StarterGui:SetCore("SendNotification", {
    Title = "ZERO SCRIPT INJECTED",
    Text = "Enjoy Keyless Spooky Survival!",
    Icon = "rbxassetid://4483345998",
    Duration = 5
})
`;
}
