 -- *** Arnan Blue Mage Gearswap Lua File *** --

-- Things to ADD --
	-- AM1 overwrite
	-- new spells (other than mighty guard)
	-- Problem: AM timers dont work in Salvage 
	
--/console gs c C1 - Accuracy Toggle (4 levels of acc)
--/console gs c C17 - DW Toggle (Single Weapon, DW3 or DW4)
--/console gs c C2 - Locks Hybrid Set
--/console gs c C7 - Locks PDT Set
--/console gs c C15 - Locks MDT Set
--/console gs c C12 - Locks Kiting Set
--/console gs c C6 - Idle Set Toggle (Full or DT)

include('organizer-lib')
 
function get_sets()
        AccIndex = 1
        AccArray = {"LowACC","MidACC","HighACC","Learning","Hybrid"} -- 5 Levels Of Accuracy Sets For TP/WS. Default ACC Set Is LowACC. 
        WeaponIndex = 2
		WeaponArray = {"Single","DW3","DW4"} -- Amount of Dual Wield used for TP. Default is DW5 --
        IdleIndex = 1
        IdleArray = {"Full","DT"} -- Default Idle Set Is Full --
        Armor = 'None'
        target_distance = 6 -- Set Default Distance Here --
		Thaumas = 'OFF' -- Set Default Thaumas Coat ON or OFF Here --
        Cure_Spells = {"Cure","Cure II","Cure III","Cure IV"} -- Cure Degradation --
        Curaga_Spells = {"Curaga","Curaga II"} -- Curaga Degradation --
        send_command('input /macro book 1;wait .1;input /macro set 1') -- Change Default Macro Book Here --
		send_command('input /echo [<me> <job>]')
 
        sc_map = {SC1="ChantduCygne", SC2="Berserk", SC3="HeadButt"} -- 3 Additional Binds. Can Change Whatever JA/WS/Spells You Like Here. Remember Not To Use Spaces. --
		
		 RosmertaCape = {}
		RosmertaCape.MAB ={ augments={'INT+20','Mag. Acc+20 /Mag. Dmg.+20','INT+10','"Mag.Atk.Bns."+10','Spell interruption rate down-10%',}}
		RosmertaCape.WS = { name="Rosmerta's Cape", augments={'STR+20','Accuracy+20 Attack+20','STR+10','Weapon skill damage +10%',}}
		RosmertaCape.TP = { name="Rosmerta's Cape", augments={'DEX+20','Accuracy+20 Attack+20','"Store TP"+10','Phys. dmg. taken-10%',}}
		RosmertaCape.CDC = { name="Rosmerta's Cape", augments={'DEX+20','Accuracy+20 Attack+20','DEX+10','Crit.hit rate+10',}}
	
		 HerculeanLegs = {}
    HerculeanLegs.CDC = { name = "Herculean trousers", augments = { 'Attack+22','Crit.hit rate+3','DEX+14', } }

        PhysicalBlueMagic = S{
                        'Asuran Claws','Bludgeon','Body Slam','Feather Storm','Mandibular Bite','Queasyshroom',
                        'Power Attack','Ram Charge','Saurian Slide','Screwdriver','Sickle Slash','Smite of Rage',
                        'Spinal Cleave','Spiral Spin','Sweeping Gouge','Terror Touch'}
 
        PhysicalBlueMagic_STR = S{
                        'Battle Dance','Bloodrake','Death Scissors','Dimensional Death','Empty Thrash',
                        'Quadrastrike','Uppercut','Tourbillion','Thrashing Assault','Vertical Cleave',
                        'Whirl of Rage'}
 
        PhysicalBlueMagic_DEX = S{
                        'Amorphic Spikes','Barbed Crescent','Claw Cyclone','Disseverment','Foot Kick',
                        'Frenetic Rip','Goblin Rush','Hysteric Barrage','Paralyzing Triad','Seedspray',
                        'Sinker Drill','Vanity Dive'}
 
        PhysicalBlueMagic_VIT = S{
                        'Cannonball','Delta Thrust','Glutinous Dart','Grand Slam','Quad. Continuum',
                        'Sprout Smack'}
 
        PhysicalBlueMagic_AGI = S{
                        'Benthic Typhoon','Helldive','Hydro Shot','Jet Stream','Pinecone Bomb','Wild Oats'}
				
		BlueMagic_PhysicalACC = S{
						'Heavy Strike'}
 
        MagicalBlueMagic = S{
                        'Acrid Stream','Anvil Lightning','Crashing Thunder','Charged Whisker','Droning Whirlwind','Firespit',
						'Foul Waters','Gates of Hades','Leafstorm','Molting Plumage','Nectarous Deluge','Polar Roar',
						'Regurgitation','Rending Deluge','Scouring Spate','Searing Tempest','Silent Storm','Spectral Floe',
						'Subduction','Tem. Upheaval','Thermal Pulse','Thunderbolt','Uproot','Water Bomb','Tearing Gust','Cesspool'}
						
		BlueMagic_Dark = S{
						'Atra. Libations','Blood Saber','Dark Orb','Death Ray','Eyes On Me',
						'Evryone. Grudge','Palling Salvo','Tenebral Crush'}
		
		BlueMagic_Light = S{
						'Blinding Fulgor','Diffusion Ray','Magic Hammer','Rail Cannon','Retinal Glare'}
		
		BlueMagic_Earth = S{
						'Embalming Earth','Entomb','Sandspin'}
 
        BlueMagic_Accuracy = S{
                        '1000 Needles','Absolute Terror','Auroral Drape','Awful Eye','Blank Gaze','Blistering Roar',
						'Blood Drain','Blood Saber','Chaotic Eye','Cimicine Discharge','Cold Wave','Digest','Corrosive Ooze',
						'Demoralizing Roar','Enervation','Filamented Hold','Frightful Roar',
                        'Geist Wall','Hecatomb Wave','Infrasonics','Light of Penance','Lowing','Mind Blast','Mortal Ray',
						'MP Drainkiss','Osmosis','Soporific','Sound Blast','Stinking Gas',
						'Sub-zero Smash','Triumphant Roar','Venom Shell','Voracious Trunk','Yawn','Cruel Joke'}
						
		BlueMagic_AccuracySpeed = S{
                       'Feather Tickle','Reaving Wind'}
					   
		BlueMagic_AccuracyDT = S{
                       'Sheep Song','Dream Flower',}
 
        BlueMagic_Breath = S{
                        'Bad Breath','Flying Hip Press','Final Sting','Frost Breath','Heat Breath','Magnetite Cloud',
						'Poison Breath','Radiant Breath','Self Destruct','Thunder Breath','Wind Breath'}
 
        BlueMagic_Buff = S{
                        'Carcharian Verve','Diamondhide','Metallic Body','Magic Barrier',"Occultation",
                        'Orcish Counterstance','Plasma Charge','Pyric Bulwark','Reactor Cool'}
                            
        BlueMagic_Healing = S{
                        'Healing Breeze','Magic Fruit','Plenilune Embrace','Pollen','Restoral','Wild Carrot'}
						
		BlueMagic_HPCure = S{
						'White Wind'}
 
        BlueMagic_Stun = S{
						'Blitzstrahl','Temporal Shift'}
		
		BlueMagic_PhysicalStun = S{
						'Frypan','Head Butt','Sudden Lunge','Tail slap','Whirl of Rage'}		
		
		BlueMagic_Emnity = S{
						'Actinic Burst','Exuviation','Fantod','Jettatura'}		
 
        BlueMagic_Diffusion = S{
                        'Amplification','Cocoon','Exuviation','Feather Barrier','Harden Shell','Memento Mori','Metallic Body',
                        'Mighty Guard','Plasma Charge','Reactor Cool','Refueling','Saline Coat','Warm-Up','Zephyr Mantle'}
 
        BlueMagic_Unbridled = S{
                        'Absolute Terror','Bilgestorm','Blistering Roar','Bloodrake','Carcharian Verve',
                        'Droning Whirlwind','Gates of Hades','Harden Shell','Mighty Guard','Pyric Bulwark',
                        'Thunderbolt','Tourbillion'}
						
		--------------------
        -- Idle/Town Sets --
		--------------------
        sets.Idle = {ammo="Aurgelmir orb",
			      head="Malignance chapeau",neck="Elite royal collar", ear1="Ethereal earring",ear2="Genmei Earring",
			      body="Hashishin Mintan +2",hands="Nyame Gauntlets",ring1="Defending Ring",ring2="Stikini ring +1",
			      back=RosmertaCape.TP,waist="Platinum moogle belt",legs="Carmine Cuisses +1",feet="Malignance Boots"}
        sets.Idle.Full = set_combine(sets.Idle,{})
        sets.Idle.DT = set_combine(sets.Idle,{
						neck="Elite royal collar",
						ear1="Ethereal Earring",
						hands="Gleti's Gauntlets",
						ring2="Stikini ring +1",
						feet="Malignance Boots"})
 
		-------------
		-- TP Sets --
		-------------
         sets.TP = {
				ammo="Coiste Bodhar",
				head="Malignance chapeau",
				neck="Mirage Stole +2",
				ear1="Dedition Earring",
				ear2="Suppanomimi",
				body="Malignance tabard",
				hands="Gleti's Gauntlets",
				ring1="Epona's Ring",
				ring2="Chirich Ring +1",
				back=RosmertaCape.TP,
				waist="Shetal Stone",
				legs="Malignance tights",
				feet="Malignance Boots"}
	
        sets.TP.MidACC = {ammo="Aurgelmir orb",
			    head="Malignance chapeau",neck="Mirage Stole +2", ear1="Telos Earring", ear2="Suppanomimi",
			    body={ name="Nyame Mail", augments={'Path: B',}},hands="Gleti's Gauntlets",ring1="Chirich Ring +1",ring2="Chirich Ring +1",
			    back=RosmertaCape.TP,legs="Malignance tights",feet="Malignance Boots"}
        sets.TP.HighACC = {ammo="Honed Tathlum",
			    head="Nyame helm",neck="Mirage Stole +2", ear1="Telos Earring", ear2="Brutal Earring",
			    body={ name="Nyame Mail", augments={'Path: B',}},hands="Gleti's Gauntlets",ring1="Chirich Ring +1",ring2="Chirich Ring +1",
			    back=RosmertaCape.TP,waist="Kentarch Belt", legs="Malignance tights",feet="Malignance Boots"}
		sets.TP.Learning = {ammo="Coiste Bodhar",
				head="Malignance chapeau",
				neck="Mirage Stole +2",
				ear1="Telos Earring",
				ear2="Suppanomimi",
				body="Hashishin Mintan +2",
				hands="Assimilator's Bazubands",
				ring1="Epona's Ring",
				ring2="Chirich Ring +1",
				back=RosmertaCape.TP,
				waist="Shetal Stone",
				legs="Malignance tights",
				feet="Malignance Boots"}
		
		sets.TP.Hybrid = {ammo="Aurgelmir orb",
			    head="Malignance chapeau",neck="Mirage Stole +2", ear1="Dedition Earring", ear2="Suppanomimi",
			    body="Malignance tabard",hands="Gleti's Gauntlets",ring1="Chirich ring +1",ring2="Defending Ring",
			    back=RosmertaCape.TP,waist="Shetal Stone",legs="Nyame Flanchard",feet="Malignance Boots"}

		---------------------------
        -- Single Weapon TP Sets --
		---------------------------
        sets.TP.Single = {ammo="Coiste Bodhar",
			    head="Malignance chapeau",neck="Mirage Stole +2", ear1="Dedition Earring", ear2="Suppanomimi",
			    body={ name="Nyame Mail", augments={'Path: B',}},hands="Gleti's Gauntlets",ring1="Epona's ring",{name="Chirich Ring +1", bag="wardrobe2"},
			    back=RosmertaCape.TP,waist="Shetal Stone",legs="Nyame Flanchard",feet="Malignance Boots"}
        sets.TP.Single.MidACC = set_combine(sets.TP.Single,{
                        ammo="Honed Tathlum",
                        back=RosmertaCape.TP})
        sets.TP.Single.HighACC = set_combine(sets.TP.Single.MidACC,{
                        waist="Kentarch Belt",
                        neck="Mirage Stole +2",back=RosmertaCape.TP})
		sets.TP.Single.MaxACC = set_combine(sets.TP.Single.HighACC,{                        
						ear1="Cessance Earring",
                        back=RosmertaCape.TP,
						waist="Kentarch Belt",})

        -- Single Weapon Capped Magic Haste Sets --
        sets.TP.Single.HighHaste = set_combine(sets.TP.Single,{})
        sets.TP.Single.MidACC.HighHaste = set_combine(sets.TP.Single.MidACC,{})
        sets.TP.Single.HighACC.HighHaste = set_combine(sets.TP.Single.HighACC,{})
		sets.TP.Single.MaxACC.HighHaste = set_combine(sets.TP.Single.MaxACC,{})
 
		-- Single Weapon AM3 Sets --
        sets.TP.Single.AM3 = set_combine(sets.TP.Single,{})
        sets.TP.Single.MidACC.AM3 = set_combine(sets.TP.Single.MidACC,{})
        sets.TP.Single.HighACC.AM3 = set_combine(sets.TP.Single.HighACC,{})
		sets.TP.Single.MaxACC.AM3 = set_combine(sets.TP.Single.MaxACC,{})
		
        -- Single Weapon AM3 Capped Magic Haste Sets --
        sets.TP.Single.HighHaste.AM3 = set_combine(sets.TP.Single,{})
        sets.TP.Single.MidACC.HighHaste.AM3 = set_combine(sets.TP.Single.MidACC,{})
        sets.TP.Single.HighACC.HighHaste.AM3 = set_combine(sets.TP.Single.HighACC,{})
		sets.TP.Single.MaxACC.HighHaste.AM3 = set_combine(sets.TP.Single.MaxACC,{})
 
		----------------------------
        -- Dual Wield III TP Sets --
		----------------------------
		sets.TP.DW3 = set_combine(sets.TP,{})
        sets.TP.DW3.MidACC = set_combine(sets.TP.MidACC,{})
        sets.TP.DW3.HighACC = set_combine(sets.TP.HighACC,{feet="Malignance Boots"})
		sets.TP.DW3.MaxACC = set_combine(sets.TP.Learning,{
                        ear2="Cessance Earring"})
 
        -- Dual Wield III Capped Magic Haste Sets --
        sets.TP.DW3.HighHaste =  set_combine(sets.TP,{feet="Malignance Boots", ear2="Suppanomimi",
                        waist="Shetal Stone"})
        sets.TP.DW3.MidACC.HighHaste =  set_combine(sets.TP.MidACC,{feet="Malignance Boots",
                        ear2="Telos Earring"})
        sets.TP.DW3.HighACC.HighHaste =  set_combine(sets.TP.HighACC,{feet="Malignance Boots",
                        ear2="Cessance Earring",
                        waist="Kentarch Belt"})
		sets.TP.DW3.MaxACC.HighHaste =  set_combine(sets.TP.Learning,{feet="Malignance Boots",
                        ear2="Cessance Earring",
                        waist="Kentarch Belt"})
                        	
		-- Dual Wield III AM3 Sets --
        sets.TP.DW3.AM3 = set_combine(sets.TP,{ammo="Aurgelmir orb",back=RosmertaCape.TP,ring1={name="Chirich Ring +1", bag="wardrobe1"}, ring2={name="Chirich Ring +1", bag="wardrobe2"},
						neck="Mirage Stole +2"})
        sets.TP.DW3.MidACC.AM3 = set_combine(sets.TP.MidACC,{back=RosmertaCape.TP,
						neck="Mirage Stole +2",
						ear2="Suppanomimi",
						ear1="Telos Earring"})
        sets.TP.DW3.HighACC.AM3 = set_combine(sets.TP.HighACC,{back=RosmertaCape.TP,
						ear2="Suppanomimi",
						ear1="Telos Earring"})
		sets.TP.DW3.MaxACC.AM3 = set_combine(sets.TP.Learning,{
                        ear2="Cessance Earring"})
 
        -- Dual Wield III AM3 Capped Magic Haste Sets --
        sets.TP.DW3.HighHaste.AM3 =  set_combine(sets.TP,{ammo="Aurgelmir orb", ring1={name="Chirich Ring +1", bag="wardrobe1"}, ring2={name="Chirich Ring +1", bag="wardrobe2"},
                        back=RosmertaCape.TP,
						neck="Mirage Stole +2"})
        sets.TP.DW3.MidACC.HighHaste.AM3 = set_combine(sets.TP.MidACC,{
                        back=RosmertaCape.TP,
						ear2="Suppanomimi",
						ear1="Telos Earring"})
        sets.TP.DW3.HighACC.HighHaste.AM3 = set_combine(sets.TP.HighACC,{
                        back=RosmertaCape.TP,
						ear2="Suppanomimi",
						ear1="Telos Earring"})
		sets.TP.DW3.MaxACC.HighHaste.AM3 = set_combine(sets.TP.Learning,{
                        ear2="Cessance Earring",
                        waist="Kentarch Belt",
						back=RosmertaCape.TP})
								
		---------------------------
        -- Dual Wield IV TP Sets --
		---------------------------
        sets.TP.DW4 = set_combine(sets.TP,{ear2="Cessance earring", ring2={name="Chirich Ring +1", bag="wardrobe2"}, waist="Sailfi Belt +1"})
        sets.TP.DW4.MidACC = set_combine(sets.TP.MidACC,{})
        sets.TP.DW4.HighACC = set_combine(sets.TP.HighACC,{})
		sets.TP.DW4.MaxACC = set_combine(sets.TP.Learning,{})
 
        -- Dual Wield IV Capped Magic Haste Sets --
        sets.TP.DW4.HighHaste =  set_combine(sets.TP,{})
        sets.TP.DW4.MidACC.HighHaste =  set_combine(sets.TP.MidACC,{})
        sets.TP.DW4.HighACC.HighHaste =  set_combine(sets.TP.HighACC,{})
		sets.TP.DW4.MaxACC.HighHaste =  set_combine(sets.TP.Learning,{})

		-- Dual Wield IV AM3 Sets --
        sets.TP.DW4.AM3 = set_combine(sets.TP,{ear2="Cessance earring", ring2={name="Chirich Ring +1", bag="wardrobe2"}, waist="Sailfi Belt +1"})
        sets.TP.DW4.MidACC.AM3 = set_combine(sets.TP.MidACC,{
						waist="Sailfi Belt +1"})
        sets.TP.DW4.HighACC.AM3 = set_combine(sets.TP.HighACC,{
						waist="Sailfi Belt +1"})
		sets.TP.DW4.MaxACC.AM3 = set_combine(sets.TP.Learning,{
                        ear2="Cessance Earring",
						waist="Kentarch Belt"})
 
        -- Dual Wield IV AM3 Capped Magic Haste Sets --
        sets.TP.DW4.HighHaste.AM3 =  set_combine(sets.TP,{ammo="Aurgelmir orb", ear2="Dedition earring", ring1={name="Chirich Ring +1", bag="wardrobe1"}, ring2={name="Chirich Ring +1", bag="wardrobe2"}, waist="Sailfi Belt +1"})
        sets.TP.DW4.MidACC.HighHaste.AM3 = set_combine(sets.TP.MidACC,{})
        sets.TP.DW4.HighACC.HighHaste.AM3 = set_combine(sets.TP.HighACC,{})
		sets.TP.DW4.MaxACC.HighHaste.AM3 = set_combine(sets.TP.Learning,{
                        ear1="Telos Earring",
                        ear2="Cessance Earring",
                        waist="Kentarch Belt"})
 
		-----------------------
		-- Damage Taken Sets --
		-----------------------
		
        -- PDT Set --
        sets.PDT = {ammo="Aurgelmir orb",
			    head="Nyame helm",neck="Elite royal collar", ear1="Ethereal Earring", ear2="Genmei Earring",
				body="Hashishin Mintan +2",hands="Gleti's Gauntlets",ring1="Defending ring",ring2="Stikini ring +1",
			    back=RosmertaCape.TP,waist="Platinum moogle belt",legs="Nyame Flanchard",feet="Malignance Boots"}
 
		-- MDT Set --
        sets.MDT = set_combine(sets.PDT,{
						head="Malignance chapeau",
						hands="Telchine Gloves",
						Ring2="Defending Ring",
						legs="Telchine Braconi",
						feet="Malignance Boots"})
 
        -- Hybrid Sets --
        sets.TP.Hybrid = set_combine(sets.PDT,{
						ammo="Aurgelmir orb",
						ear1="Suppanomimi",
						ear2="Brutal Earring",
						hands="Gleti's Gauntlets",
						legs="Malignance tights"})
        sets.TP.Hybrid.MidACC = set_combine(sets.TP.Hybrid,{
						ammo="Honed Tathlum",})
        sets.TP.Hybrid.HighACC = set_combine(sets.TP.Hybrid.MidACC,{
						hands="Gleti's Gauntlets",
						back=RosmertaCape.TP})
		sets.TP.Hybrid.MaxACC = set_combine(sets.TP.Hybrid.HighACC,{
						neck="Mirage Stole +2",})
						
        -- Hybrid High Haste Sets --
        sets.TP.Hybrid.HighHaste = set_combine(sets.PDT,{
						ammo="Aurgelmir orb",
						ear1="Suppanomimi",
						ear2="Brutal Earring",
						waist="Sailfi Belt +1",
						legs="Malignance tights"})
        sets.TP.Hybrid.MidACC.HighHaste = set_combine(sets.TP.Hybrid.HighHaste,{
						ammo="Honed Tathlum",
						ear2="Cessance Earring"})
        sets.TP.Hybrid.HighACC.HighHaste = set_combine(sets.TP.Hybrid.MidACC.HighHaste,{
						hands="Gleti's Gauntlets"})
		sets.TP.Hybrid.MaxACC.HighHaste = set_combine(sets.TP.Hybrid.HighACC.HighHaste,{
						waist="Kentarch Belt"})

		-- Kiting Set --
		sets.Kiting =  set_combine(sets.PDT,{
						legs="Carmine Cuisses +1"})
 
		-----------------------
		-- Weapon Skill Sets --
		-----------------------
 
        -- WS Base Sets --
        sets.WS = {ammo="Oshasha's treatise",
				  head="Hashishin Kavuk +3",neck="Mirage Stole +2",ear1="Ishvara Earring",ear2="Moonshade Earring",
                   body="Nyame Mail",hands="Jhakri Cuffs +2",ring1="Ephramad's Ring",ring2="Epaminondas's Ring",
				  back=RosmertaCape.WS,waist="Sailfi Belt +1",legs="Nyame flanchard",feet="Nyame Sollerets"}
		sets.WS.MidACC = {ammo="Honed Tathlum",
				  head="Hashishin Kavuk +3",neck="Mirage Stole +2",ear1="Ishvara Earring",ear2="Moonshade Earring",
                   body="Assimilator's Jubbah +3",hands="Gleti's Gauntlets",ring1="Epona's ring",ring2="Epaminondas's Ring",
				  back=RosmertaCape.WS,waist="Sailfi Belt +1",legs="Nyame flanchard",feet="Malignance Boots"}
		sets.WS.HighACC = {ammo="Honed Tathlum",
				  head="Hashishin Kavuk +3",neck="Mirage Stole +2",ear1="Ishvara Earring",ear2="Moonshade Earring",
                   body="Assimilator's Jubbah +3",hands="Gleti's Gauntlets",ring1="Epona's ring",ring2="Epaminondas's Ring",
				  back=RosmertaCape.WS,waist="Sailfi Belt +1",legs="Nyame flanchard",feet="Malignance Boots"}
		sets.WS.MaxACC = {ammo="Honed Tathlum",
				  head="Hashishin Kavuk +3",neck="Mirage Stole +2",ear1="Ishvara Earring",ear2="Moonshade Earring",
                   body="Assimilator's Jubbah +3",hands="Gleti's Gauntlets",ring1="Epona's ring",ring2="Epaminondas's Ring",
				  back=RosmertaCape.WS,waist="Sailfi Belt +1",legs="Nyame flanchard",feet="Malignance Boots"}
						
		-- Magic WS Base Set --
		sets.WS.MABWS = {ammo="Ghastly tathlum +1",
			         head="Jhakri coronal +2",neck="Mirage Stole +2",ear1="Hecate's earring",ear2="Friomisi Earring",
		                 body="Hashishin mintan +2",hands="Jhakri Cuffs +2",ring1="Shiva Ring +1",ring2="Strendu ring",
			         back=RosmertaCape.MAB,waist="Orpheus's Sash",legs="Luhlaza Shalwar +3",feet="Hashishin basmak +2"}
		
		-----------------------------
		-- Sword Weapon Skill Sets --
		-----------------------------
 
        -- Chant du Cygne Sets -- 
        sets.WS["Chant du Cygne"] = set_combine(sets.WS,{
						head="Adhemar bonnet +1",
						neck="Mirage Stole +2",
						body="Assimilator's Jubbah +3",
						hands="Gleti's gauntlets",
						ammo="Aurgelmir orb",
						legs=HerculeanLegs.CDC,
						ring1="Epona's ring",
                        ring2="Begrudging Ring",
						ear1="Odr Earring",
						ear2="Mache Earring +1",
						waist="Light Belt",
                        back=RosmertaCape.CDC})
        sets.WS["Chant du Cygne"].MidACC = set_combine(sets.WS.MidACC,{
						ammo="Aurgelmir orb",
						head="Nyame helm",
						neck="Mirage Stole +2",
						hands="Gleti's Gauntlets",
                        ring2="Begrudging Ring",
						legs=HerculeanLegs.CDC,
                        back=RosmertaCape.CDC})
        sets.WS["Chant du Cygne"].HighACC = set_combine(sets.WS.HighACC,{
                        ring1="Begrudging Ring",
						neck="Mirage Stole +2",
                        back=RosmertaCape.CDC,
						hands="Gleti's Gauntlets",
						ring2="Begrudging Ring",
						legs=HerculeanLegs.CDC,
						back=RosmertaCape.CDC,
						feet="Malignance Boots"})
        sets.WS["Chant du Cygne"].MaxACC = set_combine(sets.WS.MaxACC,{})
 
		-- Requiescat Sets --
        sets.WS.Requiescat = set_combine(sets.WS,{
                        ammo="Hydrocera",
                        head="Hashishin Kavuk +3",
						hands="Leyline Gloves",})
        sets.WS.Requiescat.MidACC = set_combine(sets.WS.MidACC,{
                        ammo="Hydrocera"})
        sets.WS.Requiescat.HighACC = set_combine(sets.WS.HighACC,{
})
        sets.WS.Requiescat.MaxACC = set_combine(sets.WS.MaxACC,{})
 
		-- Expiacion Sets --
        sets.WS.Expiacion = set_combine(sets.WS,{
						neck="Mirage Stole +2",
                        head="Hashishin Kavuk +3",
						body="Nyame Mail",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						legs="Luhlaza Shalwar +3",
						ear1="Ishvara earring",
						ear2="Moonshade earring",
						feet="Nyame Sollerets"})
        sets.WS.Expiacion.MidACC = set_combine(sets.WS.MidACC,{
                        head="Hashishin Kavuk +3",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						legs="Luhlaza Shalwar +3",
						feet="Nyame Sollerets"})
        sets.WS.Expiacion.HighACC = set_combine(sets.WS.HighACC,{
                        head="Hashishin Kavuk +3",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						legs="Luhlaza Shalwar +3",
						feet="Nyame Sollerets"})
		sets.WS.Expiacion.MaxACC = set_combine(sets.WS.MaxACC,{
                        head="Hashishin Kavuk +3",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						legs="Luhlaza Shalwar +3",
						feet="Nyame Sollerets"})
		
		-- Savage Blade Set --
		sets.WS["Savage Blade"] = set_combine(sets.WS,{
						neck="Mirage Stole +2",
                        head="Hashishin Kavuk +3",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						ring1="Sroda Ring",
						legs="Luhlaza Shalwar +3",
						feet="Nyame Sollerets"})
        sets.WS["Savage Blade"].MidACC = set_combine(sets.WS.MidACC,{
                        head="Hashishin Kavuk +3",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						legs="Luhlaza Shalwar +3",
						feet="Nyame Sollerets"})
        sets.WS["Savage Blade"].HighACC = set_combine(sets.WS.HighACC,{
                        head="Jhakri coronal +2",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						legs="Luhlaza Shalwar +3",
						feet="Nyame Sollerets"})
        sets.WS["Savage Blade"].MaxACC = set_combine(sets.WS.MaxACC,{
                        head="Jhakri coronal +2",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						legs="Luhlaza Shalwar +3",
						feet="Nyame Sollerets"})
						
		-- Seraph Blade Sets --
		sets.WS["Seraph Blade"] = set_combine(sets.WS,{						
						neck="Mirage Stole +2",
                        head="Hashishin Kavuk +3",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						legs="Luhlaza Shalwar +3",
						ring1="Weatherspoon Ring",
						feet="Nyame Sollerets"})
						
		-- Red Lotus Blade Sets --
		sets.WS["Red Lotus Blade"] = set_combine(sets.WS.MABWS,{neck="Mirage Stole +2",
                        head="Hashishin Kavuk +3",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						legs="Luhlaza Shalwar +3",
						feet="Nyame Sollerets"}
						)
		
        -- Vorpal Blade Sets --
        sets.WS["Vorpal Blade"] = set_combine(sets.WS,{
                        back=RosmertaCape.CDC})
        sets.WS["Vorpal Blade"].MidACC = set_combine(sets.WS.MidACC,{
                        back=RosmertaCape.CDC,
						feet="Malignance Boots"})
        sets.WS["Vorpal Blade"].HighACC = set_combine(sets.WS.HighACC,{
                        back=RosmertaCape.CDC,
						feet="Malignance Boots"})
        sets.WS["Vorpal Blade"].MaxACC = set_combine(sets.WS.MaxACC,{})
		
        -- Circle Blade Sets --
        sets.WS["Circle Blade"] = set_combine(sets.WS,{
                        head="Jhakri coronal +2"})
        sets.WS["Circle Blade"].MidACC = set_combine(sets.WS.MidACC,{
                        ear1="Telos Earring"})
        sets.WS["Circle Blade"].HighACC = set_combine(sets.WS.HighACC,{
                        ear1="Telos Earring"})
        sets.WS["Circle Blade"].MaxACC = set_combine(sets.WS.MaxACC,{})		
		
		-- Sanguine Blade Set --
		sets.WS["Sanguine Blade"] = set_combine(sets.WS.MABWS,{
                        back=RosmertaCape.MAB,
						head="Pixie Hairpin +1"}
						)
        sets.WS["Sanguine Blade"].MidACC = set_combine(sets.WS.MABWS,{
                       back=RosmertaCape.MAB,
						head="Pixie Hairpin +1"})
        sets.WS["Sanguine Blade"].HighACC = set_combine(sets.WS.MABWS,{
                       back=RosmertaCape.MAB,
						head="Pixie Hairpin +1"})
        sets.WS["Sanguine Blade"].MaxACC = set_combine(sets.WS.MABWS,{
                       back=RosmertaCape.MAB,
						head="Pixie Hairpin +1"})
		
		----------------------------
		-- Club Weapon Skill Sets --
		----------------------------
		
		-- Realmrazer Sets --
		sets.WS.Realmrazer = set_combine(sets.WS,{
                        ammo="Hydrocera",
                        head="Malignance chapeau",})
        sets.WS.Realmrazer.MaxACC = set_combine(sets.WS.MaxACC,{})

		-- Black Halo Sets --
        sets.WS["Black Halo"] = set_combine(sets.WS,{neck="Mirage Stole +2",
                        head="Hashishin Kavuk +3",
						neck="Mirage Stole +2",
						waist="Sailfi Belt +1",
						legs="Luhlaza Shalwar +3",
						feet="Nyame Sollerets"})
        sets.WS["Black Halo"].MidACC = set_combine(sets.WS.MidACC,{})
        sets.WS["Black Halo"].HighACC = set_combine(sets.WS.HighACC,{})
        sets.WS["Black Halo"].MaxACC = set_combine(sets.WS.MaxACC,{})
		
		-- Flash Nova Set --
		sets.WS["Flash Nova"] = set_combine(sets.WS.MABWS,{ring1="Etana Ring",ring2="Weatherspoon ring"})
        sets.WS["Flash Nova"].MidACC = set_combine(sets.WS.MABWS,{})
        sets.WS["Flash Nova"].HighACC = set_combine(sets.WS.MABWS,{})
        sets.WS["Flash Nova"].MaxACC = set_combine(sets.WS.MABWS,{})
        
		----------------------
		-- Job Ability Sets --
		----------------------
		
		-- Blue Mage JA Sets --
        sets.JA = {}
		sets.JA['Azure Lore'] = {hands="Luhlaza Bazubands"}
		sets['Chain Affinity'] = {head="Hashishin Kavuk +3",feet="Assim. Charuqs +2"}
		sets.Efflux = {legs="Hashishin Tayt +2"}
		sets['Burst Affinity'] = {feet="Hashishin Basmak +2"}
		--sets.Convergence = {head="Luh. Keffiyeh +1"}
		sets.Diffusion = {feet="Luhlaza Charuqs +3"}
        
		-- Enmity JA Set --
		sets.JA.Enmity = set_combine(sets.PDT,{})
		
		-- /WAR JA Sets --
        sets.JA.Provoke = set_combine(sets.JA.Enmity,{ammo="Perfect Lucky Egg",waist="Chaac belt"})
        sets.JA.Warcry = set_combine(sets.JA.Enmity,{})
		
		-- /PLD JA Sets --
        sets.JA["Shield Bash"] = set_combine(sets.JA.Enmity,{})
        sets.JA.Sentinel = set_combine(sets.JA.Enmity,{})
        sets.JA["Holy Circle"] = set_combine(sets.JA.Enmity,{})
		
		-- /DRK JA Sets --
		sets.JA.Souleater = set_combine(sets.JA.Enmity,{})
        sets.JA["Last Resort"] = set_combine(sets.JA.Enmity,{})
        sets.JA["Arcane Circle"] = set_combine(sets.JA.Enmity,{})
		
        -- /DNC JA Sets --
        sets.Waltz = {head="Nyame helm",
        body={ name="Nyame Mail", augments={'Path: B',}},hands="Leyline Gloves",legs="Luhlaza Shalwar +3"}
        sets.Step = {
						ammo="Hydrocera",
                        head="Malignance chapeau",
                        neck="Mirage Stole +2",
                        ear1="Brutal Earring",
						body="Hashishin Mintan +2",
                        hands="Leyline Gloves",
						waist="Chaac Belt",
						back="Cornflower Cape",
                        legs="Assimilator's shalwar +2",
                        feet="Hashishin Basmak +2"}
		sets.Flourish = set_combine(sets.Step,{})

		
		--------------------
        -- Pre-Cast Sets --
		-------------------- 
		
		-- Base Pre-Cast Set --
        sets.Precast = {
                        ammo="Impatiens",
                        head="Carmine Mask +1", --14
                        neck="Voltsurge Torque", --4
                        left_ear="Loquac. Earring", --2
                        ear2="Gifted Earring",
                        body="Luhlaza Jubbah +1", --7
                        hands="Leyline Gloves", --5
                        ring1="Weatherspoon Ring", --5
                        ring2="Kishar Ring", --4
                        back="Swith Cape", --3
                        waist="Witful Belt", --3
                        legs="Ayanmo Cosciales +1", --5
                        feet="Carmine Greaves +1"} --7
		
		-- Fast Cast Set --
        sets.Precast.FastCast = set_combine(sets.Precast,{})
						
		-- Pre-Cast Blue Magic --
		sets.Precast['Blue Magic'] = set_combine(sets.Precast,{body="Hashishin Mintan +2",hands="Hashishin Bazubands +2"})
						
        -- Pre-Cast Enhancing Magic --
        sets.Precast['Enhancing Magic'] = set_combine(sets.Precast,{waist="Siegel Sash"})
		
		-- Cure Precast Set --
        sets.Precast.Cure = set_combine(sets.Precast.FastCast,{})
 
		------------------------------------
		-- Mid-Cast Sets (Non-Blue Magic) --
		------------------------------------
 
        -- Mid-Cast Base Set --
        sets.Midcast = {
                        ammo="Staunch Tathlum",
                        head="Jhakri coronal +2",
                        neck="Voltsurge Torque",
                        ear1="Loquac. Earring",
                        ear2="Gifted Earring",
                        body="Luhlaza Jubbah +1",
                        hands="Leyline Gloves",
                        ring1="Etana Ring",
                        ring2="Kishar Ring",
                        back="Swith Cape",
                        waist="Witful Belt",
                        legs="Assimilator's shalwar +2",
                        feet="Carmine Greaves +1"}
 
        -- Magic Haste Set --
        sets.Midcast.Haste = set_combine(sets.Midcast,{})
						
		-- Magic Attack Bonus Set --
		sets.Midcast.MAB = {ammo="Ghastly Tathlum +1",
			      head="Hashishin Kavuk +3",neck="Sibyl scarf",ear1="Hecate's earring",ear2="Friomisi Earring",
			      body="Hashishin mintan +2",hands="Hashishin Bazubands +2",ring1="Shiva Ring +1",ring2="Metamorph Ring +1",
			      back=RosmertaCape.MAB,waist="Orpheus's Sash",legs="Luhlaza Shalwar +3",feet="Hashishin Basmak +2"}

		-- Magic Accuracy Set --
		sets.Midcast.MACC = {
						{ammo="Hydrocera",
			       head="Malignance chapeau",neck="Mirage Stole +2",ear2="Hashishin Earring",ear1="Crep. Earring",
                  body="Hashishin mintan +2",hands="Nyame gauntlets",ring1="Stikini ring +1",ring2="Metamorph Ring +1",
			      back=RosmertaCape.MAB,waist="Acuity Belt +1",legs="Hashishin Tayt +2",feet="Hashishin Basmak +2"}}
						
		-- Magic Enmity Set --
		sets.Midcast.MagicEnmity = set_combine(sets.Midcast,{})
		
        -- Enhancing Magic Base Set --
        sets.Midcast['Enhancing Magic'] = {
						neck="Mirage Stole +2",waist="Siegel Sash"}
		
		-- Elemental Magic Set --
		sets.Midcast['Elemental Magic'] = set_combine(sets.Midcast.MAB,{})

		-- Enfeebling Magic Set --
		sets.Midcast['Enfeebling Magic'] = set_combine(sets.Midcast.MACC,{
                        feet="Hashishin Basmak +2"})
		
		-- Dark Magic Set --
		sets.Midcast['Dark Magic'] = set_combine(sets.Midcast.MACC,{})
		
		-- Flash Set --
		sets.Midcast.Flash = set_combine(sets.Midcast.MagicEnmity,{ammo="Perfect Lucky Egg",waist="Chaac belt"})
		
		-- Repose Set --
		sets.Midcast.Repose = set_combine(sets.Midcast.MACC,{})
		
        -- Stoneskin Set --
        sets.Midcast.Stoneskin = set_combine(sets.Midcast['Enhancing Magic'])
						
		-- Enfeebling Ninjutsu Set --
		sets.Midcast.Enfeebling_Ninjutsu = set_combine(sets.Midcast.MACC,{})
		
        -- Elemental Ninjutsu Set --
        sets.Midcast.Elemental_Ninjutsu = set_combine(sets.Midcast.MAB,{})
		
		-- /RUN JA Sets --
		sets.JA.Lunge = set_combine(sets.Midcast.MAB,{})
		sets.JA.Swipe = set_combine(sets.JA.Lunge,{})
 
		-----------------------------------------------------
        -- For Cure Spells & The Listed Healing Blue Magic --
		-----------------------------------------------------
		
		-- Cure Set --
        sets.Midcast.Cure = {ammo="Egoist's Tathlum",
    head={ name="Telchine Cap", augments={'"Cure" potency +5%','HP+28',}},
    body={ name="Telchine Chas.", augments={'"Cure" potency +5%','HP+39',}},
    hands={ name="Telchine Gloves", augments={'"Cure" potency +5%','HP+25',}},
    legs={ name="Telchine Braconi", augments={'"Cure" potency +4%','HP+39',}},
    feet={ name="Telchine Pigaches", augments={'"Cure" potency +5%','HP+38',}},
    neck="Elite royal collar",
    waist="Platinum moogle belt",
    ear1="Eabani Earring",
    ear2="Ethereal Earring",
    left_ring="Defending Ring",
    right_ring="Naji's Loop",
    back="Moonbeam cape"}
						
		-- Self Cures --
		sets.Midcast.SelfCure = set_combine(sets.Midcast.Cure,{})
						
		-- HP-up Cures --
		sets.Midcast.HPCure = set_combine(sets.Midcast.Cure,{})
		
		------------------------------
		-- Mid-Cast Blue Magic Sets --
		------------------------------
		
         -- Blue Magic Base Mid-Cast Set --
        sets.Midcast['Blue Magic'] = set_combine(sets.Midcast,{hands="Hashishin Bazubands +2"})
 
        -- For The Listed Physical Type Blue Magic --
        sets.Midcast.PhysicalBlueMagic = {
                        ammo="Aurgelmir orb",
                        head="Gleti's mask",
                        ear1="Odr earring",
                        ear2="Hashishin earring",
                        body="Assimilator's Jubbah +3",
                        hands="Gleti's Gauntlets",
                        ring1="Ephramad's Ring", 
						ring2="Sroda Ring",
                        back=RosmertaCape.WS,
                        waist="Sailfi belt +1",
                        legs="Hashishin Tayt +2",
                        feet="Assim. Charuqs +2"}
 
        -- BlueMagic STR Set --
        sets.Midcast.PhysicalBlueMagic_STR = set_combine(sets.Midcast.PhysicalBlueMagic,{})
 
        -- BlueMagic STR/DEX Set --
        sets.Midcast.PhysicalBlueMagic_DEX = set_combine(sets.Midcast.PhysicalBlueMagic,{
						ring2="Ephramad's Ring",
						back=RosmertaCape.CDC,
						ear1="Odr earring",
                        ear2="Hashishin earring"
						})
 
        -- BlueMagic STR/VIT Set --
        sets.Midcast.PhysicalBlueMagic_VIT = set_combine(sets.Midcast.PhysicalBlueMagic,{
						ammo="Mavi Tathlum"})
 
        -- BlueMagic STR/AGI Set --
        sets.Midcast.PhysicalBlueMagic_AGI = set_combine(sets.Midcast.PhysicalBlueMagic,{})
		
		-- Physical Acc Blue Magic --
		sets.Midcast.BlueMagic_PhysicalACC = {
                        ammo="Aurgelmir orb",
                        head="Gleti's mask",
                        ear1="Crep. Earring",
                        ear2="Hashishin earring",
                        body="Assimilator's Jubbah +3",
                        hands="Gleti's Gauntlets",
                        ring1="Ephramad's Ring", 
						ring2="Sroda Ring",
                        back=RosmertaCape.WS,
                        waist="Sailfi belt +1",
                        legs="Hashishin Tayt +2",
                        feet="Assim. Charuqs +2"}
 
        -- For The Listed Magical Type BlueMagic --
        sets.Midcast.MagicalBlueMagic = set_combine(sets.Midcast.MAB,{})
		
		-- Dark Based Magical Blue Magic --
		sets.Midcast.BlueMagic_Dark = set_combine(sets.Midcast.MAB,{head="Pixie Hairpin +1"})
		
		-- Light Based Magical Blue Magic --
		sets.Midcast.BlueMagic_Light = set_combine(sets.Midcast.MAB,{ring2="Weatherspoon Ring"}) -- Insert Etana Ring Here --

		-- Earth Based Magical Blue Magic --
		sets.Midcast.BlueMagic_Earth = set_combine(sets.Midcast.MAB,{neck="Quanpur Necklace"})
 
        -- Magic Accuracy For The Listed BlueMagic --
        sets.Midcast.BlueMagic_Accuracy = set_combine(sets.Midcast.MAB,{ammo="Mavi tathlum", head="Assimilator's Keffiyeh +3", neck="Mirage Stole +2", ear2="Hashishin Earring",body="Hashishin Mintan +2",hands="Hashishin Bazubands +2",ring1="Metamorph Ring +1",ring2="Stikini Ring +1",back="Aurist's cape +1",legs="Hashishin Tayt +2",waist="Acuity Belt +1"})
		
		sets.Midcast.BlueMagic_AccuracyS = set_combine(sets.Midcast.BlueMagic_Accuracy,{})
		
		sets.Midcast.BlueMagic_AccuracyDT = set_combine(sets.Midcast.BlueMagic_Accuracy,{ammo="Mavi Tathlum",head="Malignance Chapeau",waist="Acuity Belt +1",ring1="Defending Ring"})
 
        -- Stun Set For The Listed BlueMagic --
        sets.Midcast.BlueMagic_Stun = set_combine(sets.Midcast.MACC,{
						neck="Mirage Stole +2"})
						
		-- Physical Stun Blue Magic --
		sets.Midcast.BlueMagic_PhysicalStun = set_combine(sets.Midcast.MACC,{
                        --ammo="Honed tathlum",
						ammo="Perfect Lucky Egg",
						head="Hashishin Kavuk +3",
						neck="Mirage Stole +2",
                        body="Hashishin Mintan +2",
                        hands="Hashishin Bazubands +2",
						ring1="Etana ring",
						ring2="Metamorph Ring +1",
						ear1="Crep. Earring",
						ear2="Hashishin Earring",
						back="Aurist's Cape +1",
						--waist="Acuity Belt +1",
						waist="Chaac belt",
						legs="Hashishin Tayt +2",
                        feet="Hashishin Basmak +2"})
 
        -- Buff Set For The Listed Blue Magic --
        sets.Midcast.BlueMagic_Buff = {
						ammo="Mavi Tathlum",
                        head="Luhlaza Keffiyeh +1",
                        neck="Mirage Stole +2",
                        ear1="Loquac. Earring",
                        ear2="Gifted Earring",
                        body="Assimilator's Jubbah +3",
                        hands="Rawhide gloves",
                        ring1="Kishar Ring",
                        legs="Hashishin Tayt +2",
						waist="Siegel Sash",
                        feet="Luhlaza Charuqs +3"}
 
        -- Breath Set For The Listed Blue Magic --
        sets.Midcast.BlueMagic_Breath = set_combine(sets.Midcast,{head="Luhlaza Keffiyeh +1"})
		
		-- White Wind Set --
		sets.Midcast.BlueMagic_HPCure = set_combine(sets.Midcast.HPCure,{})
		
		-- Enmity Sets For the Listed Blue Magic --
		sets.Midcast.BlueMagic_Emnity = set_combine(sets.Midcast.MagicEnmity,{})
 
