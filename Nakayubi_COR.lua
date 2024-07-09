-------------------------------------------------------------------------------------------------------------------
-- Setup functions for this job.  Generally should not be modified.
-------------------------------------------------------------------------------------------------------------------

--[[
    gs c toggle LuzafRing -- Toggles use of Luzaf Ring on and off
    
    Offense mode is melee or ranged.  Used ranged offense mode if you are engaged
    for ranged weaponskills, but not actually meleeing.
    
    Weaponskill mode, if set to 'Normal', is handled separately for melee and ranged weaponskills.
--]]


-- Initialization function for this job file.
function get_sets()
    mote_include_version = 2
    
    -- Load and initialize the include file.
    include('Mote-Include.lua')
end

-- Setup vars that are user-independent.  state.Buff vars initialized here will automatically be tracked.
function job_setup()
    -- Whether to use Luzaf's Ring
    state.LuzafRing = M(false, "Luzaf's Ring")
    -- Whether a warning has been given for low ammo
    state.warned = M(false)

    define_roll_values()
end

include('organizer-lib')
-------------------------------------------------------------------------------------------------------------------
-- User setup functions for this job.  Recommend that these be overridden in a sidecar file.
-------------------------------------------------------------------------------------------------------------------

-- Setup vars that are user-dependent.  Can override this function in a sidecar file.
function user_setup()
    state.OffenseMode:options('Savage', 'DP', 'Aeolian', 'Fomal')
    state.RangedMode:options('Normal', 'Acc')
    state.WeaponskillMode:options('Normal', 'Acc', 'Att', 'Mod')
    state.CastingMode:options('Normal', 'Resistant')
    state.IdleMode:options('Normal', 'PDT', 'Refresh')

    gear.RAbullet = "Chrono Bullet"
    gear.WSbullet = "Chrono Bullet"
    gear.MAbullet = "Living Bullet"
    gear.QDbullet = "Hauksbok Bullet"
    options.ammo_warning_limit = 15

    -- Additional local binds
    send_command('bind ^` input /ja "Double-up" <me>')
    send_command('bind !` input /ja "Bolter\'s Roll" <me>')

    select_default_macro_book()
end


-- Called when this job file is unloaded (eg: job change)
function user_unload()
    send_command('unbind ^`')
    send_command('unbind !`')
end

