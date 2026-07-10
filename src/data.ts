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
  ZeroHub Luau Learning Sandbox
  Generated on: ${dateStr}

  This sample is intentionally local-only and educational. It demonstrates
  safe ScreenGui construction, button event handling, scrolling content, and
  cleanup patterns. It does not include exploit hooks, anti-cheat bypasses,
  remote event abuse, or off-platform telemetry.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local LocalPlayer = Players.LocalPlayer
local PlayerGui = LocalPlayer:WaitForChild("PlayerGui")

local Settings = {
    PreviewWalkSpeed = ${config.walkSpeed},
    PreviewFlySpeed = ${config.flySpeed},
    PreviewJumpPower = ${config.jumpPower},
    AccentColor = ${selectedThemeColor},
    ShowChestLabels = ${config.espChests},
    ShowSupplyLabels = ${config.espSupplies},
    ShowLandmarkLabels = ${config.espRuins}
}

local existing = PlayerGui:FindFirstChild("ZeroHubLearningSandbox")
if existing then
    existing:Destroy()
end

local connections = {}
local function track(connection)
    table.insert(connections, connection)
    return connection
end

local function cleanup()
    for _, connection in ipairs(connections) do
        if connection and connection.Disconnect then
            connection:Disconnect()
        end
    end
    table.clear(connections)
end

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "ZeroHubLearningSandbox"
ScreenGui.ResetOnSpawn = false
ScreenGui.Parent = PlayerGui

local MainFrame = Instance.new("Frame")
MainFrame.Name = "MainFrame"
MainFrame.Size = UDim2.new(0, 380, 0, 280)
MainFrame.Position = UDim2.new(0.5, -190, 0.5, -140)
MainFrame.BackgroundColor3 = Color3.fromRGB(15, 17, 20)
MainFrame.BorderSizePixel = 0
MainFrame.Parent = ScreenGui

local UICorner = Instance.new("UICorner")
UICorner.CornerRadius = UDim.new(0, 14)
UICorner.Parent = MainFrame

local UIStroke = Instance.new("UIStroke")
UIStroke.Color = Settings.AccentColor
UIStroke.Thickness = 1.5
UIStroke.Parent = MainFrame

local Header = Instance.new("TextLabel")
Header.Size = UDim2.new(1, -48, 0, 42)
Header.Position = UDim2.new(0, 16, 0, 0)
Header.BackgroundTransparency = 1
Header.Text = "ZeroHub Luau Learning Sandbox"
Header.TextColor3 = Color3.fromRGB(245, 245, 245)
Header.Font = Enum.Font.GothamBold
Header.TextSize = 14
Header.TextXAlignment = Enum.TextXAlignment.Left
Header.Parent = MainFrame

local CloseButton = Instance.new("TextButton")
CloseButton.Size = UDim2.new(0, 32, 0, 32)
CloseButton.Position = UDim2.new(1, -40, 0, 5)
CloseButton.BackgroundColor3 = Color3.fromRGB(39, 39, 42)
CloseButton.Text = "×"
CloseButton.TextColor3 = Color3.fromRGB(255, 255, 255)
CloseButton.Font = Enum.Font.GothamBold
CloseButton.TextSize = 18
CloseButton.Parent = MainFrame

local closeCorner = Instance.new("UICorner")
closeCorner.CornerRadius = UDim.new(0, 8)
closeCorner.Parent = CloseButton

track(CloseButton.MouseButton1Click:Connect(function()
    cleanup()
    ScreenGui:Destroy()
end))

local Scroll = Instance.new("ScrollingFrame")
Scroll.Size = UDim2.new(1, -32, 1, -58)
Scroll.Position = UDim2.new(0, 16, 0, 48)
Scroll.BackgroundTransparency = 1
Scroll.BorderSizePixel = 0
Scroll.ScrollBarThickness = 5
Scroll.ScrollBarImageColor3 = Settings.AccentColor
Scroll.CanvasSize = UDim2.new(0, 0, 0, 0)
Scroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
Scroll.Parent = MainFrame

local Layout = Instance.new("UIListLayout")
Layout.SortOrder = Enum.SortOrder.LayoutOrder
Layout.Padding = UDim.new(0, 8)
Layout.Parent = Scroll

local function createRow(title, body)
    local Row = Instance.new("Frame")
    Row.Size = UDim2.new(1, -8, 0, 58)
    Row.BackgroundColor3 = Color3.fromRGB(24, 24, 27)
    Row.BorderSizePixel = 0
    Row.Parent = Scroll

    local RowCorner = Instance.new("UICorner")
    RowCorner.CornerRadius = UDim.new(0, 10)
    RowCorner.Parent = Row

    local Title = Instance.new("TextLabel")
    Title.Size = UDim2.new(1, -20, 0, 22)
    Title.Position = UDim2.new(0, 10, 0, 6)
    Title.BackgroundTransparency = 1
    Title.Text = title
    Title.TextColor3 = Settings.AccentColor
    Title.Font = Enum.Font.GothamBold
    Title.TextSize = 12
    Title.TextXAlignment = Enum.TextXAlignment.Left
    Title.Parent = Row

    local Body = Instance.new("TextLabel")
    Body.Size = UDim2.new(1, -20, 0, 24)
    Body.Position = UDim2.new(0, 10, 0, 28)
    Body.BackgroundTransparency = 1
    Body.Text = body
    Body.TextColor3 = Color3.fromRGB(212, 212, 216)
    Body.Font = Enum.Font.Gotham
    Body.TextSize = 10
    Body.TextWrapped = true
    Body.TextXAlignment = Enum.TextXAlignment.Left
    Body.Parent = Row
end

createRow("Button lifecycle", "MouseButton1Click updates state, then the UI reflects the new value.")
createRow("Scrolling frames", "AutomaticCanvasSize keeps large educational lists scrollable without manual sizing.")
createRow("Cleanup", "Connections are tracked and disconnected before destroying the ScreenGui.")
createRow("Preview settings", "Walk ${config.walkSpeed}, jump ${config.jumpPower}, and visual labels are displayed as local demo values only.")

local pulse = 0
track(RunService.Heartbeat:Connect(function(dt)
    pulse += dt
    UIStroke.Transparency = 0.15 + (math.sin(pulse * 2) + 1) * 0.15
end))
`;
}