end
 
function pretarget(spell,action)
        if (spell.type:endswith('Magic') or spell.type == "Ninjutsu") and buffactive.silence then -- Auto Use Echo Drops If You Are Silenced --
                cancel_spell()
                send_command('input /item "Echo Drops" <me>')
        elseif spell.english == "Berserk" and buffactive.Berserk then -- Change Berserk To Aggressor If Berserk Is On --
                cancel_spell()
                send_command('Aggressor')
        elseif spell.english:ifind("Cure") and player.mp<actualCost(spell.mp_cost) then
                degrade_spell(spell,Cure_Spells)
        elseif spell.english:ifind("Curaga") and player.mp<actualCost(spell.mp_cost) then
                degrade_spell(spell,Curaga_Spells)
        elseif spell.type == "WeaponSkill" and spell.target.distance > target_distance and player.status == 'Engaged' then -- Cancel WS If You Are Out Of Range --
                cancel_spell()
                add_to_chat(123, spell.name..' Canceled: [Out of Range]')
                return
        end
end
 
function precast(spell,action)
	if spell.type == "WeaponSkill" then
		if player.status ~= 'Engaged' then -- Cancel WS If You Are Not Engaged. Can Delete It If You Don't Need It --
			cancel_spell()
			add_to_chat(123,'Unable To Use WeaponSkill: [Disengaged]')
			return
		else
			equipSet = sets.WS
			if equipSet[spell.english] then
				equipSet = equipSet[spell.english]
			end
			if equipSet[AccArray[AccIndex]] then
				equipSet = equipSet[AccArray[AccIndex]]
			end
			if buffactive['Reive Mark'] then -- Equip Ygnas's Resolve +1 During Reive --
				equipSet = set_combine(equipSet,{neck="Ygnas's Resolve +1"})
			end
				if spell.english == "Chant du Cygne" and player.tp > 2900 then
                    equipSet = set_combine(equipSet,{ear2="Brutal Earring"})  
                elseif spell.english == "Requiescat" and player.tp > 2900 then
                    equipSet = set_combine(equipSet,{ear2="Brutal Earring"})  
				elseif spell.english == "Expiacion" and player.tp > 2900 then
                    equipSet = set_combine(equipSet,{ear2="Brutal Earring"}) 
				elseif spell.english == "Savage Blade" and player.tp > 2900 then
                        equipSet = set_combine(equipSet,{ear2="Brutal Earring"})
				elseif spell.english == "Vorpal Blade" and player.tp > 2900 then
                        equipSet = set_combine(equipSet,{ear2="Brutal Earring"})
				elseif spell.english == "Sanguine Blade" and world.day == "Darksday" or world.weather_element == "Dark" then
						equipSet = set_combine(equipSet,{waist="Hachirin-no-Obi"})
				elseif spell.english == "Tenebral Crush" and world.day == "Darksday" and spell.target.distance < 7 or world.weather_element == "Dark" and spell.target.distance < 7 then
						equipSet = set_combine(equipSet,{waist="Hachirin-no-Obi"})
                elseif spell.english == "Realmrazer" and player.tp > 2900 then
						equipSet = set_combine(equipSet,{ear1="Brutal Earring"})  
				elseif spell.english == "Black Halo" and player.tp > 2900 then
						equipSet = set_combine(equipSet,{ear1="Telos Earring",ear2="Brutal Earring"}) 
				elseif spell.english == "Flash Nova" and world.day == "Lightsday" or world.weather_element == "Light" then
						equipSet = set_combine(equipSet,{waist="Hachirin-no-Obi"})					
				end
                equip(equipSet)
                end
        elseif spell.type == "JobAbility" or spell.type == "Ward" or spell.type == "Effusion" then
                if sets.JA[spell.english] then
                        equip(sets.JA[spell.english])
                end			
        elseif spell.type == "Rune" then
                equip(sets.JA.Enmity)				
        elseif spell.type:endswith('Magic') or spell.type == "Ninjutsu" then
                if buffactive.silence or spell.target.distance > 16+target_distance then -- Cancel Magic or Ninjutsu If You Are Silenced or Out of Range --
                        cancel_spell()
                        add_to_chat(123, spell.name..' Canceled: [Silenced or Out of Casting Range]')
                        return
                else
                        if (string.find(spell.english,'Cur') or BlueMagic_Healing:contains(spell.english)) and spell.english ~= "Cursna" then
                                equip(sets.Precast.Cure)
                        elseif string.find(spell.english,'Utsusemi') then
                                if buffactive['Copy Image (3)'] or buffactive['Copy Image (4)'] then
                                        cancel_spell()
                                        add_to_chat(123, spell.english .. ' Canceled: [3+ Images]')
                                        return
						else
							equip(sets.Precast.FastCast)
						end
						elseif sets.Precast[spell.skill] then
								equip(sets.Precast[spell.skill])
						else
						equip(sets.Precast.FastCast)
			end
		end
        elseif string.find(spell.type,'Flourish') then
                if spell.english == "Animated Flourish" then
                        equip(sets.Enmity)
                else
                        equip(sets.Flourish)
                end
        elseif spell.type == "Step" then
                equip(sets.Step)
        elseif spell.type == "Waltz" then
                refine_waltz(spell,action)
                equip(sets.Waltz)
        elseif spell.english == 'Spectral Jig' and buffactive.Sneak then
                cast_delay(0.2)
                send_command('cancel Sneak')
        end