-- Define sets and vars used by this job file.
function init_gear_sets()
    --------------------------------------
    -- Start defining the sets
    --------------------------------------
    
    -- Precast Sets

    -- Precast sets to enhance JAs
	
	
	Rostam = {}
	Rostam.RangeTP = {name="Rostam", augments={'Path: A',}}
    Rostam.Rolls ={ name="Rostam", augments={'Path: C',}}
	
	CamulusCape = {}
	CamulusCape.WS = { name="Camulus's Mantle", augments={'STR+20','Accuracy+20 Attack+20','STR+2','Weapon skill damage +10%',}}
    CamulusCape.RA = { name="Camulus's Mantle", augments={'AGI+20','Rng.Acc.+20 Rng.Atk.+20','Rng.Atk.+10','"Store TP"+10',}}
    CamulusCape.MAB = { name="Camulus's Mantle", augments={'AGI+20','Mag. Acc+20 /Mag. Dmg.+20','Weapon skill damage +9%',}}
    CamulusCape.TP = { name="Camulus's Mantle", augments={'DEX+19','Accuracy+20 Attack+20','Accuracy+10','"Dual Wield"+10','Phys. dmg. taken-10%',}}
	
    sets.precast.JA['Triple Shot'] = {body="Chasseur's Frac +2"}
	sets.precast.JA['Snake Eye'] = {legs="Lanun Trews +3"}
    sets.precast.JA['Wild Card'] = {feet="Lanun Bottes +3"}
    sets.precast.JA['Random Deal'] = {body="Lanun Frac +3"}
	sets.precast.JA['Fold'] = {body="Lanun Gants +3"}

    
    sets.precast.CorsairRoll = {main=Rostam.Rolls,range={ name="Compensator", augments={'DMG:+15','Rng.Atk.+15','"Mag.Atk.Bns."+15',}},ammo="Living Bullet",
		head="Lanun Tricorne +3",neck="Elite royal collar",ear1="Enervating earring",ear2="Crep. Earring",
		body="Chasseur's Frac +2",hands="Chasseur's Gants +2",ring1="Defending Ring",ring2="Barataria Ring",
		back=CamulusCape.TP,waist="Platinum moogle belt",legs="Chasseur's Culottes +2",feet="Malignance Boots"}

    sets.precast.CorsairRoll["Caster's Roll"] = set_combine(sets.precast.CorsairRoll, {legs="Chasseur's Culottes +2"})
    sets.precast.CorsairRoll["Courser's Roll"] = set_combine(sets.precast.CorsairRoll, {feet="Chasseur's Bottes +2"})
    sets.precast.CorsairRoll["Blitzer's Roll"] = set_combine(sets.precast.CorsairRoll, {head="Chasseur's Tricorne +2"})
    sets.precast.CorsairRoll["Tactician's Roll"] = set_combine(sets.precast.CorsairRoll, {body="Chasseur's Frac +2"})
    sets.precast.CorsairRoll["Allies' Roll"] = set_combine(sets.precast.CorsairRoll, {hands="Chasseur's Bottes +2"})
    
    sets.precast.LuzafRing = {ring2="Luzaf's Ring"}
    sets.precast.FoldDoubleBust = {hands="Lanun Gants +3"}
    
    sets.precast.CorsairShot = {body='Mirke Wardecors'}
    

    -- Waltz set (chr and vit)
    sets.precast.Waltz = {
        head="Adhemar Bonnet +1"}
        
    -- Don't need any special gear for Healing Waltz.
    sets.precast.Waltz['Healing Waltz'] = {}

    -- Fast cast sets for spells
    
    sets.precast.FC = {head="Carmine Mask +1", --14
                        neck="Voltsurge Torque", --4
                        left_ear="Loquac. Earring", --2
                        ear2="Gifted Earring",
                        hands="Leyline Gloves", --5
                        ring1="Weatherspoon Ring", --5
                        ring2="Kishar Ring", --4
                        back="Swith Cape", --3
                        waist="Witful Belt", --3
                        feet="Carmine Greaves +1"} --7}

    --sets.precast.FC.Utsusemi = set_combine(sets.precast.FC, {neck="Magoraga Beads"})


    sets.precast.RA = {ammo="Chrono Bullet",head="Chasseur's Tricorne +2",
		neck="Commodore charm +2",
		body="Laksamana's Frac +2",hands="Carmine finger gauntlets +1",
		back="Navarch's mantle",waist="Impulse Belt",legs="Adhemar Kecks +1",feet="Meg. Jam. +1",}

       
    -- Weaponskill sets
    -- Default set for any weaponskill that isn't any more specifically defined
		sets.precast.WS = {head="Nyame Helm",neck="Light Gorget",ear1="Moonshade Earring",ear2="Crep. Earring",
		body="Laksamana's Frac +2",hands="Chasseur's Gants +2",ring1="Dingir Ring",ring2="Epaminondas's Ring",
		back=CamulusCape.RA,waist="Svelt. Gouriz +1",legs="Nyame flanchard",feet="Nyame Sollerets"}


    -- Specific weaponskill sets.  Uses the base set if an appropriate WSMod version isn't found.
    sets.precast.WS['Evisceration'] = set_combine(sets.precast.WS, {head="Adhemar Bonnet +1",neck="Soil Gorget",ear2="Brutal Earring",body="Laksamana's Frac +2",hands="Chasseur's Gants +2",ring1="Epaminondas's Ring",ring2="Ephramad's ring",
	back=CamulusCape.WS,waist="Soil Gorget",feet="Nyame Sollerets"})
	
	sets.precast.WS['Savage Blade'] = set_combine(sets.precast.WS, {head="Nyame helm",neck="Republican platinum medal",ear1="Odr earring",ear2="Moonshade Earring",body="Nyame Mail",hands="Adhemar wristbands +1",ring1="Ephramad's Ring",ring2="Sroda Ring",legs="Nyame flanchard",back=CamulusCape.WS,waist="Sailfi belt +1",feet="Nyame Sollerets"})

    sets.precast.WS['Exenterator'] = set_combine(sets.precast.WS, {head="Adhemar Bonnet +1",neck="Soil Gorget",ear2="Brutal Earring",body="Laksamana's Frac +2",hands="Chasseur's Gants +2",ring1="Epona's Ring",
	back=CamulusCape.WS,waist="Soil Gorget",feet="Nyame Sollerets"})

    sets.precast.WS['Requiescat'] = set_combine(sets.precast.WS, {head="Adhemar Bonnet +1",neck="Soil Gorget",ear2="Brutal Earring",body="Laksamana's Frac +2",hands="Chasseur's Gants +2",ring1="Epona's Ring",
	back=CamulusCape.WS,waist="Soil Gorget",feet="Lanun Bottes +3"})

    sets.precast.WS['Last Stand'] = {ammo="Chrono Bullet",
		head="Ikenga's hat",neck="Light Gorget",ear1="Moonshade Earring",ear2="Ishvara Earring",
		body="Nyame Mail",hands="Chasseur's Gants +2",ring1="Dingir Ring",ring2="Epaminondas's Ring",
		back=CamulusCape.RA,waist="Light Belt",legs="Lanun trews +3",feet="Nyame Sollerets"}

    sets.precast.WS['Last Stand'].Acc = {ammo="Chrono Bullet",
		head="Lanun tricorne +3",neck="Light Gorget",ear1="Moonshade Earring",ear2="Ishvara Earring",
		body="Nyame Mail",hands="Chasseur's Gants +2",ring1="Ephramad's Ring",ring2="Epaminondas's Ring",
		back=CamulusCape.RA,waist="Svelt. Gouriz +1",legs="Lanun trews +3",feet="Nyame Sollerets"}

	sets.precast.WS['Aeolian Edge'] = {ammo="Hauksbok Bullet",
		head="Nyame Helm",neck="Sibyl scarf",ear1="Moonshade Earring",ear2="Friomisi Earring",
		body="Lanun Frac +3",hands="Nyame gauntlets",ring1="Epaminondas's Ring",ring2="Metamorph ring +1",
		back=CamulusCape.MAB,waist="Orpheus's sash",legs="Nyame flanchard",feet="Lanun Bottes +3"}

    sets.precast.WS['Wildfire'] = {ammo="Living Bullet",
		head="Nyame Helm",neck="Commodore charm +2",ear1="Hecate's Earring",ear2="Friomisi Earring",
		body="Lanun Frac +3",hands="Nyame gauntlets",ring1="Epaminondas's Ring",ring2="Dingir Ring",
		back=CamulusCape.MAB,waist="Skrymir cord",legs="Nyame flanchard",feet="Lanun Bottes +3"}


		sets.precast.WS['Leaden Salute'] = {ammo="Living Bullet",
		head="Pixie Hairpin +1",neck="Commodore charm +2",ear1="Moonshade Earring",ear2="Friomisi Earring",
		body="Lanun Frac +3",hands="Nyame gauntlets",ring1="Dingir Ring",ring2="Epaminondas's Ring",
		back=CamulusCape.MAB,waist="Orpheus's sash",legs="Nyame flanchard",feet="Lanun Bottes +3"}
		
	sets.precast.WS['Hot Shot'] = {ammo="Living Bullet",
		head="Nyame Helm",neck="Light Gorget",ear1="Hecate's Earring",ear2="Friomisi Earring",
		body="Nyame Mail",hands="Chasseur's Gants +2",ring1="Epaminondas's Ring",ring2="Dingir ring",
		back=CamulusCape.RA,waist="Orpheus's sash",legs="Nyame flanchard",feet="Lanun Bottes +3"}
    
    
    -- Midcast Sets
	
    sets.midcast.FastRecast = {
        head="Adhemar Bonnet +1",
        body="Nyame mail"}
        
    -- Specific spells
    sets.midcast.Utsusemi = sets.midcast.FastRecast

    sets.midcast.CorsairShot = {ammo="Hauksbok Bullet",
		head="Nyame Helm",neck="Commodore charm +2",ear1="Friomisi Earring",ear2="Dedition Earring",
		body="Lanun Frac +3",hands="Carmine finger gauntlets +1",ring1="Dingir Ring",ring2="Fenrir Ring +1",
		back=CamulusCape.MAB,waist="Skrymir cord",legs="Nyame flanchard",feet="Lanun Bottes +3"}

    sets.midcast.CorsairShot.Acc = {ammo="Animikii Bullet",
		head="Chasseur's tricorne +2",neck="Commodore charm +2",ear1="Chasseur's Earring",ear2="Crep. Earring",
		body="Chasseur's Frac +2",hands="Nyame gauntlets",ring1="Metamorph Ring +1",ring2="Weatherspoon Ring",
		back=CamulusCape.MAB,waist="Kwahu kachina belt +1",legs="Ikenga's trousers",feet="Malignance boots"}

    sets.midcast.CorsairShot['Light Shot'] = {ammo="Animikii Bullet",
		head="Chasseur's tricorne +2",neck="Commodore charm +2",ear1="Chasseur's Earring",ear2="Crep. Earring",
		body="Chasseur's Frac +2",hands="Nyame gauntlets",ring1="Metamorph Ring +1",ring2="Weatherspoon Ring",
		back=CamulusCape.MAB,waist="Kwahu kachina belt +1",legs="Ikenga's trousers",feet="Malignance boots"}

    sets.midcast.CorsairShot['Dark Shot'] = sets.midcast.CorsairShot['Light Shot']


    -- Ranged gear
    sets.midcast.RA = {ammo="Chrono bullet",
		head="Ikenga's hat",neck="Ocachi gorget",ear1="Telos Earring",ear2="Crep. Earring",
		body="Ikenga's vest",hands="Chasseur's Gants +2",ring1="Dingir Ring",ring2="Ephramad's Ring",
		back=CamulusCape.RA,waist="Elanid Belt",legs="Lanun trews +3",feet="Ikenga's clogs"}

    sets.midcast.RA.Acc = {ammo="Chrono bullet",
		head="Ikenga's hat",neck="Ocachi gorget",ear1="Telos Earring",ear2="Crep. Earring",
		body="Ikenga's vest",hands="Chasseur's Gants +2",ring1="Dingir Ring",ring2="Ephramad's Ring",
		back=CamulusCape.RA,waist="Elanid Belt",legs="Lanun trews +3",feet="Ikenga's clogs"}

    
    -- Sets to return to when not performing an action.
    
    -- Resting sets
    sets.resting = {neck="Elite royal collar"}
    

    -- Idle sets
    sets.idle = {ammo="Living Bullet",
		head="Malignance Chapeau",neck="Elite royal collar",ear1="Genmei Earring",ear2="Crep. Earring",
		body="Malignance tabard",hands="Nyame gauntlets",ring1="Defending Ring",ring2="Barataria Ring",
		back=CamulusCape.TP,waist="Platinum moogle belt",legs="Carmine Cuisses +1",feet="Malignance Boots"}

    sets.idle.Town = {range="Death Penalty",ammo="Living Bullet",
		head="Malignance Chapeau",neck="Elite royal collar",ear1="Genmei Earring",ear2="Crep. Earring",
		body="Malignance tabard",hands="Nyame gauntlets",ring1="Defending Ring",ring2="Barataria Ring",
		back=CamulusCape.TP,waist="Platinum moogle belt",legs="Carmine Cuisses +1",feet="Malignance Boots"}
    
    -- Defense sets
    sets.defense.PDT = {ammo="Living Bullet",
		head="Malignance Chapeau",neck="Elite royal collar",ear1="Telos Earring",ear2="Crep. Earring",
		body="Malignance tabard",hands="Nyame gauntlets",ring1="Defending Ring",ring2="Barataria Ring",
		back=CamulusCape.TP,waist="Platinum moogle belt",legs="Carmine Cuisses +1",feet="Malignance Boots"}

    sets.defense.MDT = {ammo="Living Bullet",
		head="Malignance Chapeau",neck="Elite royal collar",ear1="Telos Earring",ear2="Crep. Earring",
		body="Malignance tabard",hands="Nyame gauntlets",ring1="Defending Ring",ring2="Barataria Ring",
		back=CamulusCape.TP,waist="Platinum moogle belt",legs="Carmine Cuisses +1",feet="Malignance Boots"}
    

    sets.Kiting = {feet="Carmine Cuisses +1"}

    -- Engaged sets

    -- Variations for TP weapon and (optional) offense/defense modes.  Code will fall back on previous
    -- sets if more refined versions aren't defined.
    -- If you create a set with both offense and defense modes, the offense mode should be first.
    -- EG: sets.engaged.Dagger.Accuracy.Evasion
    
    -- Normal melee group
    sets.engaged.Savage = {main="Naegling",range="Anarchy +2",
		head="Malignance Chapeau",neck="Asperity Necklace",ear1="Suppanomimi",ear2="Dedition earring",
		body="Malignance tabard",hands="Nyame gauntlets",ring1="Petrov Ring",ring2="Epona's Ring",
		back=CamulusCape.TP,waist="Shetal Stone",legs="Malignance tights",feet="Malignance boots"}
    
    sets.engaged.Aeolian = {main=Rostam.RangeTP,range="Anarchy +2",ammo="Living Bullet",
		head="Malignance Chapeau",neck="Asperity Necklace",ear1="Telos Earring",ear2="Suppanomimi",
		body="Malignance tabard",hands="Nyame gauntlets",ring1="Petrov Ring",ring2="Epona's Ring",back=CamulusCape.TP,waist="Shetal Stone",legs="Malignance tights",feet="Malignance boots"}

    sets.engaged.Savage.DW = {main="Naegling",range="Anarchy +2",ammo="Living Bullet",
		head="Malignance Chapeau",neck="Asperity Necklace",ear1="Telos Earring",ear2="Suppanomimi",
		body="Malignance tabard",hands="Nyame gauntlets",ring1="Petrov Ring",ring2="Epona's Ring",
		back=CamulusCape.TP,waist="Shetal Stone",legs="Malignance tights",feet="Malignance boots"}
    
    sets.engaged.Aeolian.DW = {main=Rostam.RangeTP,range="Anarchy +2",ammo="Living Bullet",
		head="Malignance Chapeau",neck="Asperity Necklace",ear1="Telos Earring",ear2="Suppanomimi",
		body="Malignance tabard",hands="Nyame gauntlets",ring1="Petrov Ring",ring2="Epona's Ring",
		back=CamulusCape.TP,waist="Shetal Stone",legs="Malignance tights",feet="Malignance boots"}

    sets.engaged.DP = {main=Rostam.RangeTP,range="Death Penalty",ammo="Living Bullet",
		head="Malignance Chapeau",neck="Asperity Necklace",ear1="Telos Earring",ear2="Suppanomimi",
		body="Malignance tabard",hands="Nyame gauntlets",ring1="Petrov Ring",ring2="Epona's Ring",
		back=CamulusCape.TP,waist="Shetal Stone",legs="Malignance tights",feet="Malignance boots"}
		
	 sets.engaged.Fomal = {main=Rostam.RangeTP,range="Fomalhaut",ammo="Chrono Bullet",
		head="Malignance Chapeau",neck="Asperity Necklace",ear1="Telos Earring",ear2="Suppanomimi",
		body="Malignance tabard",hands="Nyame gauntlets",ring1="Petrov Ring",ring2="Epona's Ring",
		back=CamulusCape.TP,waist="Shetal Stone",legs="Malignance tights",feet="Malignance boots"}