end
 
function midcast(spell,action)
        equipSet = {}
        if spell.type:endswith('Magic') or spell.type == 'Ninjutsu' or spell.type == 'Trust' then 
                equipSet = sets.Midcast
                if equipSet[spell.english] then
                        equipSet = equipSet[spell.english]
				elseif (string.find(spell.english,'Cur') or BlueMagic_Healing:contains(spell.english)) and spell.english ~= "Cursna" then
                        if spell.target.name == player.name then
                                equipSet = equipSet.SelfCure
                        else
                                equipSet = equipSet.Cure
                        end
                        elseif BlueMagic_HPCure:contains(spell.english) then
                                equipSet = equipSet.BlueMagic_HPCure
                elseif string.find(spell.english,'Protect') or string.find(spell.english,'Shell') then
                        if spell.target.name == player.name then
                                equipSet = set_combine(sets.Haste,{ring1="Sheltered Ring"})
                        end		
				elseif spell.english:startswith('Refresh') or spell.english:startswith('Haste') or spell.english:startswith('Flurry') or spell.english:startswith('Blink') or spell.english:startswith('Regen') or spell.english:endswith('Spikes') then
								equipSet = sets.Haste
				elseif spell.english == "Stoneskin" then
						if buffactive.Stoneskin then
								send_command('@wait 2.8;cancel stoneskin')
					end
								equipSet = equipSet.Stoneskin
                elseif PhysicalBlueMagic:contains(spell.english) or PhysicalBlueMagic_STR:contains(spell.english) or PhysicalBlueMagic_DEX:contains(spell.english) or PhysicalBlueMagic_VIT:contains(spell.english) or PhysicalBlueMagic_AGI:contains(spell.english) or BlueMagic_PhysicalACC:contains(spell.english) then
                        if PhysicalBlueMagic_STR:contains(spell.english) then
                                equipSet = equipSet.PhysicalBlueMagic_STR
                        elseif PhysicalBlueMagic_DEX:contains(spell.english) then
                                equipSet = equipSet.PhysicalBlueMagic_DEX
                        elseif PhysicalBlueMagic_VIT:contains(spell.english) then
                                equipSet = equipSet.PhysicalBlueMagic_VIT
                        elseif PhysicalBlueMagic_AGI:contains(spell.english) then
                                equipSet = equipSet.PhysicalBlueMagic_AGI
                        elseif PhysicalBlueMagic:contains(spell.english) then
                                equipSet = equipSet.PhysicalBlueMagic
                        elseif BlueMagic_PhysicalACC:contains(spell.english) then
                                equipSet = equipSet.BlueMagic_PhysicalACC
                        end
						if buffactive['Chain Affinity'] then
								equipSet = set_combine(equipSet,sets['Chain Affinity'])
						end
						if buffactive.Efflux then
								equipSet = set_combine(equipSet,sets.Efflux)
						end
                elseif MagicalBlueMagic:contains(spell.english) or BlueMagic_Dark:contains(spell.english) or BlueMagic_Light:contains(spell.english) or BlueMagic_Earth:contains(spell.english) then
                        if MagicalBlueMagic:contains(spell.english) then
                                equipSet = equipSet.MagicalBlueMagic
                        elseif BlueMagic_Dark:contains(spell.english) then
                                equipSet = equipSet.BlueMagic_Dark
                        elseif BlueMagic_Light:contains(spell.english) then
                                equipSet = equipSet.BlueMagic_Light
                        elseif BlueMagic_Earth:contains(spell.english) then
                                equipSet = equipSet.BlueMagic_Earth
                        end
                        if buffactive['Burst Affinity'] then
								equipSet = set_combine(equipSet,sets['Burst Affinity'])
                        end
						if buffactive.Convergence then
								equipSet = set_combine(equipSet,sets.Convergence)
						end
                elseif BlueMagic_Accuracy:contains(spell.english) then
                        equipSet = equipSet.BlueMagic_Accuracy
				elseif BlueMagic_AccuracySpeed:contains(spell.english) then
                        equipSet = equipSet.BlueMagic_AccuracyS
                elseif BlueMagic_Stun:contains(spell.english) then
                        equipSet = equipSet.BlueMagic_Stun
				elseif BlueMagic_PhysicalStun:contains(spell.english) then
                        equipSet = equipSet.BlueMagic_PhysicalStun
                elseif BlueMagic_Emnity:contains(spell.english) then
                        equipSet = equipSet.BlueMagic_Emnity						
                elseif BlueMagic_Buff:contains(spell.english) then
                        equipSet = equipSet.BlueMagic_Buff
                elseif BlueMagic_Diffusion:contains(spell.english) and buffactive.Diffusion then
                        equipSet = set_combine(equipSet,sets.Diffusion)
                elseif BlueMagic_Breath:contains(spell.english) then
                        equipSet = equipSet.BlueMagic_Breath
                elseif spell.english == "Stoneskin" then
                        if buffactive.Stoneskin then
                                send_command('@wait 2.8;cancel stoneskin')
                        end
                        equipSet = equipSet.Stoneskin
                elseif spell.english == "Sneak" then
                        if spell.target.name == player.name and buffactive['Sneak'] then
                                send_command('cancel sneak')
                        end
                        equipSet = equipSet.Haste
                elseif string.find(spell.english,'Utsusemi') then
                        if spell.english == 'Utsusemi: Ichi' and (buffactive['Copy Image'] or buffactive['Copy Image (2)']) then
                                send_command('@wait 1.7;cancel Copy Image*')
                        end
                        equipSet = equipSet.Haste
				elseif spell.english == 'Monomi: Ichi' then
						if buffactive['Sneak'] then
								send_command('@wait 1.7;cancel sneak')
						end
						equipSet = equipSet.Haste
				elseif spell.english:startswith('Tonko') then
						equipSet = equipSet.Haste
				elseif spell.english:startswith('Jabaku') or spell.english:startswith('Hojo') or spell.english:startswith('Kurayami') or spell.english:startswith('Dokumori') then
						equipSet = equipSet.Enfeebling_Ninjutsu
				elseif spell.english:startswith('Katon') or spell.english:startswith('Suiton') or spell.english:startswith('Doton') or spell.english:startswith('Hyoton') or spell.english:startswith('Huton') or spell.english:startswith('Raiton') then
						equipSet = equipSet.Elemental_Ninjutsu
				end
		elseif equipSet[spell.skill] then
			equipSet = equipSet[spell.skill]
		end
				if spell.skill == 'Elemental Magic' or spell.english:startswith('Cur') or spell.english:startswith('Aspir') or spell.english:startswith('Drain') or spell.english:startswith('White Wind') then
				if (world.day_element == spell.element or world.weather_element == spell.element) then
						equipSet = set_combine(equipSet,{waist="Hachirin-no-Obi"})
				end
	elseif equipSet[spell.english] then
		equipSet = equipSet[spell.english]
	end
	equip(equipSet)
end
 
function aftercast(spell,action)
        if spell.type == "WeaponSkill" and not spell.interrupted then
                send_command('wait 0.2;gs c TP')
		elseif spell.english == "Sleep II" or spell.english == "Repose" or spell.english == "Dream Flower" then -- Sleep II//Repose/Dream Flower Countdown --
			send_command('wait 60;input /echo Sleep II/Dream Flower Effect: [WEARING OFF IN 30 SEC.];wait 15;input /echo Sleep II/Dream Flower Effect: [WEARING OFF IN 15 SEC.];wait 10;input /echo Sleep II/Dream Flower Effect: [WEARING OFF IN 5 SEC.]')
		elseif spell.english == "Sleep" or spell.english == "Sleepga" or spell.english == "Sheep Song" then -- Sleep/Sleepga/Sheep Song Countdown --
			send_command('wait 30;input /echo Sleep/Sleepga/Sheep Song Effect: [WEARING OFF IN 30 SEC.];wait 15;input /echo Sleep/Sleepga/Sheep Song Effect: [WEARING OFF IN 15 SEC.];wait 10;input /echo Sleep/Sleepga/Sheep Song Effect: [WEARING OFF IN 5 SEC.]')
	end
	status_change(player.status)
end
 
function status_change(new,old)
        if Armor == 'PDT' then
                equip(sets.PDT)
        elseif Armor == 'MDT' then
                equip(sets.MDT)
		elseif Armor == 'Kiting' then
                equip(sets.Kiting)
        elseif new == 'Engaged' then
                equipSet = sets.TP
        if Armor == 'Hybrid' and equipSet["Hybrid"] then
                equipSet = equipSet["Hybrid"]
        end
		if equipSet[WeaponArray[WeaponIndex]] then
                equipSet = equipSet[WeaponArray[WeaponIndex]]
        end
        if equipSet[AccArray[AccIndex]] then
                equipSet = equipSet[AccArray[AccIndex]]
        end
		if (buffactive.March and (buffactive.Embrava or buffactive.Haste or buffactive['Mighty Guard']) or (buffactive.Haste == 2) or (buffactive['Mighty Guard']) and (buffactive.Embrava or buffactive.Haste)) and equipSet["HighHaste"] then
				equipSet = equipSet["HighHaste"]
        end
		if buffactive["Aftermath: Lv.3"] and equipSet["AM3"] then
				equipSet = equipSet["AM3"]
	    end
		if Thaumas == 'ON' then -- Use Thaumas Coat Toggle --
				equipSet = set_combine(equipSet,sets.TP.Thaumas)
		end
        equip(equipSet)
	elseif new == 'Idle' then
		equipSet = sets.Idle
		if equipSet[IdleArray[IdleIndex]] then
			equipSet = equipSet[IdleArray[IdleIndex]]
		end
		if buffactive['Reive Mark'] then -- Equip Ygnas's Resolve +1 During Reive --
			equipSet = set_combine(equipSet,{neck="Ygnas's Resolve +1"})
		end
		if world.area:endswith('Adoulin') then
			equipSet = set_combine(equipSet,{body="Councilor's Garb"}) -- Equip Councilor's Garb in Adoulin --
		end
		equip(equipSet)
	end