end

-------------------------------------------------------------------------------------------------------------------
-- Job-specific hooks for standard casting events.
-------------------------------------------------------------------------------------------------------------------

-- Set eventArgs.handled to true if we don't want any automatic gear equipping to be done.
-- Set eventArgs.useMidcastGear to true if we want midcast gear equipped on precast.
function job_precast(spell, action, spellMap, eventArgs)
    -- Check that proper ammo is available if we're using ranged attacks or similar.
    if spell.action_type == 'Ranged Attack' or spell.type == 'WeaponSkill' or spell.type == 'CorsairShot' then
        do_bullet_checks(spell, spellMap, eventArgs)
    end
	
	if spell.english == "Leaden Salute" and spell.target.distance < 7 then equipSet = set_combine(sets.precast.WS['Leaden Salute'], {waist = "Orpheus's Sash"})
	elseif spell.english == "Leaden Salute" and (world.weather_element == "Dark" or world.day_element == "Dark") then add_to_chat(125, "weather mode") equipSet = set_combine(sets.precast.WS['Leaden Salute'], {waist = "Hachirin-no-Obi"})
	end
	
	if spell.english == "Wildfire" and spell.target.distance < 7 then equipSet = set_combine(sets.precast.WS['Wildfire'], {waist = "Orpheus's Sash"})
	elseif spell.english == "Wildfire" and (world.weather_element == "Fire" or world.day_element == "Fire") then add_to_chat(125, "weather mode") equipSet = set_combine(sets.precast.WS['Wildfire'], {waist = "Hachirin-no-Obi"})
	end
	
	if spell.english == "Aeolian Edge" and spell.target.distance < 7 then equipSet = set_combine(sets.precast.WS['Aeolian Edge'], {waist = "Orpheus's Sash"})
	elseif spell.english == "Aeolian Edge" and (world.weather_element == "Fire" or world.day_element == "Wind") then add_to_chat(125, "weather mode") equipSet = set_combine(sets.precast.WS['Aeolian Edge'], {waist = "Hachirin-no-Obi"})
	end

    -- gear sets
    if (spell.type == 'CorsairRoll' or spell.english == "Double-Up") and state.LuzafRing.value then
        equip(sets.precast.LuzafRing)
    elseif spell.type == 'CorsairShot' and state.CastingMode.value == 'Resistant' then
        classes.CustomClass = 'Acc'
    elseif spell.english == 'Fold' and buffactive['Bust'] == 2 then
        if sets.precast.FoldDoubleBust then
            equip(sets.precast.FoldDoubleBust)
            eventArgs.handled = true
        end
    end