end

 
function buff_change(buff,gain)
        buff = string.lower(buff)
        if buff == "aftermath: lv.3" then -- AM3 Timer/Countdown --
                if gain then
                        send_command('timers create "Aftermath: Lv.3" 180 down')
                else
                        send_command('timers delete "Aftermath: Lv.3"')
                        add_to_chat(123,'AM3: [OFF]')
                end
        elseif buff == "aftermath: lv.2" then -- AM2 Timer/Countdown --
                if gain then
                        send_command('timers create "Aftermath: Lv.2" 270 down')
                else
                        send_command('timers delete "Aftermath: Lv.2"')
                        add_to_chat(123,'AM2: [OFF]')
                end
        elseif buff == "aftermath: lv.1" then -- AM1 Timer/Countdown --
                if gain then
                        send_command('timers create "Aftermath: Lv.1" 90 down')
                else
                        send_command('timers delete "Aftermath: Lv.1"')
                        add_to_chat(123,'AM1: [OFF]')
                end
		elseif buff == 'transcendency' then
				if gain then
                        send_command('timers create "Transcendency" 180 down')
                else
                        send_command('timers delete "Transcendency"')
                        add_to_chat(123,'Transcendency: [OFF]')
                end				
        elseif buff == 'weakness' then -- Weakness Timer --
                if gain then
                        send_command('timers create "Weakness" 300 up')
                else
                        send_command('timers delete "Weakness"')
                end
        end
        if buffactive.Terror or buffactive.Stun or buffactive.Petrification or buffactive.Sleep and gain then -- Lock PDT When You Are Terrorised/Stunned/Petrified/Slept --
                equip({
						--ammo="Iron Gobbet",
                        --head="Lithelimb Cap",
                        neck="Elite royal collar",
                        ear1="Ethereal Earring",
                        hands="Gleti's Gauntlets",
                        --ring1="Defending Ring",
                        ring2="Stikini ring +1",
                        back="Repulse Mantle",
                        waist="Platinum moogle belt",
                        --legs="Iuitl Tights +1",
                        feet="Malignance Boots"})
        else
        if not midaction() then
                status_change(player.status)
				end
        end