end


-- Set eventArgs.handled to true if we don't want any automatic gear equipping to be done.
function job_aftercast(spell, action, spellMap, eventArgs)
    if spell.type == 'CorsairRoll' and not spell.interrupted then
        display_roll_info(spell)
    end
end

-------------------------------------------------------------------------------------------------------------------
-- User code that supplements standard library decisions.
-------------------------------------------------------------------------------------------------------------------

-- Return a customized weaponskill mode to use for weaponskill sets.
-- Don't return anything if you're not overriding the default value.
function get_custom_wsmode(spell, spellMap, default_wsmode)
    if buffactive['Transcendancy'] then
        return 'Brew'
    end
end


-- Called by the 'update' self-command, for common needs.
-- Set eventArgs.handled to true if we don't want automatic equipping of gear.
function job_update(cmdParams, eventArgs)
    if newStatus == 'Engaged' and player.equipment.main == 'Chatoyant Staff' then
        state.OffenseMode:set('Ranged')
    end
end


-- Set eventArgs.handled to true if we don't want the automatic display to be run.
function display_current_job_state(eventArgs)
    local msg = ''
    
    msg = msg .. 'Off.: '..state.OffenseMode.current
    msg = msg .. ', Rng.: '..state.RangedMode.current
    msg = msg .. ', WS.: '..state.WeaponskillMode.current
    msg = msg .. ', QD.: '..state.CastingMode.current

    if state.DefenseMode.value ~= 'None' then
        local defMode = state[state.DefenseMode.value ..'DefenseMode'].current
        msg = msg .. ', Defense: '..state.DefenseMode.value..' '..defMode
    end
    
    if state.Kiting.value then
        msg = msg .. ', Kiting'
    end
    
    if state.PCTargetMode.value ~= 'default' then
        msg = msg .. ', Target PC: '..state.PCTargetMode.value
    end

    if state.SelectNPCTargets.value then
        msg = msg .. ', Target NPCs'
    end

    msg = msg .. ', Roll Size: ' .. ((state.LuzafRing.value and 'Large') or 'Small')
    
    add_to_chat(122, msg)

    eventArgs.handled = true