end

 
-- In Game: //gs c (command), Macro: /console gs c (command), Bind: gs c (command) --
function self_command(command)
        if command == 'C1' then -- Accuracy Level Toggle --
                AccIndex = (AccIndex % #AccArray) + 1
                add_to_chat(158,'Accuracy Level: ' .. AccArray[AccIndex])
                status_change(player.status)
		elseif command == 'C17' then -- Main Weapon Toggle --
				WeaponIndex = (WeaponIndex % #WeaponArray) + 1
				add_to_chat(158,'Main Weapon: '..WeaponArray[WeaponIndex])
				status_change(player.status)
        elseif command == 'C5' then -- Auto Update Gear Toggle --
                status_change(player.status)
                add_to_chat(158,'Auto Update Gear')
        elseif command == 'C2' then -- Hybrid Toggle --
                if Armor == 'Hybrid' then
                        Armor = 'None'
                        add_to_chat(123,'Hybrid Set: [Unlocked]')
                else
                        Armor = 'Hybrid'
                        add_to_chat(158,'Hybrid Set: '..AccArray[AccIndex])
                end
                status_change(player.status)
        elseif command == 'C7' then -- PDT Toggle --
                if Armor == 'PDT' then
                        Armor = 'None'
                        add_to_chat(123,'PDT Set: [Unlocked]')
                else
                        Armor = 'PDT'
                        add_to_chat(158,'PDT Set: [Locked]')
                end
                status_change(player.status)
        elseif command == 'C15' then -- MDT Toggle --
                if Armor == 'MDT' then
                        Armor = 'None'
                        add_to_chat(123,'MDT Set: [Unlocked]')
                else
                        Armor = 'MDT'
                        add_to_chat(158,'MDT Set: [Locked]')
                end
				status_change(player.status)
        elseif command == 'C12' then -- Kiting Toggle --
                if Armor == 'Kiting' then
                        Armor = 'None'
                        add_to_chat(123,'Kiting Set: [Unlocked]')
                else
                        Armor = 'Kiting'
                        add_to_chat(158,'Kiting Set: [Locked]')
                end
                status_change(player.status)
		elseif command == 'C16' then -- Thaumas Coat Toggle --
				if Thaumas == 'ON' then
						Thaumas = 'OFF'
						add_to_chat(123,'Thaumas Coat: [OFF]')
		else
						Thaumas = 'ON'
						add_to_chat(158,'Thaumas Coat: [ON]')
		end
				status_change(player.status)
        elseif command == 'C8' then -- Distance Toggle --
                if player.target.distance then
                        target_distance = math.floor(player.target.distance*10)/10
                        add_to_chat(158,'Distance: '..target_distance)
        else
                        add_to_chat(123,'No Target Selected')
        end
        elseif command == 'C6' then -- Idle Toggle --
                IdleIndex = (IdleIndex % #IdleArray) + 1
                add_to_chat(158,'Idle Set: ' .. IdleArray[IdleIndex])
                status_change(player.status)
        elseif command == 'TP' then
                add_to_chat(158,'TP Return: ['..tostring(player.tp)..']')
        elseif command:match('^SC%d$') then
                send_command('//' .. sc_map[command])
        end
		
end

function check_equip_lock() -- Lock Equipment Here --
	if player.equipment.left_ring == "Warp Ring" or player.equipment.left_ring == "Capacity Ring" or player.equipment.right_ring == "Warp Ring" or player.equipment.right_ring == "Capacity Ring" then
		disable('ring1','ring2')
	elseif player.equipment.back == "Mecisto. Mantle" or player.equipment.back == "Aptitude Mantle +1" or player.equipment.back == "Aptitude Mantle" then
		disable('back')
	else
		enable('ring1','ring2','back')
	end
end
 
function actualCost(originalCost)
        if buffactive["Penury"] then
                return originalCost*.5
        elseif buffactive["Light Arts"] then
                return originalCost*.9
        else
                return originalCost
        end
end
 
function degrade_spell(spell,degrade_array)
        spell_index = table.find(degrade_array,spell.name)
        if spell_index>1 then
                new_spell = degrade_array[spell_index - 1]
                change_spell(new_spell,spell.target.raw)
                add_to_chat(8,spell.name..' Canceled: ['..player.mp..'/'..player.max_mp..'MP::'..player.mpp..'%] Casting '..new_spell..' instead.')
        end
end
 
function refine_waltz(spell,action)
	if spell.type ~= 'Waltz' then
		return
	end

	if spell.name == "Healing Waltz" or spell.name == "Divine Waltz" or spell.name == "Divine Waltz II" then
		return
	end

	local newWaltz = spell.english
	local waltzID

	local missingHP

	if spell.target.type == "SELF" then
		missingHP = player.max_hp - player.hp
	elseif spell.target.isallymember then
		local target = find_player_in_alliance(spell.target.name)
		local est_max_hp = target.hp / (target.hpp/100)
		missingHP = math.floor(est_max_hp - target.hp)
	end

	if missingHP ~= nil then
		if player.sub_job == 'DNC' then
			if missingHP < 40 and spell.target.name == player.name then
				add_to_chat(123,'Full HP!')
				cancel_spell()
				return
			elseif missingHP < 150 then
				newWaltz = 'Curing Waltz'
				waltzID = 190
			elseif missingHP < 300 then
				newWaltz = 'Curing Waltz II'
				waltzID = 191
			else
				newWaltz = 'Curing Waltz III'
				waltzID = 192
			end
		else
			return
		end
	end

	local waltzTPCost = {['Curing Waltz'] = 20, ['Curing Waltz II'] = 35, ['Curing Waltz III'] = 50}
	local tpCost = waltzTPCost[newWaltz]

	local downgrade

	if player.tp < tpCost and not buffactive.trance then

		if player.tp < 20 then
			add_to_chat(123, 'Insufficient TP ['..tostring(player.tp)..']. Cancelling.')
			cancel_spell()
			return
		elseif player.tp < 35 then
			newWaltz = 'Curing Waltz'
		elseif player.tp < 50 then
			newWaltz = 'Curing Waltz II'
		end

		downgrade = 'Insufficient TP ['..tostring(player.tp)..']. Downgrading to '..newWaltz..'.'
	end

	if newWaltz ~= spell.english then
		send_command('@input /ja "'..newWaltz..'" '..tostring(spell.target.raw))
		if downgrade then
			add_to_chat(158, downgrade)
		end
		cancel_spell()
		return
	end

	if missingHP > 0 then
		add_to_chat(158,'Trying to cure '..tostring(missingHP)..' HP using '..newWaltz..'.')
	end
end

function find_player_in_alliance(name)
	for i,v in ipairs(alliance) do
		for k,p in ipairs(v) do
			if p.name == name then
				return p
			end
		end
	end
end

function sub_job_change(newSubjob, oldSubjob)
	select_default_macro_book()
end

function set_macro_page(set,book)
	if not tonumber(set) then
		add_to_chat(123,'Error setting macro page: Set is not a valid number ('..tostring(set)..').')
		return
	end
	if set < 1 or set > 10 then
		add_to_chat(123,'Error setting macro page: Macro set ('..tostring(set)..') must be between 1 and 10.')
		return
	end

	if book then
		if not tonumber(book) then
			add_to_chat(123,'Error setting macro page: book is not a valid number ('..tostring(book)..').')
			return
		end
		if book < 1 or book > 20 then
			add_to_chat(123,'Error setting macro page: Macro book ('..tostring(book)..') must be between 1 and 20.')
			return
		end
		send_command('@input /macro book '..tostring(book)..';wait .1;input /macro set '..tostring(set))
	else
		send_command('@input /macro set '..tostring(set))
	end
end

function select_default_macro_book()
	-- Default macro set/book
	if player.sub_job == 'WAR' then
		set_macro_page(1, 2)

	elseif player.sub_job == 'DRG' then
		set_macro_page(1, 8)

	elseif player.sub_job == 'RUN' then
		set_macro_page(1, 7)

	elseif player.sub_job == 'NIN' then
		set_macro_page(1, 1)

	elseif player.sub_job == 'DNC' then
		set_macro_page(1, 3)

	elseif player.sub_job == 'BLM' then
		set_macro_page(1, 20)

	else
		set_macro_page(1, 1)

	end
end