end


-------------------------------------------------------------------------------------------------------------------
-- Utility functions specific to this job.
-------------------------------------------------------------------------------------------------------------------

function define_roll_values()
    rolls = {
        ["Corsair's Roll"]   = {lucky=5, unlucky=9, bonus="Experience Points"},
        ["Ninja Roll"]       = {lucky=4, unlucky=8, bonus="Evasion"},
        ["Hunter's Roll"]    = {lucky=4, unlucky=8, bonus="Accuracy"},
        ["Chaos Roll"]       = {lucky=4, unlucky=8, bonus="Attack"},
        ["Magus's Roll"]     = {lucky=2, unlucky=6, bonus="Magic Defense"},
        ["Healer's Roll"]    = {lucky=3, unlucky=7, bonus="Cure Potency Received"},
        ["Puppet Roll"]      = {lucky=4, unlucky=8, bonus="Pet Magic Accuracy/Attack"},
        ["Choral Roll"]      = {lucky=2, unlucky=6, bonus="Spell Interruption Rate"},
        ["Monk's Roll"]      = {lucky=3, unlucky=7, bonus="Subtle Blow"},
        ["Beast Roll"]       = {lucky=4, unlucky=8, bonus="Pet Attack"},
        ["Samurai Roll"]     = {lucky=2, unlucky=6, bonus="Store TP"},
        ["Evoker's Roll"]    = {lucky=5, unlucky=9, bonus="Refresh"},
        ["Rogue's Roll"]     = {lucky=5, unlucky=9, bonus="Critical Hit Rate"},
        ["Warlock's Roll"]   = {lucky=4, unlucky=8, bonus="Magic Accuracy"},
        ["Fighter's Roll"]   = {lucky=5, unlucky=9, bonus="Double Attack Rate"},
        ["Drachen Roll"]     = {lucky=3, unlucky=7, bonus="Pet Accuracy"},
        ["Gallant's Roll"]   = {lucky=3, unlucky=7, bonus="Defense"},
        ["Wizard's Roll"]    = {lucky=5, unlucky=9, bonus="Magic Attack"},
        ["Dancer's Roll"]    = {lucky=3, unlucky=7, bonus="Regen"},
        ["Scholar's Roll"]   = {lucky=2, unlucky=6, bonus="Conserve MP"},
        ["Bolter's Roll"]    = {lucky=3, unlucky=9, bonus="Movement Speed"},
        ["Caster's Roll"]    = {lucky=2, unlucky=7, bonus="Fast Cast"},
        ["Courser's Roll"]   = {lucky=3, unlucky=9, bonus="Snapshot"},
        ["Blitzer's Roll"]   = {lucky=4, unlucky=9, bonus="Attack Delay"},
        ["Tactician's Roll"] = {lucky=5, unlucky=8, bonus="Regain"},
        ["Allies's Roll"]    = {lucky=3, unlucky=10, bonus="Skillchain Damage"},
        ["Miser's Roll"]     = {lucky=5, unlucky=7, bonus="Save TP"},
        ["Companion's Roll"] = {lucky=2, unlucky=10, bonus="Pet Regain and Regen"},
        ["Avenger's Roll"]   = {lucky=4, unlucky=8, bonus="Counter Rate"},
    }
end

function display_roll_info(spell)
    rollinfo = rolls[spell.english]
    local rollsize = (state.LuzafRing.value and 'Large') or 'Small'

    if rollinfo then
        add_to_chat(104, spell.english..' provides a bonus to '..rollinfo.bonus..'.  Roll size: '..rollsize)
        add_to_chat(104, 'Lucky roll is '..tostring(rollinfo.lucky)..', Unlucky roll is '..tostring(rollinfo.unlucky)..'.')
    end
end


-- Determine whether we have sufficient ammo for the action being attempted.
function do_bullet_checks(spell, spellMap, eventArgs)
    local bullet_name
    local bullet_min_count = 1
    
    if spell.type == 'WeaponSkill' then
        if spell.skill == "Marksmanship" then
            if spell.element == 'None' then
                -- physical weaponskills
                bullet_name = gear.WSbullet
            else
                -- magical weaponskills
                bullet_name = gear.MAbullet
            end
        else
            -- Ignore non-ranged weaponskills
            return
        end
    elseif spell.type == 'CorsairShot' then
        bullet_name = gear.QDbullet
    elseif spell.action_type == 'Ranged Attack' then
        bullet_name = gear.RAbullet
        if buffactive['Triple Shot'] then
            bullet_min_count = 3
        end
    end
    
    local available_bullets = player.inventory[bullet_name] or player.wardrobe[bullet_name]
    
    -- If no ammo is available, give appropriate warning and end.
    if not available_bullets then
        if spell.type == 'CorsairShot' and player.equipment.ammo ~= 'empty' then
            add_to_chat(104, 'No Quick Draw ammo left.  Using what\'s currently equipped ('..player.equipment.ammo..').')
            return
        elseif spell.type == 'WeaponSkill' and player.equipment.ammo == gear.RAbullet then
            add_to_chat(104, 'No weaponskill ammo left.  Using what\'s currently equipped (standard ranged bullets: '..player.equipment.ammo..').')
            return
        else
            add_to_chat(104, 'No ammo ('..tostring(bullet_name)..') available for that action.')
            eventArgs.cancel = true
            return
        end
    end
	if buffactive['Triple Shot'] then
				equipSet = set_combine(sets.midcast.RA,{body="Chasseur's Frac +2",hands="Lanun gants +3",head="Oshosi Mask +1",legs="Osh. Trousers +1",feet="Osh. Leggings +1"})
			end
    
	if spell.type == 'CorsairShot' and player.inventory["Trump Card"] and player.inventory["Trump Card"].count < 10 then
        add_to_chat(104, 'Low on trump cards!')
	end


    -- Don't allow shooting or weaponskilling with ammo reserved for quick draw.
    if spell.type ~= 'CorsairShot' and bullet_name == gear.QDbullet and available_bullets.count <= bullet_min_count then
        add_to_chat(104, 'No ammo will be left for Quick Draw.  Cancelling.')
        eventArgs.cancel = true
        return
    end
    
    -- Low ammo warning.
    if spell.type ~= 'CorsairShot' and state.warned.value == false
        and available_bullets.count > 1 and available_bullets.count <= options.ammo_warning_limit then
        local msg = '*****  LOW AMMO WARNING: '..bullet_name..' *****'
        --local border = string.repeat("*", #msg)
        local border = ""
        for i = 1, #msg do
            border = border .. "*"
        end
        
        add_to_chat(104, border)
        add_to_chat(104, msg)
        add_to_chat(104, border)

        state.warned:set()
    elseif available_bullets.count > options.ammo_warning_limit and state.warned then
        state.warned:reset()
    end
end

-- Select default macro book on initial load or subjob change.
function select_default_macro_book()
    set_macro_page(1, 6)
end

